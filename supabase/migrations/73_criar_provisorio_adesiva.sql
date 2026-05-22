-- =====================================================
-- MIGRAÇÃO: Criar Tabela PROVISORIO/ADESIVA
-- Descrição: Procedimento Provisório ou Adesiva
-- Data: 2025-12-04
-- =====================================================

-- Criar tabela procedimentos_provisorio
CREATE TABLE IF NOT EXISTS procedimentos_provisorio (
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
    -- ETAPA 4: MAQUIAGEM (Protético)
    -- ===================================
    maquiagem_status status_etapa DEFAULT 'Pendente',
    maquiagem_data DATE,
    maquiagem_executor_id BIGINT,
    maquiagem_executado_em TIMESTAMP,
    maquiagem_executado_por VARCHAR(255),

    -- ===================================
    -- ETAPA 5: MOLDAGEM (Dentista)
    -- ===================================
    moldagem_status status_etapa DEFAULT 'Pendente',
    moldagem_data DATE,
    moldagem_executor_id UUID,
    moldagem_executado_em TIMESTAMP,
    moldagem_executado_por VARCHAR(255),

    -- ===================================
    -- ETAPA 6: VG - Vazamento Gesso (Protético)
    -- ===================================
    vg_status status_etapa DEFAULT 'Pendente',
    vg_data DATE,
    vg_executor_id BIGINT,
    vg_executado_em TIMESTAMP,
    vg_executado_por VARCHAR(255),

    -- ===================================
    -- ETAPA 7: MONTAGEM DE DENTE (Protético)
    -- ===================================
    montagem_dente_status status_etapa DEFAULT 'Pendente',
    montagem_dente_data DATE,
    montagem_dente_executor_id BIGINT,
    montagem_dente_executado_em TIMESTAMP,
    montagem_dente_executado_por VARCHAR(255),

    -- ===================================
    -- ETAPA 8: Paciente 2 (Prova) (Dentista) - COM AGENDA
    -- ===================================
    paciente2_status status_etapa DEFAULT 'Pendente',
    paciente2_data DATE,
    paciente2_agenda DATE,
    paciente2_executor_id UUID,
    paciente2_executado_em TIMESTAMP,
    paciente2_executado_por VARCHAR(255),

    -- Metadados
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_procedimentos_provisorio_user_id
    ON procedimentos_provisorio(user_id);

CREATE INDEX IF NOT EXISTS idx_procedimentos_provisorio_ordem_servico
    ON procedimentos_provisorio(ordem_servico);

CREATE INDEX IF NOT EXISTS idx_procedimentos_provisorio_status_geral
    ON procedimentos_provisorio(status_geral);

CREATE INDEX IF NOT EXISTS idx_procedimentos_provisorio_paciente_id
    ON procedimentos_provisorio(paciente_id);

CREATE INDEX IF NOT EXISTS idx_procedimentos_provisorio_dentista_id
    ON procedimentos_provisorio(dentista_id);

CREATE INDEX IF NOT EXISTS idx_procedimentos_provisorio_protetico_id
    ON procedimentos_provisorio(protetico_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE procedimentos_provisorio ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver apenas seus próprios procedimentos
CREATE POLICY "Users can view their own procedimentos_provisorio"
ON procedimentos_provisorio
FOR SELECT
USING (auth.uid() = user_id);

-- Política: Usuários podem criar seus próprios procedimentos
CREATE POLICY "Users can create their own procedimentos_provisorio"
ON procedimentos_provisorio
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem atualizar seus próprios procedimentos
CREATE POLICY "Users can update their own procedimentos_provisorio"
ON procedimentos_provisorio
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem deletar seus próprios procedimentos
CREATE POLICY "Users can delete their own procedimentos_provisorio"
ON procedimentos_provisorio
FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGER PARA ATUALIZAR updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_procedimentos_provisorio_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_procedimentos_provisorio_updated_at
    BEFORE UPDATE ON procedimentos_provisorio
    FOR EACH ROW
    EXECUTE FUNCTION update_procedimentos_provisorio_updated_at();

-- =====================================================
-- COMENTÁRIOS NA TABELA
-- =====================================================
COMMENT ON TABLE procedimentos_provisorio IS 'Tabela de procedimentos PROVISORIO/ADESIVA com 8 etapas rastreadas';
COMMENT ON COLUMN procedimentos_provisorio.ordem_servico IS 'Número da Ordem de Serviço';
COMMENT ON COLUMN procedimentos_provisorio.status_geral IS 'Status geral do procedimento: Pendente, Em andamento, Concluído';
COMMENT ON COLUMN procedimentos_provisorio.dente IS 'Dente(s) envolvido(s) no procedimento';
COMMENT ON COLUMN procedimentos_provisorio.copia IS 'Tipo de cópia: ESCANEAMENTO ou MOLDAGEM';
COMMENT ON COLUMN procedimentos_provisorio.paciente2_agenda IS 'Data agendada para Paciente 2 (Prova)';
