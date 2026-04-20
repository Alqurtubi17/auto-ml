# backend/services/build_pipeline.py
import asyncio
import datetime
import traceback
from schemas import BuildStatus, GenerateMLRequest
from services.build_store import store
from ml.engine import train_model
from services.ml_generator import generate_deployment_code

async def run_build(job_id: str, req: GenerateMLRequest) -> None:
    try:
        # ── Stage 1: Training Model ────────────────────────────────────
        await store.update(job_id, status=BuildStatus.training, progress=20)
        await store.append_log(job_id, f"[training] Memulai proses training algoritma {req.task_type.value}...")
        await asyncio.sleep(1) # Efek delay agar animasi frontend terlihat
        
        # Lempar proses berat scikit-learn ke background thread agar FastAPI tidak macet
        loop = asyncio.get_running_loop()
        metrics, model_path = await loop.run_in_executor(None, train_model, req.task_type, req.algorithm, job_id)
        
        await store.update(job_id, progress=60, accuracy=metrics.accuracy)
        await store.append_log(job_id, f"[training] Model berhasil dilatih! Latency: {metrics.latency_ms}ms, Size: {metrics.model_size}")
        
        # ── Stage 2: Code Generation & UI Schema ───────────────────────
        await store.update(job_id, status=BuildStatus.generating, progress=75)
        await store.append_log(job_id, "[generating] Merakit source code Python dan UI Dashboard...")
        
        generated_code = generate_deployment_code(req.project_name, req.task_type)
        
        # UI Schema untuk membangun Form Input otomatis di Frontend
        ui_schema = {
            "title": f"Dashboard {req.project_name}",
            "type": req.task_type.value,
            "inputs": [
                {"name": "fitur_1", "type": "number", "label": "Parameter Data 1"},
                {"name": "fitur_2", "type": "number", "label": "Parameter Data 2"}
            ],
            "_metrics": metrics.model_dump()
        }
        
        # ── Stage 3: Selesai ───────────────────────────────────────────
        await store.update(
            job_id,
            status=BuildStatus.done,
            progress=100,
            generated_code=generated_code,
            ui_schema=ui_schema, # Disimpan ke database Neon.tech
            completed_at=datetime.datetime.now(datetime.timezone.utc)
        )
        await store.append_log(job_id, "[done] Pipeline ML selesai dan siap di-deploy!")
        
    except Exception as e:
        tb = traceback.format_exc()
        await store.update(job_id, status=BuildStatus.error)
        await store.append_log(job_id, f"[error] Gagal melatih model: {str(e)}")