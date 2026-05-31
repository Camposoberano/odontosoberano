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
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
          cleanupOutdatedCaches: true,
        },
        manifest: {
          name: 'Instituto Belém - Sistema de Gestão',
          short_name: 'Inst. Belém',
          description: 'Gerenciamento completo e inteligente para o Inst. Belém.',
          theme_color: '#ffffff',
          background_color: '#ffffff',
          display: 'standalone',
          scope: base,
          start_url: base,
          id: base,
          categories: ['medical', 'business', 'productivity'],
          icons: [
            {
              src: `${base}pwa-192x192.png`,
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: `${base}pwa-512x512.png`,
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        }
      }),
      mode === 'development' && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
