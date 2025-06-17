resource "railway_project" "earnmax_db" {
  name        = "earnmax-database"
  description = "PostgreSQL database for EarnMax Elite"
}

resource "railway_service" "postgres" {
  project_id = railway_project.earnmax_db.id
  name       = "earnmax-postgres"
  service_type = "postgresql"
  
  environment_variables = {
    POSTGRES_USER     = var.db_username
    POSTGRES_PASSWORD = var.db_password
    POSTGRES_DB       = "earnmax_prod"
  }
}

resource "railway_environment_variable" "db_connection" {
  project_id     = railway_project.earnmax_db.id
  service_id     = railway_service.postgres.id
  name           = "DATABASE_URL"
  value          = "postgresql://${var.db_username}:${var.db_password}@${railway_service.postgres.domain}/earnmax_prod"
  environment    = "production"
}

resource "railway_deployment" "db_init" {
  project_id = railway_project.earnmax_db.id
  service_id = railway_service.postgres.id
  environment = "production"
  triggers = {
    always_run = timestamp()
  }
}