# Infraestructura AWS

Terraform crea VPC, RDS PostgreSQL, ECS Fargate, ALB, S3 y CloudFront con headers de seguridad.

```bash
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform apply
```

Después del apply:

1. Publicar `backend/` con el `Dockerfile` a ECR y actualizar `container_image`.
2. Construir el frontend (`npm run build`) y subir `frontend/dist` al bucket S3 de salida.
3. Invalidar CloudFront.
4. Copiar las URLs al README raíz.
