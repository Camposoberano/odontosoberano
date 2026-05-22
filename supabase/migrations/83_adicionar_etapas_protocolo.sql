-- =====================================================
-- MIGRAÇÃO: 83_ADICIONAR_ETAPAS_PROTOCOLO.SQL
-- Descrição: Adiciona as etapas de Envio Lab, Recebimento Lab 
-- e Agendamento ao fluxo de Protocolo.
-- Data: 2026-04-05
-- =====================================================

-- 1. ADICIONAR COLUNAS PARA NOVAS ETAPAS NA TABELA procedimentos_protocolo
DO $$ 
BEGIN 
    -- 1.1 Envio para Laboratório
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'procedimentos_protocolo' AND column_name = 'envio_laboratorio_status') THEN
        ALTER TABLE procedimentos_protocolo ADD COLUMN envio_laboratorio_status status_etapa DEFAULT 'Pendente';
        ALTER TABLE procedimentos_protocolo ADD COLUMN envio_laboratorio_data DATE;
        ALTER TABLE procedimentos_protocolo ADD COLUMN envio_laboratorio_executor_id UUID;
        ALTER TABLE procedimentos_protocolo ADD COLUMN envio_laboratorio_executado_em TIMESTAMP;
        ALTER TABLE procedimentos_protocolo ADD COLUMN envio_laboratorio_executado_por VARCHAR(255);
    END IF;

    -- 1.2 Recebimento do Laboratório
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'procedimentos_protocolo' AND column_name = 'recebimento_laboratorio_status') THEN
        ALTER TABLE procedimentos_protocolo ADD COLUMN recebimento_laboratorio_status status_etapa DEFAULT 'Pendente';
        ALTER TABLE procedimentos_protocolo ADD COLUMN recebimento_laboratorio_data DATE;
        ALTER TABLE procedimentos_protocolo ADD COLUMN recebimento_laboratorio_executor_id UUID;
        ALTER TABLE procedimentos_protocolo ADD COLUMN recebimento_laboratorio_executado_em TIMESTAMP;
        ALTER TABLE procedimentos_protocolo ADD COLUMN recebimento_laboratorio_executado_por VARCHAR(255);
    END IF;

    -- 1.3 Agendamento do Paciente
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'procedimentos_protocolo' AND column_name = 'agendamento_paciente_status') THEN
        ALTER TABLE procedimentos_protocolo ADD COLUMN agendamento_paciente_status status_etapa DEFAULT 'Pendente';
        ALTER TABLE procedimentos_protocolo ADD COLUMN agendamento_paciente_data DATE;
        ALTER TABLE procedimentos_protocolo ADD COLUMN agendamento_paciente_agenda DATE;
        ALTER TABLE procedimentos_protocolo ADD COLUMN agendamento_paciente_executor_id UUID;
        ALTER TABLE procedimentos_protocolo ADD COLUMN agendamento_paciente_executado_em TIMESTAMP;
        ALTER TABLE procedimentos_protocolo ADD COLUMN agendamento_paciente_executado_por VARCHAR(255);
    END IF;
END $$;

-- 2. NOTIFICAR SCHEMA RELOAD
NOTIFY pgrst, 'reload schema';
