from fastapi import APIRouter, HTTPException
from schemas import TemplateSchema, TemplateListResponse
from services.template_registry import TEMPLATES, TEMPLATE_MAP

router = APIRouter()


@router.get("", response_model=TemplateListResponse)
def list_templates() -> TemplateListResponse:
    return TemplateListResponse(templates=TEMPLATES)


@router.get("/{template_id}", response_model=TemplateSchema)
def get_template(template_id: str) -> TemplateSchema:
    t = TEMPLATE_MAP.get(template_id)
    if not t:
        raise HTTPException(status_code=404, detail=f"Template '{template_id}' not found")
    return t
