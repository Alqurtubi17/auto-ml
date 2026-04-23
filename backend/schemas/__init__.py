from __future__ import annotations
from enum import Enum
from pydantic import BaseModel, Field, ConfigDict
from pydantic.alias_generators import to_camel
import datetime

class CamelModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        protected_namespaces=()
    )

class MLTaskType(str, Enum):
    classification = "classification"
    regression = "regression"
    clustering = "clustering"

class BuildStatus(str, Enum):
    idle = "idle"
    queued = "queued"
    training = "training"
    generating = "generating"
    done = "done"
    error = "error"
    stopped = "stopped"

class MLMetrics(CamelModel):
    accuracy: float | None = None
    latency_ms: int | None = None
    model_size: str | None = None
    algorithm_name: str | None = None
    chart_data: list[dict] | None = None
    detailed_metrics: list[dict] | None = None
    scatter_data: list[dict] | None = None
    best_parameters: dict | None = None

class GenerateMLRequest(CamelModel):
    user_id: str = Field(..., description="ID user dari NextAuth") # Wajib ada
    project_name: str = Field(min_length=1, max_length=120)
    task_type: MLTaskType
    algorithm: str = "auto"
    data_file: str | None = None
    target_column: str | None = None
    feature_columns: list[str] | None = None
    nan_strategy: str = "mean"
    scaling_strategy: str = "none"
    use_tuning: bool = False
    hyperparameters: dict | None = None

class MLProjectResponse(CamelModel):
    id: str
    user_id: str
    project_name: str
    task_type: MLTaskType
    status: BuildStatus
    progress: int = 0
    accuracy: float | None = None
    hugging_face_url: str | None = None
    generated_code: str | None = None
    ui_schema: dict | None = None
    metrics: MLMetrics | None = None
    created_at: datetime.datetime
    completed_at: datetime.datetime | None = None
    logs: list[str] = Field(default_factory=list)