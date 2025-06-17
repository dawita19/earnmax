provider "vercel" {
  api_token = var.vercel_api_token
  team      = "your-team-slug"
}

provider "railway" {
  api_token = var.railway_api_token
}

variable "vercel_api_token" {
  description = "Vercel API token"
  type        = string
  sensitive   = true
}

variable "railway_api_token" {
  description = "Railway API token"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT secret for authentication"
  type        = string
  sensitive   = true
}