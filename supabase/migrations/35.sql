-- ============================================
-- SISTEMA DE PROCEDIMENTOS ODONTOLÓGICOS
-- Baseado no sistema Ortovital
-- Odonto Soberano - Migração 35
-- ============================================

-- ============================================
-- 1. CRIAÇÃO DE ENUMS (TIPOS)
-- ============================================

-- Tipos de procedimentos
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

-- Status das etapas
CREATE TYPE status_etapa AS ENUM (
    'Pendente',
    'Finalizado',
    'Aguardando',
    'Enviado',
    'Concluido',
    'Procedimento OK'
);

-- Tipos de arcada
CREATE TYPE tipo_arcada AS ENUM (
    'SUP',
    'INF',
    'SUP/INF'
);

-- Status geral do procedimento
CREATE TYPE status_procedimento AS ENUM (
    'Pendente',
    'Em andamento',
    'Concluído'
);

-- ============================================
-- 2. TABELA DE DOUTORES (para procedimentos)
-- ============================================

CREATE TABLE IF NOT EXISTS doutores (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cro VARCHAR(50),
    especialidade VARCHAR(100),
    telefone VARCHAR(20),
    email VARCHAR(255),
    ativo BOOLEAN DEFAULT true,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 3. TABELA DE PROTÉTICOS
-- ============================================

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

-- ============================================
-- 4. TABELA PPR - PRÓTESE PARCIAL REMOVÍVEL
-- ============================================

CREATE TABLE IF NOT EXISTS procedimentos_ppr (
    -- Identificação
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,

    -- Informações básicas
    ordem_servico INTEGER NOT NULL,
    nome_paciente VARCHAR(255) NOT NULL,
    paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
    data_inicial DATE NOT NULL DEFAULT CURRENT_DATE,

    -- Detalhes técnicos
    arcada tipo_arcada,
    dente VARCHAR(100),

    -- Profissionais responsáveis
    doutor_id BIGINT REFERENCES doutores(id),
    protetico_id BIGINT REFERENCES proteticos(id),

    -- Status geral
    status_geral status_procedimento DEFAULT 'Pendente',
    data_entrega DATE,

    -- ============================================
    -- ETAPA 1: MOLDAGEM (Doutor)
    -- ============================================
    moldagem_status status_etapa DEFAULT 'Pendente',
    moldagem_data DATE,
    moldagem_executor_id BIGINT,
    moldagem_executado_em TIMESTAMP,
    moldagem_executado_por VARCHAR(255),

    -- ============================================
    -- ETAPA 2: VG - GESSO/GUIA (Protético)
    -- ============================================
    vg_status status_etapa DEFAULT 'Pendente',
    vg_data DATE,
    vg_executor_id BIGINT,
    vg_executado_em TIMESTAMP,
    vg_executado_por VARCHAR(255),

    -- ============================================
    -- ETAPA 3: ENVIO METAL LAB (Secretária)
    -- ============================================
    envio_metal_lab_status status_etapa DEFAULT 'Pendente',
    envio_metal_lab_data DATE,
    envio_metal_lab_executor_id BIGINT,
    envio_metal_lab_executado_em TIMESTAMP,
    envio_metal_lab_executado_por VARCHAR(255),

    -- ============================================
    -- ETAPA 4: REC METAL LAB (Secretária)
    -- ============================================
    rec_metal_lab_status status_etapa DEFAULT 'Pendente',
    rec_metal_lab_data DATE,
    rec_metal_lab_executor_id BIGINT,
    rec_metal_lab_executado_em TIMESTAMP,
    rec_metal_lab_executado_por VARCHAR(255),

    -- ============================================
    -- ETAPA 5: PROVA METAL (Doutor)
    -- ============================================
    prova_metal_status status_etapa DEFAULT 'Pendente',
    prova_metal_data DATE,
    prova_metal_executor_id BIGINT,
    prova_metal_executado_em TIMESTAMP,
    prova_metal_executado_por VARCHAR(255),

    -- ============================================
    -- ETAPA 6: PLANO CERA (Protético)
    -- ============================================
    plano_cera_status status_etapa DEFAULT 'Pendente',
    plano_cera_data DATE,
    plano_cera_executor_id BIGINT,
    plano_cera_executado_em TIMESTAMP,
    plano_cera_executado_por VARCHAR(255),

    -- ============================================
    -- ETAPA 7: PROVA CERA (Doutor)
    -- ============================================
    prova_cera_status status_etapa DEFAULT 'Pendente',
    prova_cera_data DATE,
    prova_cera_executor_id BIGINT,
    prova_cera_executado_em TIMESTAMP,
    prova_cera_executado_por VARCHAR(255),

    -- ============================================
    -- ETAPA 8: MONTAGEM DENTE (Protético)
    -- ============================================
    montagem_dente_status status_etapa DEFAULT 'Pendente',
    montagem_dente_data DATE,
    montagem_dente_executor_id BIGINT,
    montagem_dente_executado_em TIMESTAMP,
    montagem_dente_executado_por VARCHAR(255),

    -- ============================================
    -- ETAPA 9: PROVA DENTE (Doutor)
    -- ============================================
    prova_dente_status status_etapa DEFAULT 'Pendente',
    prova_dente_data DATE,
    prova_dente_executor_id BIGINT,
    prova_dente_executado_em TIMESTAMP,
    prova_dente_executado_por VARCHAR(255),

    -- ============================================
    -- ETAPA 10: ACRILIZAÇÃO (Protético)
    -- ============================================
    acrilizacao_status status_etapa DEFAULT 'Pendente',
    acrilizacao_data DATE,
    acrilizacao_executor_id BIGINT,
    acrilizacao_executado_em TIMESTAMP,
    acrilizacao_executado_por VARCHAR(255),

    -- ============================================
    -- ETAPA 11: ENTREGA (Doutor)
    -- ============================================
    entrega_status status_etapa DEFAULT 'Pendente',
    entrega_data DATE,
    entrega_executor_id BIGINT,
    entrega_executado_em TIMESTAMP,
    entrega_executado_por VARCHAR(255),

    -- Metadados
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Constraints
    UNIQUE(user_id, ordem_servico)
);

-- ============================================
-- 5. TABELA DE HISTÓRICO DE AÇÕES
-- ============================================

CREATE TABLE IF NOT EXISTS historico_procedimentos (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,

    -- Identificação do procedimento
    procedimento_tipo VARCHAR(50) NOT NULL,
    procedimento_id UUID NOT NULL,
    ordem_servico INTEGER NOT NULL,
    nome_paciente VARCHAR(255) NOT NULL,

    -- Detalhes da etapa
    etapa VARCHAR(50) NOT NULL,
    etapa_label VARCHAR(100) NOT NULL,

    -- Ação realizada
    acao VARCHAR(50) NOT NULL, -- INICIOU, CONCLUIU, ALTEROU_STATUS
    status_anterior status_etapa,
    status_novo status_etapa,

    -- Executor
    executor_tipo VARCHAR(50), -- DOUTOR, PROTETICO, SECRETARIA
    executor_id BIGINT,
    executor_nome VARCHAR(255),
    responsavel_esperado VARCHAR(50), -- Quem deveria fazer

    -- Observações
    observacoes TEXT,

    -- Rastreamento
    executado_em TIMESTAMP DEFAULT NOW(),
    ip_address VARCHAR(50),
    user_agent TEXT,

    -- Índices para consultas
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 6. VIEWS PARA RELATÓRIOS
-- ============================================

-- View: Procedimentos em andamento
CREATE OR REPLACE VIEW v_procedimentos_andamento AS
SELECT
    p.id,
    p.ordem_servico,
    p.nome_paciente,
    p.data_inicial,
    p.status_geral,
    p.arcada,
    p.dente,
    d.nome as doutor_nome,
    pr.nome as protetico_nome,
    p.data_entrega,
    p.created_at
FROM procedimentos_ppr p
LEFT JOIN doutores d ON p.doutor_id = d.id
LEFT JOIN proteticos pr ON p.protetico_id = pr.id
WHERE p.status_geral IN ('Pendente', 'Em andamento')
ORDER BY p.ordem_servico DESC;

-- View: Próximas entregas
CREATE OR REPLACE VIEW v_proximas_entregas AS
SELECT
    p.ordem_servico,
    p.nome_paciente,
    p.data_entrega,
    d.nome as doutor_nome,
    p.status_geral,
    DATE_PART('day', p.data_entrega - CURRENT_DATE) as dias_restantes
FROM procedimentos_ppr p
LEFT JOIN doutores d ON p.doutor_id = d.id
WHERE p.data_entrega >= CURRENT_DATE
  AND p.status_geral != 'Concluído'
ORDER BY p.data_entrega ASC;

-- View: Produtividade de doutores
CREATE OR REPLACE VIEW v_produtividade_doutores AS
SELECT
    d.id as doutor_id,
    d.nome as doutor_nome,
    COUNT(DISTINCT p.id) as total_procedimentos,
    COUNT(DISTINCT CASE WHEN p.status_geral = 'Concluído' THEN p.id END) as procedimentos_concluidos,
    COUNT(DISTINCT CASE WHEN p.moldagem_status = 'Finalizado' THEN p.id END) as moldagens,
    COUNT(DISTINCT CASE WHEN p.prova_metal_status = 'Finalizado' THEN p.id END) as provas_metal,
    COUNT(DISTINCT CASE WHEN p.prova_cera_status = 'Finalizado' THEN p.id END) as provas_cera,
    COUNT(DISTINCT CASE WHEN p.prova_dente_status = 'Finalizado' THEN p.id END) as provas_dente,
    COUNT(DISTINCT CASE WHEN p.entrega_status = 'Finalizado' THEN p.id END) as entregas,
    MAX(h.executado_em) as ultima_acao
FROM doutores d
LEFT JOIN procedimentos_ppr p ON d.id = p.doutor_id
LEFT JOIN historico_procedimentos h ON d.id = h.executor_id AND h.executor_tipo = 'DOUTOR'
GROUP BY d.id, d.nome;

-- View: Produtividade de protéticos
CREATE OR REPLACE VIEW v_produtividade_proteticos AS
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
LEFT JOIN historico_procedimentos h ON pr.id = h.executor_id AND h.executor_tipo = 'PROTETICO'
GROUP BY pr.id, pr.nome;

-- ============================================
-- 7. ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX idx_procedimentos_ppr_user_id ON procedimentos_ppr(user_id);
CREATE INDEX idx_procedimentos_ppr_paciente_id ON procedimentos_ppr(paciente_id);
CREATE INDEX idx_procedimentos_ppr_ordem_servico ON procedimentos_ppr(ordem_servico);
CREATE INDEX idx_procedimentos_ppr_status_geral ON procedimentos_ppr(status_geral);
CREATE INDEX idx_procedimentos_ppr_doutor_id ON procedimentos_ppr(doutor_id);
CREATE INDEX idx_procedimentos_ppr_protetico_id ON procedimentos_ppr(protetico_id);
CREATE INDEX idx_procedimentos_ppr_data_entrega ON procedimentos_ppr(data_entrega);

CREATE INDEX idx_historico_user_id ON historico_procedimentos(user_id);
CREATE INDEX idx_historico_procedimento_id ON historico_procedimentos(procedimento_id);
CREATE INDEX idx_historico_ordem_servico ON historico_procedimentos(ordem_servico);
CREATE INDEX idx_historico_executor ON historico_procedimentos(executor_id, executor_tipo);
CREATE INDEX idx_historico_executado_em ON historico_procedimentos(executado_em);

CREATE INDEX idx_doutores_user_id ON doutores(user_id);
CREATE INDEX idx_doutores_ativo ON doutores(ativo);
CREATE INDEX idx_proteticos_user_id ON proteticos(user_id);
CREATE INDEX idx_proteticos_ativo ON proteticos(ativo);

-- ============================================
-- 8. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS
ALTER TABLE procedimentos_ppr ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_procedimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE doutores ENABLE ROW LEVEL SECURITY;
ALTER TABLE proteticos ENABLE ROW LEVEL SECURITY;

-- Políticas para procedimentos_ppr
DROP POLICY IF EXISTS "Usuários podem ver seus próprios procedimentos" ON procedimentos_ppr;
CREATE POLICY "Usuários podem ver seus próprios procedimentos"
    ON procedimentos_ppr FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem inserir seus próprios procedimentos" ON procedimentos_ppr;
CREATE POLICY "Usuários podem inserir seus próprios procedimentos"
    ON procedimentos_ppr FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios procedimentos" ON procedimentos_ppr;
CREATE POLICY "Usuários podem atualizar seus próprios procedimentos"
    ON procedimentos_ppr FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem deletar seus próprios procedimentos" ON procedimentos_ppr;
CREATE POLICY "Usuários podem deletar seus próprios procedimentos"
    ON procedimentos_ppr FOR DELETE
    USING (auth.uid() = user_id);

-- Políticas para histórico
DROP POLICY IF EXISTS "Usuários podem ver seu próprio histórico" ON historico_procedimentos;
CREATE POLICY "Usuários podem ver seu próprio histórico"
    ON historico_procedimentos FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem inserir em seu próprio histórico" ON historico_procedimentos;
CREATE POLICY "Usuários podem inserir em seu próprio histórico"
    ON historico_procedimentos FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Políticas para doutores
DROP POLICY IF EXISTS "Usuários podem ver seus doutores" ON doutores;
CREATE POLICY "Usuários podem ver seus doutores"
    ON doutores FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Usuários podem inserir doutores" ON doutores;
CREATE POLICY "Usuários podem inserir doutores"
    ON doutores FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar seus doutores" ON doutores;
CREATE POLICY "Usuários podem atualizar seus doutores"
    ON doutores FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem deletar seus doutores" ON doutores;
CREATE POLICY "Usuários podem deletar seus doutores"
    ON doutores FOR DELETE
    USING (auth.uid() = user_id);

-- Políticas para protéticos
DROP POLICY IF EXISTS "Usuários podem ver seus protéticos" ON proteticos;
CREATE POLICY "Usuários podem ver seus protéticos"
    ON proteticos FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Usuários podem inserir protéticos" ON proteticos;
CREATE POLICY "Usuários podem inserir protéticos"
    ON proteticos FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar seus protéticos" ON proteticos;
CREATE POLICY "Usuários podem atualizar seus protéticos"
    ON proteticos FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem deletar seus protéticos" ON proteticos;
CREATE POLICY "Usuários podem deletar seus protéticos"
    ON proteticos FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- 9. FUNÇÃO PARA ATUALIZAÇÃO AUTOMÁTICA
-- ============================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_procedimentos_ppr_updated_at ON procedimentos_ppr;
CREATE TRIGGER update_procedimentos_ppr_updated_at
    BEFORE UPDATE ON procedimentos_ppr
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_doutores_updated_at ON doutores;
CREATE TRIGGER update_doutores_updated_at
    BEFORE UPDATE ON doutores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_proteticos_updated_at ON proteticos;
CREATE TRIGGER update_proteticos_updated_at
    BEFORE UPDATE ON proteticos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 10. INSERIR DADOS DE EXEMPLO
-- ============================================

-- Inserir doutores de exemplo (opcional)
INSERT INTO doutores (nome, cro, especialidade, telefone, email)
VALUES
    ('Dr. João Silva', 'CRO-SP 12345', 'Prótese Dentária', '(11) 98765-4321', 'joao@clinica.com'),
    ('Dra. Maria Santos', 'CRO-SP 54321', 'Implantodontia', '(11) 98765-1234', 'maria@clinica.com')
ON CONFLICT DO NOTHING;

-- Inserir protéticos de exemplo (opcional)
INSERT INTO proteticos (nome, especialidade, telefone, email, laboratorio)
VALUES
    ('Carlos Protético', 'Prótese Removível', '(11) 99999-1111', 'carlos@lab.com', 'Lab Dental'),
    ('Ana Técnica', 'Prótese Fixa', '(11) 99999-2222', 'ana@lab.com', 'Lab Dental')
ON CONFLICT DO NOTHING;

-- ============================================
-- CONCLUÍDO!
-- ============================================

SELECT 'Sistema de Procedimentos Odontológicos instalado com sucesso!' as mensagem;
