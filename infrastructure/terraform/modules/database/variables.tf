variable "db_username" {
  description = "PostgreSQL admin username"
  type        = string
  default     = "earnmax_admin"
}

variable "db_password" {
  description = "PostgreSQL admin password"
  type        = string
  sensitive   = true
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "production"
}