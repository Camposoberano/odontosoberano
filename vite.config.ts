import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { securityHeadersPlugin } from "./vite-security-headers";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const base = env.VITE_BASE_PATH || '/belem/';

  return {
    base,
    server: {
      host: "::",
      port: 8081,
    },
    plugins: [
      react(),
      securityHeadersPlugin(),
      // SW desativado — selfDestroying limpa caches antigos nos browsers dos usuários
      VitePWA({ selfDestroying: true }),
      mode === 'development' && componentTagger(),
    ].filter(Boolean),
    build: {
      target: ['es2020', 'safari14'],
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return;
            if (id.includes('@supabase')) return 'supabase';
            if (id.includes('recharts') || id.includes('d3-')) return 'charts';
            if (id.includes('jspdf') || id.includes('html2canvas')) return 'pdf';
            if (id.includes('@radix-ui') || id.includes('cmdk') || id.includes('vaul') || id.includes('input-otp')) return 'ui';
            if (id.includes('framer-motion')) return 'motion';
            if (id.includes('react-router') || id.includes('react-dom')) return 'react-vendor';
            if (id.includes('/react/')) return 'react-core';
          },
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
