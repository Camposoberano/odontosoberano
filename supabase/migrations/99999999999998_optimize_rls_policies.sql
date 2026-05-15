-- =====================================================
-- OTIMIZAÇÃO DE POLÍTICAS RLS (Row Level Security)
-- Criado em: 2025-12-04
-- Propósito: Melhorar performance e segurança das políticas RLS
-- =====================================================

-- =====================================================
-- FUNÇÃO AUXILIAR OTIMIZADA PARA VERIFICAR ROLES
-- =====================================================

-- Drop função antiga se existir
DROP FUNCTION IF EXISTS public.is_admin_or_dev();

-- Criar função otimizada com cache de role
CREATE OR REPLACE FUNCTION public.is_admin_or_dev()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_profiles
    WHERE user_id = auth.uid()
    AND role IN ('ADMIN', 'DEV')
  );
$$;

-- Comentário
COMMENT ON FUNCTION public.is_admin_or_dev() IS 'Verifica se o usuário atual é ADMIN ou DEV (otimizado com STABLE)';

-- Função para verificar se é ADMIN
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_profiles
    WHERE user_id = auth.uid()
    AND role = 'ADMIN'
  );
$$;

COMMENT ON FUNCTION public.is_admin() IS 'Verifica se o usuário atual é ADMIN';

-- Função para verificar se usuário tem permissão específica
CREATE OR REPLACE FUNCTION public.has_permission(permission_name TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_profiles
    WHERE user_id = auth.uid()
    AND (
      role IN ('ADMIN', 'DEV')
      OR permissions ? permission_name
    )
  );
$$;

COMMENT ON FUNCTION public.has_permission IS 'Verifica se usuário tem permissão específica';

-- =====================================================
-- RECRIAR POLÍTICAS OTIMIZADAS PARA USER_PROFILES
-- =====================================================

-- Drop políticas antigas
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.user_profiles;

-- SELECT: Usuários veem próprio perfil, ADMINs veem todos
CREATE POLICY "optimized_select_user_profiles" ON public.user_profiles
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR public.is_admin_or_dev()
  );

-- INSERT: Apenas ADMINs podem criar perfis
CREATE POLICY "optimized_insert_user_profiles" ON public.user_profiles
  FOR INSERT
  WITH CHECK (public.is_admin());

-- UPDATE: ADMINs podem atualizar todos, usuários podem atualizar o próprio
CREATE POLICY "optimized_update_user_profiles" ON public.user_profiles
  FOR UPDATE
  USING (
    user_id = auth.uid()
    OR public.is_admin_or_dev()
  )
  WITH CHECK (
    user_id = auth.uid()
    OR public.is_admin_or_dev()
  );

-- DELETE: Apenas ADMINs podem deletar
CREATE POLICY "optimized_delete_user_profiles" ON public.user_profiles
  FOR DELETE
  USING (public.is_admin());

-- =====================================================
-- POLÍTICAS OTIMIZADAS PARA PACIENTES
-- =====================================================

-- Drop políticas antigas se existirem
DROP POLICY IF EXISTS "Users can view all pacientes" ON public.pacientes;
DROP POLICY IF EXISTS "Users can insert pacientes" ON public.pacientes;
DROP POLICY IF EXISTS "Users can update pacientes" ON public.pacientes;
DROP POLICY IF EXISTS "Users can delete pacientes" ON public.pacientes;

-- SELECT: Todos usuários autenticados podem ver pacientes
CREATE POLICY "optimized_select_pacientes" ON public.pacientes
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- INSERT: Usuários com permissão podem criar pacientes
CREATE POLICY "optimized_insert_pacientes" ON public.pacientes
  FOR INSERT
  WITH CHECK (
    public.has_permission('cadastro_pacientes')
    OR public.is_admin_or_dev()
  );

-- UPDATE: Usuários com permissão podem atualizar
CREATE POLICY "optimized_update_pacientes" ON public.pacientes
  FOR UPDATE
  USING (
    public.has_permission('editar_pacientes')
    OR public.is_admin_or_dev()
  )
  WITH CHECK (
    public.has_permission('editar_pacientes')
    OR public.is_admin_or_dev()
  );

-- DELETE: Apenas ADMINs podem deletar
CREATE POLICY "optimized_delete_pacientes" ON public.pacientes
  FOR DELETE
  USING (public.is_admin());

-- =====================================================
-- POLÍTICAS OTIMIZADAS PARA PROCEDIMENTOS
-- =====================================================

-- Função auxiliar para verificar acesso a procedimentos
CREATE OR REPLACE FUNCTION public.can_access_procedimentos()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT auth.uid() IS NOT NULL;
$$;

-- Procedimentos PPR
DROP POLICY IF EXISTS "Users can view procedimentos_ppr" ON public.procedimentos_ppr;
DROP POLICY IF EXISTS "Users can insert procedimentos_ppr" ON public.procedimentos_ppr;
DROP POLICY IF EXISTS "Users can update procedimentos_ppr" ON public.procedimentos_ppr;
DROP POLICY IF EXISTS "Admins can delete procedimentos_ppr" ON public.procedimentos_ppr;

CREATE POLICY "optimized_select_procedimentos_ppr" ON public.procedimentos_ppr
  FOR SELECT USING (public.can_access_procedimentos());

CREATE POLICY "optimized_insert_procedimentos_ppr" ON public.procedimentos_ppr
  FOR INSERT WITH CHECK (public.can_access_procedimentos());

CREATE POLICY "optimized_update_procedimentos_ppr" ON public.procedimentos_ppr
  FOR UPDATE USING (public.can_access_procedimentos());

CREATE POLICY "optimized_delete_procedimentos_ppr" ON public.procedimentos_ppr
  FOR DELETE USING (public.is_admin());

-- Procedimentos PT/PM
DROP POLICY IF EXISTS "Users can view procedimentos_pt_pm" ON public.procedimentos_pt_pm;
DROP POLICY IF EXISTS "Users can insert procedimentos_pt_pm" ON public.procedimentos_pt_pm;
DROP POLICY IF EXISTS "Users can update procedimentos_pt_pm" ON public.procedimentos_pt_pm;
DROP POLICY IF EXISTS "Admins can delete procedimentos_pt_pm" ON public.procedimentos_pt_pm;

CREATE POLICY "optimized_select_procedimentos_pt_pm" ON public.procedimentos_pt_pm
  FOR SELECT USING (public.can_access_procedimentos());

CREATE POLICY "optimized_insert_procedimentos_pt_pm" ON public.procedimentos_pt_pm
  FOR INSERT WITH CHECK (public.can_access_procedimentos());

CREATE POLICY "optimized_update_procedimentos_pt_pm" ON public.procedimentos_pt_pm
  FOR UPDATE USING (public.can_access_procedimentos());

CREATE POLICY "optimized_delete_procedimentos_pt_pm" ON public.procedimentos_pt_pm
  FOR DELETE USING (public.is_admin());

-- Procedimentos Fixa
DROP POLICY IF EXISTS "Users can view procedimentos_fixa" ON public.procedimentos_fixa;
DROP POLICY IF EXISTS "Users can insert procedimentos_fixa" ON public.procedimentos_fixa;
DROP POLICY IF EXISTS "Users can update procedimentos_fixa" ON public.procedimentos_fixa;
DROP POLICY IF EXISTS "Admins can delete procedimentos_fixa" ON public.procedimentos_fixa;

CREATE POLICY "optimized_select_procedimentos_fixa" ON public.procedimentos_fixa
  FOR SELECT USING (public.can_access_procedimentos());

CREATE POLICY "optimized_insert_procedimentos_fixa" ON public.procedimentos_fixa
  FOR INSERT WITH CHECK (public.can_access_procedimentos());

CREATE POLICY "optimized_update_procedimentos_fixa" ON public.procedimentos_fixa
  FOR UPDATE USING (public.can_access_procedimentos());

CREATE POLICY "optimized_delete_procedimentos_fixa" ON public.procedimentos_fixa
  FOR DELETE USING (public.is_admin());

-- =====================================================
-- POLÍTICAS OTIMIZADAS PARA FINANCEIRO
-- =====================================================

-- Contas a Pagar
DROP POLICY IF EXISTS "Users can view contas_pagar" ON public.contas_pagar;
DROP POLICY IF EXISTS "Users can insert contas_pagar" ON public.contas_pagar;
DROP POLICY IF EXISTS "Users can update contas_pagar" ON public.contas_pagar;
DROP POLICY IF EXISTS "Admins can delete contas_pagar" ON public.contas_pagar;

CREATE POLICY "optimized_select_contas_pagar" ON public.contas_pagar
  FOR SELECT USING (
    public.has_permission('ver_financeiro')
    OR public.is_admin_or_dev()
  );

CREATE POLICY "optimized_insert_contas_pagar" ON public.contas_pagar
  FOR INSERT WITH CHECK (
    public.has_permission('gerenciar_financeiro')
    OR public.is_admin_or_dev()
  );

CREATE POLICY "optimized_update_contas_pagar" ON public.contas_pagar
  FOR UPDATE USING (
    public.has_permission('gerenciar_financeiro')
    OR public.is_admin_or_dev()
  );

CREATE POLICY "optimized_delete_contas_pagar" ON public.contas_pagar
  FOR DELETE USING (public.is_admin());

-- Contas a Receber
DROP POLICY IF EXISTS "Users can view contas_receber" ON public.contas_receber;
DROP POLICY IF EXISTS "Users can insert contas_receber" ON public.contas_receber;
DROP POLICY IF EXISTS "Users can update contas_receber" ON public.contas_receber;
DROP POLICY IF EXISTS "Admins can delete contas_receber" ON public.contas_receber;

CREATE POLICY "optimized_select_contas_receber" ON public.contas_receber
  FOR SELECT USING (
    public.has_permission('ver_financeiro')
    OR public.is_admin_or_dev()
  );

CREATE POLICY "optimized_insert_contas_receber" ON public.contas_receber
  FOR INSERT WITH CHECK (
    public.has_permission('gerenciar_financeiro')
    OR public.is_admin_or_dev()
  );

CREATE POLICY "optimized_update_contas_receber" ON public.contas_receber
  FOR UPDATE USING (
    public.has_permission('gerenciar_financeiro')
    OR public.is_admin_or_dev()
  );

CREATE POLICY "optimized_delete_contas_receber" ON public.contas_receber
  FOR DELETE USING (public.is_admin());

-- =====================================================
-- ÍNDICES PARA MELHORAR PERFORMANCE DAS POLÍTICAS
-- =====================================================

-- Índice para busca rápida de role por user_id
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id_role
  ON public.user_profiles(user_id, role);

-- Índice para verificação rápida de ADMINs
CREATE INDEX IF NOT EXISTS idx_user_profiles_role
  ON public.user_profiles(role)
  WHERE role IN ('ADMIN', 'DEV');

-- Índice para permissions (se a coluna existir)
CREATE INDEX IF NOT EXISTS idx_user_profiles_permissions
  ON public.user_profiles USING GIN (permissions)
  WHERE permissions IS NOT NULL;

-- =====================================================
-- GRANTS E PERMISSÕES
-- =====================================================

GRANT EXECUTE ON FUNCTION public.is_admin_or_dev() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_permission(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_procedimentos() TO authenticated;

-- =====================================================
-- MENSAGEM DE SUCESSO
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Políticas RLS otimizadas com sucesso!';
  RAISE NOTICE '🚀 Funções auxiliares criadas para melhor performance';
  RAISE NOTICE '📊 Índices adicionados para queries mais rápidas';
  RAISE NOTICE '🔒 Segurança mantida com melhor desempenho';
END $$;
