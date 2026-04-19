"""
Build pipeline — runs in a background asyncio task.
Stages: queued → training → generating → done
"""
from __future__ import annotations
import asyncio
import datetime
import traceback

from schemas import BuildJob, BuildStatus, GenerateRequest
from services.build_store import store
from services.template_registry import TEMPLATE_MAP
from services.site_generator import generate_html
from ml.engine import train_for_template


async def _run_stage(
    job_id: str,
    status: BuildStatus,
    log_msg: str,
    progress: int,
    coro,
):
    await store.update(job_id, status=status, progress=progress)
    await store.append_log(job_id, log_msg)
    return await coro


async def run_build(job: BuildJob, req: GenerateRequest) -> None:
    job_id = job.id
    template = TEMPLATE_MAP.get(req.template_id)
    if not template:
        await store.update(job_id, status=BuildStatus.error)
        await store.append_log(job_id, f"[error] Unknown template: {req.template_id}")
        return

    try:
        # ── Stage 1: Training ──────────────────────────────────────────
        await store.update(job_id, status=BuildStatus.training, progress=10)
        await store.append_log(job_id, f"[training] Selecting ML strategy for '{template.category}' category")
        await asyncio.sleep(0.2)

        loop = asyncio.get_running_loop()
        metrics = await loop.run_in_executor(None, train_for_template, template.category)

        await store.update(job_id, progress=55, ml_metrics=metrics)
        await store.append_log(
            job_id,
            f"[training] Complete — accuracy={metrics.accuracy:.1%}  "
            f"latency={metrics.latency_ms}ms  size={metrics.model_size}"
        )

        # ── Stage 2: Site generation ───────────────────────────────────
        await store.update(job_id, status=BuildStatus.generating, progress=65)
        await store.append_log(job_id, f"[generating] Assembling {len(template.sections)} sections")
        await asyncio.sleep(0.1)

        html = await loop.run_in_executor(
            None,
            generate_html,
            template,
            req.project_name,
            req.primary_color,
            req.user_description,
        )

        # In production: write html to S3 / Vercel deploy / CDN
        output_url = f"http://localhost:8000/preview/{job_id}.html"
        await store.update(job_id, progress=90)
        await store.append_log(job_id, f"[generating] Site HTML produced ({len(html):,} bytes)")

        # ── Stage 3: Finalise ──────────────────────────────────────────
        await asyncio.sleep(0.05)
        await store.update(
            job_id,
            status=BuildStatus.done,
            progress=100,
            completed_at=datetime.datetime.now(datetime.timezone.utc),
            output_url=output_url,
        )
        await store.append_log(job_id, f"[done] Build complete → {output_url}")

    except Exception:
        tb = traceback.format_exc()
        await store.update(job_id, status=BuildStatus.error)
        await store.append_log(job_id, f"[error] {tb}")
