output "redis_url" {
  description = "Redis connection URL"
  value       = railway_environment_variable.redis_url.value
  sensitive   = true
}

output "redis_host" {
  description = "Redis hostname"
  value       = railway_service.redis.domain
}