terraform {
  required_version = ">= 1.3.0"

  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 0.11"
    }
    railway = {
      source  = "railwayapp/railway"
      version = "~> 0.2"
    }
  }
}

provider "vercel" {
  api_token = var.vercel_api_token
  team      = var.vercel_team_id
}

provider "railway" {
  api_token = var.railway_api_token
}