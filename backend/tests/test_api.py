"""
pytest test suite — run with: pytest tests/ -v
Requires: pip install httpx pytest pytest-asyncio anyio
"""
import sys, os, datetime
import pytest
from httpx import AsyncClient, ASGITransport

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from main import app
from ml.engine import train_for_template
from schemas import TemplateCategory, BuildStatus, GenerateRequest
from services.build_store import BuildStore


# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture
def anyio_backend(): return "asyncio"


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


# ── Health ────────────────────────────────────────────────────────────────────

@pytest.mark.anyio
async def test_health(client: AsyncClient):
    r = await client.get("/healthz")
    assert r.status_code == 200
    body = r.json()
    assert body["ok"] is True
    assert "env" in body


# ── Templates ─────────────────────────────────────────────────────────────────

@pytest.mark.anyio
async def test_list_templates_count(client: AsyncClient):
    r = await client.get("/api/templates")
    assert r.status_code == 200
    assert len(r.json()["templates"]) == 10


@pytest.mark.anyio
async def test_get_template_valid(client: AsyncClient):
    r = await client.get("/api/templates/saas-launch")
    assert r.status_code == 200
    t = r.json()
    assert t["id"] == "saas-launch"
    assert t["category"] == "saas"
    assert len(t["sections"]) > 0
    # camelCase fields present (alias_generator)
    assert "mlFeatures" in t,         "mlFeatures must be camelCase in response"
    assert "estimatedBuildSec" in t,   "estimatedBuildSec must be camelCase in response"


@pytest.mark.anyio
async def test_get_template_not_found(client: AsyncClient):
    r = await client.get("/api/templates/does-not-exist")
    assert r.status_code == 404


@pytest.mark.anyio
async def test_all_templates_schema(client: AsyncClient):
    r = await client.get("/api/templates")
    for t in r.json()["templates"]:
        assert t["id"]
        assert t["name"]
        assert t["accent"].startswith("#")
        assert t["estimatedBuildSec"] > 0     # camelCase
        assert len(t["mlFeatures"]) >= 1       # camelCase
        assert len(t["sections"]) >= 1


# ── Builds — create ───────────────────────────────────────────────────────────

@pytest.mark.anyio
async def test_create_build_valid(client: AsyncClient):
    r = await client.post("/api/builds", json={
        "templateId": "saas-launch",            # camelCase input
        "projectName": "Test Project",
        "primaryColor": "#ff5500",
        "userDescription": "A test build",
    })
    assert r.status_code == 202
    job = r.json()
    assert job["id"]
    assert job["status"] == "queued"
    assert job["templateId"] == "saas-launch"  # camelCase output
    assert job["progress"] == 0
    assert "createdAt" in job                   # camelCase output


@pytest.mark.anyio
async def test_create_build_also_accepts_snake_case(client: AsyncClient):
    """Backend must accept snake_case input too (populate_by_name=True)."""
    r = await client.post("/api/builds", json={
        "template_id": "blog-publication",
        "project_name": "Snake Case Test",
        "primary_color": "#000000",
    })
    assert r.status_code == 202
    assert r.json()["templateId"] == "blog-publication"


@pytest.mark.anyio
async def test_create_build_unknown_template(client: AsyncClient):
    r = await client.post("/api/builds", json={
        "templateId": "fake-template",
        "projectName": "X",
        "primaryColor": "#000000",
    })
    assert r.status_code == 422


@pytest.mark.anyio
async def test_create_build_empty_project_name(client: AsyncClient):
    r = await client.post("/api/builds", json={
        "templateId": "saas-launch",
        "projectName": "",
        "primaryColor": "#000000",
    })
    assert r.status_code == 422


# ── Builds — read ─────────────────────────────────────────────────────────────

@pytest.mark.anyio
async def test_get_build_after_create(client: AsyncClient):
    create_r = await client.post("/api/builds", json={
        "templateId": "blog-publication",
        "projectName": "My Blog",
        "primaryColor": "#333333",
    })
    job_id = create_r.json()["id"]
    get_r = await client.get(f"/api/builds/{job_id}")
    assert get_r.status_code == 200
    assert get_r.json()["id"] == job_id
    assert get_r.json()["templateId"] == "blog-publication"


@pytest.mark.anyio
async def test_get_build_not_found(client: AsyncClient):
    r = await client.get("/api/builds/00000000-0000-0000-0000-000000000000")
    assert r.status_code == 404


@pytest.mark.anyio
async def test_list_builds_schema(client: AsyncClient):
    r = await client.get("/api/builds")
    assert r.status_code == 200
    body = r.json()
    assert "builds" in body
    assert isinstance(body["builds"], list)


# ── Builds — cancel ───────────────────────────────────────────────────────────

@pytest.mark.anyio
async def test_cancel_in_progress_build():
    store = BuildStore()
    req = GenerateRequest(template_id="startup-product", project_name="CancelMe", primary_color="#000000")
    job = await store.create(req)
    await store.update(job.id, status=BuildStatus.training, progress=20)
    ok = await store.cancel(job.id)
    assert ok is True
    result = await store.get(job.id)
    assert result is not None
    assert result.status == BuildStatus.error


@pytest.mark.anyio
async def test_cancel_completed_build_returns_false():
    store = BuildStore()
    req = GenerateRequest(template_id="saas-launch", project_name="AlreadyDone", primary_color="#000000")
    job = await store.create(req)
    await store.update(
        job.id,
        status=BuildStatus.done,
        completed_at=datetime.datetime.now(datetime.timezone.utc),
    )
    ok = await store.cancel(job.id)
    assert ok is False


@pytest.mark.anyio
async def test_cancel_nonexistent_build_via_api(client: AsyncClient):
    r = await client.post("/api/builds/nonexistent-id/cancel")
    assert r.status_code == 409


# ── Build store unit tests ────────────────────────────────────────────────────

@pytest.mark.anyio
async def test_build_store_create_and_get():
    store = BuildStore()
    req = GenerateRequest(template_id="saas-launch", project_name="Test", primary_color="#000000")
    job = await store.create(req)
    fetched = await store.get(job.id)
    assert fetched is not None
    assert fetched.id == job.id
    assert fetched.template_id == "saas-launch"


@pytest.mark.anyio
async def test_build_store_append_log():
    store = BuildStore()
    req = GenerateRequest(template_id="saas-launch", project_name="X", primary_color="#000000")
    job = await store.create(req)
    await store.append_log(job.id, "line one")
    await store.append_log(job.id, "line two")
    updated = await store.get(job.id)
    assert updated is not None
    assert "line one" in updated.logs
    assert "line two" in updated.logs


@pytest.mark.anyio
async def test_build_store_update_status_and_progress():
    store = BuildStore()
    req = GenerateRequest(template_id="saas-launch", project_name="X", primary_color="#000000")
    job = await store.create(req)
    updated = await store.update(job.id, status=BuildStatus.training, progress=45)
    assert updated is not None
    assert updated.status == BuildStatus.training
    assert updated.progress == 45


@pytest.mark.anyio
async def test_build_store_get_nonexistent():
    store = BuildStore()
    result = await store.get("does-not-exist")
    assert result is None


@pytest.mark.anyio
async def test_build_store_list_all():
    store = BuildStore()
    req = GenerateRequest(template_id="saas-launch", project_name="A", primary_color="#000000")
    await store.create(req)
    await store.create(req)
    all_jobs = await store.list_all()
    assert len(all_jobs) >= 2


# ── ML engine unit tests ──────────────────────────────────────────────────────

def test_ml_engine_nlp():
    m = train_for_template(TemplateCategory.saas)
    assert m.accuracy is not None and 0 < m.accuracy <= 1.0
    assert m.latency_ms is not None and m.latency_ms >= 0
    assert m.model_size is not None


def test_ml_engine_tabular():
    m = train_for_template(TemplateCategory.realestate)
    assert m.accuracy is not None and m.accuracy <= 1.0


def test_ml_engine_reco():
    m = train_for_template(TemplateCategory.ecommerce)
    assert m.accuracy is not None and 0 < m.accuracy <= 1.0


def test_ml_engine_scoring():
    m = train_for_template(TemplateCategory.agency)
    assert m.accuracy is not None and 0 < m.accuracy <= 1.0


def test_ml_engine_all_categories_no_error():
    for cat in TemplateCategory:
        m = train_for_template(cat)
        assert m.accuracy  is not None, f"Missing accuracy for {cat}"
        assert m.latency_ms is not None, f"Missing latency for {cat}"
        assert m.model_size is not None, f"Missing model_size for {cat}"


def test_ml_engine_cache_is_used():
    from services.model_store import model_exists
    import hashlib
    cat = TemplateCategory.startup
    key = f"model_{cat.value}_{hashlib.md5(cat.value.encode()).hexdigest()[:8]}"
    train_for_template(cat)
    assert model_exists(key), "Model should be persisted to disk after training"


def test_ml_metrics_fields_present():
    for cat in [TemplateCategory.saas, TemplateCategory.ecommerce,
                TemplateCategory.portfolio, TemplateCategory.healthcare]:
        m = train_for_template(cat)
        assert m.accuracy  is not None
        assert m.latency_ms is not None
        assert m.model_size not in (None, "unknown")
