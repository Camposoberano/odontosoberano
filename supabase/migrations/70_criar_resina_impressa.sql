-- =====================================================
-- MIGRAÇÃO: Criar Tabela RESINA IMPRESSA
-- Descrição: Procedimento de Resina Impressa
-- Data: 2025-12-04
-- =====================================================

-- Criar tabela procedimentos_resina_impressa
CREATE TABLE IF NOT EXISTS procedimentos_resina_impressa (
    -- Identificação
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),

    -- Informações Básicas
    ordem_servico INTEGER NOT NULL,
    nome_paciente VARCHAR(255) NOT NULL,
    paciente_id UUID REFERENCES pacientes(id),
    data_inicial DATE NOT NULL,

    -- Detalhes Técnicos
    dente VARCHAR(100),
    observacoes TEXT,

    -- Profissionais
    dentista_id UUID REFERENCES dentistas(id),
    protetico_id BIGINT REFERENCES proteticos(id),

    -- Status Geral
    status_geral status_procedimento DEFAULT 'Pendente',
    data_entrega DATE,

    -- ===================================
    -- ETAPA 1: ESCANER (Protético)
    -- ===================================
    escaner_status status_etapa DEFAULT 'Pendente',
    escaner_data DATE,
    escaner_executor_id BIGINT,
    escaner_executado_em TIMESTAMP,
    escaner_executado_por VARCHAR(255),

    -- ===================================
    -- ETAPA 2: EXOCAD (Protético)
    -- ===================================
    exocad_status status_etapa DEFAULT 'Pendente',
    exocad_data DATE,
    exocad_executor_id BIGINT,
    exocad_executado_em TIMESTAMP,
    exocad_executado_por VARCHAR(255),

    -- ===================================
    -- ETAPA 3: IMPRESSÃO (Protético)
    -- ===================================
    impressao_status status_etapa DEFAULT 'Pendente',
    impressao_data DATE,
    impressao_executor_id BIGINT,
    impressao_executado_em TIMESTAMP,
    impressao_executado_por VARCHAR(255),

    -- ===================================
    -- ETAPA 4: MAQUIAGEM (Protético)
    -- ===================================
    maquiagem_status status_etapa DEFAULT 'Pendente',
    maquiagem_data DATE,
    maquiagem_executor_id BIGINT,
    maquiagem_executado_em TIMESTAMP,
    maquiagem_executado_por VARCHAR(255),

    -- ===================================
    -- ETAPA 5: Paciente 3 (Prova Final) (Dentista) - COM AGENDA
    -- ===================================
    paciente3_status status_etapa DEFAULT 'Pendente',
    paciente3_data DATE,
    paciente3_agenda DATE,
    paciente3_executor_id UUID,
    paciente3_executado_em TIMESTAMP,
    paciente3_executado_por VARCHAR(255),

    -- Metadados
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_procedimentos_resina_impressa_user_id
    ON procedimentos_resina_impressa(user_id);

CREATE INDEX IF NOT EXISTS idx_procedimentos_resina_impressa_ordem_servico
    ON procedimentos_resina_impressa(ordem_servico);

CREATE INDEX IF NOT EXISTS idx_procedimentos_resina_impressa_status_geral
    ON procedimentos_resina_impressa(status_geral);

CREATE INDEX IF NOT EXISTS idx_procedimentos_resina_impressa_paciente_id
    ON procedimentos_resina_impressa(paciente_id);

CREATE INDEX IF NOT EXISTS idx_procedimentos_resina_impressa_dentista_id
    ON procedimentos_resina_impressa(dentista_id);

CREATE INDEX IF NOT EXISTS idx_procedimentos_resina_impressa_protetico_id
    ON procedimentos_resina_impressa(protetico_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE procedimentos_resina_impressa ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver apenas seus próprios procedimentos
CREATE POLICY "Users can view their own procedimentos_resina_impressa"
ON procedimentos_resina_impressa
FOR SELECT
USING (auth.uid() = user_id);

-- Política: Usuários podem criar seus próprios procedimentos
CREATE POLICY "Users can create their own procedimentos_resina_impressa"
ON procedimentos_resina_impressa
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem atualizar seus próprios procedimentos
CREATE POLICY "Users can update their own procedimentos_resina_impressa"
ON procedimentos_resina_impressa
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem deletar seus próprios procedimentos
CREATE POLICY "Users can delete their own procedimentos_resina_impressa"
ON procedimentos_resina_impressa
FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGER PARA ATUALIZAR updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_procedimentos_resina_impressa_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_procedimentos_resina_impressa_updated_at
    BEFORE UPDATE ON procedimentos_resina_impressa
    FOR EACH ROW
    EXECUTE FUNCTION update_procedimentos_resina_impressa_updated_at();

-- =====================================================
-- COMENTÁRIOS NA TABELA
-- =====================================================
COMMENT ON TABLE procedimentos_resina_impressa IS 'Tabela de procedimentos RESINA IMPRESSA com 5 etapas rastreadas';
COMMENT ON COLUMN procedimentos_resina_impressa.ordem_servico IS 'Número da Ordem de Serviço';
COMMENT ON COLUMN procedimentos_resina_impressa.status_geral IS 'Status geral do procedimento: Pendente, Em andamento, Concluído';
COMMENT ON COLUMN procedimentos_resina_impressa.dente IS 'Dente(s) envolvido(s) no procedimento';
COMMENT ON COLUMN procedimentos_resina_impressa.paciente3_agenda IS 'Data agendada para Paciente 3 (Prova Final)';
