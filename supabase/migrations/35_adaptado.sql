-- ============================================
-- SISTEMA DE PROCEDIMENTOS ODONTOLÓGICOS
-- Odonto Soberano - Migração 35 (ADAPTADO)
-- ============================================

-- ============================================
-- 1. CRIAÇÃO DE ENUMS (TIPOS)
-- ============================================

DO $$ BEGIN
    CREATE TYPE tipo_procedimento AS ENUM (
        'PPR',
        'PT/PM',
        'PROTOCOLO DEFINITIVO',
        'PROTOCOLO PROVISORIO',
        'FIXA ORTOVITAL',
        'PROVISORIO/ADESIVA',
        'LAB EXTERNO',
        'CERAMICA ORTOVITAL',
        'RESINA IMPRESSA',
        'PLACA DE BRUXISMO/CLAREAMENTO'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

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

DO $$ BEGIN
    CREATE TYPE tipo_arcada AS ENUM (
        'SUP',
        'INF',
        'SUP/INF'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE status_procedimento AS ENUM (
        'Pendente',
        'Em andamento',
        'Concluído'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- 2. CRIAR TABELA DE PROTÉTICOS
-- ============================================

CREATE TABLE IF NOT EXISTS proteticos (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    especialidade VARCHAR(100),
    telefone VARCHAR(20),
    email VARCHAR(255),
    laboratorio VARCHAR(255),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 3. TABELA PPR - USANDO TABELA DENTISTAS EXISTENTE
-- ============================================

CREATE TABLE IF NOT EXISTS procedimentos_ppr (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ordem_servico INTEGER NOT NULL,
    nome_paciente VARCHAR(255) NOT NULL,
    paciente_id UUID,
    data_inicial DATE NOT NULL DEFAULT CURRENT_DATE,
    arcada tipo_arcada,
    dente VARCHAR(100),
    dentista_id UUID REFERENCES dentistas(id),  -- Usando tabela existente
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

    envio_metal_lab_status status_etapa DEFAULT 'Pendente',
    envio_metal_lab_data DATE,
    envio_metal_lab_executor_id UUID,
    envio_metal_lab_executado_em TIMESTAMP,
    envio_metal_lab_executado_por VARCHAR(255),

    rec_metal_lab_status status_etapa DEFAULT 'Pendente',
    rec_metal_lab_data DATE,
    rec_metal_lab_executor_id UUID,
    rec_metal_lab_executado_em TIMESTAMP,
    rec_metal_lab_executado_por VARCHAR(255),

    prova_metal_status status_etapa DEFAULT 'Pendente',
    prova_metal_data DATE,
    prova_metal_executor_id UUID,
    prova_metal_executado_em TIMESTAMP,
    prova_metal_executado_por VARCHAR(255),

    plano_cera_status status_etapa DEFAULT 'Pendente',
    plano_cera_data DATE,
    plano_cera_executor_id BIGINT,
    plano_cera_executado_em TIMESTAMP,
    plano_cera_executado_por VARCHAR(255),

    prova_cera_status status_etapa DEFAULT 'Pendente',
    prova_cera_data DATE,
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
    prova_dente_executor_id UUID,
    prova_dente_executado_em TIMESTAMP,
    prova_dente_executado_por VARCHAR(255),

    acrilizacao_status status_etapa DEFAULT 'Pendente',
    acrilizacao_data DATE,
    acrilizacao_executor_id BIGINT,
    acrilizacao_executado_em TIMESTAMP,
    acrilizacao_executado_por VARCHAR(255),

    entrega_status status_etapa DEFAULT 'Pendente',
    entrega_data DATE,
    entrega_executor_id UUID,
    entrega_executado_em TIMESTAMP,
    entrega_executado_por VARCHAR(255),

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT unique_ordem_servico UNIQUE(ordem_servico)
);

-- ============================================
-- 4. TABELA DE HISTÓRICO
-- ============================================

CREATE TABLE IF NOT EXISTS historico_procedimentos (
    id BIGSERIAL PRIMARY KEY,
    procedimento_tipo VARCHAR(50) NOT NULL,
    procedimento_id UUID NOT NULL,
    ordem_servico INTEGER NOT NULL,
    nome_paciente VARCHAR(255) NOT NULL,
    etapa VARCHAR(50) NOT NULL,
    etapa_label VARCHAR(100) NOT NULL,
    acao VARCHAR(50) NOT NULL,
    status_anterior status_etapa,
    status_novo status_etapa,
    executor_tipo VARCHAR(50),
    executor_id VARCHAR(100),
    executor_nome VARCHAR(255),
    responsavel_esperado VARCHAR(50),
    observacoes TEXT,
    executado_em TIMESTAMP DEFAULT NOW(),
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 5. VIEWS
-- ============================================

DROP VIEW IF EXISTS v_procedimentos_andamento CASCADE;
DROP VIEW IF EXISTS v_proximas_entregas CASCADE;
DROP VIEW IF EXISTS v_produtividade_dentistas CASCADE;
DROP VIEW IF EXISTS v_produtividade_proteticos CASCADE;

CREATE VIEW v_procedimentos_andamento AS
SELECT
    p.id,
    p.ordem_servico,
    p.nome_paciente,
    p.data_inicial,
    p.status_geral,
    p.arcada,
    p.dente,
    d.nome as dentista_nome,
    pr.nome as protetico_nome,
    p.data_entrega,
    p.created_at
FROM procedimentos_ppr p
LEFT JOIN dentistas d ON p.dentista_id = d.id
LEFT JOIN proteticos pr ON p.protetico_id = pr.id
WHERE p.status_geral IN ('Pendente', 'Em andamento')
ORDER BY p.ordem_servico DESC;

CREATE VIEW v_proximas_entregas AS
SELECT
    p.ordem_servico,
    p.nome_paciente,
    p.data_entrega,
    d.nome as dentista_nome,
    p.status_geral,
    (p.data_entrega - CURRENT_DATE) as dias_restantes
FROM procedimentos_ppr p
LEFT JOIN dentistas d ON p.dentista_id = d.id
WHERE p.data_entrega >= CURRENT_DATE
  AND p.status_geral != 'Concluído'
ORDER BY p.data_entrega ASC;

CREATE VIEW v_produtividade_dentistas AS
SELECT
    d.id as dentista_id,
    d.nome as dentista_nome,
    COUNT(DISTINCT p.id) as total_procedimentos,
    COUNT(DISTINCT CASE WHEN p.status_geral = 'Concluído' THEN p.id END) as procedimentos_concluidos,
    COUNT(DISTINCT CASE WHEN p.moldagem_status = 'Finalizado' THEN p.id END) as moldagens,
    COUNT(DISTINCT CASE WHEN p.prova_metal_status = 'Finalizado' THEN p.id END) as provas_metal,
    COUNT(DISTINCT CASE WHEN p.prova_cera_status = 'Finalizado' THEN p.id END) as provas_cera,
    COUNT(DISTINCT CASE WHEN p.prova_dente_status = 'Finalizado' THEN p.id END) as provas_dente,
    COUNT(DISTINCT CASE WHEN p.entrega_status = 'Finalizado' THEN p.id END) as entregas,
    MAX(h.executado_em) as ultima_acao
FROM dentistas d
LEFT JOIN procedimentos_ppr p ON d.id = p.dentista_id
LEFT JOIN historico_procedimentos h ON CAST(d.id AS TEXT) = h.executor_id AND h.executor_tipo = 'DENTISTA'
GROUP BY d.id, d.nome;

CREATE VIEW v_produtividade_proteticos AS
SELECT
    pr.id as protetico_id,
    pr.nome as protetico_nome,
    COUNT(DISTINCT p.id) as total_procedimentos,
    COUNT(DISTINCT CASE WHEN p.vg_status = 'Finalizado' THEN p.id END) as vgs,
    COUNT(DISTINCT CASE WHEN p.plano_cera_status = 'Finalizado' THEN p.id END) as planos_cera,
    COUNT(DISTINCT CASE WHEN p.montagem_dente_status = 'Finalizado' THEN p.id END) as montagens,
    COUNT(DISTINCT CASE WHEN p.acrilizacao_status = 'Finalizado' THEN p.id END) as acrilizacoes,
    MAX(h.executado_em) as ultima_acao
FROM proteticos pr
LEFT JOIN procedimentos_ppr p ON pr.id = p.protetico_id
LEFT JOIN historico_procedimentos h ON CAST(pr.id AS TEXT) = h.executor_id AND h.executor_tipo = 'PROTETICO'
GROUP BY pr.id, pr.nome;

-- ============================================
-- 6. ÍNDICES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_procedimentos_ppr_paciente_id ON procedimentos_ppr(paciente_id);
CREATE INDEX IF NOT EXISTS idx_procedimentos_ppr_ordem_servico ON procedimentos_ppr(ordem_servico);
CREATE INDEX IF NOT EXISTS idx_procedimentos_ppr_status_geral ON procedimentos_ppr(status_geral);
CREATE INDEX IF NOT EXISTS idx_procedimentos_ppr_dentista_id ON procedimentos_ppr(dentista_id);
CREATE INDEX IF NOT EXISTS idx_procedimentos_ppr_protetico_id ON procedimentos_ppr(protetico_id);
CREATE INDEX IF NOT EXISTS idx_procedimentos_ppr_data_entrega ON procedimentos_ppr(data_entrega);

CREATE INDEX IF NOT EXISTS idx_historico_procedimento_id ON historico_procedimentos(procedimento_id);
CREATE INDEX IF NOT EXISTS idx_historico_ordem_servico ON historico_procedimentos(ordem_servico);
CREATE INDEX IF NOT EXISTS idx_historico_executor ON historico_procedimentos(executor_id, executor_tipo);
CREATE INDEX IF NOT EXISTS idx_historico_executado_em ON historico_procedimentos(executado_em);

CREATE INDEX IF NOT EXISTS idx_proteticos_ativo ON proteticos(ativo);

-- ============================================
-- 7. TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_procedimentos_ppr_updated_at ON procedimentos_ppr;
CREATE TRIGGER update_procedimentos_ppr_updated_at
    BEFORE UPDATE ON procedimentos_ppr
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_proteticos_updated_at ON proteticos;
CREATE TRIGGER update_proteticos_updated_at
    BEFORE UPDATE ON proteticos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. DADOS DE EXEMPLO
-- ============================================

INSERT INTO proteticos (nome, especialidade, telefone, email, laboratorio)
VALUES
    ('Carlos Protético', 'Prótese Removível', '(11) 99999-1111', 'carlos@lab.com', 'Lab Dental'),
    ('Ana Técnica', 'Prótese Fixa', '(11) 99999-2222', 'ana@lab.com', 'Lab Dental')
ON CONFLICT DO NOTHING;

-- ============================================
-- CONCLUÍDO!
-- ============================================

SELECT 'Sistema de Procedimentos Odontológicos instalado com sucesso!' as mensagem;
