output "api_url" {
  value = "http://${aws_lb.api.dns_name}"
}

output "cloudfront_url" {
  value = "https://${aws_cloudfront_distribution.frontend.domain_name}"
}

output "rds_endpoint" {
  value = aws_db_instance.postgres.address
}

output "frontend_bucket" {
  value = aws_s3_bucket.frontend.bucket
}
