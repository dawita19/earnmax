resource "railway_project" "earnmax" {
  name = "earnmax-elite-backend"
}

resource "railway_service" "backend" {
  project_id = railway_project.earnmax.id
  name       = "backend-service"
  source = {
    repo = "your-github-repo/backend"
  }
}

resource "railway_service" "database" {
  project_id = railway_project.earnmax.id
  name       = "postgres-db"
  service_type = "postgresql"
}

resource "railway_environment_variable" "db_connection" {
  service_id = railway_service.backend.id
  name       = "DATABASE_URL"
  value      = railway_service.database.postgresql.connection_url
}