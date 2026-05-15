-- =====================================================
-- MIGRAÇÃO: Criar Tabela LAB MAURICIO (Laboratório Externo)
-- Descrição: Procedimento com Laboratório Externo
-- Data: 2025-12-04
-- =====================================================

-- Criar tabela procedimentos_lab_externo
CREATE TABLE IF NOT EXISTS procedimentos_lab_externo (
    -- Identificação
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),

    -- Informações Básicas
    ordem_servico INTEGER NOT NULL,
    nome_paciente VARCHAR(255) NOT NULL,
    paciente_id UUID REFERENCES pacientes(id),
    data_inicial DATE NOT NULL,

    -- Detalhes Técnicos
    arcada VARCHAR(20), -- SUP/INF
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
    -- ETAPA 2: ENVIO DE ARQUIVO (Secretária)
    -- ===================================
    envio_arquivo_status status_etapa DEFAULT 'Pendente',
    envio_arquivo_data DATE,
    envio_arquivo_executor_id UUID,
    envio_arquivo_executado_em TIMESTAMP,
    envio_arquivo_executado_por VARCHAR(255),

    -- ===================================
    -- ETAPA 3: MOLDAGEM (Dentista)
    -- ===================================
    moldagem_status status_etapa DEFAULT 'Pendente',
    moldagem_data DATE,
    moldagem_executor_id UUID,
    moldagem_executado_em TIMESTAMP,
    moldagem_executado_por VARCHAR(255),

    -- ===================================
    -- ETAPA 4: VG - Vazamento Gesso (Protético)
    -- ===================================
    vg_status status_etapa DEFAULT 'Pendente',
    vg_data DATE,
    vg_executor_id BIGINT,
    vg_executado_em TIMESTAMP,
    vg_executado_por VARCHAR(255),

    -- ===================================
    -- ETAPA 5: ENV LAB - Envio Lab (Secretária)
    -- ===================================
    env_lab_status status_etapa DEFAULT 'Pendente',
    env_lab_data DATE,
    env_lab_executor_id UUID,
    env_lab_executado_em TIMESTAMP,
    env_lab_executado_por VARCHAR(255),

    -- ===================================
    -- ETAPA 6: REC DO LAB COPPING - Recebimento Lab Coping (Secretária)
    -- ===================================
    rec_lab_copping_status status_etapa DEFAULT 'Pendente',
    rec_lab_copping_data DATE,
    rec_lab_copping_executor_id UUID,
    rec_lab_copping_executado_em TIMESTAMP,
    rec_lab_copping_executado_por VARCHAR(255),

    -- ===================================
    -- ETAPA 7: PROVA DE COPING (Dentista) - COM AGENDA
    -- ===================================
    prova_coping_status status_etapa DEFAULT 'Pendente',
    prova_coping_data DATE,
    prova_coping_agenda DATE,
    prova_coping_executor_id UUID,
    prova_coping_executado_em TIMESTAMP,
    prova_coping_executado_por VARCHAR(255),

    -- ===================================
    -- ETAPA 8: ENVIO DE LB - Envio Lab (Secretária)
    -- ===================================
    envio_lb_status status_etapa DEFAULT 'Pendente',
    envio_lb_data DATE,
    envio_lb_executor_id UUID,
    envio_lb_executado_em TIMESTAMP,
    envio_lb_executado_por VARCHAR(255),

    -- ===================================
    -- ETAPA 9: RECEBIMENTO LAB (Secretária)
    -- ===================================
    recebimento_lab_status status_etapa DEFAULT 'Pendente',
    recebimento_lab_data DATE,
    recebimento_lab_executor_id UUID,
    recebimento_lab_executado_em TIMESTAMP,
    recebimento_lab_executado_por VARCHAR(255),

    -- ===================================
    -- ETAPA 10: Paciente 3 (Prova Final) (Dentista) - COM AGENDA
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
CREATE INDEX IF NOT EXISTS idx_procedimentos_lab_externo_user_id
    ON procedimentos_lab_externo(user_id);

CREATE INDEX IF NOT EXISTS idx_procedimentos_lab_externo_ordem_servico
    ON procedimentos_lab_externo(ordem_servico);

CREATE INDEX IF NOT EXISTS idx_procedimentos_lab_externo_status_geral
    ON procedimentos_lab_externo(status_geral);

CREATE INDEX IF NOT EXISTS idx_procedimentos_lab_externo_paciente_id
    ON procedimentos_lab_externo(paciente_id);

CREATE INDEX IF NOT EXISTS idx_procedimentos_lab_externo_dentista_id
    ON procedimentos_lab_externo(dentista_id);

CREATE INDEX IF NOT EXISTS idx_procedimentos_lab_externo_protetico_id
    ON procedimentos_lab_externo(protetico_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE procedimentos_lab_externo ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver apenas seus próprios procedimentos
CREATE POLICY "Users can view their own procedimentos_lab_externo"
ON procedimentos_lab_externo
FOR SELECT
USING (auth.uid() = user_id);

-- Política: Usuários podem criar seus próprios procedimentos
CREATE POLICY "Users can create their own procedimentos_lab_externo"
ON procedimentos_lab_externo
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem atualizar seus próprios procedimentos
CREATE POLICY "Users can update their own procedimentos_lab_externo"
ON procedimentos_lab_externo
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem deletar seus próprios procedimentos
CREATE POLICY "Users can delete their own procedimentos_lab_externo"
ON procedimentos_lab_externo
FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGER PARA ATUALIZAR updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_procedimentos_lab_externo_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_procedimentos_lab_externo_updated_at
    BEFORE UPDATE ON procedimentos_lab_externo
    FOR EACH ROW
    EXECUTE FUNCTION update_procedimentos_lab_externo_updated_at();

-- =====================================================
-- COMENTÁRIOS NA TABELA
-- =====================================================
COMMENT ON TABLE procedimentos_lab_externo IS 'Tabela de procedimentos LAB MAURICIO (Laboratório Externo) com 10 etapas rastreadas';
COMMENT ON COLUMN procedimentos_lab_externo.ordem_servico IS 'Número da Ordem de Serviço';
COMMENT ON COLUMN procedimentos_lab_externo.status_geral IS 'Status geral do procedimento: Pendente, Em andamento, Concluído';
COMMENT ON COLUMN procedimentos_lab_externo.arcada IS 'Arcada envolvida';
COMMENT ON COLUMN procedimentos_lab_externo.prova_coping_agenda IS 'Data agendada para Prova de Coping';
COMMENT ON COLUMN procedimentos_lab_externo.paciente3_agenda IS 'Data agendada para Paciente 3 (Prova Final)';
