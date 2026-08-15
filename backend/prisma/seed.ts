import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const products = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Nova Pulse ANC',
    description:
      'Auriculares inalámbricos con cancelación activa de ruido, 32 h de batería y estuche de carga rápida. Diseñados para trabajo y viaje.',
    priceInCents: 18990000,
    imageUrl: '/images/headphones.jpg',
    stock: 12,
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Lumen Desk Lamp',
    description:
      'Lámpara de escritorio con temperatura de color ajustable, USB-C y brazo articulado de aluminio.',
    priceInCents: 12990000,
    imageUrl: '/images/lamp.jpg',
    stock: 8,
  },
];

async function main() {
  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      create: product,
      update: {
        name: product.name,
        description: product.description,
        priceInCents: product.priceInCents,
        imageUrl: product.imageUrl,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
