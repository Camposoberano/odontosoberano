-- Migration 130: Garantir que usuários autenticados vejam todos os registros de contas_receber
-- Problema: a policy clinic_shared_access_contas_receber (FOR ALL) pode não cobrir SELECT
-- corretamente em conjunto com optimized_select_contas_receber.
-- Solução: adicionar policy SELECT explícita sem remover as existentes.

DO $$
BEGIN
  -- Adicionar policy SELECT explícita para todos os usuários autenticados da clínica
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'contas_receber'
    AND policyname = 'clinic_view_all_contas_receber'
  ) THEN
    EXECUTE '
      CREATE POLICY clinic_view_all_contas_receber
        ON contas_receber
        FOR SELECT
        TO authenticated
        USING (true)
    ';
  END IF;
END $$;

-- Mesma correção para contas_pagar (pode ter o mesmo problema)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'contas_pagar'
    AND policyname = 'clinic_view_all_contas_pagar'
  ) THEN
    EXECUTE '
      CREATE POLICY clinic_view_all_contas_pagar
        ON contas_pagar
        FOR SELECT
        TO authenticated
        USING (true)
    ';
  END IF;
END $$;

-- Verificação
SELECT tablename, policyname, cmd, roles, qual
FROM pg_policies
WHERE tablename IN ('contas_receber', 'contas_pagar')
ORDER BY tablename, policyname;
