import { PluginOption } from 'vite';

const COOLIFY_URL = "http://supabasekong-fqy9q0izcz6njphhpeoxgepz.187.127.28.228.sslip.io";
const COOLIFY_WS  = "ws://supabasekong-fqy9q0izcz6njphhpeoxgepz.187.127.28.228.sslip.io";

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: https://*.supabase.co https://bancodedados.institutobelem.com blob:",
  `connect-src 'self' https://*.supabase.co https://api.ipify.org wss://*.supabase.co https://viacep.com.br https://bancodedados.soberano.pro wss://bancodedados.soberano.pro https://bancodedados.institutobelem.com wss://bancodedados.institutobelem.com ${COOLIFY_URL} ${COOLIFY_WS}`,
  "font-src 'self' data: https://fonts.gstatic.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

export function securityHeadersPlugin(): PluginOption {
  return {
    name: 'security-headers',
    configureServer(server) {
      server.middlewares.use((_req, res, next) => {
        res.setHeader('Content-Security-Policy', csp);
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((_req, res, next) => {
        res.setHeader('Content-Security-Policy', csp);
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        next();
      });
    }
  };
}
