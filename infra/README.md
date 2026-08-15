# Infraestructura AWS (us-east-2)

Terraform crea VPC, RDS PostgreSQL, ECR, ECS Fargate, ALB, S3 y CloudFront.

La SPA y la API se sirven por el mismo CloudFront (HTTPS). Las rutas `/products*`, `/stock*`, `/customers*`, `/deliveries*`, `/transactions*`, `/webhooks*`, `/health*` y `/api*` van al ALB; el resto al bucket S3.

## GitHub Actions (recomendado)

Configura los secretos `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` y `DB_PASSWORD` y lanza el workflow **Deploy AWS**. El estado queda en S3:

`product-checkout-tfstate-<ACCOUNT_ID>-us-east-2`

## Apply local

```bash
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
aws s3api create-bucket \
  --bucket "product-checkout-tfstate-${ACCOUNT_ID}-us-east-2" \
  --region us-east-2 \
  --create-bucket-configuration LocationConstraint=us-east-2 || true

cp terraform.tfvars.example terraform.tfvars
# completar db_password y llaves de pago

terraform init \
  -backend-config="bucket=product-checkout-tfstate-${ACCOUNT_ID}-us-east-2" \
  -backend-config="key=product-checkout/terraform.tfstate" \
  -backend-config="region=us-east-2"

terraform apply
```

Después del apply, el workflow (o estos pasos) publica la app:

1. Build de `backend/Dockerfile` → ECR (`:gitsha` y `:latest`)
2. `terraform apply` con `container_image`
3. `npm run build` en `frontend` con `VITE_API_URL` = URL de CloudFront
4. `aws s3 sync frontend/dist` e invalidación de CloudFront
