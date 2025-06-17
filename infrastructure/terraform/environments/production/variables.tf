variable "jwt_secret" {
  description = "Secret key for JWT token generation"
  type        = string
  sensitive   = true
}

variable "admin_api_key" {
  description = "API key for admin operations"
  type        = string
  sensitive   = true
}

variable "vercel_team_id" {
  description = "Vercel team ID"
  type        = string
}

variable "railway_token" {
  description = "Railway API token"
  type        = string
  sensitive   = true
}