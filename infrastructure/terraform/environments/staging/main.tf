# Configure Vercel provider for frontend
terraform {
  required_providers {
    vercel = {
      source = "vercel/vercel"
      version = "~> 0.3"
    }
    railway = {
      source = "railwayapp/railway"
      version = "~> 0.2"
    }
  }
}

# Vercel Frontend Configuration
resource "vercel_project" "earnmax_frontend" {
  name           = "earnmax-elite-frontend"
  framework      = "nextjs"
  git_repository = {
    repo = "your-github-org/earnmax-elite"
    type = "github"
  }
  
  environment = [
    {
      key    = "NEXT_PUBLIC_API_URL"
      value  = railway_service.backend.deployment_url
      target = ["production", "preview"]
    },
    {
      key    = "NEXT_PUBLIC_ENV"
      value  = "staging"
      target = ["production", "preview"]
    }
  ]
}

# Railway Backend Configuration
resource "railway_project" "earnmax_backend" {
  name        = "earnmax-elite-backend"
  description = "EarnMax Elite Backend Services"
}

resource "railway_service" "backend" {
  project_id = railway_project.earnmax_backend.id
  name       = "api"
  source     = {
    repo    = "your-github-org/earnmax-elite"
    branch  = "main"
    service_root = "backend"
  }
  
  environment_variables = {
    DATABASE_URL = railway_postgresql.earnmax_db.connection_string
    JWT_SECRET   = var.jwt_secret
    NODE_ENV     = "production"
  }
}

# Railway Database Configuration
resource "railway_postgresql" "earnmax_db" {
  project_id = railway_project.earnmax_backend.id
  name       = "earnmax-db"
  plan       = "small-2x" # Adjust based on needs
}

# Railway Network Configuration
resource "railway_network" "earnmax_network" {
  project_id = railway_project.earnmax_backend.id
  name       = "earnmax-network"
  services   = [railway_service.backend.id]
}