output "frontend_url" {
  value       = vercel_project.earnmax_frontend.live_url
  description = "The production URL of the frontend"
}

output "backend_url" {
  value       = railway_service.backend.deployment_url
  description = "The URL of the backend API"
}

output "database_connection_string" {
  value       = railway_postgresql.earnmax_db.connection_string
  sensitive   = true
  description = "The connection string for the PostgreSQL database"
}

output "railway_project_id" {
  value       = railway_project.earnmax_backend.id
  description = "The Railway project ID"
}