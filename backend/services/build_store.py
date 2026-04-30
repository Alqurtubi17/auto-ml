from __future__ import annotations
import datetime
import json
from prisma import Prisma, Json
from schemas import (
    MLProjectResponse,
    MLTaskType,
    BuildStatus,
    GenerateMLRequest,
    MLMetrics,
)

db = Prisma()

class BuildStore:
    async def connect(self):
        if not db.is_connected():
            await db.connect()

    async def create(self, req: GenerateMLRequest) -> MLProjectResponse:
        project = await db.mlproject.create(
            data={
                "userId": req.user_id,
                "projectName": req.project_name,
                "taskType": req.task_type.value,
                "status": BuildStatus.queued.value,
                "progress": 0,
                "logs": Json([f"[queued] Job created for '{req.task_type.value}'"]),
            }
        )
        return self._to_schema(project)

    async def get(self, job_id: str) -> MLProjectResponse | None:
        project = await db.mlproject.find_unique(where={"id": job_id})
        return self._to_schema(project) if project else None

    async def list_all(self) -> list[MLProjectResponse]:
        projects = await db.mlproject.find_many(order={"createdAt": "desc"})
        return [self._to_schema(p) for p in projects]

    async def update(self, job_id: str, **kwargs) -> MLProjectResponse | None:
        data = {}

        if "status" in kwargs:
            status = kwargs["status"]
            data["status"] = status.value if hasattr(status, "value") else status

        if "progress" in kwargs:
            data["progress"] = kwargs["progress"]

        if "accuracy" in kwargs:
            data["accuracy"] = kwargs["accuracy"]

        if "generated_code" in kwargs:
            data["generatedCode"] = kwargs["generated_code"]

        if "hugging_face_url" in kwargs:
            data["huggingFaceUrl"] = kwargs["hugging_face_url"]

        if "ui_schema" in kwargs:
            data["uiSchema"] = Json(kwargs["ui_schema"])
            
        if "metrics" in kwargs:
            data["metrics"] = Json(kwargs["metrics"])
            
        if "logs" in kwargs:
            data["logs"] = Json(kwargs["logs"])

        if "completed_at" in kwargs:
            data["completedAt"] = kwargs["completed_at"]

        project = await db.mlproject.update(
            where={"id": job_id},
            data=data
        )

        return self._to_schema(project)

    async def delete(self, job_id: str) -> bool:
        try:
            await db.mlproject.delete(where={"id": job_id})
            return True
        except:
            return False

    async def append_log(self, job_id: str, line: str) -> None:
        project = await db.mlproject.find_unique(where={"id": job_id})

        if not project:
            return

        logs = project.logs
        if logs is None:
            logs = []
        elif isinstance(logs, str):
            try:
                logs = json.loads(logs)
            except:
                logs = []
        elif not isinstance(logs, list):
            logs = []

        logs.append(line)

        await db.mlproject.update(
            where={"id": job_id},
            data={"logs": Json(logs)}
        )

    def _to_schema(self, p) -> MLProjectResponse:
        metrics = None

        if getattr(p, "metrics", None) and isinstance(p.metrics, dict):
            metrics = MLMetrics(**p.metrics)
        elif p.uiSchema and isinstance(p.uiSchema, dict):
            raw_metrics = p.uiSchema.get("_metrics")
            if raw_metrics:
                metrics = MLMetrics(**raw_metrics)
                
        logs_list = p.logs
        if isinstance(logs_list, str):
            try:
                logs_list = json.loads(logs_list)
            except:
                logs_list = []
        if not isinstance(logs_list, list):
            logs_list = []

        return MLProjectResponse(
            id=p.id,
            project_name=p.projectName,
            task_type=MLTaskType(p.taskType),
            status=BuildStatus(p.status),
            progress=p.progress,
            accuracy=p.accuracy,
            hugging_face_url=p.huggingFaceUrl,
            generated_code=p.generatedCode,
            ui_schema=p.uiSchema,
            metrics=metrics,
            created_at=p.createdAt,
            completed_at=p.completedAt,
            logs=logs_list,
        )

store = BuildStore()