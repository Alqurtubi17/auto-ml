from fastapi import APIRouter, HTTPException, File, UploadFile, Form, Body, Request
from fastapi.responses import FileResponse
from schemas import MLProjectResponse, GenerateMLRequest, MLTaskType, BuildStatus
import os
import shutil
import uuid
import joblib
import pandas as pd
import numpy as np

from services.build_store import store
from services.build_pipeline import run_build

try:
    from services.queue import queue
    USE_QUEUE = True
except:
    USE_QUEUE = False

router = APIRouter()

@router.post("", response_model=MLProjectResponse, status_code=202)
async def create_build(
    project_name: str = Form(...),
    task_type: MLTaskType = Form(...),
    algorithm: str = Form("auto"),
    target_column: str | None = Form(None),
    feature_columns: str | None = Form(None),
    nan_strategy: str = Form("mean"),
    scaling_strategy: str = Form("none"),
    use_tuning: bool = Form(False),
    custom_params: str | None = Form(None),
    file: UploadFile | None = None
):
    data_file_path = None
    if file:
        os.makedirs("/tmp/uploads", exist_ok=True)
        data_file_path = f"/tmp/uploads/{uuid.uuid4()}_{file.filename}"
        with open(data_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

    features = [f.strip() for f in feature_columns.split(",")] if feature_columns else None
    
    parsed_params = None
    if custom_params:
        try:
            import json
            parsed_params = json.loads(custom_params)
        except:
            parsed_params = None

    req = GenerateMLRequest(
        project_name=project_name,
        task_type=task_type,
        algorithm=algorithm,
        target_column=target_column,
        feature_columns=features,
        data_file=data_file_path,
        nan_strategy=nan_strategy,
        scaling_strategy=scaling_strategy,
        use_tuning=use_tuning,
        hyperparameters=parsed_params
    )

    job = await store.create(req)

    if USE_QUEUE:
        await queue.put((run_build, (job.id, req)))
    else:
        import asyncio
        asyncio.create_task(run_build(job.id, req))

    return job

@router.get("", response_model=dict)
async def list_builds():
    builds = await store.list_all()
    return {"builds": builds}

@router.get("/{build_id}", response_model=MLProjectResponse)
async def get_build(build_id: str):
    job = await store.get(build_id)
    if not job:
        raise HTTPException(404, "ML Project not found")
    return job

@router.post("/{build_id}/predict")
async def predict(build_id: str, request: Request):
    try:
        body = await request.json()
        features = body.get("features", body) if isinstance(body, dict) else body
    except:
        features = {}

    job = await store.get(build_id)
    if not job:
        raise HTTPException(404, "Project tidak ditemukan")

    if job.status.value != "done":
        raise HTTPException(400, "Model belum selesai dilatih")

    model_path = f"/tmp/models/model_{build_id}.joblib"
    if not os.path.exists(model_path):
        raise HTTPException(404, "Model file tidak ditemukan di server")

    try:
        model = joblib.load(model_path)
        df = pd.DataFrame([features])

        if hasattr(model, "feature_names_in_"):
            for col in model.feature_names_in_:
                if col not in df.columns:
                    df[col] = 0.0
            df = df[model.feature_names_in_]

        if not hasattr(model, "predict"):
            raise Exception("Model ini adalah versi lama yang tidak memiliki fungsi predict. Silakan hapus dan buat Project Baru!")

        X_pred = df.values

        scaler_x_path = f"/tmp/models/scaler_x_{build_id}.joblib"
        if os.path.exists(scaler_x_path):
            scaler_x = joblib.load(scaler_x_path)
            X_pred = scaler_x.transform(X_pred)

        pred = model.predict(X_pred)[0]

        scaler_y_path = f"/tmp/models/scaler_y_{build_id}.joblib"
        if os.path.exists(scaler_y_path) and job.task_type.value == "regression":
            scaler_y = joblib.load(scaler_y_path)
            pred = scaler_y.inverse_transform([[pred]])[0][0]

        task_type_str = job.task_type.value if hasattr(job.task_type, "value") else str(job.task_type)

        if task_type_str == "clustering":
            formatted_pred = str(int(pred)) 
        elif task_type_str == "regression":
            formatted_pred = f"{float(pred):.4f}" 
        else:
            formatted_pred = str(pred) 

        return {
            "status": "success",
            "prediction": formatted_pred
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(500, f"Engine Error: {str(e)}")

@router.get("/{build_id}/model")
async def download_model(build_id: str):
    job = await store.get(build_id)
    if not job:
        raise HTTPException(404, "ML Project not found")
        
    model_path = f"/tmp/models/model_{build_id}.joblib"
    if not os.path.exists(model_path):
        raise HTTPException(404, "Model file not found. It might have been deleted or the build failed.")
        
    return FileResponse(
        path=model_path,
        filename=f"model_{build_id}.joblib",
        media_type="application/octet-stream"
    )

@router.delete("/{build_id}")
async def delete_project(build_id: str):
    job = await store.get(build_id)
    if not job:
        raise HTTPException(404, "ML Project not found")
    
    await store.delete(build_id)
    
    model_path = f"/tmp/models/model_{build_id}.joblib"
    if os.path.exists(model_path):
        os.remove(model_path)
        
    return {"status": "success", "message": "Project deleted successfully"}
    
@router.put("/{build_id}/config")
async def update_config(build_id: str, config: dict = Body(...)):
    job = await store.get(build_id)
    if not job:
        raise HTTPException(404, "ML Project not found")
    
    current_ui = job.ui_schema or {}
    current_ui.update(config)
    
    await store.update(build_id, ui_schema=current_ui)
    return {"status": "success", "message": "Config updated"}

@router.post("/{build_id}/stop")
async def stop_deployment(build_id: str):
    job = await store.get(build_id)
    if not job:
        raise HTTPException(404, "ML Project not found")
    
    await store.update(build_id, status=BuildStatus.stopped)
    return {"status": "success", "message": "Deployment stopped"}