-- =====================================================
-- MIGRAÇÃO 108: Fix RLS multi-usuário
-- Data: 2026-05-24
-- Problema: Pacientes e funcionários invisíveis para
--   usuários que não os criaram (secretária, admin).
--   - usePacientes filtrava por user_id no cliente (corrigido no hook).
--   - funcionarios nunca teve RLS atualizado para multi-user.
-- =====================================================

-- ─────────────────────────────────────────────────────
-- 1. FUNCIONARIOS: substituir policy restrita por acesso staff
-- ─────────────────────────────────────────────────────

-- Dropar policy original que bloqueava tudo
DROP POLICY IF EXISTS "Funcionarios are viewable by owner" ON public.funcionarios;
DROP POLICY IF EXISTS "Funcionarios are insertable by owner" ON public.funcionarios;
DROP POLICY IF EXISTS "Funcionarios are updatable by owner" ON public.funcionarios;
DROP POLICY IF EXISTS "Funcionarios are deletable by owner" ON public.funcionarios;
-- Nomes alternativos que possam existir
DROP POLICY IF EXISTS "funcionarios_select" ON public.funcionarios;
DROP POLICY IF EXISTS "funcionarios_insert" ON public.funcionarios;
DROP POLICY IF EXISTS "funcionarios_update" ON public.funcionarios;
DROP POLICY IF EXISTS "funcionarios_delete" ON public.funcionarios;

-- SELECT: qualquer autenticado vê todos
CREATE POLICY "funcionarios_select_all" ON public.funcionarios
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- INSERT/UPDATE: qualquer autenticado pode criar/editar
CREATE POLICY "funcionarios_insert_all" ON public.funcionarios
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "funcionarios_update_all" ON public.funcionarios
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- DELETE: apenas ADMIN/DEV
CREATE POLICY "funcionarios_delete_admin" ON public.funcionarios
  FOR DELETE USING (public.is_admin_or_dev());

-- ─────────────────────────────────────────────────────
-- 2. PACIENTES: dropar policy original conflitante
--    (a nova "optimized_select_pacientes" com auth.uid() IS NOT NULL
--     já existe desde 99999999999998, mas a original nunca foi dropada)
-- ─────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Pacientes are viewable by owner" ON public.pacientes;
DROP POLICY IF EXISTS "Pacientes are insertable by owner" ON public.pacientes;
DROP POLICY IF EXISTS "Pacientes are updatable by owner" ON public.pacientes;
DROP POLICY IF EXISTS "Pacientes are deletable by owner" ON public.pacientes;
-- nomes alternativos
DROP POLICY IF EXISTS "Users can view pacientes" ON public.pacientes;

-- ─────────────────────────────────────────────────────
-- 3. DENTISTAS: dropar policy original conflitante
--    (107 já criou as novas, mas a original user_id-based pode ainda estar ativa)
-- ─────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can view their own dentistas" ON public.dentistas;
DROP POLICY IF EXISTS "Users can insert their own dentistas" ON public.dentistas;
DROP POLICY IF EXISTS "Users can update their own dentistas" ON public.dentistas;
DROP POLICY IF EXISTS "Users can delete their own dentistas" ON public.dentistas;

NOTIFY pgrst, 'reload schema';
