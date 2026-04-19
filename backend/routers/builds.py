import asyncio
from fastapi import APIRouter, BackgroundTasks, HTTPException
from schemas import BuildJob, BuildListResponse, GenerateRequest
from services.build_store import store
from services.template_registry import TEMPLATE_MAP
from services.build_pipeline import run_build

router = APIRouter()


@router.post("", response_model=BuildJob, status_code=202)
async def create_build(req: GenerateRequest, bg: BackgroundTasks) -> BuildJob:
    if req.template_id not in TEMPLATE_MAP:
        raise HTTPException(status_code=422, detail=f"Unknown template_id: '{req.template_id}'")
    job = await store.create(req)
    bg.add_task(run_build, job, req)
    return job


@router.get("", response_model=BuildListResponse)
async def list_builds() -> BuildListResponse:
    builds = await store.list_all()
    return BuildListResponse(builds=sorted(builds, key=lambda b: b.created_at, reverse=True))


@router.get("/{build_id}", response_model=BuildJob)
async def get_build(build_id: str) -> BuildJob:
    job = await store.get(build_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Build '{build_id}' not found")
    return job


@router.post("/{build_id}/cancel", response_model=dict)
async def cancel_build(build_id: str) -> dict:
    ok = await store.cancel(build_id)
    if not ok:
        raise HTTPException(status_code=409, detail="Build cannot be cancelled (not in progress or not found)")
    return {"ok": True}
