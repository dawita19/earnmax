terraform {
  backend "remote" {
    organization = "earnmax-elite"

    workspaces {
      name = "production"
    }
  }
}