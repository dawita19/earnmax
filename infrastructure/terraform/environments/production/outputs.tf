output "frontend_url" {
  value       = vercel_project.earnmax_elite_frontend.production_url
  description = "Production frontend URL"
}

output "backend_url" {
  value       = railway_service.backend_api.production_url
  description = "Production backend API URL"
}

output "database_url" {
  value       = railway_postgresql.primary.connection_url
  description = "Production database connection URL"
  sensitive   = true
}

output "redis_url" {
  value       = railway_redis.cache.connection_url
  description = "Production Redis connection URL"
  sensitive   = true
}