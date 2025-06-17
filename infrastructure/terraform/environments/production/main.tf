terraform {
  required_providers {
    vercel = {
      source = "vercel/vercel"
      version = "~> 0.3"
    }
    railway = {
      source = "terraform-railway/railway"
      version = "~> 0.2"
    }
  }
}

# Vercel Frontend Configuration
resource "vercel_project" "earnmax_elite_frontend" {
  name      = "earnmax-elite-frontend-prod"
  framework = "nextjs"
  git_repository = {
    type = "github"
    repo = "your-github-org/earnmax-elite"
  }

  environment = [
    {
      key    = "NEXT_PUBLIC_API_URL"
      value  = railway_service.backend_api.production_url
      target = ["production"]
    },
    {
      key    = "NEXT_PUBLIC_ENV"
      value  = "production"
      target = ["production"]
    }
  ]
}

# Railway Backend Configuration
resource "railway_service" "backend_api" {
  name       = "earnmax-elite-backend-prod"
  project_id = railway_project.earnmax_elite.id
  source = {
    repo = "your-github-org/earnmax-elite"
    path = "/backend"
  }
  environment = {
    NODE_ENV              = "production"
    DATABASE_URL          = railway_postgresql.primary.connection_url
    JWT_SECRET            = var.jwt_secret
    ADMIN_API_KEY         = var.admin_api_key
    REDIS_URL             = railway_redis.cache.connection_url
  }
  service_domains = ["api.earnmaxelite.com"]
}

# Railway Database Configuration
resource "railway_postgresql" "primary" {
  name       = "earnmax-elite-db-prod"
  project_id = railway_project.earnmax_elite.id
  plugins    = ["pg_cron", "pg_stat_statements"]
}

resource "railway_redis" "cache" {
  name       = "earnmax-elite-cache-prod"
  project_id = railway_project.earnmax_elite.id
}

resource "railway_project" "earnmax_elite" {
  name        = "earnmax-elite-prod"
  description = "Production environment for EarnMax Elite"
}

# Vercel Deployment Configuration
resource "vercel_deployment" "production" {
  project_id = vercel_project.earnmax_elite_frontend.id
  ref        = "main"
  production = true
}

# Outputs
output "frontend_url" {
  value = vercel_project.earnmax_elite_frontend.production_url
}

output "backend_url" {
  value = railway_service.backend_api.production_url
}