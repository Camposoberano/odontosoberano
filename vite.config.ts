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
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
