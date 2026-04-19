from __future__ import annotations
import asyncio
import datetime
import uuid
from schemas import BuildJob, BuildStatus, GenerateRequest, MLMetrics


class BuildStore:
    """Thread-safe in-memory job registry. Swap with Redis for production."""

    def __init__(self) -> None:
        self._lock = asyncio.Lock()
        self._jobs: dict[str, BuildJob] = {}

    async def create(self, req: GenerateRequest) -> BuildJob:
        job = BuildJob(
            id=str(uuid.uuid4()),
            template_id=req.template_id,
            status=BuildStatus.queued,
            progress=0,
            created_at=datetime.datetime.now(datetime.timezone.utc),
            logs=[f"[queued] Job created for template '{req.template_id}'"],
        )
        async with self._lock:
            self._jobs[job.id] = job
        return job

    async def get(self, job_id: str) -> BuildJob | None:
        return self._jobs.get(job_id)

    async def list_all(self) -> list[BuildJob]:
        return list(self._jobs.values())

    async def update(self, job_id: str, **kwargs) -> BuildJob | None:
        async with self._lock:
            job = self._jobs.get(job_id)
            if not job:
                return None
            updated = job.model_copy(update=kwargs)
            self._jobs[job_id] = updated
            return updated

    async def append_log(self, job_id: str, line: str) -> None:
        async with self._lock:
            job = self._jobs.get(job_id)
            if job:
                self._jobs[job_id] = job.model_copy(update={"logs": job.logs + [line]})

    async def cancel(self, job_id: str) -> bool:
        async with self._lock:
            job = self._jobs.get(job_id)
            if not job or job.status in (BuildStatus.done, BuildStatus.error):
                return False
            self._jobs[job_id] = job.model_copy(
                update={"status": BuildStatus.error, "logs": job.logs + ["[cancelled] Job cancelled by user."]}
            )
            return True


store = BuildStore()
