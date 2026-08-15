variable "aws_region" {
  type    = string
  default = "us-east-2"
}

variable "project" {
  type    = string
  default = "product-checkout"
}

variable "db_username" {
  type    = string
  default = "checkout"
}

variable "db_password" {
  type      = string
  sensitive = true
}

variable "frontend_origin" {
  type        = string
  default     = ""
  description = "CORS origin. Vacío = URL de CloudFront."
}

variable "wompi_base_url" {
  type    = string
  default = "https://api-sandbox.co.uat.wompi.dev/v1"
}

variable "wompi_public_key" {
  type      = string
  sensitive = true
}

variable "wompi_private_key" {
  type      = string
  sensitive = true
}

variable "wompi_events_key" {
  type      = string
  sensitive = true
}

variable "wompi_integrity_key" {
  type      = string
  sensitive = true
}

variable "base_fee_cents" {
  type    = number
  default = 350000
}

variable "delivery_fee_cents" {
  type    = number
  default = 890000
}

variable "container_image" {
  type        = string
  default     = ""
  description = "URI de la imagen en ECR. Vacío = <ecr>/latest."
}
