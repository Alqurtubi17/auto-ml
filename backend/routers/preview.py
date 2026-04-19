"""
Preview router — serves the generated HTML for a completed build.
In production replace with S3/CDN redirect.
"""
from __future__ import annotations
from fastapi import APIRouter, HTTPException
from fastapi.responses import HTMLResponse

from services.build_store import store
from services.template_registry import TEMPLATE_MAP
from services.site_generator import generate_html
from schemas import BuildStatus, GenerateRequest

router = APIRouter()


@router.get("/preview/{build_id}", response_class=HTMLResponse, include_in_schema=False)
async def serve_preview(build_id: str) -> HTMLResponse:
    job = await store.get(build_id)
    if not job:
        raise HTTPException(status_code=404, detail="Build not found")
    if job.status != BuildStatus.done:
        raise HTTPException(status_code=425, detail="Build not complete yet")

    template = TEMPLATE_MAP.get(job.template_id)
    if not template:
        raise HTTPException(status_code=500, detail="Template config missing")

    html = generate_html(
        template=template,
        project_name="Preview",
        primary_color="#1a1a1a",
        description="",
    )
    return HTMLResponse(content=html)
