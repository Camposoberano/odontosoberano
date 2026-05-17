-- =====================================================
-- FIX: RLS em tabelas sem proteção + trigger_audit_log
-- Data: 2026-05-17
-- Problema raiz: trigger_audit_log passava TG_TABLE_NAME (tipo `name`)
--   para log_audit que esperava VARCHAR — PostgreSQL não faz coerção
--   implícita, causando falha em TODAS as operações auditadas incluindo
--   criação de auth users.
-- =====================================================

-- 1. FIX CRÍTICO: trigger_audit_log com cast correto
--    (também corrigido em 99999999999999_audit_log_system.sql)
CREATE OR REPLACE FUNCTION public.trigger_audit_log()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $func$
DECLARE
  v_old_data JSONB;
  v_new_data JSONB;
  v_action VARCHAR(50);
  v_record_id UUID;
BEGIN
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

  -- Cast explícito: TG_TABLE_NAME é tipo `name`, log_audit espera VARCHAR.
  -- PostgreSQL não coerce implicitamente; sem cast toda operação auditada falha.
  PERFORM public.log_audit(
    v_action,
    TG_TABLE_NAME::VARCHAR,
    v_record_id,
    v_old_data,
    v_new_data
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$func$;

-- 2. FIX: procedimentos_ppr tinha policies mas RLS desabilitado
ALTER TABLE public.procedimentos_ppr ENABLE ROW LEVEL SECURITY;

-- 3. FIX: historico_procedimentos nunca teve RLS
ALTER TABLE public.historico_procedimentos ENABLE ROW LEVEL SECURITY;

-- Política básica para historico_procedimentos (leitura/escrita via service_role)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'historico_procedimentos' AND schemaname = 'public'
  ) THEN
    CREATE POLICY "allow_authenticated" ON public.historico_procedimentos
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;
