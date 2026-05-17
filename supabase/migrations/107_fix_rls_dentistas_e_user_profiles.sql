-- =====================================================
-- FIX: RLS dentistas + user_profiles vazios
-- Data: 2026-05-17
-- Problema: user_profiles estava vazio porque handle_new_user
--   falhava silenciosamente (trigger_audit_log bug — corrigido em 106).
--   Sem profiles, nenhum usuário tinha role, e as políticas de
--   ADMIN/SECRETARIA não funcionavam.
-- =====================================================

-- 1. Garantir que user_profiles existe para todos auth.users sem profile
INSERT INTO public.user_profiles (user_id, email, nome, role)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'nome', split_part(u.email, '@', 1)),
  'SECRETARIA'
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_profiles up WHERE up.user_id = u.id
);

-- 2. RLS dentistas: ADMIN/DEV/SECRETARIA/FINANCEIRO veem TODOS
DROP POLICY IF EXISTS "Staff can view all dentistas" ON public.dentistas;
CREATE POLICY "Staff can view all dentistas" ON public.dentistas
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.user_id = auth.uid()
    AND up.role IN ('ADMIN', 'DEV', 'SECRETARIA', 'FINANCEIRO')
  )
);

-- 3. RLS dentistas: ADMIN/DEV gerenciam todos os registros
DROP POLICY IF EXISTS "Admin can manage all dentistas" ON public.dentistas;
CREATE POLICY "Admin can manage all dentistas" ON public.dentistas
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.user_id = auth.uid()
    AND up.role IN ('ADMIN', 'DEV')
  )
)
WITH CHECK (true);
