-- ============================================================
-- FUNÇÃO RPC PARA CÁLCULO DE COMISSÕES (PERFORMANCE DE BACKEND)
-- Melhor alternativa às Edge Functions para processamento local intenso
-- ============================================================

CREATE OR REPLACE FUNCTION calcular_comissoes_periodo(
  p_dentista_id UUID,
  p_data_inicio DATE,
  p_data_fim DATE
)
RETURNS TABLE (
  total_comissao DECIMAL(10,2),
  quantidade_procedimentos INTEGER,
  ticket_medio_comissao DECIMAL(10,2)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se o usuário solicitante tem permissão
  IF NOT (
    auth.uid() = p_dentista_id OR 
    EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid() AND role IN ('ADMIN', 'FINANCEIRO', 'DEV'))
  ) THEN
    RAISE EXCEPTION 'Acesso Negado: Você não tem permissão para ver comissões de outros profissionais.';
  END IF;

  RETURN QUERY
  SELECT 
    COALESCE(SUM(valor_comissao), 0) as total_comissao,
    COUNT(*)::INTEGER as quantidade_procedimentos,
    CASE 
      WHEN COUNT(*) > 0 THEN COALESCE(SUM(valor_comissao), 0) / COUNT(*)
      ELSE 0
    END as ticket_medio_comissao
  FROM (
    -- Unir dados de todas as tabelas de procedimento (PPR, PT, Fixa, etc.)
    -- Exemplo simplificado. Na prática real, todas as tabelas que geram comissões entrariam aqui via UNION ALL
    SELECT 100.00::DECIMAL as valor_comissao FROM procedimentos_ppr WHERE dentista_responsavel_id = p_dentista_id AND created_at BETWEEN p_data_inicio AND p_data_fim
    UNION ALL
    SELECT 150.00::DECIMAL as valor_comissao FROM procedimentos_pt_pm WHERE dentista_responsavel_id = p_dentista_id AND created_at BETWEEN p_data_inicio AND p_data_fim
  ) comissoes_consolidadas;
  
END;
$$;
