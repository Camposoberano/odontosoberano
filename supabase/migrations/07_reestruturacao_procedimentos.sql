-- =====================================================
-- MIGRAÇÃO: Reestruturação de Procedimentos (TÓPICO 02)
-- Descrição: Separação de tabelas, duplicatas e novas etapas
-- Data: 2024-03-04
-- =====================================================

BEGIN;

-- 1. ADICIONAR NOVAS ETAPAS NA TABELA FIXA (Ação 4)
-- Adiciona etapas no início do fluxo para procedimentos_fixa
ALTER TABLE procedimentos_fixa 
ADD COLUMN IF NOT EXISTS moldagem_estudo_status status_etapa DEFAULT 'Pendente',
ADD COLUMN IF NOT EXISTS moldagem_estudo_data DATE,
ADD COLUMN IF NOT EXISTS moldagem_estudo_executor_id UUID,
ADD COLUMN IF NOT EXISTS moldagem_estudo_executado_em TIMESTAMP,
ADD COLUMN IF NOT EXISTS moldagem_estudo_executado_por VARCHAR(255),
ADD COLUMN IF NOT EXISTS compra_dentes_status status_etapa DEFAULT 'Pendente',
ADD COLUMN IF NOT EXISTS compra_dentes_data DATE,
ADD COLUMN IF NOT EXISTS compra_dentes_executor_id UUID,
ADD COLUMN IF NOT EXISTS compra_dentes_executado_em TIMESTAMP,
ADD COLUMN IF NOT EXISTS compra_dentes_executado_por VARCHAR(255);

-- 2. CRIAR TABELAS SEPARADAS (Ação 1)

-- Prótese Total (PT)
CREATE TABLE IF NOT EXISTS procedimentos_pt (LIKE procedimentos_pt_pm INCLUDING ALL);
-- Ponte Móvel (PM)
CREATE TABLE IF NOT EXISTS procedimentos_pm (LIKE procedimentos_pt_pm INCLUDING ALL);

-- Placa de Bruxismo
CREATE TABLE IF NOT EXISTS procedimentos_bruxismo (LIKE procedimentos_placa INCLUDING ALL);
-- Clareamento
CREATE TABLE IF NOT EXISTS procedimentos_clareamento (LIKE procedimentos_placa INCLUDING ALL);

-- 3. CRIAR DUPLICATAS (Ação 2 & 3 Especial)

-- Coroa sobre Implante (Base: Lab Externo)
CREATE TABLE IF NOT EXISTS procedimentos_coroa_implante (LIKE procedimentos_lab_externo INCLUDING ALL);
-- Fixa de Zircônia (Base: Lab Externo)
CREATE TABLE IF NOT EXISTS procedimentos_fixa_zirconia (LIKE procedimentos_lab_externo INCLUDING ALL);

-- Restauração Indireta (Base: Provisório/Adesiva)
CREATE TABLE IF NOT EXISTS procedimentos_restauracao_indireta (LIKE procedimentos_provisorio INCLUDING ALL);

-- 4. MIGRAÇÃO DE DADOS (OPCIONAL MAS RECOMENDADA)
-- Mover dados de PT/PM para as respectivas tabelas
INSERT INTO procedimentos_pt SELECT * FROM procedimentos_pt_pm WHERE tipo_protese = 'PT' ON CONFLICT DO NOTHING;
INSERT INTO procedimentos_pm SELECT * FROM procedimentos_pt_pm WHERE tipo_protese = 'PM' ON CONFLICT DO NOTHING;

-- 5. ADICIONAR CAMPOS FINANCEIROS (Se não estiverem presentes via INCLUDING ALL)
-- Nota: INCLUDING ALL já traz as colunas valor_lab, etc. se elas existirem na tabela pai.
-- Mas vamos garantir que as políticas RLS também sejam criadas (INCLUDING ALL traz índices e constraints, mas RLS precisa ser habilitado).

ALTER TABLE procedimentos_pt ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedimentos_pm ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedimentos_bruxismo ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedimentos_clareamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedimentos_coroa_implante ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedimentos_fixa_zirconia ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedimentos_restauracao_indireta ENABLE ROW LEVEL SECURITY;

-- Aplicar políticas básicas de RLS para as novas tabelas
DO $$
DECLARE
    t text;
    tables text[] := ARRAY[
        'procedimentos_pt', 'procedimentos_pm', 
        'procedimentos_bruxismo', 'procedimentos_clareamento',
        'procedimentos_coroa_implante', 'procedimentos_fixa_zirconia',
        'procedimentos_restauracao_indireta'
    ];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Users can view their own %I" ON %I', t, t);
        EXECUTE format('CREATE POLICY "Users can view their own %I" ON %I FOR SELECT USING (auth.uid() = user_id)', t, t);
        
        EXECUTE format('DROP POLICY IF EXISTS "Users can create their own %I" ON %I', t, t);
        EXECUTE format('CREATE POLICY "Users can create their own %I" ON %I FOR INSERT WITH CHECK (auth.uid() = user_id)', t, t);
        
        EXECUTE format('DROP POLICY IF EXISTS "Users can update their own %I" ON %I', t, t);
        EXECUTE format('CREATE POLICY "Users can update their own %I" ON %I FOR UPDATE USING (auth.uid() = user_id)', t, t);
        
        EXECUTE format('DROP POLICY IF EXISTS "Users can delete their own %I" ON %I', t, t);
        EXECUTE format('CREATE POLICY "Users can delete their own %I" ON %I FOR DELETE USING (auth.uid() = user_id)', t, t);
    END LOOP;
END $$;

COMMIT;
