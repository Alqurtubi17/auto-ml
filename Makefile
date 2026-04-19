.PHONY: dev dev-backend dev-frontend install install-backend install-frontend \
        test lint fmt docker-up docker-down clean

# ── Local dev ─────────────────────────────────────────────────────────────────

dev: ## Start both services concurrently (requires tmux or run in two terminals)
	@echo "Starting backend on :8000 and frontend on :3000"
	@make -j2 dev-backend dev-frontend

dev-backend:
	cd backend && uvicorn main:app --host 0.0.0.0 --port 8000 --reload

dev-frontend:
	cd frontend && npm run dev

# ── Install ───────────────────────────────────────────────────────────────────

install: install-backend install-frontend

install-backend:
	cd backend && pip install -r requirements.txt

install-frontend:
	cd frontend && npm install

# ── Test ──────────────────────────────────────────────────────────────────────

test: ## Run backend pytest suite
	cd backend && pytest tests/ -v --tb=short

test-watch:
	cd backend && pytest tests/ -v --tb=short -f

# ── Quality ───────────────────────────────────────────────────────────────────

lint: ## Lint both stacks
	cd backend && python -m py_compile main.py routers/*.py services/*.py ml/*.py schemas/__init__.py
	cd frontend && npx tsc --noEmit

fmt: ## Format Python code with black
	cd backend && python -m black . --line-length 100

# ── Docker ────────────────────────────────────────────────────────────────────

docker-up: ## Start full stack via Docker Compose
	docker compose up --build

docker-down:
	docker compose down

# ── Env setup ─────────────────────────────────────────────────────────────────

setup-env:
	cp frontend/.env.example frontend/.env.local
	cp backend/.env.example backend/.env
	@echo "Edit frontend/.env.local and backend/.env before starting."

# ── Clean ─────────────────────────────────────────────────────────────────────

clean:
	find . -name "__pycache__" -type d | xargs rm -rf
	find . -name "*.pyc" -delete
	rm -rf frontend/.next frontend/node_modules
	@echo "Cleaned."

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
	  awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'
