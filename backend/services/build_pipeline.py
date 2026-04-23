import asyncio
import datetime
import traceback

from schemas import BuildStatus, GenerateMLRequest
from services.build_store import store
from ml.engine import train_model
from services.ml_generator import generate_deployment_code

try:
    from services.ws_manager import ws_manager
except:
    ws_manager = None

async def notify(job_id: str, payload: dict):
    if ws_manager:
        try:
            await ws_manager.send(job_id, payload)
        except:
            pass

async def run_build(job_id: str, req: GenerateMLRequest) -> None:
    try:
        task_val = req.task_type.value if hasattr(req.task_type, "value") else str(req.task_type)
        
        await store.update(job_id, status=BuildStatus.training, progress=10)
        await store.append_log(job_id, f"[training] Start {task_val}")

        await notify(job_id, {"status": "training", "progress": 10})

        await asyncio.sleep(0.5)

        loop = asyncio.get_running_loop()

        nan_strat = getattr(req, "nan_strategy", "mean")
        scale_strat = getattr(req, "scaling_strategy", "none")
        use_tuning = getattr(req, "use_tuning", False)
        hyperparams = getattr(req, "hyperparameters", {})

        metrics, model_path, training_logs, ui_updates = await loop.run_in_executor(
            None,
            train_model,
            req.task_type,
            req.algorithm,
            job_id,
            req.data_file,
            req.feature_columns,
            req.target_column,
            nan_strat,
            scale_strat,
            use_tuning,
            hyperparams
        )

        for log_line in training_logs:
            await store.append_log(job_id, log_line)

        metrics_data = metrics.model_dump(by_alias=True) if hasattr(metrics, "model_dump") else metrics.dict(by_alias=True)

        await store.update(
            job_id,
            progress=60,    
            accuracy=metrics.accuracy,
            ui_schema=ui_updates,
            metrics=metrics_data
        )

        await store.append_log(
            job_id,
            f"[training] Done | acc={metrics.accuracy:.4f} | size={metrics.model_size}"
        )

        await notify(job_id, {
            "status": "training_done",
            "progress": 60,
            "accuracy": metrics.accuracy
        })

        await store.update(job_id, status=BuildStatus.generating, progress=75)
        await store.append_log(job_id, "[generating] Creating deployment code")

        await notify(job_id, {"status": "generating", "progress": 75})

        generated_code = generate_deployment_code(
            req.project_name,
            req.task_type
        )

        inputs = []
        chart_data = metrics_data.get("chartData", metrics_data.get("chart_data", []))
        if chart_data:
            inputs = [{"name": c["name"], "label": c["name"], "type": "number"} for c in chart_data]
        else:
            inputs = [
                {"name": "fitur_1", "type": "number", "label": "Fitur 1"},
                {"name": "fitur_2", "type": "number", "label": "Fitur 2"},
            ]

        ui_schema = {
            "title": f"Dashboard {req.project_name}",
            "type": task_val,
            "inputs": inputs,
            "_metrics": metrics_data
        }
        
        ui_schema.update(ui_updates)

        await store.update(
            job_id,
            status=BuildStatus.done,
            progress=100,
            accuracy=metrics.accuracy,
            metrics=metrics_data,
            generated_code=generated_code,
            ui_schema=ui_schema,
            completed_at=datetime.datetime.now(datetime.timezone.utc)
        )

        await store.append_log(job_id, "[done] Pipeline selesai")

        await notify(job_id, {
            "status": "done",
            "progress": 100,
            "endpoint": f"/predict/{job_id}"
        })

    except Exception as e:
        tb = traceback.format_exc()

        await store.update(job_id, status=BuildStatus.error)
        await store.append_log(job_id, f"[error] {str(e)}")

        await notify(job_id, {
            "status": "error",
            "message": str(e)
        })

        print("PIPELINE ERROR:\n", tb)