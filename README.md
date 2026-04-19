# WebForge AI — Automated ML/AI Web Builder

A full-stack platform that trains adaptive ML models and generates production-ready websites from 10 configurable templates. Select a template → fill in project details → click **Magic Build** → watch the ML pipeline train and generate your site in real time.

---

## Tech Stack

| Layer      | Technology                                           |
|------------|------------------------------------------------------|
| Frontend   | Next.js 14 (App Router), Tailwind CSS, Lucide React  |
| State      | SWR 2 — zero `useEffect` for data fetching           |
| Validation | Zod (client-side form guard)                         |
| Backend    | Python 3.12, FastAPI 0.111, Pydantic v2              |
| ML         | Scikit-Learn (TF-IDF, RandomForest, SVD, GBM)        |
| Persist    | Joblib model cache, asyncio in-memory build store    |
| DevOps     | Docker Compose, Makefile                             |

---

## Application Flow

```
User Browser
     │
     │  1. Load dashboard (Next.js App Router, SSR)
     ▼
┌─────────────────────────────────────────────────────────┐
│  DashboardClient.tsx                                    │
│                                                         │
│  useTemplates()  ──SWR GET /api/templates──►            │
│  TemplateCard ×10  (select one)                         │
│                                                         │
│  [Fill: project name, description, color]               │
│  [Click Magic Build]                                    │
│         │                                               │
│  useSiteGenerate()  ──SWR Mutation──►                   │
│  POST /api/builds  { templateId, projectName, … }       │
│         │                                               │
│  ◄── 202 Accepted  { id, status:"queued" }              │
│         │                                               │
│  useBuildStatus(id)  ── polls every 1.2 s ──►           │
│  GET /api/builds/:id                                    │
│  (stops polling when status = done | error)             │
│                                                         │
│  BuildStatusPanel  shows live progress + logs + metrics │
└─────────────────────────────────────────────────────────┘
     │
     │  HTTP (proxied by Next.js /api/* rewrite)
     ▼
┌─────────────────────────────────────────────────────────┐
│  FastAPI  (port 8000)                                   │
│                                                         │
│  POST /api/builds                                       │
│    1. Validate GenerateRequest (Pydantic)               │
│    2. Create BuildJob { status:"queued" }               │
│    3. Dispatch background task (BackgroundTasks)        │
│    4. Return 202 immediately                            │
│                                                         │
│  Background Pipeline (build_pipeline.py)               │
│    │                                                    │
│    ├─ status → "training"  (progress 10–62%)           │
│    │    run_in_executor → ML Engine                     │
│    │       ├─ NLP categories:     TF-IDF + LogReg       │
│    │       ├─ Tabular categories: RandomForest          │
│    │       ├─ Reco categories:    TruncatedSVD          │
│    │       └─ Scoring categories: GradientBoosting      │
│    │    Persist model to disk (joblib, /tmp/models/)    │
│    │    Update BuildJob.mlMetrics                       │
│    │                                                    │
│    ├─ status → "generating"  (progress 65–90%)         │
│    │    site_generator.py assembles HTML from           │
│    │    TemplateSchema sections + user config           │
│    │                                                    │
│    └─ status → "done"  (progress 100%)                 │
│         output_url set → preview served at             │
│         GET /preview/:build_id                          │
│                                                         │
│  GET /api/builds/:id                                    │
│    Return current BuildJob (polled by SWR)             │
└─────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
ai-web-builder/
├── Makefile                    # make dev | test | docker-up | lint | clean
├── docker-compose.yml          # backend :8000 + frontend :3000
├── README.md
│
├── backend/
│   ├── main.py                 # FastAPI app, CORS, router mounts
│   ├── config.py               # Env-var settings, @lru_cache singleton
│   ├── requirements.txt        # All pinned deps + test deps
│   ├── pytest.ini              # asyncio_mode = auto
│   ├── .env.example
│   ├── Dockerfile
│   │
│   ├── schemas/__init__.py     # Pydantic v2 models with camelCase aliases
│   │                             CamelModel base → alias_generator=to_camel
│   │                             All API responses are camelCase automatically
│   │
│   ├── routers/
│   │   ├── templates.py        # GET /api/templates  GET /api/templates/:id
│   │   ├── builds.py           # POST|GET|LIST|CANCEL /api/builds
│   │   └── preview.py          # GET /preview/:build_id → HTMLResponse
│   │
│   ├── services/
│   │   ├── template_registry.py  # 10 TemplateSchema objects, TEMPLATE_MAP
│   │   ├── build_store.py        # asyncio.Lock in-memory job store
│   │   ├── build_pipeline.py     # queued → training → generating → done
│   │   ├── site_generator.py     # HTML assembler (swap with Jinja2/Next SSG)
│   │   └── model_store.py        # joblib save/load, MODEL_CACHE_DIR
│   │
│   ├── ml/
│   │   └── engine.py           # 4-strategy ML dispatcher + disk cache
│   │
│   └── tests/
│       └── test_api.py         # 27 tests: routes, camelCase, store, ML, cancel
│
└── frontend/
    ├── package.json            # next 14, swr 2, lucide-react, clsx, zod
    ├── next.config.js          # /api/* → backend rewrite proxy
    ├── tailwind.config.ts      # font vars: --font-sans, --font-mono
    ├── tsconfig.json
    ├── postcss.config.js
    ├── .env.example
    ├── Dockerfile
    │
    ├── types/index.ts          # TS interfaces matching backend camelCase output
    │
    ├── lib/
    │   ├── api.ts              # Typed fetcher + api.templates.* / api.builds.*
    │   ├── templates.ts        # 10 TemplateConfig[] (client-side fallback data)
    │   └── validation.ts       # Zod schema for GenerateRequest + fieldErrors map
    │
    ├── hooks/
    │   ├── useTemplates.ts     # SWR + local fallback, zero useEffect
    │   ├── useBuildStatus.ts   # Adaptive polling (stops at done|error)
    │   └── useSiteGenerate.ts  # SWR mutation → returns activeBuildId
    │
    ├── components/
    │   ├── SWRProvider.tsx     # Global SWR config (retry, errorRetryCount)
    │   ├── TemplateCard.tsx    # Accent-ring selection card
    │   ├── MagicBuildButton.tsx  # Pulse-ring, spinner, live indigo dot
    │   └── BuildStatusPanel.tsx  # Progress bar, metrics grid, log terminal
    │
    └── app/                    # Next.js App Router
        ├── layout.tsx          # Google Fonts (Inter + JetBrains Mono), SWRProvider
        ├── page.tsx            # Server entry → DashboardClient
        ├── DashboardClient.tsx # Full dashboard: filter/select/configure/build
        ├── loading.tsx         # Suspense skeleton
        ├── error.tsx           # Error boundary with reset
        ├── globals.css         # Wise tokens: card, btn-primary, input, skeleton…
        ├── history/page.tsx    # Build history table with SWR live refresh
        └── build/[id]/page.tsx # Per-build detail with live status polling
```

---

## Quick Start

### Option A — Docker (recommended)

```bash
git clone <repo>
cd ai-web-builder
docker compose up --build
```

Frontend: http://localhost:3000  
Backend API: http://localhost:8000  
API Docs: http://localhost:8000/docs

### Option B — Local dev

```bash
# 1. Backend
cd backend
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8000

# 2. Frontend (new terminal)
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

### Option C — Makefile shortcuts

```bash
make install       # pip install + npm install
make dev           # both services concurrently
make test          # 27-test pytest suite
make docker-up     # docker compose up --build
make clean         # remove __pycache__, .next, node_modules
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable          | Default                   | Description                          |
|-------------------|---------------------------|--------------------------------------|
| `APP_ENV`         | `development`             | `development` or `production`        |
| `CORS_ORIGINS`    | `http://localhost:3000`   | Comma-separated allowed origins      |
| `MODEL_CACHE_DIR` | `/tmp/webforge_models`    | Directory for joblib model files     |
| `LOG_LEVEL`       | `info`                    | Uvicorn log level                    |

### Frontend (`frontend/.env.local`)

| Variable                | Default                  | Description           |
|-------------------------|--------------------------|-----------------------|
| `NEXT_PUBLIC_API_URL`   | `http://localhost:8000`  | FastAPI base URL      |

---

## API Reference

### Templates

```
GET  /api/templates          → { templates: TemplateConfig[] }
GET  /api/templates/:id      → TemplateConfig
```

### Builds

```
POST /api/builds             → 202 BuildJob          (starts background pipeline)
GET  /api/builds             → { builds: BuildJob[] }
GET  /api/builds/:id         → BuildJob              (poll for status updates)
POST /api/builds/:id/cancel  → { ok: true }
GET  /preview/:id            → text/html              (generated site preview)
```

### Request body (camelCase — matches TypeScript types)

```json
{
  "templateId":      "saas-launch",
  "projectName":     "My SaaS",
  "primaryColor":    "#1a6cf6",
  "userDescription": "A B2B analytics platform"
}
```

> The backend also accepts snake_case input (`template_id`, `project_name`, etc.)
> thanks to `populate_by_name=True` on all Pydantic models.

### BuildJob shape (camelCase response)

```json
{
  "id":          "3f2a1b9c-...",
  "templateId":  "saas-launch",
  "status":      "done",
  "progress":    100,
  "createdAt":   "2025-01-01T12:00:00",
  "completedAt": "2025-01-01T12:00:18",
  "outputUrl":   "http://localhost:8000/preview/3f2a1b9c-.html",
  "logs":        ["[queued] ...", "[training] ...", "[done] ..."],
  "mlMetrics": {
    "accuracy":  0.942,
    "latencyMs": 47,
    "modelSize": "2.1 MB"
  }
}
```

---

## ML Strategy Matrix

| Template categories             | Algorithm                        | Accuracy | Model size | p95 inference |
|---------------------------------|----------------------------------|----------|------------|---------------|
| `saas`, `blog`, `startup`       | TF-IDF (4k features) + LogReg    | ~94%     | ~2 MB      | < 10 ms       |
| `realestate`, `healthcare`, `education` | StandardScaler + RandomForest (60 trees) | ~99% | ~4 MB | < 20 ms |
| `ecommerce`, `restaurant`       | TruncatedSVD (k=32) on sparse matrix | ~85% variance | ~1.5 MB | < 5 ms |
| `agency`, `portfolio`           | StandardScaler + GradientBoosting (n=40) | ~92% F1 | ~3 MB | < 15 ms |

Models are cached to disk on first train (`MODEL_CACHE_DIR`). Subsequent builds for the same category load the cached model in milliseconds.

---

## SWR Data Flow

```
Component                Hook                    Key / Behaviour
─────────────────────────────────────────────────────────────────────────────
DashboardClient    →  useTemplates()         GET /api/templates
                       fallbackData from lib/templates.ts (instant render)

DashboardClient    →  useSiteGenerate()      SWR Mutation → POST /api/builds
                       returns activeBuildId on success

BuildStatusPanel   →  useBuildStatus(id)     GET /api/builds/:id
                       polls every 1.2 s while status ∈ {queued,training,generating}
                       stops polling automatically at done | error

history/page.tsx   →  useBuildList()         GET /api/builds
                       polls every 5 s, revalidates on focus
```

Zero `useEffect` for data fetching — all state lives in SWR's cache.

---

## Running Tests

```bash
cd backend
pytest tests/ -v

# Expected output:
# 27 passed in ~12s
# 0 warnings, 0 failures
```

Test coverage includes:
- Health check
- All 10 templates schema (camelCase field assertion)
- Build create (camelCase + snake_case input)
- Build read / list / cancel
- Build store concurrency (asyncio.Lock)
- ML engine: all 4 strategies + all 10 categories
- Model disk cache assertion

---

## Production Checklist

- [ ] Replace in-memory `BuildStore` with Redis (swap `services/build_store.py`)
- [ ] Replace HTML `site_generator.py` with Jinja2 templates or headless Next.js SSG
- [ ] Upload generated HTML to S3/Vercel and update `output_url`
- [ ] Add authentication (NextAuth.js frontend + JWT middleware on FastAPI)
- [ ] Add Celery + Redis worker for scalable background ML jobs
- [ ] Configure `MODEL_CACHE_DIR` to a persistent volume (not `/tmp`)
- [ ] Set `APP_ENV=production` and restrict `CORS_ORIGINS`
- [ ] Wire `error.tsx` to Sentry or Datadog
