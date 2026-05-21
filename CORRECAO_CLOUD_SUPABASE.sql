-- CORREÇÃO CLOUD — Rodar no SQL Editor do Supabase
-- https://supabase.com/dashboard/project/ebpuykdqoqkmshfwrchd/editor

-- ============================================================
-- 1. Garantir função can_access_procedimentos()
-- ============================================================
CREATE OR REPLACE FUNCTION public.can_access_procedimentos()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT auth.uid() IS NOT NULL;
$$;

-- ============================================================
-- 2. RLS: can_access_procedimentos() em todas as tabelas
-- ============================================================
DROP POLICY IF EXISTS "optimized_select_procedimentos_fixa_ceramica" ON procedimentos_fixa_ceramica;
CREATE POLICY "optimized_select_procedimentos_fixa_ceramica"
  ON procedimentos_fixa_ceramica FOR SELECT USING (can_access_procedimentos());

DROP POLICY IF EXISTS "optimized_select_procedimentos_adesiva" ON procedimentos_adesiva;
CREATE POLICY "optimized_select_procedimentos_adesiva"
  ON procedimentos_adesiva FOR SELECT USING (can_access_procedimentos());

DROP POLICY IF EXISTS "optimized_select_procedimentos_bruxismo" ON procedimentos_bruxismo;
CREATE POLICY "optimized_select_procedimentos_bruxismo"
  ON procedimentos_bruxismo FOR SELECT USING (can_access_procedimentos());

DROP POLICY IF EXISTS "optimized_select_procedimentos_clareamento" ON procedimentos_clareamento;
CREATE POLICY "optimized_select_procedimentos_clareamento"
  ON procedimentos_clareamento FOR SELECT USING (can_access_procedimentos());

DROP POLICY IF EXISTS "optimized_select_procedimentos_coroa_implante" ON procedimentos_coroa_implante;
CREATE POLICY "optimized_select_procedimentos_coroa_implante"
  ON procedimentos_coroa_implante FOR SELECT USING (can_access_procedimentos());

DROP POLICY IF EXISTS "optimized_select_procedimentos_fixa_impressa" ON procedimentos_fixa_impressa;
CREATE POLICY "optimized_select_procedimentos_fixa_impressa"
  ON procedimentos_fixa_impressa FOR SELECT USING (can_access_procedimentos());

DROP POLICY IF EXISTS "optimized_select_procedimentos_fixa_zirconia" ON procedimentos_fixa_zirconia;
CREATE POLICY "optimized_select_procedimentos_fixa_zirconia"
  ON procedimentos_fixa_zirconia FOR SELECT USING (can_access_procedimentos());

DROP POLICY IF EXISTS "optimized_select_procedimentos_lab_externo" ON procedimentos_lab_externo;
CREATE POLICY "optimized_select_procedimentos_lab_externo"
  ON procedimentos_lab_externo FOR SELECT USING (can_access_procedimentos());

DROP POLICY IF EXISTS "optimized_select_procedimentos_pm" ON procedimentos_pm;
CREATE POLICY "optimized_select_procedimentos_pm"
  ON procedimentos_pm FOR SELECT USING (can_access_procedimentos());

DROP POLICY IF EXISTS "optimized_select_procedimentos_protocolo" ON procedimentos_protocolo;
CREATE POLICY "optimized_select_procedimentos_protocolo"
  ON procedimentos_protocolo FOR SELECT USING (can_access_procedimentos());

DROP POLICY IF EXISTS "optimized_select_procedimentos_pt" ON procedimentos_pt;
CREATE POLICY "optimized_select_procedimentos_pt"
  ON procedimentos_pt FOR SELECT USING (can_access_procedimentos());

DROP POLICY IF EXISTS "optimized_select_procedimentos_restauracao_indireta" ON procedimentos_restauracao_indireta;
CREATE POLICY "optimized_select_procedimentos_restauracao_indireta"
  ON procedimentos_restauracao_indireta FOR SELECT USING (can_access_procedimentos());

DROP POLICY IF EXISTS "optimized_select_procedimentos_placa" ON procedimentos_placa;
CREATE POLICY "optimized_select_procedimentos_placa"
  ON procedimentos_placa FOR SELECT USING (can_access_procedimentos());

-- ============================================================
-- 3. Corrigir procedimentos_ceramica (nome antigo, build antigo)
--    Adicionar colunas novas que o build antigo tenta inserir
-- ============================================================
ALTER TABLE procedimentos_ceramica
  ADD COLUMN IF NOT EXISTS escaner_status text,
  ADD COLUMN IF NOT EXISTS escaner_data date,
  ADD COLUMN IF NOT EXISTS escaner_executor_id bigint,
  ADD COLUMN IF NOT EXISTS escaner_executado_em timestamp,
  ADD COLUMN IF NOT EXISTS escaner_executado_por varchar,
  ADD COLUMN IF NOT EXISTS exocad_status text,
  ADD COLUMN IF NOT EXISTS exocad_data date,
  ADD COLUMN IF NOT EXISTS exocad_executor_id bigint,
  ADD COLUMN IF NOT EXISTS exocad_executado_em timestamp,
  ADD COLUMN IF NOT EXISTS exocad_executado_por varchar,
  ADD COLUMN IF NOT EXISTS imp_res_calcinavel_status text,
  ADD COLUMN IF NOT EXISTS imp_res_calcinavel_data date,
  ADD COLUMN IF NOT EXISTS imp_res_calcinavel_executor_id bigint,
  ADD COLUMN IF NOT EXISTS imp_res_calcinavel_executado_em timestamp,
  ADD COLUMN IF NOT EXISTS imp_res_calcinavel_executado_por varchar,
  ADD COLUMN IF NOT EXISTS moldagem_status text,
  ADD COLUMN IF NOT EXISTS moldagem_data date,
  ADD COLUMN IF NOT EXISTS moldagem_executor_id uuid,
  ADD COLUMN IF NOT EXISTS moldagem_executado_em timestamp,
  ADD COLUMN IF NOT EXISTS moldagem_executado_por varchar,
  ADD COLUMN IF NOT EXISTS vg_status text,
  ADD COLUMN IF NOT EXISTS vg_data date,
  ADD COLUMN IF NOT EXISTS vg_executor_id bigint,
  ADD COLUMN IF NOT EXISTS vg_executado_em timestamp,
  ADD COLUMN IF NOT EXISTS vg_executado_por varchar,
  ADD COLUMN IF NOT EXISTS enceramento_status text,
  ADD COLUMN IF NOT EXISTS enceramento_data date,
  ADD COLUMN IF NOT EXISTS enceramento_executor_id bigint,
  ADD COLUMN IF NOT EXISTS enceramento_executado_em timestamp,
  ADD COLUMN IF NOT EXISTS enceramento_executado_por varchar,
  ADD COLUMN IF NOT EXISTS queima_ceramica_status text,
  ADD COLUMN IF NOT EXISTS queima_ceramica_data date,
  ADD COLUMN IF NOT EXISTS queima_ceramica_executor_id bigint,
  ADD COLUMN IF NOT EXISTS queima_ceramica_executado_em timestamp,
  ADD COLUMN IF NOT EXISTS queima_ceramica_executado_por varchar,
  ADD COLUMN IF NOT EXISTS injecao_status text,
  ADD COLUMN IF NOT EXISTS injecao_data date,
  ADD COLUMN IF NOT EXISTS injecao_executor_id bigint,
  ADD COLUMN IF NOT EXISTS injecao_executado_em timestamp,
  ADD COLUMN IF NOT EXISTS injecao_executado_por varchar,
  ADD COLUMN IF NOT EXISTS maquiagem_status text,
  ADD COLUMN IF NOT EXISTS maquiagem_data date,
  ADD COLUMN IF NOT EXISTS maquiagem_executor_id bigint,
  ADD COLUMN IF NOT EXISTS maquiagem_executado_em timestamp,
  ADD COLUMN IF NOT EXISTS maquiagem_executado_por varchar,
  ADD COLUMN IF NOT EXISTS paciente3_status text,
  ADD COLUMN IF NOT EXISTS paciente3_data date,
  ADD COLUMN IF NOT EXISTS paciente3_agenda date,
  ADD COLUMN IF NOT EXISTS paciente3_executor_id uuid,
  ADD COLUMN IF NOT EXISTS paciente3_executado_em timestamp,
  ADD COLUMN IF NOT EXISTS paciente3_executado_por varchar,
  ADD COLUMN IF NOT EXISTS proxima_etapa text,
  ADD COLUMN IF NOT EXISTS proxima_etapa_responsavel text,
  ADD COLUMN IF NOT EXISTS cor_dente varchar,
  ADD COLUMN IF NOT EXISTS cor_gengiva varchar,
  ADD COLUMN IF NOT EXISTS registro_mordida boolean,
  ADD COLUMN IF NOT EXISTS marca_dente text,
  ADD COLUMN IF NOT EXISTS copia varchar,
  ADD COLUMN IF NOT EXISTS valor_lab numeric,
  ADD COLUMN IF NOT EXISTS pagamento_lab_status text,
  ADD COLUMN IF NOT EXISTS pagamento_lab_data timestamptz,
  ADD COLUMN IF NOT EXISTS doutor_id bigint,
  ADD COLUMN IF NOT EXISTS procedimento_catalogo_id uuid;

-- RLS para procedimentos_ceramica (nome antigo)
ALTER TABLE procedimentos_ceramica ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "optimized_select_procedimentos_ceramica" ON procedimentos_ceramica;
CREATE POLICY "optimized_select_procedimentos_ceramica"
  ON procedimentos_ceramica FOR SELECT USING (can_access_procedimentos());
DROP POLICY IF EXISTS "optimized_insert_procedimentos_ceramica" ON procedimentos_ceramica;
CREATE POLICY "optimized_insert_procedimentos_ceramica"
  ON procedimentos_ceramica FOR INSERT WITH CHECK (can_access_procedimentos());
DROP POLICY IF EXISTS "optimized_update_procedimentos_ceramica" ON procedimentos_ceramica;
CREATE POLICY "optimized_update_procedimentos_ceramica"
  ON procedimentos_ceramica FOR UPDATE USING (can_access_procedimentos());

NOTIFY pgrst, 'reload schema';
