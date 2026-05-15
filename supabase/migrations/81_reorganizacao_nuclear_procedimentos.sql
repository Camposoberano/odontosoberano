-- =====================================================
-- MIGRAÇÃO: 81_REORGANIZACAO_NUCLEAR_PROCEDIMENTOS.SQL
-- Descrição: Reorganização de tabelas e nomes (Tópico 02)
-- Data: 2026-04-05
-- =====================================================

-- 1. RENOMEAÇÃO DE TABELAS (Caso existam com nomes antigos)
DO $$ 
BEGIN
    -- Cerâmica -> Fixa de Cerâmica
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'procedimentos_ceramica') THEN
        ALTER TABLE procedimentos_ceramica RENAME TO procedimentos_fixa_ceramica;
    END IF;

    -- Resina Impressa -> Fixa Impressa
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'procedimentos_resina_impressa') THEN
        ALTER TABLE procedimentos_resina_impressa RENAME TO procedimentos_fixa_impressa;
    END IF;

    -- Provisório Barra Adesiva -> Adesiva
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'procedimentos_provisorio') THEN
        ALTER TABLE procedimentos_provisorio RENAME TO procedimentos_adesiva;
    END IF;
END $$;

-- 2. CRIAÇÃO DE NOVAS TABELAS (Dobra/Duplicação/Separação)
-- Prótese Total (PT)
CREATE TABLE IF NOT EXISTS procedimentos_pt (
    LIKE procedimentos_pt_pm INCLUDING ALL
);

-- Ponte Móvel (PM)
CREATE TABLE IF NOT EXISTS procedimentos_pm (
    LIKE procedimentos_pt_pm INCLUDING ALL
);

-- Migrar dados se a tabela antiga existir
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'procedimentos_pt_pm') THEN
        INSERT INTO procedimentos_pt SELECT * FROM procedimentos_pt_pm WHERE tipo_protese = 'PT' ON CONFLICT DO NOTHING;
        INSERT INTO procedimentos_pm SELECT * FROM procedimentos_pt_pm WHERE tipo_protese = 'PM' ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Restauração Indireta (Baseada na Adesiva)
CREATE TABLE IF NOT EXISTS procedimentos_restauracao_indireta (
    LIKE procedimentos_adesiva INCLUDING ALL
);

-- Garantir que Coroa Sobre Implante e Fixa Zircônia existam (Baseadas no Lab Externo)
-- Se não existirem, criamos a partir do lab_externo
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'procedimentos_coroa_implante') THEN
        CREATE TABLE procedimentos_coroa_implante (LIKE procedimentos_lab_externo INCLUDING ALL);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'procedimentos_fixa_zirconia') THEN
        CREATE TABLE procedimentos_fixa_zirconia (LIKE procedimentos_lab_externo INCLUDING ALL);
    END IF;
END $$;

-- 3. ALTERAR ESTRUTURA (Fixa Provisória)
-- Adiciona colunas no início do fluxo (usaremos a ordem lógica no frontend, aqui só garantimos colunas)
ALTER TABLE procedimentos_fixa ADD COLUMN IF NOT EXISTS moldagem_estudo_status status_etapa DEFAULT 'Pendente';
ALTER TABLE procedimentos_fixa ADD COLUMN IF NOT EXISTS moldagem_estudo_data DATE;
ALTER TABLE procedimentos_fixa ADD COLUMN IF NOT EXISTS moldagem_estudo_executor_id UUID;
ALTER TABLE procedimentos_fixa ADD COLUMN IF NOT EXISTS moldagem_estudo_executado_em TIMESTAMP;
ALTER TABLE procedimentos_fixa ADD COLUMN IF NOT EXISTS moldagem_estudo_executado_por VARCHAR(255);

ALTER TABLE procedimentos_fixa ADD COLUMN IF NOT EXISTS compra_dentes_status status_etapa DEFAULT 'Pendente';
ALTER TABLE procedimentos_fixa ADD COLUMN IF NOT EXISTS compra_dentes_data DATE;
ALTER TABLE procedimentos_fixa ADD COLUMN IF NOT EXISTS compra_dentes_executor_id UUID;
ALTER TABLE procedimentos_fixa ADD COLUMN IF NOT EXISTS compra_dentes_executado_em TIMESTAMP;
ALTER TABLE procedimentos_fixa ADD COLUMN IF NOT EXISTS compra_dentes_executado_por VARCHAR(255);

-- 4. ATUALIZAÇÃO RECURSIVA DAS VIEWS (ESSENCIAL PARA O DASHBOARD)
DROP VIEW IF EXISTS v_todos_procedimentos_full_exp CASCADE;
DROP VIEW IF EXISTS v_todos_procedimentos_full CASCADE;

CREATE OR REPLACE VIEW v_todos_procedimentos_full AS
SELECT id, user_id, ordem_servico, nome_paciente, paciente_id, data_inicial, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, updated_at, 'ppr' as tipo FROM procedimentos_ppr
UNION ALL
SELECT id, user_id, ordem_servico, nome_paciente, paciente_id, data_inicial, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, updated_at, 'pt' as tipo FROM procedimentos_pt
UNION ALL
SELECT id, user_id, ordem_servico, nome_paciente, paciente_id, data_inicial, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, updated_at, 'pm' as tipo FROM procedimentos_pm
UNION ALL
SELECT id, user_id, ordem_servico, nome_paciente, paciente_id, data_inicial, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, updated_at, 'protocolo-definitivo' as tipo FROM procedimentos_protocolo
UNION ALL
SELECT id, user_id, ordem_servico, nome_paciente, paciente_id, data_inicial, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, updated_at, 'fixa' as tipo FROM procedimentos_fixa
UNION ALL
SELECT id, user_id, ordem_servico, nome_paciente, paciente_id, data_inicial, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, updated_at, 'fixa-ceramica' as tipo FROM procedimentos_fixa_ceramica
UNION ALL
SELECT id, user_id, ordem_servico, nome_paciente, paciente_id, data_inicial, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, updated_at, 'fixa-impressa' as tipo FROM procedimentos_fixa_impressa
UNION ALL
SELECT id, user_id, ordem_servico, nome_paciente, paciente_id, data_inicial, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, updated_at, 'adesiva' as tipo FROM procedimentos_adesiva
UNION ALL
SELECT id, user_id, ordem_servico, nome_paciente, paciente_id, data_inicial, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, updated_at, 'restauracao-indireta' as tipo FROM procedimentos_restauracao_indireta
UNION ALL
SELECT id, user_id, ordem_servico, nome_paciente, paciente_id, data_inicial, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, updated_at, 'bruxismo' as tipo FROM procedimentos_bruxismo
UNION ALL
SELECT id, user_id, ordem_servico, nome_paciente, paciente_id, data_inicial, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, updated_at, 'clareamento' as tipo FROM procedimentos_clareamento
UNION ALL
SELECT id, user_id, ordem_servico, nome_paciente, paciente_id, data_inicial, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, updated_at, 'coroa-implante' as tipo FROM procedimentos_coroa_implante
UNION ALL
SELECT id, user_id, ordem_servico, nome_paciente, paciente_id, data_inicial, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, updated_at, 'fixa-zirconia' as tipo FROM procedimentos_fixa_zirconia
UNION ALL
SELECT id, user_id, ordem_servico, nome_paciente, paciente_id, data_inicial, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, updated_at, 'lab-externo' as tipo FROM procedimentos_lab_externo;

-- View Expandida (Com nomes)
CREATE OR REPLACE VIEW v_todos_procedimentos_full_exp AS
SELECT 
    v.*,
    d.nome as dentista_nome,
    p.nome as protetico_nome,
    p.laboratorio as protetico_laboratorio
FROM v_todos_procedimentos_full v
LEFT JOIN dentistas d ON v.dentista_id = d.id
LEFT JOIN proteticos p ON v.protetico_id = p.id;

NOTIFY pgrst, 'reload schema';
