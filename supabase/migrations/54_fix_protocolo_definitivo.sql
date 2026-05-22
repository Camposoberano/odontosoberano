-- =====================================================
-- FIX FINAL: Garantir que a tabela protocolo está correta
-- =====================================================

-- 1. Remover completamente a tabela e suas dependências
DROP POLICY IF EXISTS "Users can view their own procedimentos_protocolo" ON procedimentos_protocolo;
DROP POLICY IF EXISTS "Users can create their own procedimentos_protocolo" ON procedimentos_protocolo;
DROP POLICY IF EXISTS "Users can update their own procedimentos_protocolo" ON procedimentos_protocolo;
DROP POLICY IF EXISTS "Users can delete their own procedimentos_protocolo" ON procedimentos_protocolo;
DROP POLICY IF EXISTS "protocolo_select" ON procedimentos_protocolo;
DROP POLICY IF EXISTS "protocolo_insert" ON procedimentos_protocolo;
DROP POLICY IF EXISTS "protocolo_update" ON procedimentos_protocolo;
DROP POLICY IF EXISTS "protocolo_delete" ON procedimentos_protocolo;
DROP TRIGGER IF EXISTS trigger_update_procedimentos_protocolo_updated_at ON procedimentos_protocolo;
DROP TRIGGER IF EXISTS protocolo_updated_at ON procedimentos_protocolo;
DROP FUNCTION IF EXISTS update_procedimentos_protocolo_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_protocolo_timestamp() CASCADE;
DROP TABLE IF EXISTS procedimentos_protocolo CASCADE;

-- 2. Criar ENUM tipo_protocolo (se não existir)
DO $$ BEGIN
    CREATE TYPE tipo_protocolo AS ENUM ('PROVISORIO', 'DEFINITIVO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Criar tabela procedimentos_protocolo
CREATE TABLE procedimentos_protocolo (
    -- Identificação
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Informações Básicas
    ordem_servico INTEGER NOT NULL,
    nome_paciente VARCHAR(255) NOT NULL,
    paciente_id UUID REFERENCES pacientes(id) ON DELETE SET NULL,
    data_inicial DATE NOT NULL,

    -- Detalhes Técnicos
    tipo_protocolo tipo_protocolo NOT NULL,
    arcada tipo_arcada,
    observacoes TEXT,

    -- Profissionais
    dentista_id UUID REFERENCES dentistas(id) ON DELETE SET NULL,
    protetico_id BIGINT REFERENCES proteticos(id) ON DELETE SET NULL,

    -- Status Geral
    status_geral status_procedimento DEFAULT 'Pendente',
    data_entrega DATE,

    -- ETAPA 1: MOLDAGEM (Dentista)
    moldagem_status status_etapa DEFAULT 'Pendente',
    moldagem_data DATE,
    moldagem_executor_id UUID,
    moldagem_executado_em TIMESTAMP,
    moldagem_executado_por VARCHAR(255),

    -- ETAPA 2: VG - Vazamento de Gesso (Protético)
    vg_status status_etapa DEFAULT 'Pendente',
    vg_data DATE,
    vg_executor_id BIGINT,
    vg_executado_em TIMESTAMP,
    vg_executado_por VARCHAR(255),

    -- ETAPA 3: PROVA DE BARRA (Dentista) - APENAS DEFINITIVO
    prova_barra_status status_etapa DEFAULT 'Pendente',
    prova_barra_data DATE,
    prova_barra_executor_id UUID,
    prova_barra_executado_em TIMESTAMP,
    prova_barra_executado_por VARCHAR(255),

    -- ETAPA 4: PLANO DE CERA (Protético) - COM AGENDA
    plano_cera_status status_etapa DEFAULT 'Pendente',
    plano_cera_data DATE,
    plano_cera_agenda DATE,
    plano_cera_executor_id BIGINT,
    plano_cera_executado_em TIMESTAMP,
    plano_cera_executado_por VARCHAR(255),

    -- ETAPA 5: PROVA DE CERA (Dentista) - COM AGENDA (F1)
    prova_cera_status status_etapa DEFAULT 'Pendente',
    prova_cera_data DATE,
    prova_cera_agenda DATE,
    prova_cera_executor_id UUID,
    prova_cera_executado_em TIMESTAMP,
    prova_cera_executado_por VARCHAR(255),

    -- ETAPA 6: MONTAGEM DE DENTE (Protético)
    montagem_dente_status status_etapa DEFAULT 'Pendente',
    montagem_dente_data DATE,
    montagem_dente_executor_id BIGINT,
    montagem_dente_executado_em TIMESTAMP,
    montagem_dente_executado_por VARCHAR(255),

    -- ETAPA 7: PROVA DE DENTE (Dentista) - COM AGENDA (F2)
    prova_dente_status status_etapa DEFAULT 'Pendente',
    prova_dente_data DATE,
    prova_dente_agenda DATE,
    prova_dente_executor_id UUID,
    prova_dente_executado_em TIMESTAMP,
    prova_dente_executado_por VARCHAR(255),

    -- ETAPA 8: ACRILIZAÇÃO E ACABAMENTO (Protético)
    acrilizacao_acabamento_status status_etapa DEFAULT 'Pendente',
    acrilizacao_acabamento_data DATE,
    acrilizacao_acabamento_executor_id BIGINT,
    acrilizacao_acabamento_executado_em TIMESTAMP,
    acrilizacao_acabamento_executado_por VARCHAR(255),

    -- ETAPA 9: ENTREGA (Dentista) - COM AGENDA (F3)
    entrega_status status_etapa DEFAULT 'Pendente',
    entrega_data DATE,
    entrega_agenda DATE,
    entrega_executor_id UUID,
    entrega_executado_em TIMESTAMP,
    entrega_executado_por VARCHAR(255),

    -- Metadados
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Criar índices para performance
CREATE INDEX idx_procedimentos_protocolo_user_id ON procedimentos_protocolo(user_id);
CREATE INDEX idx_procedimentos_protocolo_ordem_servico ON procedimentos_protocolo(ordem_servico);
CREATE INDEX idx_procedimentos_protocolo_status_geral ON procedimentos_protocolo(status_geral);
CREATE INDEX idx_procedimentos_protocolo_tipo_protocolo ON procedimentos_protocolo(tipo_protocolo);
CREATE INDEX idx_procedimentos_protocolo_paciente_id ON procedimentos_protocolo(paciente_id);
CREATE INDEX idx_procedimentos_protocolo_dentista_id ON procedimentos_protocolo(dentista_id);
CREATE INDEX idx_procedimentos_protocolo_protetico_id ON procedimentos_protocolo(protetico_id);

-- 5. Habilitar RLS
ALTER TABLE procedimentos_protocolo ENABLE ROW LEVEL SECURITY;

-- 6. Criar políticas RLS
CREATE POLICY "Users can view their own procedimentos_protocolo"
ON procedimentos_protocolo
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own procedimentos_protocolo"
ON procedimentos_protocolo
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own procedimentos_protocolo"
ON procedimentos_protocolo
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own procedimentos_protocolo"
ON procedimentos_protocolo
FOR DELETE
USING (auth.uid() = user_id);

-- 7. Criar função e trigger para updated_at
CREATE OR REPLACE FUNCTION update_procedimentos_protocolo_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_procedimentos_protocolo_updated_at
    BEFORE UPDATE ON procedimentos_protocolo
    FOR EACH ROW
    EXECUTE FUNCTION update_procedimentos_protocolo_updated_at();

-- 8. Comentários
COMMENT ON TABLE procedimentos_protocolo IS 'Tabela de procedimentos PROTOCOLO (Provisório e Definitivo) com 9 etapas rastreadas';
COMMENT ON COLUMN procedimentos_protocolo.ordem_servico IS 'Número da Ordem de Serviço';
COMMENT ON COLUMN procedimentos_protocolo.tipo_protocolo IS 'Tipo: PROVISORIO (8 etapas) ou DEFINITIVO (9 etapas com Prova de Barra)';
