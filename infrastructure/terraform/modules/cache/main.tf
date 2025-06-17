resource "railway_service" "redis" {
  project_id   = var.project_id
  name         = "earnmax-redis"
  service_type = "redis"
  
  environment_variables = {
    REDIS_PASSWORD = var.redis_password
  }
}

resource "railway_environment_variable" "redis_url" {
  project_id  = var.project_id
  service_id  = railway_service.redis.id
  name        = "REDIS_URL"
  value       = "redis://:${var.redis_password}@${railway_service.redis.domain}:6379"
  environment = var.environment
}