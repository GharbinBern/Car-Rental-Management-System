.PHONY: dev backend frontend stop create-admin

dev:
	@chmod +x start.sh
	@./start.sh

backend:
	@eval "$$(conda shell.zsh hook)" && conda activate car-rental || true; \
	uvicorn backend.api.main:app --reload --port 8000

frontend:
	@cd frontend && npm run dev -- --port 3000 --strictPort --host

stop:
	@lsof -ti:8000,3000 | xargs -r kill -9 || true

create-admin:
	@eval "$$(conda shell.zsh hook)" && conda activate car-rental || true; \
	python backend/cli/manage.py create-admin
