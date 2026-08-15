output "api_url" {
  value       = "https://${aws_cloudfront_distribution.frontend.domain_name}"
  description = "API HTTPS (CloudFront → ALB)"
}

output "alb_url" {
  value       = "http://${aws_lb.api.dns_name}"
  description = "ALB HTTP interno; el cliente debe usar api_url"
}

output "cloudfront_url" {
  value = "https://${aws_cloudfront_distribution.frontend.domain_name}"
}

output "cloudfront_distribution_id" {
  value = aws_cloudfront_distribution.frontend.id
}

output "rds_endpoint" {
  value = aws_db_instance.postgres.address
}

output "frontend_bucket" {
  value = aws_s3_bucket.frontend.bucket
}

output "ecr_repository_url" {
  value = aws_ecr_repository.api.repository_url
}

output "ecs_cluster" {
  value = aws_ecs_cluster.main.name
}

output "ecs_service" {
  value = aws_ecs_service.api.name
}
