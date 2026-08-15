# Checkout API

API NestJS. El detalle de modelo, Swagger y cobertura está en el [README raíz](../README.md).

```bash
cp .env.example .env
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npm run start:dev
```

Swagger: http://localhost:3000/api/docs
