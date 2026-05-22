-- =====================================================
-- MIGRAÇÃO: Criar Tabela FIXA ORTOVITAL
-- Descrição: Procedimento de Prótese Fixa Ortovital
-- Data: 2025-01-26
-- =====================================================

-- Criar tabela procedimentos_fixa
CREATE TABLE IF NOT EXISTS procedimentos_fixa (
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
    -- ETAPA 1: MOLDAGEM (Dentista)
    -- ===================================
    moldagem_status status_etapa DEFAULT 'Pendente',
    moldagem_data DATE,
    moldagem_executor_id UUID,
    moldagem_executado_em TIMESTAMP,
    moldagem_executado_por VARCHAR(255),

    -- ===================================
    -- ETAPA 2: VG (Protético)
    -- ===================================
    vg_status status_etapa DEFAULT 'Pendente',
    vg_data DATE,
    vg_executor_id BIGINT,
    vg_executado_em TIMESTAMP,
    vg_executado_por VARCHAR(255),

    -- ===================================
    -- ETAPA 3: MONTAGEM DE DENTE (Protético)
    -- ===================================
    montagem_dente_status status_etapa DEFAULT 'Pendente',
    montagem_dente_data DATE,
    montagem_dente_executor_id BIGINT,
    montagem_dente_executado_em TIMESTAMP,
    montagem_dente_executado_por VARCHAR(255),

    -- ===================================
    -- ETAPA 4: PROVA DE DENTE (Dentista) - COM AGENDA
    -- ===================================
    prova_dente_status status_etapa DEFAULT 'Pendente',
    prova_dente_data DATE,
    prova_dente_agenda DATE,
    prova_dente_executor_id UUID,
    prova_dente_executado_em TIMESTAMP,
    prova_dente_executado_por VARCHAR(255),

    -- ===================================
    -- ETAPA 5: PROVA CERA - Paciente 2 (Dentista) - COM AGENDA
    -- ===================================
    prova_cera_status status_etapa DEFAULT 'Pendente',
    prova_cera_data DATE,
    prova_cera_agenda DATE,
    prova_cera_executor_id UUID,
    prova_cera_executado_em TIMESTAMP,
    prova_cera_executado_por VARCHAR(255),

    -- ===================================
    -- ETAPA 6: ENTREGA (Dentista)
    -- ===================================
    entrega_status status_etapa DEFAULT 'Pendente',
    entrega_data DATE,
    entrega_executor_id UUID,
    entrega_executado_em TIMESTAMP,
    entrega_executado_por VARCHAR(255),

    -- Metadados
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_procedimentos_fixa_user_id
    ON procedimentos_fixa(user_id);

CREATE INDEX IF NOT EXISTS idx_procedimentos_fixa_ordem_servico
    ON procedimentos_fixa(ordem_servico);

CREATE INDEX IF NOT EXISTS idx_procedimentos_fixa_status_geral
    ON procedimentos_fixa(status_geral);

CREATE INDEX IF NOT EXISTS idx_procedimentos_fixa_paciente_id
    ON procedimentos_fixa(paciente_id);

CREATE INDEX IF NOT EXISTS idx_procedimentos_fixa_dentista_id
    ON procedimentos_fixa(dentista_id);

CREATE INDEX IF NOT EXISTS idx_procedimentos_fixa_protetico_id
    ON procedimentos_fixa(protetico_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE procedimentos_fixa ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver apenas seus próprios procedimentos
CREATE POLICY "Users can view their own procedimentos_fixa"
ON procedimentos_fixa
FOR SELECT
USING (auth.uid() = user_id);

-- Política: Usuários podem criar seus próprios procedimentos
CREATE POLICY "Users can create their own procedimentos_fixa"
ON procedimentos_fixa
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem atualizar seus próprios procedimentos
CREATE POLICY "Users can update their own procedimentos_fixa"
ON procedimentos_fixa
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem deletar seus próprios procedimentos
CREATE POLICY "Users can delete their own procedimentos_fixa"
ON procedimentos_fixa
FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGER PARA ATUALIZAR updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_procedimentos_fixa_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_procedimentos_fixa_updated_at
    BEFORE UPDATE ON procedimentos_fixa
    FOR EACH ROW
    EXECUTE FUNCTION update_procedimentos_fixa_updated_at();

-- =====================================================
-- COMENTÁRIOS NA TABELA
-- =====================================================
COMMENT ON TABLE procedimentos_fixa IS 'Tabela de procedimentos FIXA ORTOVITAL com 6 etapas rastreadas';
COMMENT ON COLUMN procedimentos_fixa.ordem_servico IS 'Número da Ordem de Serviço';
COMMENT ON COLUMN procedimentos_fixa.status_geral IS 'Status geral do procedimento: Pendente, Em andamento, Concluído';
COMMENT ON COLUMN procedimentos_fixa.prova_dente_agenda IS 'Data agendada para Prova de Dente';
COMMENT ON COLUMN procedimentos_fixa.prova_cera_agenda IS 'Data agendada para Prova Cera (Paciente 2)';
