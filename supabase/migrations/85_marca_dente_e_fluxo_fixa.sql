-- Migração 85: Adição de 'marca_dente' e novos estágios para Fixa Impressa

-- 1. Adicionar 'marca_dente' em todas as tabelas de procedimentos
DO $$
DECLARE
    t text;
    tables text[] := ARRAY[
        'procedimentos_ppr', 'procedimentos_pt', 'procedimentos_pm', 
        'procedimentos_protocolo', 'procedimentos_fixa', 'procedimentos_fixa_ceramica', 
        'procedimentos_fixa_impressa', 'procedimentos_adesiva', 'procedimentos_restauracao_indireta', 
        'procedimentos_bruxismo', 'procedimentos_clareamento', 'procedimentos_lab_externo', 
        'procedimentos_coroa_implante', 'procedimentos_fixa_zirconia'
    ];
BEGIN
    FOREACH t IN ARRAY tables
    LOOP
        EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS marca_dente TEXT', t);
    END LOOP;
END $$;

-- 2. Adicionar novos estágios para Fixa Impressa (Tópico 06)
-- Atualmente já temos 'impressao' e 'maquiagem'. Vamos adicionar 'resina_impressa_ou_calcinavel' e 'acabamento'.
ALTER TABLE procedimentos_fixa_impressa 
ADD COLUMN IF NOT EXISTS resina_impressa_ou_calcinavel_status TEXT DEFAULT 'Pendente',
ADD COLUMN IF NOT EXISTS resina_impressa_ou_calcinavel_data DATE,
ADD COLUMN IF NOT EXISTS resina_impressa_ou_calcinavel_executor_id INTEGER,
ADD COLUMN IF NOT EXISTS resina_impressa_ou_calcinavel_executado_em TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS resina_impressa_ou_calcinavel_executado_por TEXT,

ADD COLUMN IF NOT EXISTS acabamento_status TEXT DEFAULT 'Pendente',
ADD COLUMN IF NOT EXISTS acabamento_data DATE,
ADD COLUMN IF NOT EXISTS acabamento_executor_id INTEGER,
ADD COLUMN IF NOT EXISTS acabamento_executado_em TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS acabamento_executado_por TEXT;

-- 3. Recriar a View Unificada (v_todos_procedimentos_full) para incluir 'marca_dente'
DROP VIEW IF EXISTS v_todos_procedimentos_full_exp CASCADE;
DROP VIEW IF EXISTS v_todos_procedimentos_full CASCADE;

CREATE OR REPLACE VIEW v_todos_procedimentos_full AS
SELECT id, user_id, ordem_servico::text, nome_paciente, paciente_id, data_inicial, 'ppr' as tipo, arcada::text, dente::text, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, observacoes, created_at, updated_at, marca_dente FROM procedimentos_ppr
UNION ALL
SELECT id, user_id, ordem_servico::text, nome_paciente, paciente_id, data_inicial, 'pt' as tipo, arcada::text, dente::text, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, observacoes, created_at, updated_at, marca_dente FROM procedimentos_pt
UNION ALL
SELECT id, user_id, ordem_servico::text, nome_paciente, paciente_id, data_inicial, 'pm' as tipo, arcada::text, dente::text, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, observacoes, created_at, updated_at, marca_dente FROM procedimentos_pm
UNION ALL
SELECT id, user_id, ordem_servico::text, nome_paciente, paciente_id, data_inicial, 'protocolo-definitivo' as tipo, arcada::text, dente::text, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, observacoes, created_at, updated_at, marca_dente FROM procedimentos_protocolo
UNION ALL
SELECT id, user_id, ordem_servico::text, nome_paciente, paciente_id, data_inicial, 'fixa' as tipo, NULL::text as arcada, dente::text, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, observacoes, created_at, updated_at, marca_dente FROM procedimentos_fixa
UNION ALL
SELECT id, user_id, ordem_servico::text, nome_paciente, paciente_id, data_inicial, 'fixa-ceramica' as tipo, NULL::text as arcada, dente::text, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, observacoes, created_at, updated_at, marca_dente FROM procedimentos_fixa_ceramica
UNION ALL
SELECT id, user_id, ordem_servico::text, nome_paciente, paciente_id, data_inicial, 'fixa-impressa' as tipo, NULL::text as arcada, dente::text, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, observacoes, created_at, updated_at, marca_dente FROM procedimentos_fixa_impressa
UNION ALL
SELECT id, user_id, ordem_servico::text, nome_paciente, paciente_id, data_inicial, 'adesiva' as tipo, NULL::text as arcada, dente::text, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, observacoes, created_at, updated_at, marca_dente FROM procedimentos_adesiva
UNION ALL
SELECT id, user_id, ordem_servico::text, nome_paciente, paciente_id, data_inicial, 'restauracao-indireta' as tipo, NULL::text as arcada, dente::text, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, observacoes, created_at, updated_at, marca_dente FROM procedimentos_restauracao_indireta
UNION ALL
SELECT id, user_id, ordem_servico::text, nome_paciente, paciente_id, data_inicial, 'bruxismo' as tipo, arcada::text, dente::text, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, observacoes, created_at, updated_at, marca_dente FROM procedimentos_bruxismo
UNION ALL
SELECT id, user_id, ordem_servico::text, nome_paciente, paciente_id, data_inicial, 'clareamento' as tipo, arcada::text, NULL::text as dente, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, observacoes, created_at, updated_at, marca_dente FROM procedimentos_clareamento
UNION ALL
SELECT id, user_id, ordem_servico::text, nome_paciente, paciente_id, data_inicial, 'lab-externo' as tipo, arcada::text, dente::text, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, observacoes, created_at, updated_at, marca_dente FROM procedimentos_lab_externo
UNION ALL
SELECT id, user_id, ordem_servico::text, nome_paciente, paciente_id, data_inicial, 'coroa-implante' as tipo, arcada::text, dente::text, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, observacoes, created_at, updated_at, marca_dente FROM procedimentos_coroa_implante
UNION ALL
SELECT id, user_id, ordem_servico::text, nome_paciente, paciente_id, data_inicial, 'fixa-zirconia' as tipo, NULL::text as arcada, dente::text, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, observacoes, created_at, updated_at, marca_dente FROM procedimentos_fixa_zirconia;

-- 4. Recriar View Expandida com nomes (v_todos_procedimentos_full_exp)
CREATE OR REPLACE VIEW v_todos_procedimentos_full_exp AS
SELECT 
    v.*,
    d.nome as dentista_nome,
    p.nome as protetico_nome,
    p.laboratorio as protetico_laboratorio
FROM v_todos_procedimentos_full v
LEFT JOIN dentistas d ON v.dentista_id = d.id
LEFT JOIN proteticos p ON v.protetico_id = p.id;
