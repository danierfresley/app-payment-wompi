declare const process: { env: Record<string, string | undefined> };

export const appEnv = {
  apiUrl: process.env.VITE_API_URL ?? 'http://localhost:3000',
  wompiBaseUrl:
    process.env.VITE_WOMPI_BASE_URL ??
    'https://api-sandbox.co.uat.wompi.dev/v1',
  wompiPublicKey: process.env.VITE_WOMPI_PUBLIC_KEY ?? '',
  baseFeeCents: Number(process.env.VITE_BASE_FEE_CENTS ?? 350000),
  deliveryFeeCents: Number(process.env.VITE_DELIVERY_FEE_CENTS ?? 890000),
};
