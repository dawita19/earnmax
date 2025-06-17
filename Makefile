# Makefile
.PHONY: deploy setup configure

deploy: setup configure
	@echo "🚀 Deploying all services"
	@make deploy-frontend
	@make deploy-backend

deploy-frontend:
	@echo "🌐 Deploying frontend to Vercel"
	@cd frontend && vercel --prod

deploy-backend:
	@echo "⚙️ Deploying backend to Railway"
	@railway up --service backend --detach

setup:
	@echo "🔧 Setting up deployment environment"
	@chmod +x scripts/setup-deployments.sh
	@./scripts/setup-deployments.sh

configure:
	@echo "⚙️ Configuring environment variables"
	@chmod +x scripts/configure-env.sh
	@./scripts/configure-env.sh

migrate:
	@echo "🔄 Running database migrations"
	@railway run -- npm run migrate:prod

seed:
	@echo "🌱 Seeding database"
	@railway run -- npm run seed:prod

local:
	@echo "🏠 Starting local development environment"
	@docker-compose up -d
	@cd frontend && npm run dev