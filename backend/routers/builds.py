# backend/routers/builds.py
from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel
from schemas import MLProjectResponse, GenerateMLRequest
from services.build_store import store
from services.build_pipeline import run_build
import os, joblib, pandas as pd

router = APIRouter()

@router.post("", response_model=MLProjectResponse, status_code=202)
async def create_build(req: GenerateMLRequest, bg: BackgroundTasks):
    # 1. Simpan project ke Database
    job = await store.create(req)
    
    # 2. Lempar tugas training ke background task
    bg.add_task(run_build, job.id, req)
    
    return job

@router.get("", response_model=dict)
async def list_builds():
    # Ambil semua history dari Neon.tech
    builds = await store.list_all()
    return {"builds": builds}

@router.get("/{build_id}", response_model=MLProjectResponse)
async def get_build(build_id: str):
    job = await store.get(build_id)
    if not job:
        raise HTTPException(status_code=404, detail="ML Project not found")
    return job

class PredictRequest(BaseModel):
    features: dict[str, float]

@router.post("/{build_id}/predict")
async def predict_model(build_id: str, req: PredictRequest):
    job = await store.get(build_id)
    if not job:
        raise HTTPException(status_code=404, detail="Project tidak ditemukan")
    if job.status.value != "done":
        raise HTTPException(status_code=400, detail="Model belum selesai dilatih")

    model_path = f"/tmp/models/model_{build_id}.joblib"
    if not os.path.exists(model_path):
        raise HTTPException(status_code=404, detail="File model fisik tidak ditemukan di server")

    try:
        # Muat model dan lakukan prediksi
        model = joblib.load(model_path)
        
        # Konversi input dictionary ke DataFrame satu baris
        input_df = pd.DataFrame([req.features])
        prediction = model.predict(input_df)
        
        # Format hasil berdasarkan tipe tugas
        result_value = prediction[0]
        if job.task_type.value == "classification":
            formatted_result = f"Kelas {int(result_value)}"
        elif job.task_type.value == "regression":
            formatted_result = f"{float(result_value):.4f}"
        else:
            formatted_result = f"Cluster {int(result_value)}"

        return {"status": "success", "prediction": formatted_result, "raw_value": float(result_value)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal melakukan inferensi: {str(e)}")