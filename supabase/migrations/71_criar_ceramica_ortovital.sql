-- =====================================================
-- MIGRAÇÃO: Criar Tabela CERAMICA ORTOVITAL
-- Descrição: Procedimento de Cerâmica Ortovital
-- Data: 2025-12-04
-- =====================================================

-- Criar tabela procedimentos_ceramica
CREATE TABLE IF NOT EXISTS procedimentos_ceramica (
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
    -- ETAPA 3: IMP RES CALCINAVEL (Protético)
    -- ===================================
    imp_res_calcinavel_status status_etapa DEFAULT 'Pendente',
    imp_res_calcinavel_data DATE,
    imp_res_calcinavel_executor_id BIGINT,
    imp_res_calcinavel_executado_em TIMESTAMP,
    imp_res_calcinavel_executado_por VARCHAR(255),

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
    -- ETAPA 6: ENCERAMENTO (Protético)
    -- ===================================
    enceramento_status status_etapa DEFAULT 'Pendente',
    enceramento_data DATE,
    enceramento_executor_id BIGINT,
    enceramento_executado_em TIMESTAMP,
    enceramento_executado_por VARCHAR(255),

    -- ===================================
    -- ETAPA 7: QUEIMA DE CERAMICA (Protético)
    -- ===================================
    queima_ceramica_status status_etapa DEFAULT 'Pendente',
    queima_ceramica_data DATE,
    queima_ceramica_executor_id BIGINT,
    queima_ceramica_executado_em TIMESTAMP,
    queima_ceramica_executado_por VARCHAR(255),

    -- ===================================
    -- ETAPA 8: INJEÇÃO (Protético)
    -- ===================================
    injecao_status status_etapa DEFAULT 'Pendente',
    injecao_data DATE,
    injecao_executor_id BIGINT,
    injecao_executado_em TIMESTAMP,
    injecao_executado_por VARCHAR(255),

    -- ===================================
    -- ETAPA 9: MAQUIAGEM (Protético)
    -- ===================================
    maquiagem_status status_etapa DEFAULT 'Pendente',
    maquiagem_data DATE,
    maquiagem_executor_id BIGINT,
    maquiagem_executado_em TIMESTAMP,
    maquiagem_executado_por VARCHAR(255),

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
CREATE INDEX IF NOT EXISTS idx_procedimentos_ceramica_user_id
    ON procedimentos_ceramica(user_id);

CREATE INDEX IF NOT EXISTS idx_procedimentos_ceramica_ordem_servico
    ON procedimentos_ceramica(ordem_servico);

CREATE INDEX IF NOT EXISTS idx_procedimentos_ceramica_status_geral
    ON procedimentos_ceramica(status_geral);

CREATE INDEX IF NOT EXISTS idx_procedimentos_ceramica_paciente_id
    ON procedimentos_ceramica(paciente_id);

CREATE INDEX IF NOT EXISTS idx_procedimentos_ceramica_dentista_id
    ON procedimentos_ceramica(dentista_id);

CREATE INDEX IF NOT EXISTS idx_procedimentos_ceramica_protetico_id
    ON procedimentos_ceramica(protetico_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE procedimentos_ceramica ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver apenas seus próprios procedimentos
CREATE POLICY "Users can view their own procedimentos_ceramica"
ON procedimentos_ceramica
FOR SELECT
USING (auth.uid() = user_id);

-- Política: Usuários podem criar seus próprios procedimentos
CREATE POLICY "Users can create their own procedimentos_ceramica"
ON procedimentos_ceramica
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem atualizar seus próprios procedimentos
CREATE POLICY "Users can update their own procedimentos_ceramica"
ON procedimentos_ceramica
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem deletar seus próprios procedimentos
CREATE POLICY "Users can delete their own procedimentos_ceramica"
ON procedimentos_ceramica
FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGER PARA ATUALIZAR updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_procedimentos_ceramica_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_procedimentos_ceramica_updated_at
    BEFORE UPDATE ON procedimentos_ceramica
    FOR EACH ROW
    EXECUTE FUNCTION update_procedimentos_ceramica_updated_at();

-- =====================================================
-- COMENTÁRIOS NA TABELA
-- =====================================================
COMMENT ON TABLE procedimentos_ceramica IS 'Tabela de procedimentos CERAMICA ORTOVITAL com 10 etapas rastreadas';
COMMENT ON COLUMN procedimentos_ceramica.ordem_servico IS 'Número da Ordem de Serviço';
COMMENT ON COLUMN procedimentos_ceramica.status_geral IS 'Status geral do procedimento: Pendente, Em andamento, Concluído';
COMMENT ON COLUMN procedimentos_ceramica.dente IS 'Dente(s) envolvido(s) no procedimento';
COMMENT ON COLUMN procedimentos_ceramica.copia IS 'Tipo de cópia: ESCANEAMENTO ou MOLDAGEM';
COMMENT ON COLUMN procedimentos_ceramica.paciente3_agenda IS 'Data agendada para Paciente 3 (Prova Final)';
