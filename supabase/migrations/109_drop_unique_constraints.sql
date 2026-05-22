-- Migration 109: Remove constraints únicas legadas em procedimentos_*
-- APLICADA MANUALMENTE em 2026-05-22 via Supabase SQL Editor
-- Origem: EXECUTAR_NO_SUPABASE.sql
-- Motivo: constraints globais bloqueavam inserção de OS duplicadas por usuário diferente

ALTER TABLE IF EXISTS procedimentos_ppr DROP CONSTRAINT IF EXISTS unique_ordem_servico;
ALTER TABLE IF EXISTS procedimentos_ptpm DROP CONSTRAINT IF EXISTS unique_ordem_servico;
ALTER TABLE IF EXISTS procedimentos_fixa DROP CONSTRAINT IF EXISTS unique_ordem_servico;
ALTER TABLE IF EXISTS procedimentos_protocolo_provisorio DROP CONSTRAINT IF EXISTS unique_ordem_servico;
ALTER TABLE IF EXISTS procedimentos_protocolo_definitivo DROP CONSTRAINT IF EXISTS unique_ordem_servico;
ALTER TABLE IF EXISTS procedimentos_resina_impressa DROP CONSTRAINT IF EXISTS unique_ordem_servico;
ALTER TABLE IF EXISTS procedimentos_ceramica DROP CONSTRAINT IF EXISTS unique_ordem_servico;
ALTER TABLE IF EXISTS procedimentos_placa DROP CONSTRAINT IF EXISTS unique_ordem_servico;
ALTER TABLE IF EXISTS procedimentos_provisorio DROP CONSTRAINT IF EXISTS unique_ordem_servico;
ALTER TABLE IF EXISTS procedimentos_lab_externo DROP CONSTRAINT IF EXISTS unique_ordem_servico;

ALTER TABLE IF EXISTS procedimentos_ppr DROP CONSTRAINT IF EXISTS unique_user_os;
ALTER TABLE IF EXISTS procedimentos_ptpm DROP CONSTRAINT IF EXISTS unique_user_os;
ALTER TABLE IF EXISTS procedimentos_fixa DROP CONSTRAINT IF EXISTS unique_user_os;
ALTER TABLE IF EXISTS procedimentos_protocolo_provisorio DROP CONSTRAINT IF EXISTS unique_user_os;
ALTER TABLE IF EXISTS procedimentos_protocolo_definitivo DROP CONSTRAINT IF EXISTS unique_user_os;
ALTER TABLE IF EXISTS procedimentos_resina_impressa DROP CONSTRAINT IF EXISTS unique_user_os;
ALTER TABLE IF EXISTS procedimentos_ceramica DROP CONSTRAINT IF EXISTS unique_user_os;
ALTER TABLE IF EXISTS procedimentos_placa DROP CONSTRAINT IF EXISTS unique_user_os;
ALTER TABLE IF EXISTS procedimentos_provisorio DROP CONSTRAINT IF EXISTS unique_user_os;
ALTER TABLE IF EXISTS procedimentos_lab_externo DROP CONSTRAINT IF EXISTS unique_user_os;
