from __future__ import annotations
from enum import Enum
from typing import Any
from pydantic import BaseModel, Field, ConfigDict
from pydantic.alias_generators import to_camel
import datetime


# ── Base ──────────────────────────────────────────────────────────────────────

class CamelModel(BaseModel):
    """Base for all API schemas.
    - alias_generator: serialises field names as camelCase (templateId, mlFeatures…)
    - populate_by_name: accepts both snake_case (Python code) and camelCase (JSON body)
    FastAPI's jsonable_encoder calls model_dump(by_alias=True) automatically, so
    all HTTP responses are camelCase; no extra configuration needed.
    """
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )


# ── Enums ─────────────────────────────────────────────────────────────────────

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


class BuildStatus(str, Enum):
    idle       = "idle"
    queued     = "queued"
    training   = "training"
    generating = "generating"
    done       = "done"
    error      = "error"


# ── Template schemas ──────────────────────────────────────────────────────────

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


# ── Build schemas ─────────────────────────────────────────────────────────────

class MLMetrics(CamelModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        protected_namespaces=(),
    )
    accuracy:   float | None = None
    latency_ms: int   | None = None
    model_size: str   | None = None


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
