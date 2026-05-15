-- ============================================
-- SISTEMA DE PROCEDIMENTOS PT/PM (Prótese Total/Prótese Móvel)
-- Baseado no sistema Ortovital
-- Odonto Soberano - Migração 39
-- ============================================

-- ============================================
-- 1. CRIAR ENUM PARA TIPO DE PRÓTESE (se não existir)
-- ============================================

DO $$ BEGIN
    CREATE TYPE tipo_protese_ptpm AS ENUM ('PT', 'PM');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- 2. TABELA PT/PM - PRÓTESE TOTAL/MÓVEL
-- ============================================

CREATE TABLE IF NOT EXISTS procedimentos_pt_pm (
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
    tipo_protese tipo_protese_ptpm,
    observacoes TEXT,

    -- Profissionais responsáveis
    dentista_id UUID REFERENCES dentistas(id),
    protetico_id BIGINT REFERENCES proteticos(id),

    -- Status geral
    status_geral status_procedimento DEFAULT 'Pendente',
    data_entrega DATE,

    -- ============================================
    -- ETAPA 1: MOLDAGEM (Dentista)
    -- ============================================
    moldagem_status status_etapa DEFAULT 'Pendente',
    moldagem_data DATE,
    moldagem_executor_id UUID,
    moldagem_executado_em TIMESTAMP,
    moldagem_executado_por VARCHAR(255),

    -- ============================================
    -- ETAPA 2: VAZAMENTO DE GESSO (Protético)
    -- ============================================
    vazamento_gesso_status status_etapa DEFAULT 'Pendente',
    vazamento_gesso_data DATE,
    vazamento_gesso_executor_id BIGINT,
    vazamento_gesso_executado_em TIMESTAMP,
    vazamento_gesso_executado_por VARCHAR(255),

    -- ============================================
    -- ETAPA 3: CONFECÇÃO DE MOLDEIRA (Protético)
    -- ============================================
    confeccao_moldeira_status status_etapa DEFAULT 'Pendente',
    confeccao_moldeira_data DATE,
    confeccao_moldeira_executor_id BIGINT,
    confeccao_moldeira_executado_em TIMESTAMP,
    confeccao_moldeira_executado_por VARCHAR(255),

    -- ============================================
    -- ETAPA 4: MOLDAGEM FUNCIONAL (Dentista)
    -- ============================================
    moldagem_funcional_status status_etapa DEFAULT 'Pendente',
    moldagem_funcional_data DATE,
    moldagem_funcional_executor_id UUID,
    moldagem_funcional_executado_em TIMESTAMP,
    moldagem_funcional_executado_por VARCHAR(255),
    moldagem_funcional_agenda DATE,

    -- ============================================
    -- ETAPA 5: VG (Protético)
    -- ============================================
    vg_status status_etapa DEFAULT 'Pendente',
    vg_data DATE,
    vg_executor_id BIGINT,
    vg_executado_em TIMESTAMP,
    vg_executado_por VARCHAR(255),

    -- ============================================
    -- ETAPA 6: PLANO DE CERA (Protético)
    -- ============================================
    plano_cera_status status_etapa DEFAULT 'Pendente',
    plano_cera_data DATE,
    plano_cera_executor_id BIGINT,
    plano_cera_executado_em TIMESTAMP,
    plano_cera_executado_por VARCHAR(255),
    plano_cera_agenda DATE,

    -- ============================================
    -- ETAPA 7: PROVA DE CERA (Dentista)
    -- ============================================
    prova_cera_status status_etapa DEFAULT 'Pendente',
    prova_cera_data DATE,
    prova_cera_executor_id UUID,
    prova_cera_executado_em TIMESTAMP,
    prova_cera_executado_por VARCHAR(255),
    prova_cera_agenda DATE,

    -- ============================================
    -- ETAPA 8: MONTAGEM DE DENTE (Protético)
    -- ============================================
    montagem_dente_status status_etapa DEFAULT 'Pendente',
    montagem_dente_data DATE,
    montagem_dente_executor_id BIGINT,
    montagem_dente_executado_em TIMESTAMP,
    montagem_dente_executado_por VARCHAR(255),

    -- ============================================
    -- ETAPA 9: PROVA DE DENTE (Dentista)
    -- ============================================
    prova_dente_status status_etapa DEFAULT 'Pendente',
    prova_dente_data DATE,
    prova_dente_executor_id UUID,
    prova_dente_executado_em TIMESTAMP,
    prova_dente_executado_por VARCHAR(255),
    prova_dente_agenda DATE,

    -- ============================================
    -- ETAPA 10: ACRILIZAÇÃO E ACABAMENTO (Protético)
    -- ============================================
    acrilizacao_acabamento_status status_etapa DEFAULT 'Pendente',
    acrilizacao_acabamento_data DATE,
    acrilizacao_acabamento_executor_id BIGINT,
    acrilizacao_acabamento_executado_em TIMESTAMP,
    acrilizacao_acabamento_executado_por VARCHAR(255),

    -- ============================================
    -- ETAPA 11: ENTREGA (Dentista)
    -- ============================================
    entrega_status status_etapa DEFAULT 'Pendente',
    entrega_data DATE,
    entrega_executor_id UUID,
    entrega_executado_em TIMESTAMP,
    entrega_executado_por VARCHAR(255),
    entrega_agenda DATE,

    -- Metadados
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Constraints
    CONSTRAINT unique_user_os_ptpm UNIQUE(user_id, ordem_servico)
);

-- ============================================
-- 3. VIEWS PARA ANALYTICS
-- ============================================

-- View: Procedimentos PT/PM em andamento
CREATE OR REPLACE VIEW v_procedimentos_pt_pm_andamento AS
SELECT
    p.id,
    p.ordem_servico,
    p.nome_paciente,
    p.data_inicial,
    p.status_geral,
    p.arcada,
    p.tipo_protese,
    d.nome as dentista_nome,
    pr.nome as protetico_nome,
    p.data_entrega,
    p.created_at
FROM procedimentos_pt_pm p
LEFT JOIN dentistas d ON p.dentista_id = d.id
LEFT JOIN proteticos pr ON p.protetico_id = pr.id
WHERE p.status_geral IN ('Pendente', 'Em andamento')
ORDER BY p.ordem_servico DESC;

-- View: Próximas entregas PT/PM
CREATE OR REPLACE VIEW v_proximas_entregas_pt_pm AS
SELECT
    p.ordem_servico,
    p.nome_paciente,
    p.data_entrega,
    p.tipo_protese,
    d.nome as dentista_nome,
    p.status_geral,
    (p.data_entrega - CURRENT_DATE) as dias_restantes
FROM procedimentos_pt_pm p
LEFT JOIN dentistas d ON p.dentista_id = d.id
WHERE p.data_entrega >= CURRENT_DATE
  AND p.status_geral != 'Concluído'
ORDER BY p.data_entrega ASC;

-- View: Produtividade de dentistas em PT/PM
CREATE OR REPLACE VIEW v_produtividade_dentistas_pt_pm AS
SELECT
    d.id as dentista_id,
    d.nome as dentista_nome,
    COUNT(DISTINCT p.id) as total_procedimentos,
    COUNT(DISTINCT CASE WHEN p.status_geral = 'Concluído' THEN p.id END) as procedimentos_concluidos,
    COUNT(DISTINCT CASE WHEN p.moldagem_status = 'Finalizado' THEN p.id END) as moldagens,
    COUNT(DISTINCT CASE WHEN p.moldagem_funcional_status = 'Finalizado' THEN p.id END) as moldagens_funcionais,
    COUNT(DISTINCT CASE WHEN p.prova_cera_status = 'Finalizado' THEN p.id END) as provas_cera,
    COUNT(DISTINCT CASE WHEN p.prova_dente_status = 'Finalizado' THEN p.id END) as provas_dente,
    COUNT(DISTINCT CASE WHEN p.entrega_status = 'Finalizado' THEN p.id END) as entregas,
    MAX(h.executado_em) as ultima_acao
FROM dentistas d
LEFT JOIN procedimentos_pt_pm p ON d.id = p.dentista_id
LEFT JOIN historico_procedimentos h ON d.id::text = h.executor_id::text AND h.executor_tipo = 'DENTISTA'
GROUP BY d.id, d.nome;

-- View: Produtividade de protéticos em PT/PM
CREATE OR REPLACE VIEW v_produtividade_proteticos_pt_pm AS
SELECT
    pr.id as protetico_id,
    pr.nome as protetico_nome,
    COUNT(DISTINCT p.id) as total_procedimentos,
    COUNT(DISTINCT CASE WHEN p.vazamento_gesso_status = 'Finalizado' THEN p.id END) as vazamentos_gesso,
    COUNT(DISTINCT CASE WHEN p.confeccao_moldeira_status = 'Finalizado' THEN p.id END) as confeccoes_moldeira,
    COUNT(DISTINCT CASE WHEN p.vg_status = 'Finalizado' THEN p.id END) as vgs,
    COUNT(DISTINCT CASE WHEN p.plano_cera_status = 'Finalizado' THEN p.id END) as planos_cera,
    COUNT(DISTINCT CASE WHEN p.montagem_dente_status = 'Finalizado' THEN p.id END) as montagens,
    COUNT(DISTINCT CASE WHEN p.acrilizacao_acabamento_status = 'Finalizado' THEN p.id END) as acrilizacoes,
    MAX(h.executado_em) as ultima_acao
FROM proteticos pr
LEFT JOIN procedimentos_pt_pm p ON pr.id = p.protetico_id
LEFT JOIN historico_procedimentos h ON pr.id::text = h.executor_id::text AND h.executor_tipo = 'PROTETICO'
GROUP BY pr.id, pr.nome;

-- ============================================
-- 4. ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_procedimentos_pt_pm_user_id ON procedimentos_pt_pm(user_id);
CREATE INDEX IF NOT EXISTS idx_procedimentos_pt_pm_paciente_id ON procedimentos_pt_pm(paciente_id);
CREATE INDEX IF NOT EXISTS idx_procedimentos_pt_pm_ordem_servico ON procedimentos_pt_pm(ordem_servico);
CREATE INDEX IF NOT EXISTS idx_procedimentos_pt_pm_status_geral ON procedimentos_pt_pm(status_geral);
CREATE INDEX IF NOT EXISTS idx_procedimentos_pt_pm_dentista_id ON procedimentos_pt_pm(dentista_id);
CREATE INDEX IF NOT EXISTS idx_procedimentos_pt_pm_protetico_id ON procedimentos_pt_pm(protetico_id);
CREATE INDEX IF NOT EXISTS idx_procedimentos_pt_pm_data_entrega ON procedimentos_pt_pm(data_entrega);
CREATE INDEX IF NOT EXISTS idx_procedimentos_pt_pm_tipo_protese ON procedimentos_pt_pm(tipo_protese);

-- ============================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS
ALTER TABLE procedimentos_pt_pm ENABLE ROW LEVEL SECURITY;

-- Políticas para procedimentos_pt_pm
DROP POLICY IF EXISTS "Usuários podem ver seus próprios procedimentos PT/PM" ON procedimentos_pt_pm;
CREATE POLICY "Usuários podem ver seus próprios procedimentos PT/PM"
    ON procedimentos_pt_pm FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem inserir seus próprios procedimentos PT/PM" ON procedimentos_pt_pm;
CREATE POLICY "Usuários podem inserir seus próprios procedimentos PT/PM"
    ON procedimentos_pt_pm FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios procedimentos PT/PM" ON procedimentos_pt_pm;
CREATE POLICY "Usuários podem atualizar seus próprios procedimentos PT/PM"
    ON procedimentos_pt_pm FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem deletar seus próprios procedimentos PT/PM" ON procedimentos_pt_pm;
CREATE POLICY "Usuários podem deletar seus próprios procedimentos PT/PM"
    ON procedimentos_pt_pm FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- 6. TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
-- ============================================

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_procedimentos_pt_pm_updated_at ON procedimentos_pt_pm;
CREATE TRIGGER update_procedimentos_pt_pm_updated_at
    BEFORE UPDATE ON procedimentos_pt_pm
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- CONCLUÍDO!
-- ============================================

SELECT 'Sistema de Procedimentos PT/PM instalado com sucesso!' as mensagem;
