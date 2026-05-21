-- CORREÇÃO URGENTE — Rodar no Supabase dashboard do projeto ebpuykdqoqkmshfwrchd
-- Acesse: https://supabase.com/dashboard/project/ebpuykdqoqkmshfwrchd/editor

-- ============================================================
-- 1. Garantir que can_access_procedimentos() existe
-- ============================================================
CREATE OR REPLACE FUNCTION public.can_access_procedimentos()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT auth.uid() IS NOT NULL;
$$;

-- ============================================================
-- 2. Corrigir RLS em todas as tabelas de procedimentos
--    (substituir uid()=user_id por can_access_procedimentos)
-- ============================================================

-- fixa_ceramica (principal problemática)
DROP POLICY IF EXISTS "optimized_select_procedimentos_fixa_ceramica" ON procedimentos_fixa_ceramica;
CREATE POLICY "optimized_select_procedimentos_fixa_ceramica"
  ON procedimentos_fixa_ceramica FOR SELECT USING (can_access_procedimentos());

-- adesiva
DROP POLICY IF EXISTS "optimized_select_procedimentos_adesiva" ON procedimentos_adesiva;
CREATE POLICY "optimized_select_procedimentos_adesiva"
  ON procedimentos_adesiva FOR SELECT USING (can_access_procedimentos());

-- bruxismo
DROP POLICY IF EXISTS "optimized_select_procedimentos_bruxismo" ON procedimentos_bruxismo;
CREATE POLICY "optimized_select_procedimentos_bruxismo"
  ON procedimentos_bruxismo FOR SELECT USING (can_access_procedimentos());

-- clareamento
DROP POLICY IF EXISTS "optimized_select_procedimentos_clareamento" ON procedimentos_clareamento;
CREATE POLICY "optimized_select_procedimentos_clareamento"
  ON procedimentos_clareamento FOR SELECT USING (can_access_procedimentos());

-- coroa_implante
DROP POLICY IF EXISTS "optimized_select_procedimentos_coroa_implante" ON procedimentos_coroa_implante;
CREATE POLICY "optimized_select_procedimentos_coroa_implante"
  ON procedimentos_coroa_implante FOR SELECT USING (can_access_procedimentos());

-- fixa_impressa
DROP POLICY IF EXISTS "optimized_select_procedimentos_fixa_impressa" ON procedimentos_fixa_impressa;
CREATE POLICY "optimized_select_procedimentos_fixa_impressa"
  ON procedimentos_fixa_impressa FOR SELECT USING (can_access_procedimentos());

-- fixa_zirconia
DROP POLICY IF EXISTS "optimized_select_procedimentos_fixa_zirconia" ON procedimentos_fixa_zirconia;
CREATE POLICY "optimized_select_procedimentos_fixa_zirconia"
  ON procedimentos_fixa_zirconia FOR SELECT USING (can_access_procedimentos());

-- lab_externo
DROP POLICY IF EXISTS "optimized_select_procedimentos_lab_externo" ON procedimentos_lab_externo;
CREATE POLICY "optimized_select_procedimentos_lab_externo"
  ON procedimentos_lab_externo FOR SELECT USING (can_access_procedimentos());

-- pm
DROP POLICY IF EXISTS "optimized_select_procedimentos_pm" ON procedimentos_pm;
CREATE POLICY "optimized_select_procedimentos_pm"
  ON procedimentos_pm FOR SELECT USING (can_access_procedimentos());

-- protocolo
DROP POLICY IF EXISTS "optimized_select_procedimentos_protocolo" ON procedimentos_protocolo;
CREATE POLICY "optimized_select_procedimentos_protocolo"
  ON procedimentos_protocolo FOR SELECT USING (can_access_procedimentos());

-- pt
DROP POLICY IF EXISTS "optimized_select_procedimentos_pt" ON procedimentos_pt;
CREATE POLICY "optimized_select_procedimentos_pt"
  ON procedimentos_pt FOR SELECT USING (can_access_procedimentos());

-- restauracao_indireta
DROP POLICY IF EXISTS "optimized_select_procedimentos_restauracao_indireta" ON procedimentos_restauracao_indireta;
CREATE POLICY "optimized_select_procedimentos_restauracao_indireta"
  ON procedimentos_restauracao_indireta FOR SELECT USING (can_access_procedimentos());

-- placa
DROP POLICY IF EXISTS "optimized_select_procedimentos_placa" ON procedimentos_placa;
CREATE POLICY "optimized_select_procedimentos_placa"
  ON procedimentos_placa FOR SELECT USING (can_access_procedimentos());

-- ============================================================
-- 3. Compatibilidade retroativa: view procedimentos_ceramica
--    (build antigo de soberano.pro ainda usa esse nome)
-- ============================================================
CREATE OR REPLACE VIEW procedimentos_ceramica AS
  SELECT * FROM procedimentos_fixa_ceramica;

-- Permite INSERT/UPDATE/DELETE na view (redireciona para tabela real)
CREATE OR REPLACE RULE procedimentos_ceramica_insert AS
  ON INSERT TO procedimentos_ceramica
  DO INSTEAD
  INSERT INTO procedimentos_fixa_ceramica VALUES (NEW.*);

CREATE OR REPLACE RULE procedimentos_ceramica_update AS
  ON UPDATE TO procedimentos_ceramica
  DO INSTEAD
  UPDATE procedimentos_fixa_ceramica SET ROW = NEW WHERE id = OLD.id;

CREATE OR REPLACE RULE procedimentos_ceramica_delete AS
  ON DELETE TO procedimentos_ceramica
  DO INSTEAD
  DELETE FROM procedimentos_fixa_ceramica WHERE id = OLD.id;

NOTIFY pgrst, 'reload schema';
