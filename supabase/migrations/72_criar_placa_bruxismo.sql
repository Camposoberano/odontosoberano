-- =====================================================
-- MIGRAÇÃO: Criar Tabela PLACA DE BRUXISMO/CLAREAMENTO
-- Descrição: Procedimento de Placa de Bruxismo ou Clareamento
-- Data: 2025-12-04
-- =====================================================

-- Criar tabela procedimentos_placa
CREATE TABLE IF NOT EXISTS procedimentos_placa (
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
    copia VARCHAR(50), -- ESCANEAMENTO ou MOLDAGEM
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
    -- ETAPA 4: MOLDAGEM (Dentista)
    -- ===================================
    moldagem_status status_etapa DEFAULT 'Pendente',
    moldagem_data DATE,
    moldagem_executor_id UUID,
    moldagem_executado_em TIMESTAMP,
    moldagem_executado_por VARCHAR(255),

    -- ===================================
    -- ETAPA 5: VG - Vazamento Gesso (Protético)
    -- ===================================
    vg_status status_etapa DEFAULT 'Pendente',
    vg_data DATE,
    vg_executor_id BIGINT,
    vg_executado_em TIMESTAMP,
    vg_executado_por VARCHAR(255),

    -- ===================================
    -- ETAPA 6: CONFECÇÃO DE PLACA (Protético)
    -- ===================================
    confeccao_placa_status status_etapa DEFAULT 'Pendente',
    confeccao_placa_data DATE,
    confeccao_placa_executor_id BIGINT,
    confeccao_placa_executado_em TIMESTAMP,
    confeccao_placa_executado_por VARCHAR(255),

    -- ===================================
    -- ETAPA 7: Paciente 3 (Prova Final) (Dentista) - COM AGENDA
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
CREATE INDEX IF NOT EXISTS idx_procedimentos_placa_user_id
    ON procedimentos_placa(user_id);

CREATE INDEX IF NOT EXISTS idx_procedimentos_placa_ordem_servico
    ON procedimentos_placa(ordem_servico);

CREATE INDEX IF NOT EXISTS idx_procedimentos_placa_status_geral
    ON procedimentos_placa(status_geral);

CREATE INDEX IF NOT EXISTS idx_procedimentos_placa_paciente_id
    ON procedimentos_placa(paciente_id);

CREATE INDEX IF NOT EXISTS idx_procedimentos_placa_dentista_id
    ON procedimentos_placa(dentista_id);

CREATE INDEX IF NOT EXISTS idx_procedimentos_placa_protetico_id
    ON procedimentos_placa(protetico_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE procedimentos_placa ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver apenas seus próprios procedimentos
CREATE POLICY "Users can view their own procedimentos_placa"
ON procedimentos_placa
FOR SELECT
USING (auth.uid() = user_id);

-- Política: Usuários podem criar seus próprios procedimentos
CREATE POLICY "Users can create their own procedimentos_placa"
ON procedimentos_placa
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem atualizar seus próprios procedimentos
CREATE POLICY "Users can update their own procedimentos_placa"
ON procedimentos_placa
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem deletar seus próprios procedimentos
CREATE POLICY "Users can delete their own procedimentos_placa"
ON procedimentos_placa
FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGER PARA ATUALIZAR updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_procedimentos_placa_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_procedimentos_placa_updated_at
    BEFORE UPDATE ON procedimentos_placa
    FOR EACH ROW
    EXECUTE FUNCTION update_procedimentos_placa_updated_at();

-- =====================================================
-- COMENTÁRIOS NA TABELA
-- =====================================================
COMMENT ON TABLE procedimentos_placa IS 'Tabela de procedimentos PLACA DE BRUXISMO/CLAREAMENTO com 7 etapas rastreadas';
COMMENT ON COLUMN procedimentos_placa.ordem_servico IS 'Número da Ordem de Serviço';
COMMENT ON COLUMN procedimentos_placa.status_geral IS 'Status geral do procedimento: Pendente, Em andamento, Concluído';
COMMENT ON COLUMN procedimentos_placa.arcada IS 'Arcada envolvida: SUP/INF';
COMMENT ON COLUMN procedimentos_placa.copia IS 'Tipo de cópia: ESCANEAMENTO ou MOLDAGEM';
COMMENT ON COLUMN procedimentos_placa.paciente3_agenda IS 'Data agendada para Paciente 3 (Prova Final)';
