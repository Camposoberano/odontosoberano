-- =====================================================
-- MIGRAÇÃO: 101_FIX_VIEW_PROTOCOLO_TYPES.SQL
-- Descrição: Ajusta a View Unificada para diferenciar Protocolos Provisórios de Definitivos.
-- =====================================================

-- 1. Remover as views existentes para reconstruir
DROP VIEW IF EXISTS v_todos_procedimentos_full_exp CASCADE;
DROP VIEW IF EXISTS v_todos_procedimentos_full CASCADE;

-- 2. Criar a View base com o mapeamento dinâmico para protocolos
CREATE OR REPLACE VIEW v_todos_procedimentos_full AS
SELECT id, user_id, ordem_servico::text, nome_paciente, paciente_id, data_inicial, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, updated_at, proxima_etapa, proxima_etapa_responsavel, 'ppr' as tipo FROM procedimentos_ppr
UNION ALL
SELECT id, user_id, ordem_servico::text, nome_paciente, paciente_id, data_inicial, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, updated_at, proxima_etapa, proxima_etapa_responsavel, 'pt' as tipo FROM procedimentos_pt
UNION ALL
SELECT id, user_id, ordem_servico::text, nome_paciente, paciente_id, data_inicial, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, updated_at, proxima_etapa, proxima_etapa_responsavel, 'pm' as tipo FROM procedimentos_pm
UNION ALL
-- AJUSTE AQUI: Mapeia o tipo baseado na coluna tipo_protocolo
SELECT id, user_id, ordem_servico::text, nome_paciente, paciente_id, data_inicial, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, updated_at, proxima_etapa, proxima_etapa_responsavel, 
    CASE 
        WHEN tipo_protocolo = 'PROVISORIO' THEN 'protocolo-provisorio'
        WHEN tipo_protocolo = 'DEFINITIVO' THEN 'protocolo-definitivo'
        ELSE 'protocolo' 
    END as tipo 
FROM procedimentos_protocolo
UNION ALL
SELECT id, user_id, ordem_servico::text, nome_paciente, paciente_id, data_inicial, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, updated_at, proxima_etapa, proxima_etapa_responsavel, 'fixa' as tipo FROM procedimentos_fixa
UNION ALL
SELECT id, user_id, ordem_servico::text, nome_paciente, paciente_id, data_inicial, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, updated_at, proxima_etapa, proxima_etapa_responsavel, 'fixa-ceramica' as tipo FROM procedimentos_fixa_ceramica
UNION ALL
SELECT id, user_id, ordem_servico::text, nome_paciente, paciente_id, data_inicial, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, updated_at, proxima_etapa, proxima_etapa_responsavel, 'fixa-impressa' as tipo FROM procedimentos_fixa_impressa
UNION ALL
SELECT id, user_id, ordem_servico::text, nome_paciente, paciente_id, data_inicial, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, updated_at, proxima_etapa, proxima_etapa_responsavel, 'adesiva' as tipo FROM procedimentos_adesiva
UNION ALL
SELECT id, user_id, ordem_servico::text, nome_paciente, paciente_id, data_inicial, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, updated_at, proxima_etapa, proxima_etapa_responsavel, 'restauracao-indireta' as tipo FROM procedimentos_restauracao_indireta
UNION ALL
SELECT id, user_id, ordem_servico::text, nome_paciente, paciente_id, data_inicial, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, updated_at, proxima_etapa, proxima_etapa_responsavel, 'bruxismo' as tipo FROM procedimentos_bruxismo
UNION ALL
SELECT id, user_id, ordem_servico::text, nome_paciente, paciente_id, data_inicial, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, updated_at, proxima_etapa, proxima_etapa_responsavel, 'clareamento' as tipo FROM procedimentos_clareamento
UNION ALL
SELECT id, user_id, ordem_servico::text, nome_paciente, paciente_id, data_inicial, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, updated_at, proxima_etapa, proxima_etapa_responsavel, 'coroa-implante' as tipo FROM procedimentos_coroa_implante
UNION ALL
SELECT id, user_id, ordem_servico::text, nome_paciente, paciente_id, data_inicial, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, updated_at, proxima_etapa, proxima_etapa_responsavel, 'fixa-zirconia' as tipo FROM procedimentos_fixa_zirconia
UNION ALL
SELECT id, user_id, ordem_servico::text, nome_paciente, paciente_id, data_inicial, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, updated_at, proxima_etapa, proxima_etapa_responsavel, 'lab-externo' as tipo FROM procedimentos_lab_externo;

-- 3. Recriar a View Expandida com nomes
CREATE OR REPLACE VIEW v_todos_procedimentos_full_exp WITH (security_invoker = true) AS
SELECT 
    v.*,
    d.nome as dentista_nome,
    p.nome as protetico_nome,
    p.laboratorio as protetico_laboratorio
FROM v_todos_procedimentos_full v
LEFT JOIN dentistas d ON v.dentista_id = d.id
LEFT JOIN proteticos p ON v.protetico_id = p.id;
