-- =====================================================
-- MIGRAÇÃO: Criar Tabela PROTOCOLO (Provisório e Definitivo)
-- Descrição: Procedimento de Protocolo Ortovital com 9 etapas
-- Data: 2025-01-30
-- =====================================================

-- =====================================================
-- CRIAR TABELAS NECESSÁRIAS (SE NÃO EXISTIREM)
-- =====================================================

-- Tabela de Pacientes
CREATE TABLE IF NOT EXISTS pacientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    telefone VARCHAR(20),
    data_nascimento DATE,
    cpf VARCHAR(11),
    endereco TEXT,
    status VARCHAR(20) DEFAULT 'Ativo',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Dentistas
CREATE TABLE IF NOT EXISTS dentistas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    nome VARCHAR(255) NOT NULL,
    cro VARCHAR(50),
    especialidade VARCHAR(100),
    telefone VARCHAR(20),
    email VARCHAR(255),
    cpf VARCHAR(11),
    endereco TEXT,
    data_nascimento DATE,
    status VARCHAR(20) DEFAULT 'Ativo',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Protéticos
CREATE TABLE IF NOT EXISTS proteticos (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    especialidade VARCHAR(100),
    telefone VARCHAR(20),
    email VARCHAR(255),
    laboratorio VARCHAR(255),
    ativo BOOLEAN DEFAULT true,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- CRIAR ENUMS (SE NÃO EXISTIREM)
-- =====================================================

-- Status das etapas
DO $$ BEGIN
    CREATE TYPE status_etapa AS ENUM (
        'Pendente',
        'Finalizado',
        'Aguardando',
        'Enviado',
        'Concluido',
        'Procedimento OK'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tipos de arcada
DO $$ BEGIN
    CREATE TYPE tipo_arcada AS ENUM (
        'SUP',
        'INF',
        'SUP/INF'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Status geral do procedimento
DO $$ BEGIN
    CREATE TYPE status_procedimento AS ENUM (
        'Pendente',
        'Em andamento',
        'Concluído'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tipo de protocolo (NOVO!)
DO $$ BEGIN
    CREATE TYPE tipo_protocolo AS ENUM (
        'PROVISORIO',
        'DEFINITIVO'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- CRIAR TABELA
-- =====================================================

-- Criar tabela procedimentos_protocolo
CREATE TABLE IF NOT EXISTS procedimentos_protocolo (
    -- Identificação
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),

    -- Informações Básicas
    ordem_servico INTEGER NOT NULL,
    nome_paciente VARCHAR(255) NOT NULL,
    paciente_id UUID REFERENCES pacientes(id),
    data_inicial DATE NOT NULL,

    -- Detalhes Técnicos
    tipo_protocolo tipo_protocolo NOT NULL,
    arcada tipo_arcada,
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
    -- ETAPA 2: VG - Vazamento de Gesso (Protético)
    -- ===================================
    vg_status status_etapa DEFAULT 'Pendente',
    vg_data DATE,
    vg_executor_id BIGINT,
    vg_executado_em TIMESTAMP,
    vg_executado_por VARCHAR(255),

    -- ===================================
    -- ETAPA 3: PROVA DE BARRA (Dentista) - APENAS DEFINITIVO
    -- ===================================
    prova_barra_status status_etapa DEFAULT 'Pendente',
    prova_barra_data DATE,
    prova_barra_executor_id UUID,
    prova_barra_executado_em TIMESTAMP,
    prova_barra_executado_por VARCHAR(255),

    -- ===================================
    -- ETAPA 4: PLANO DE CERA (Protético) - COM AGENDA
    -- ===================================
    plano_cera_status status_etapa DEFAULT 'Pendente',
    plano_cera_data DATE,
    plano_cera_agenda DATE,
    plano_cera_executor_id BIGINT,
    plano_cera_executado_em TIMESTAMP,
    plano_cera_executado_por VARCHAR(255),

    -- ===================================
    -- ETAPA 5: PROVA DE CERA (Dentista) - COM AGENDA (F1)
    -- ===================================
    prova_cera_status status_etapa DEFAULT 'Pendente',
    prova_cera_data DATE,
    prova_cera_agenda DATE,
    prova_cera_executor_id UUID,
    prova_cera_executado_em TIMESTAMP,
    prova_cera_executado_por VARCHAR(255),

    -- ===================================
    -- ETAPA 6: MONTAGEM DE DENTE (Protético)
    -- ===================================
    montagem_dente_status status_etapa DEFAULT 'Pendente',
    montagem_dente_data DATE,
    montagem_dente_executor_id BIGINT,
    montagem_dente_executado_em TIMESTAMP,
    montagem_dente_executado_por VARCHAR(255),

    -- ===================================
    -- ETAPA 7: PROVA DE DENTE (Dentista) - COM AGENDA (F2)
    -- ===================================
    prova_dente_status status_etapa DEFAULT 'Pendente',
    prova_dente_data DATE,
    prova_dente_agenda DATE,
    prova_dente_executor_id UUID,
    prova_dente_executado_em TIMESTAMP,
    prova_dente_executado_por VARCHAR(255),

    -- ===================================
    -- ETAPA 8: ACRILIZAÇÃO E ACABAMENTO (Protético)
    -- ===================================
    acrilizacao_acabamento_status status_etapa DEFAULT 'Pendente',
    acrilizacao_acabamento_data DATE,
    acrilizacao_acabamento_executor_id BIGINT,
    acrilizacao_acabamento_executado_em TIMESTAMP,
    acrilizacao_acabamento_executado_por VARCHAR(255),

    -- ===================================
    -- ETAPA 9: ENTREGA (Dentista) - COM AGENDA (F3)
    -- ===================================
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

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_procedimentos_protocolo_user_id
    ON procedimentos_protocolo(user_id);

CREATE INDEX IF NOT EXISTS idx_procedimentos_protocolo_ordem_servico
    ON procedimentos_protocolo(ordem_servico);

CREATE INDEX IF NOT EXISTS idx_procedimentos_protocolo_status_geral
    ON procedimentos_protocolo(status_geral);

CREATE INDEX IF NOT EXISTS idx_procedimentos_protocolo_tipo_protocolo
    ON procedimentos_protocolo(tipo_protocolo);

CREATE INDEX IF NOT EXISTS idx_procedimentos_protocolo_paciente_id
    ON procedimentos_protocolo(paciente_id);

CREATE INDEX IF NOT EXISTS idx_procedimentos_protocolo_dentista_id
    ON procedimentos_protocolo(dentista_id);

CREATE INDEX IF NOT EXISTS idx_procedimentos_protocolo_protetico_id
    ON procedimentos_protocolo(protetico_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE procedimentos_protocolo ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver apenas seus próprios procedimentos
CREATE POLICY "Users can view their own procedimentos_protocolo"
ON procedimentos_protocolo
FOR SELECT
USING (auth.uid() = user_id);

-- Política: Usuários podem criar seus próprios procedimentos
CREATE POLICY "Users can create their own procedimentos_protocolo"
ON procedimentos_protocolo
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem atualizar seus próprios procedimentos
CREATE POLICY "Users can update their own procedimentos_protocolo"
ON procedimentos_protocolo
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem deletar seus próprios procedimentos
CREATE POLICY "Users can delete their own procedimentos_protocolo"
ON procedimentos_protocolo
FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGER PARA ATUALIZAR updated_at
-- =====================================================
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

-- =====================================================
-- COMENTÁRIOS NA TABELA
-- =====================================================
COMMENT ON TABLE procedimentos_protocolo IS 'Tabela de procedimentos PROTOCOLO (Provisório e Definitivo) com 9 etapas rastreadas';
COMMENT ON COLUMN procedimentos_protocolo.ordem_servico IS 'Número da Ordem de Serviço';
COMMENT ON COLUMN procedimentos_protocolo.tipo_protocolo IS 'Tipo: PROVISORIO (8 etapas) ou DEFINITIVO (9 etapas com Prova de Barra)';
COMMENT ON COLUMN procedimentos_protocolo.status_geral IS 'Status geral do procedimento: Pendente, Em andamento, Concluído';
COMMENT ON COLUMN procedimentos_protocolo.prova_barra_data IS 'Etapa exclusiva do DEFINITIVO - Prova de Barra';
COMMENT ON COLUMN procedimentos_protocolo.plano_cera_agenda IS 'Data agendada para Plano de Cera';
COMMENT ON COLUMN procedimentos_protocolo.prova_cera_agenda IS 'Data agendada para Prova de Cera (F1)';
COMMENT ON COLUMN procedimentos_protocolo.prova_dente_agenda IS 'Data agendada para Prova de Dente (F2)';
COMMENT ON COLUMN procedimentos_protocolo.entrega_agenda IS 'Data agendada para Entrega (F3)';
