-- Passo 1: Remover tudo relacionado a procedimentos_protocolo
DROP POLICY IF EXISTS "Users can view their own procedimentos_protocolo" ON procedimentos_protocolo;
DROP POLICY IF EXISTS "Users can create their own procedimentos_protocolo" ON procedimentos_protocolo;
DROP POLICY IF EXISTS "Users can update their own procedimentos_protocolo" ON procedimentos_protocolo;
DROP POLICY IF EXISTS "Users can delete their own procedimentos_protocolo" ON procedimentos_protocolo;
DROP TRIGGER IF EXISTS trigger_update_procedimentos_protocolo_updated_at ON procedimentos_protocolo;
DROP FUNCTION IF EXISTS update_procedimentos_protocolo_updated_at();
DROP TABLE IF EXISTS procedimentos_protocolo;

-- Passo 2: Criar ENUM tipo_protocolo (ignorar se já existe)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_protocolo') THEN
        CREATE TYPE tipo_protocolo AS ENUM ('PROVISORIO', 'DEFINITIVO');
    END IF;
END $$;

-- Passo 3: Criar tabela
CREATE TABLE procedimentos_protocolo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    ordem_servico INTEGER NOT NULL,
    nome_paciente VARCHAR(255) NOT NULL,
    paciente_id UUID REFERENCES pacientes(id),
    data_inicial DATE NOT NULL,
    tipo_protocolo tipo_protocolo NOT NULL,
    arcada tipo_arcada,
    observacoes TEXT,
    dentista_id UUID REFERENCES dentistas(id),
    protetico_id BIGINT REFERENCES proteticos(id),
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

-- Passo 4: Criar índices
CREATE INDEX idx_procedimentos_protocolo_user_id ON procedimentos_protocolo(user_id);
CREATE INDEX idx_procedimentos_protocolo_ordem_servico ON procedimentos_protocolo(ordem_servico);
CREATE INDEX idx_procedimentos_protocolo_status_geral ON procedimentos_protocolo(status_geral);
CREATE INDEX idx_procedimentos_protocolo_tipo_protocolo ON procedimentos_protocolo(tipo_protocolo);

-- Passo 5: Habilitar RLS
ALTER TABLE procedimentos_protocolo ENABLE ROW LEVEL SECURITY;

-- Passo 6: Criar políticas
CREATE POLICY "Users can view their own procedimentos_protocolo" ON procedimentos_protocolo FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own procedimentos_protocolo" ON procedimentos_protocolo FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own procedimentos_protocolo" ON procedimentos_protocolo FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own procedimentos_protocolo" ON procedimentos_protocolo FOR DELETE USING (auth.uid() = user_id);

-- Passo 7: Criar função e trigger
CREATE OR REPLACE FUNCTION update_procedimentos_protocolo_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_procedimentos_protocolo_updated_at BEFORE UPDATE ON procedimentos_protocolo FOR EACH ROW EXECUTE FUNCTION update_procedimentos_protocolo_updated_at();
