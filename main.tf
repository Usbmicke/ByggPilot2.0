terraform {
  required_version = ">= 1.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

variable "gcp_project_id" {
  description = "The GCP project ID to deploy resources to."
  type        = string
}

variable "region" {
  description = "The GCP region for resources."
  type        = string
  default     = "europe-west1"
}

provider "google" {
  project = var.gcp_project_id
  region  = var.region
}

# Aktivera de API:er som krävs för applikationen
resource "google_project_service" "project_apis" {
  for_each = toset([
    "firestore.googleapis.com",
    "cloudfunctions.googleapis.com",
    "cloudbuild.googleapis.com",
    "aiplatform.googleapis.com", # För Genkit / Google AI
    "iam.googleapis.com",
    "run.googleapis.com" # Om vi senare använder Cloud Run
  ])

  service            = each.key
  disable_on_destroy = false
}

# Skapa en dedikerad Service Account för vår applikation
# Detta ger en säker identitet för appen i molnet
resource "google_service_account" "genkit_app_sa" {
  account_id   = "sa-genkit-app"
  display_name = "Service Account for Genkit Next.js App"
  project      = var.gcp_project_id
}

# Ge Service Account rollen som behövs för att anropa GenAI-modeller
resource "google_project_iam_member" "ai_user_role" {
  project = var.gcp_project_id
  role    = "roles/aiplatform.user"
  member  = google_service_account.genkit_app_sa.member
}

# Ge Service Account rollen som behövs för att läsa/skriva till Firestore
resource "google_project_iam_member" "firestore_user_role" {
  project = var.gcp_project_id
  role    = "roles/datastore.user" # roles/datastore.user ger åtkomst till Firestore
  member  = google_service_account.genkit_app_sa.member
}

# Skapa Firestore-databasen
resource "google_firestore_database" "database" {
  project     = var.gcp_project_id
  name        = "(default)"
  location_id = var.region
  type        = "FIRESTORE_NATIVE"

  # Säkerställ att API:et är aktiverat innan databasen skapas
  depends_on = [
    google_project_service.project_apis,
  ]
}
