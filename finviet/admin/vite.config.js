import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        host: true,
        // Proxy removed – frontend runs fully with mock data (no backend needed).
        // To re-enable: add proxy: { '/api': { target: 'http://localhost:8090', changeOrigin: true } }
    },
});
