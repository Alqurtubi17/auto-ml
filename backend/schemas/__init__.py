from __future__ import annotations
from enum import Enum
from pydantic import BaseModel, Field, ConfigDict
from pydantic.alias_generators import to_camel
import datetime

# Base
class CamelModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, protected_namespaces=())


# Enums

class TemplateCategory(str, Enum):
    saas        = "saas"
    ecommerce   = "ecommerce"
    portfolio   = "portfolio"
    blog        = "blog"
    restaurant  = "restaurant"
    realestate  = "realestate"
    healthcare  = "healthcare"
    education   = "education"
    agency      = "agency"
    startup     = "startup"

# Template schemas

class SectionConfig(CamelModel):
    id:     str
    type:   str
    config: dict[str, Any] = Field(default_factory=dict)


class TemplateSchema(CamelModel):
    id:                  str
    name:                str
    category:            TemplateCategory
    description:         str
    accent:              str
    sections:            list[SectionConfig]
    ml_features:         list[str]
    estimated_build_sec: int


class MLTaskType(str, Enum):
    classification = "classification"
    regression     = "regression"
    clustering     = "clustering"

class BuildJob(CamelModel):
    id:           str
    template_id:  str
    status:       BuildStatus
    progress:     int                    = 0
    created_at:   datetime.datetime
    completed_at: datetime.datetime | None = None
    output_url:   str               | None = None
    logs:         list[str]               = Field(default_factory=list)
    ml_metrics:   MLMetrics         | None = None

class BuildStatus(str, Enum):
    idle       = "idle"
    queued     = "queued"
    training   = "training"
    generating = "generating"
    done       = "done"
    error      = "error"

class MLMetrics(CamelModel):
    accuracy: float | None = None
    latency_ms: int | None = None
    model_size: str | None = None
    algorithm_name: str | None = None
    chart_data: list[dict] = []

class GenerateMLRequest(CamelModel):
    project_name: str = Field(min_length=1, max_length=120)
    task_type: MLTaskType
    data_file: str | None = None
    algorithm: str 

class MLProjectResponse(CamelModel):
    id: str
    project_name: str
    task_type: MLTaskType
    status: BuildStatus
    progress: int = 0
    accuracy: float | None = None
    metrics: MLMetrics | None = None
    hugging_face_url: str | None = None
    generated_code: str | None = None
    ui_schema: dict | None = None
    created_at: datetime.datetime
    completed_at: datetime.datetime | None = None
    logs: list[str] = Field(default_factory=list)

# ── Request / response wrappers ───────────────────────────────────────────────

class GenerateRequest(CamelModel):
    template_id:      str
    project_name:     str  = Field(min_length=1, max_length=120)
    primary_color:    str  = "#1a1a1a"
    user_description: str  = ""
    data_file:        str  | None = None


class BuildListResponse(CamelModel):
    builds: list[BuildJob]


class TemplateListResponse(CamelModel):
    templates: list[TemplateSchema]



