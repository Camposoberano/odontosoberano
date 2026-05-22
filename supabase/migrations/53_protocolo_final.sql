-- Remover completamente
DROP TABLE IF EXISTS procedimentos_protocolo CASCADE;

-- Criar tipo enum se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_protocolo') THEN
        CREATE TYPE tipo_protocolo AS ENUM ('PROVISORIO', 'DEFINITIVO');
    END IF;
END $$;

-- Criar tabela
CREATE TABLE procedimentos_protocolo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    ordem_servico INTEGER NOT NULL,
    nome_paciente VARCHAR(255) NOT NULL,
    paciente_id UUID REFERENCES pacientes(id) ON DELETE SET NULL,
    data_inicial DATE NOT NULL,
    tipo_protocolo tipo_protocolo NOT NULL,
    arcada tipo_arcada,
    observacoes TEXT,
    dentista_id UUID REFERENCES dentistas(id) ON DELETE SET NULL,
    protetico_id BIGINT REFERENCES proteticos(id) ON DELETE SET NULL,
    status_geral status_procedimento DEFAULT 'Pendente',
    data_entrega DATE,
    moldagem_status status_etapa DEFAULT 'Pendente',
    moldagem_data DATE,
    moldagem_executor_id UUID,
    moldagem_executado_em TIMESTAMP,
    moldagem_executado_por VARCHAR(255),
    vg_status status_etapa DEFAULT 'Pendente',
    vg_data DATE,
    vg_executor_id BIGINT,
    vg_executado_em TIMESTAMP,
    vg_executado_por VARCHAR(255),
    prova_barra_status status_etapa DEFAULT 'Pendente',
    prova_barra_data DATE,
    prova_barra_executor_id UUID,
    prova_barra_executado_em TIMESTAMP,
    prova_barra_executado_por VARCHAR(255),
    plano_cera_status status_etapa DEFAULT 'Pendente',
    plano_cera_data DATE,
    plano_cera_agenda DATE,
    plano_cera_executor_id BIGINT,
    plano_cera_executado_em TIMESTAMP,
    plano_cera_executado_por VARCHAR(255),
    prova_cera_status status_etapa DEFAULT 'Pendente',
    prova_cera_data DATE,
    prova_cera_agenda DATE,
    prova_cera_executor_id UUID,
    prova_cera_executado_em TIMESTAMP,
    prova_cera_executado_por VARCHAR(255),
    montagem_dente_status status_etapa DEFAULT 'Pendente',
    montagem_dente_data DATE,
    montagem_dente_executor_id BIGINT,
    montagem_dente_executado_em TIMESTAMP,
    montagem_dente_executado_por VARCHAR(255),
    prova_dente_status status_etapa DEFAULT 'Pendente',
    prova_dente_data DATE,
    prova_dente_agenda DATE,
    prova_dente_executor_id UUID,
    prova_dente_executado_em TIMESTAMP,
    prova_dente_executado_por VARCHAR(255),
    acrilizacao_acabamento_status status_etapa DEFAULT 'Pendente',
    acrilizacao_acabamento_data DATE,
    acrilizacao_acabamento_executor_id BIGINT,
    acrilizacao_acabamento_executado_em TIMESTAMP,
    acrilizacao_acabamento_executado_por VARCHAR(255),
    entrega_status status_etapa DEFAULT 'Pendente',
    entrega_data DATE,
    entrega_agenda DATE,
    entrega_executor_id UUID,
    entrega_executado_em TIMESTAMP,
    entrega_executado_por VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_proc_prot_user ON procedimentos_protocolo(user_id);
CREATE INDEX idx_proc_prot_os ON procedimentos_protocolo(ordem_servico);
CREATE INDEX idx_proc_prot_tipo ON procedimentos_protocolo(tipo_protocolo);

-- RLS
ALTER TABLE procedimentos_protocolo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "protocolo_select" ON procedimentos_protocolo FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "protocolo_insert" ON procedimentos_protocolo FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "protocolo_update" ON procedimentos_protocolo FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "protocolo_delete" ON procedimentos_protocolo FOR DELETE USING (auth.uid() = user_id);

-- Trigger
CREATE OR REPLACE FUNCTION update_protocolo_timestamp() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER protocolo_updated_at BEFORE UPDATE ON procedimentos_protocolo FOR EACH ROW EXECUTE FUNCTION update_protocolo_timestamp();
