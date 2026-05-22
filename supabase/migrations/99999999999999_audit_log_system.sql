-- =====================================================
-- SISTEMA DE AUDITORIA (AUDIT LOG)
-- Criado em: 2025-12-04
-- Propósito: Rastrear todas as operações críticas no sistema
-- =====================================================

-- Criar tabela de auditoria
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Quem fez a ação
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  user_role TEXT,

  -- O que foi feito
  action VARCHAR(50) NOT NULL, -- INSERT, UPDATE, DELETE, LOGIN, LOGOUT, etc.
  table_name VARCHAR(100) NOT NULL,
  record_id UUID,

  -- Dados da operação
  old_data JSONB,
  new_data JSONB,
  changed_fields TEXT[], -- Array de campos que mudaram

  -- Contexto adicional
  ip_address INET,
  user_agent TEXT,
  request_path TEXT,

  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Índices para performance
  CONSTRAINT valid_action CHECK (action IN (
    'INSERT', 'UPDATE', 'DELETE',
    'LOGIN', 'LOGOUT',
    'PASSWORD_CHANGE', 'PERMISSION_CHANGE',
    'EXPORT', 'IMPORT'
  ))
);

-- Comentários para documentação
COMMENT ON TABLE public.audit_log IS 'Registro de auditoria de todas operações críticas do sistema';
COMMENT ON COLUMN public.audit_log.action IS 'Tipo de ação realizada';
COMMENT ON COLUMN public.audit_log.old_data IS 'Dados antes da modificação (para UPDATE/DELETE)';
COMMENT ON COLUMN public.audit_log.new_data IS 'Dados após a modificação (para INSERT/UPDATE)';
COMMENT ON COLUMN public.audit_log.changed_fields IS 'Lista de campos que foram alterados';

-- Criar índices para melhorar performance de consultas
CREATE INDEX idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX idx_audit_log_table_name ON public.audit_log(table_name);
CREATE INDEX idx_audit_log_action ON public.audit_log(action);
CREATE INDEX idx_audit_log_created_at ON public.audit_log(created_at DESC);
CREATE INDEX idx_audit_log_record_id ON public.audit_log(record_id);

-- Habilitar Row Level Security
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Política: Apenas ADMINs e DEVs podem visualizar logs
CREATE POLICY "Admins can view audit logs" ON public.audit_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid()
      AND role IN ('ADMIN', 'DEV')
    )
  );

-- Política: Ninguém pode deletar logs (apenas sistema via trigger)
CREATE POLICY "Prevent manual audit log deletion" ON public.audit_log
  FOR DELETE
  USING (false);

-- Política: Ninguém pode editar logs (imutável)
CREATE POLICY "Prevent audit log modification" ON public.audit_log
  FOR UPDATE
  USING (false);

-- =====================================================
-- FUNÇÕES DE AUDITORIA
-- =====================================================

-- Função para registrar auditoria genérica
CREATE OR REPLACE FUNCTION public.log_audit(
  p_action VARCHAR(50),
  p_table_name VARCHAR(100),
  p_record_id UUID,
  p_old_data JSONB DEFAULT NULL,
  p_new_data JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_user_email TEXT;
  v_user_role TEXT;
  v_changed_fields TEXT[];
  v_audit_id UUID;
BEGIN
  -- Obter informações do usuário autenticado
  v_user_id := auth.uid();

  -- Buscar email e role do usuário
  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = v_user_id;

  SELECT role INTO v_user_role
  FROM public.user_profiles
  WHERE user_id = v_user_id;

  -- Para UPDATE, identificar campos que mudaram
  IF p_action = 'UPDATE' AND p_old_data IS NOT NULL AND p_new_data IS NOT NULL THEN
    SELECT ARRAY_AGG(key)
    INTO v_changed_fields
    FROM jsonb_each(p_new_data)
    WHERE p_old_data->key IS DISTINCT FROM p_new_data->key;
  END IF;

  -- Inserir log de auditoria
  INSERT INTO public.audit_log (
    user_id,
    user_email,
    user_role,
    action,
    table_name,
    record_id,
    old_data,
    new_data,
    changed_fields
  ) VALUES (
    v_user_id,
    v_user_email,
    COALESCE(v_user_role, 'UNKNOWN'),
    p_action,
    p_table_name,
    p_record_id,
    p_old_data,
    p_new_data,
    v_changed_fields
  )
  RETURNING id INTO v_audit_id;

  RETURN v_audit_id;
END;
$$;

-- =====================================================
-- TRIGGERS AUTOMÁTICOS PARA TABELAS CRÍTICAS
-- =====================================================

-- Função genérica de trigger para auditoria
CREATE OR REPLACE FUNCTION public.trigger_audit_log()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_old_data JSONB;
  v_new_data JSONB;
  v_action VARCHAR(50);
  v_record_id UUID;
BEGIN
  -- Determinar ação
  IF TG_OP = 'DELETE' THEN
    v_action := 'DELETE';
    v_old_data := to_jsonb(OLD);
    v_new_data := NULL;
    v_record_id := OLD.id;
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'UPDATE';
    v_old_data := to_jsonb(OLD);
    v_new_data := to_jsonb(NEW);
    v_record_id := NEW.id;
  ELSIF TG_OP = 'INSERT' THEN
    v_action := 'INSERT';
    v_old_data := NULL;
    v_new_data := to_jsonb(NEW);
    v_record_id := NEW.id;
  END IF;

  -- Registrar auditoria
  PERFORM public.log_audit(
    v_action,
    TG_TABLE_NAME,
    v_record_id,
    v_old_data,
    v_new_data
  );

  -- Retornar apropriadamente
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- =====================================================
-- APLICAR TRIGGERS EM TABELAS CRÍTICAS
-- =====================================================

-- Pacientes
DROP TRIGGER IF EXISTS audit_pacientes ON public.pacientes;
CREATE TRIGGER audit_pacientes
  AFTER INSERT OR UPDATE OR DELETE ON public.pacientes
  FOR EACH ROW EXECUTE FUNCTION public.trigger_audit_log();

-- User Profiles (mudanças de permissão)
DROP TRIGGER IF EXISTS audit_user_profiles ON public.user_profiles;
CREATE TRIGGER audit_user_profiles
  AFTER INSERT OR UPDATE OR DELETE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.trigger_audit_log();

-- Dentistas
DROP TRIGGER IF EXISTS audit_dentistas ON public.dentistas;
CREATE TRIGGER audit_dentistas
  AFTER INSERT OR UPDATE OR DELETE ON public.dentistas
  FOR EACH ROW EXECUTE FUNCTION public.trigger_audit_log();

-- Funcionários
DROP TRIGGER IF EXISTS audit_funcionarios ON public.funcionarios;
CREATE TRIGGER audit_funcionarios
  AFTER INSERT OR UPDATE OR DELETE ON public.funcionarios
  FOR EACH ROW EXECUTE FUNCTION public.trigger_audit_log();

-- Procedimentos (todas as variações)
DROP TRIGGER IF EXISTS audit_procedimentos_ppr ON public.procedimentos_ppr;
CREATE TRIGGER audit_procedimentos_ppr
  AFTER INSERT OR UPDATE OR DELETE ON public.procedimentos_ppr
  FOR EACH ROW EXECUTE FUNCTION public.trigger_audit_log();

DROP TRIGGER IF EXISTS audit_procedimentos_pt_pm ON public.procedimentos_pt_pm;
CREATE TRIGGER audit_procedimentos_pt_pm
  AFTER INSERT OR UPDATE OR DELETE ON public.procedimentos_pt_pm
  FOR EACH ROW EXECUTE FUNCTION public.trigger_audit_log();

DROP TRIGGER IF EXISTS audit_procedimentos_fixa ON public.procedimentos_fixa;
CREATE TRIGGER audit_procedimentos_fixa
  AFTER INSERT OR UPDATE OR DELETE ON public.procedimentos_fixa
  FOR EACH ROW EXECUTE FUNCTION public.trigger_audit_log();

-- Triggers de protocolo: tabelas renomeadas para procedimentos_protocolo
DROP TRIGGER IF EXISTS audit_protocolo ON public.procedimentos_protocolo;
CREATE TRIGGER audit_protocolo
  AFTER INSERT OR UPDATE OR DELETE ON public.procedimentos_protocolo
  FOR EACH ROW EXECUTE FUNCTION public.trigger_audit_log();

-- Contas a Pagar
DROP TRIGGER IF EXISTS audit_contas_pagar ON public.contas_pagar;
CREATE TRIGGER audit_contas_pagar
  AFTER INSERT OR UPDATE OR DELETE ON public.contas_pagar
  FOR EACH ROW EXECUTE FUNCTION public.trigger_audit_log();

-- Contas a Receber
DROP TRIGGER IF EXISTS audit_contas_receber ON public.contas_receber;
CREATE TRIGGER audit_contas_receber
  AFTER INSERT OR UPDATE OR DELETE ON public.contas_receber
  FOR EACH ROW EXECUTE FUNCTION public.trigger_audit_log();

-- =====================================================
-- VIEW PARA CONSULTA AMIGÁVEL DE LOGS
-- =====================================================

CREATE OR REPLACE VIEW public.audit_log_readable AS
SELECT
  al.id,
  al.created_at,
  al.action,
  al.table_name,
  al.user_email,
  al.user_role,
  al.changed_fields,
  CASE
    WHEN al.action = 'INSERT' THEN al.new_data
    WHEN al.action = 'DELETE' THEN al.old_data
    WHEN al.action = 'UPDATE' THEN
      jsonb_build_object(
        'before', al.old_data,
        'after', al.new_data,
        'changes', al.changed_fields
      )
    ELSE NULL
  END as data_summary,
  al.ip_address,
  al.record_id
FROM public.audit_log al
ORDER BY al.created_at DESC;

-- Política RLS para a view
ALTER VIEW public.audit_log_readable OWNER TO postgres;

-- Comentário na view
COMMENT ON VIEW public.audit_log_readable IS 'Visualização amigável dos logs de auditoria';

-- =====================================================
-- FUNÇÃO PARA LIMPAR LOGS ANTIGOS (MANUTENÇÃO)
-- =====================================================

CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs(
  p_days_to_keep INTEGER DEFAULT 365
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  -- Apenas ADMINs podem executar
  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid()
    AND role = 'ADMIN'
  ) THEN
    RAISE EXCEPTION 'Apenas administradores podem executar esta função';
  END IF;

  -- Deletar logs antigos
  DELETE FROM public.audit_log
  WHERE created_at < NOW() - (p_days_to_keep || ' days')::INTERVAL;

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

  RETURN v_deleted_count;
END;
$$;

COMMENT ON FUNCTION public.cleanup_old_audit_logs IS 'Remove logs de auditoria mais antigos que N dias (padrão: 365)';

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Permitir que serviço acesse as funções
GRANT EXECUTE ON FUNCTION public.log_audit TO authenticated;
GRANT EXECUTE ON FUNCTION public.trigger_audit_log TO postgres;
GRANT EXECUTE ON FUNCTION public.cleanup_old_audit_logs TO authenticated;

-- Permitir SELECT na view para roles autorizadas
GRANT SELECT ON public.audit_log_readable TO authenticated;

-- =====================================================
-- MENSAGEM DE SUCESSO
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Sistema de auditoria criado com sucesso!';
  RAISE NOTICE '📊 Tabelas monitoradas: pacientes, user_profiles, dentistas, funcionarios, procedimentos, contas';
  RAISE NOTICE '👀 Apenas ADMINs e DEVs podem visualizar logs';
  RAISE NOTICE '🔒 Logs são imutáveis e não podem ser deletados manualmente';
END $$;
