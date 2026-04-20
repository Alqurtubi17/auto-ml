# backend/services/build_store.py
from __future__ import annotations
import datetime
from prisma import Prisma
from schemas import MLProjectResponse, MLTaskType, BuildStatus, GenerateMLRequest

# Inisialisasi klien Prisma
db = Prisma()

class BuildStore:
    """Persistent ML Job registry using Prisma & Neon.tech."""

    async def connect(self):
        if not db.is_connected():
            await db.connect()

    async def create(self, req: GenerateMLRequest) -> MLProjectResponse:
        await self.connect()
        # Simpan project baru ke database Neon
        project = await db.mlproject.create(
            data={
                "projectName": req.project_name,
                "taskType": req.task_type.value,
                "status": BuildStatus.queued.value,
                "progress": 0,
                "logs": [f"[queued] Job created for task '{req.task_type.value}'"]
            }
        )
        return self._format_response(project)

    async def get(self, job_id: str) -> MLProjectResponse | None:
        await self.connect()
        project = await db.mlproject.find_unique(where={"id": job_id})
        if not project:
            return None
        return self._format_response(project)

    async def list_all(self) -> list[MLProjectResponse]:
        await self.connect()
        projects = await db.mlproject.find_many(order={"createdAt": "desc"})
        return [self._format_response(p) for p in projects]

    async def update(self, job_id: str, **kwargs) -> MLProjectResponse | None:
        await self.connect()
        
        # Mapping nama variabel Python (snake_case) ke kolom Prisma (camelCase)
        data_to_update = {}
        if "status" in kwargs: data_to_update["status"] = kwargs["status"].value
        if "progress" in kwargs: data_to_update["progress"] = kwargs["progress"]
        if "accuracy" in kwargs: data_to_update["accuracy"] = kwargs["accuracy"]
        if "generated_code" in kwargs: data_to_update["generatedCode"] = kwargs["generated_code"]
        if "hugging_face_url" in kwargs: data_to_update["huggingFaceUrl"] = kwargs["hugging_face_url"]
        if "ui_schema" in kwargs: data_to_update["uiSchema"] = kwargs["ui_schema"]
        
        if "completed_at" in kwargs: 
            data_to_update["completedAt"] = kwargs["completed_at"]

        project = await db.mlproject.update(
            where={"id": job_id},
            data=data_to_update
        )
        return self._format_response(project)

    async def append_log(self, job_id: str, line: str) -> None:
        await self.connect()
        project = await db.mlproject.find_unique(where={"id": job_id})
        if project:
            new_logs = project.logs + [line]
            await db.mlproject.update(
                where={"id": job_id},
                data={"logs": new_logs}
            )

    async def cancel(self, job_id: str) -> bool:
        await self.connect()
        project = await db.mlproject.find_unique(where={"id": job_id})
        if not project or project.status in (BuildStatus.done.value, BuildStatus.error.value):
            return False
        
        await db.mlproject.update(
            where={"id": job_id},
            data={
                "status": BuildStatus.error.value,
                "logs": project.logs + ["[cancelled] Job cancelled by user."]
            }
        )
        return True

    def _format_response(self, prisma_model) -> MLProjectResponse:
        """Helper untuk mengubah model database menjadi Pydantic Response"""
        ui_schema = prisma_model.uiSchema
        metrics = None
        if ui_schema and isinstance(ui_schema, dict) and "_metrics" in ui_schema:
            # Create a copy to avoid mutating the original if it's cached
            ui_schema = dict(ui_schema)
            metrics = ui_schema.pop("_metrics")
            
        return MLProjectResponse(
            id=prisma_model.id,
            project_name=prisma_model.projectName,
            task_type=MLTaskType(prisma_model.taskType),
            status=BuildStatus(prisma_model.status),
            progress=prisma_model.progress,
            accuracy=prisma_model.accuracy,
            hugging_face_url=prisma_model.huggingFaceUrl,
            generated_code=prisma_model.generatedCode,
            ui_schema=ui_schema,
            metrics=metrics,
            created_at=prisma_model.createdAt,
            logs=prisma_model.logs
        )

store = BuildStore()