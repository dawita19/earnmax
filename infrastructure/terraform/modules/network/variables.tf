variable "vercel_project_name" {
  description = "Name of the Vercel project"
  type        = string
  default     = "earnmax-elite-frontend"
}

variable "railway_org_id" {
  description = "Railway organization ID"
  type        = string
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "production"
}