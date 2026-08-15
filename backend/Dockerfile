FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci
COPY . .
RUN npx prisma generate && npm run build && npx tsc -p prisma/tsconfig.seed.json

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --omit=dev && npx prisma generate
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma-seed ./prisma-seed
EXPOSE 3000
CMD ["sh", "-c", "for i in 1 2 3 4 5 6 7 8 9 10; do npx prisma migrate deploy && break; echo waiting for database; sleep 5; done; node prisma-seed/seed.js || true; exec node dist/main.js"]
