# Product Checkout App

Tienda con checkout de tarjeta: React + Redux en el cliente y NestJS + PostgreSQL en el servidor. El número de tarjeta se tokeniza en el navegador y no se guarda en la API.

**Repositorio:** [https://github.com/danierfresley/app-payment-wompi](https://github.com/danierfresley/app-payment-wompi)

## Flujo (5 pasos)

1. Página de producto y stock
2. Modal de tarjeta + datos de entrega
3. Backdrop de resumen (producto + tarifa base + envío)
4. Estado final de la transacción
5. Regreso al producto con stock actualizado

Si el usuario refresca, el progreso se recupera desde `localStorage` (paso, cliente, entrega, `last4`, brand y token). No se persisten número de tarjeta, CVC ni fecha.

## Stack

| Capa | Tecnología |
| --- | --- |
| Frontend | React, TypeScript, Vite, Redux Toolkit, redux-persist |
| Backend | NestJS, Prisma, PostgreSQL, Hexagonal + ROP |
| Pagos | API Sandbox (tokenización en el browser, cobro en el servidor) |
| Tests | Jest (>80% en ambos lados) |
| Infra | Terraform: S3 + CloudFront, ECS Fargate, ALB, RDS |

## Cómo correr en local

```bash
docker compose up -d
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npm run start:dev

cd ../frontend
npm install
npm run dev
```

- App: http://localhost:5173
- API: http://localhost:3000
- Swagger: http://localhost:3000/api/docs
- Postman: [backend/postman/checkout-api.postman_collection.json](backend/postman/checkout-api.postman_collection.json)

Tarjetas de prueba: Visa `4242 4242 4242 4242`, Mastercard `5031 7557 3453 0604`. CVC y fecha inventados pero con formato válido.

## Modelo de datos

```
Product 1---* Transaction *---1 Customer
                    *               |
                    |               *
                    +----- Delivery
```

- `products`: catálogo seed. No hay endpoint de creación.
- `customers`: upsert por email.
- `deliveries`: dirección; pasa a `ASSIGNED` si el pago es `APPROVED`.
- `transactions`: `PENDING` reserva stock; `DECLINED`/`ERROR` lo devuelve; `APPROVED` asigna la entrega.

Montos en centavos COP. Fees: `BASE_FEE_CENTS=350000`, `DELIVERY_FEE_CENTS=890000`.

## API

| Método | Ruta | Uso |
| --- | --- | --- |
| GET | `/products` | Listar productos + stock |
| GET | `/products/:id` | Detalle |
| GET | `/stock/:productId` | Stock |
| POST | `/customers` | Crear/actualizar cliente |
| POST | `/deliveries` | Crear entrega |
| POST | `/transactions` | Crear PENDING y cobrar |
| GET | `/transactions/:id` | Consultar |
| PATCH | `/transactions/:id/sync` | Reconsultar al proveedor |
| POST | `/webhooks/payments` | Eventos del proveedor |
| GET | `/health` | Healthcheck |

La tarjeta se tokeniza en el frontend contra la API pública. El backend solo recibe `cardToken`.

## Arquitectura backend

```
domain/        entidades, errores, puertos
application/   use cases + Result (map / flatMap / fold)
infrastructure/http, prisma, adaptador de pagos
```

Los controllers no contienen reglas de negocio: hacen `fold`/`unwrap` del `Result`.

## Cobertura Jest

Ejecutar:

```bash
cd backend && npm test -- --coverage
cd frontend && npm test -- --coverage
```

Resultado local más reciente:

| Proyecto | Statements | Branches | Functions | Lines |
| --- | --- | --- | --- | --- |
| Backend | 99.56% | 83.03% | 100% | 99.48% |
| Frontend | 91.42% | 78.92% | 91.17% | 91.42% |

CI publica el reporte en cada PR (`.github/workflows/ci.yml`).

## Deploy AWS (us-east-2)

El pipeline [Deploy AWS](https://github.com/danierfresley/app-payment-wompi/actions) crea la infra con Terraform y publica:

- Frontend: S3 + CloudFront (HTTPS)
- API: ECR → ECS Fargate → ALB, expuesta en HTTPS por el mismo CloudFront (`/products`, `/transactions`, `/health`, `/api/docs`, …)

### 1. Usuario IAM en AWS

En [us-east-2](https://us-east-2.console.aws.amazon.com/console/home?region=us-east-2) crea un usuario IAM con Access Key y permisos para ECR, ECS, S3, CloudFront, VPC, RDS, Secrets Manager, IAM (roles de ECS) y CloudWatch Logs. Para la prueba, `AdministratorAccess` es suficiente.

### 2. Secretos en GitHub

Repo → **Settings → Secrets and variables → Actions**:

| Secreto | Obligatorio | Uso |
| --- | --- | --- |
| `AWS_ACCESS_KEY_ID` | Sí | Access key del usuario IAM |
| `AWS_SECRET_ACCESS_KEY` | Sí | Secret key del usuario IAM |
| `DB_PASSWORD` | Sí | Password de RDS (mín. 8 caracteres) |
| `WOMPI_PUBLIC_KEY` | No | Si falta, usa las llaves sandbox de `backend/.env.example` |
| `WOMPI_PRIVATE_KEY` | No | Igual |
| `WOMPI_EVENTS_KEY` | No | Igual |
| `WOMPI_INTEGRITY_KEY` | No | Igual |

### 3. Lanzar el deploy

- Push a `main` o `develop`, o
- Actions → **Deploy AWS** → **Run workflow**

El primer apply tarda ~15–20 min (NAT, RDS, CloudFront). Al terminar, el resumen del job deja las URLs.

URLs en vivo (us-east-2):

- Frontend / API: [https://d3duf1tgrvivw8.cloudfront.net](https://d3duf1tgrvivw8.cloudfront.net)
- Health: [https://d3duf1tgrvivw8.cloudfront.net/health](https://d3duf1tgrvivw8.cloudfront.net/health)
- Swagger: [https://d3duf1tgrvivw8.cloudfront.net/api/docs](https://d3duf1tgrvivw8.cloudfront.net/api/docs)

Costo aproximado mientras esté arriba: NAT Gateway + RDS `db.t3.micro` + ALB + ECS Fargate. Apaga o destruye con `terraform destroy` cuando no lo uses.

Headers OWASP: `helmet` en Nest y `aws_cloudfront_response_headers_policy` (HSTS, CSP, X-Frame-Options, nosniff).

## Seguridad

- HTTPS en CloudFront; CORS limitado al origen del frontend.
- Secretos en AWS Secrets Manager / `.env` local (nunca en git).
- No se almacena PAN/CVV.
- Tokens de aceptación mostrados como checkboxes con permalinks.

## Estructura

```
backend/     API NestJS
frontend/    SPA React
infra/       Terraform
```
