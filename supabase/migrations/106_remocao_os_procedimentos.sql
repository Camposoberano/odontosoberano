-- =============================================================================
-- Migration 106: Remoção completa de OS, Procedimentos e Protéticos
-- Cliente solicitou simplificação do sistema - foco em Pacientes, Agenda, Financeiro
-- =============================================================================

-- 1. DROPAR VIEWS (primeiro, pois dependem das tabelas)
DROP VIEW IF EXISTS v_todos_procedimentos_full CASCADE;
DROP VIEW IF EXISTS v_todos_procedimentos_full_exp CASCADE;
DROP VIEW IF EXISTS v_procedimentos_andamento CASCADE;
DROP VIEW IF EXISTS v_proximas_entregas CASCADE;
DROP VIEW IF EXISTS v_produtividade_dentistas CASCADE;
DROP VIEW IF EXISTS v_produtividade_doutores CASCADE;
DROP VIEW IF EXISTS v_produtividade_proteticos CASCADE;
DROP VIEW IF EXISTS v_procedimentos_next_action CASCADE;

-- 2. DROPAR TABELAS DE PROCEDIMENTOS (CASCADE remove FKs automaticamente)
DROP TABLE IF EXISTS historico_procedimentos CASCADE;
DROP TABLE IF EXISTS procedimentos_ppr CASCADE;
DROP TABLE IF EXISTS procedimentos_pt CASCADE;
DROP TABLE IF EXISTS procedimentos_pm CASCADE;
DROP TABLE IF EXISTS procedimentos_pt_pm CASCADE;
DROP TABLE IF EXISTS procedimentos_protocolo CASCADE;
DROP TABLE IF EXISTS procedimentos_protocolo_provisorio CASCADE;
DROP TABLE IF EXISTS procedimentos_fixa CASCADE;
DROP TABLE IF EXISTS procedimentos_fixa_ceramica CASCADE;
DROP TABLE IF EXISTS procedimentos_ceramica CASCADE;
DROP TABLE IF EXISTS procedimentos_fixa_impressa CASCADE;
DROP TABLE IF EXISTS procedimentos_resina_impressa CASCADE;
DROP TABLE IF EXISTS procedimentos_adesiva CASCADE;
DROP TABLE IF EXISTS procedimentos_provisorio CASCADE;
DROP TABLE IF EXISTS procedimentos_restauracao_indireta CASCADE;
DROP TABLE IF EXISTS procedimentos_placa CASCADE;
DROP TABLE IF EXISTS procedimentos_bruxismo CASCADE;
DROP TABLE IF EXISTS procedimentos_clareamento CASCADE;
DROP TABLE IF EXISTS procedimentos_lab_externo CASCADE;
DROP TABLE IF EXISTS procedimentos_coroa_implante CASCADE;
DROP TABLE IF EXISTS procedimentos_fixa_zirconia CASCADE;
DROP TABLE IF EXISTS procedimentos_catalogo CASCADE;

-- 3. DROPAR TABELAS DE OS E PROTÉTICOS
-- NOTA: orcamentos e orcamento_itens são mantidos (funcionalidade preservada)
-- O CASCADE ao dropar procedimentos_catalogo remove automaticamente a FK constraint de orcamento_itens
DROP TABLE IF EXISTS ordem_servico CASCADE;
DROP TABLE IF EXISTS proteticos CASCADE;

-- 4. DROPAR SEQUENCES
DROP SEQUENCE IF EXISTS ordem_servico_numero_seq CASCADE;

-- 5. REMOVER FUNÇÕES RELACIONADAS (se existirem)
DROP FUNCTION IF EXISTS get_proxima_etapa_ppr(record) CASCADE;
DROP FUNCTION IF EXISTS get_proxima_etapa_fixa(record) CASCADE;
DROP FUNCTION IF EXISTS get_proxima_etapa_protocolo(record) CASCADE;
