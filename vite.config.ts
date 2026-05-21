import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { securityHeadersPlugin } from "./vite-security-headers";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "/orto/",
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
        name: 'Campo Soberano - Sistema de Gestão',
        short_name: 'Campo Soberano',
        description: 'Gerenciamento completo e inteligente para o Campo Soberano.',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/orto/',
        start_url: '/orto/',
        id: '/orto/',
        categories: ['medical', 'business', 'productivity'],
        icons: [
          {
            src: '/orto/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/orto/pwa-512x512.png',
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
}));
