terraform {
  backend "remote" {
    organization = "your-org-name"

    workspaces {
      name = "earnmax-elite-staging"
    }
  }
}