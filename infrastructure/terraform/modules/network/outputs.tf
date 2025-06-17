output "vercel_deployment_url" {
  value = vercel_project.earnmax_frontend.production_url
}

output "railway_deployment_url" {
  value = railway_service.backend.domain
}

output "database_connection" {
  value = railway_service.database.postgresql.connection_url
  sensitive = true
}