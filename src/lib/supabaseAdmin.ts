import { createClient } from '@supabase/supabase-js';

// Cliente admin com service_role — apenas para operações administrativas
// (criar/desativar usuários). Uso restrito à página de gestão de usuários (ADMIN/DEV).
export const supabaseAdmin = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
