import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      'process.env.VITE_API_URL': JSON.stringify(
        env.VITE_API_URL ?? 'http://localhost:3000',
      ),
      'process.env.VITE_WOMPI_BASE_URL': JSON.stringify(
        env.VITE_WOMPI_BASE_URL ?? 'https://api-sandbox.co.uat.wompi.dev/v1',
      ),
      'process.env.VITE_WOMPI_PUBLIC_KEY': JSON.stringify(
        env.VITE_WOMPI_PUBLIC_KEY ?? '',
      ),
      'process.env.VITE_BASE_FEE_CENTS': JSON.stringify(
        env.VITE_BASE_FEE_CENTS ?? '350000',
      ),
      'process.env.VITE_DELIVERY_FEE_CENTS': JSON.stringify(
        env.VITE_DELIVERY_FEE_CENTS ?? '890000',
      ),
    },
  };
});
