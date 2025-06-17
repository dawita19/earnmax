variable "github_repo" {
  description = "GitHub repository in format 'owner/repo'"
  type        = string
}

variable "vercel_project_name" {
  description = "Name for the Vercel project"
  type        = string
  default     = "earnmax-elite-frontend"
}

variable "railway_project_name" {
  description = "Name for the Railway project"
  type        = string
  default     = "earnmax-elite-backend"
}

variable "railway_environment_name" {
  description = "Name for the Railway environment"
  type        = string
  default     = "production"
}

variable "vercel_team_id" {
  description = "Vercel team ID"
  type        = string
}

variable "railway_service_name" {
  description = "Name for the Railway backend service"
  type        = string
  default     = "backend"
}