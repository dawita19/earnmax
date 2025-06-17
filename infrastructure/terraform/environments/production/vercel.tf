resource "vercel_project" "earnmax" {
  name      = var.vercel_project_name
  framework = "nextjs"
  git_repository = {
    type = "github"
    repo = var.github_repo
  }

  root_directory = "frontend"

  environment = [
    {
      key    = "NEXT_PUBLIC_API_URL"
      value  = module.railway.service_url
      target = ["production", "preview", "development"]
    },
    {
      key    = "NODE_ENV"
      value  = var.node_env
      target = ["production", "preview", "development"]
    }
  ]
}

resource "vercel_deployment" "initial" {
  project_id  = vercel_project.earnmax.id
  production  = true
  ref         = "main"
  delete_on_destroy = true
}