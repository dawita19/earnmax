variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "staging"
}

variable "frontend_domain" {
  description = "Frontend domain name"
  type        = string
  default     = "staging.earnmaxelite.com"
}

variable "backend_domain" {
  description = "Backend domain name"
  type        = string
  default     = "api.staging.earnmaxelite.com"
}

variable "database_settings" {
  description = "Database configuration"
  type = object({
    storage_gb = number
    cpu_cores  = number
    memory_mb  = number
  })
  default = {
    storage_gb = 10
    cpu_cores  = 2
    memory_mb  = 4096
  }
}