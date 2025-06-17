output "database_url" {
  description = "PostgreSQL connection URL"
  value       = railway_environment_variable.db_connection.value
  sensitive   = true
}

output "database_host" {
  description = "PostgreSQL hostname"
  value       = railway_service.postgres.domain
}

output "project_id" {
  description = "Railway project ID"
  value       = railway_project.earnmax_db.id
}