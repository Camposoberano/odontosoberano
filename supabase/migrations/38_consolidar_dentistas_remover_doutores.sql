-- ============================================
-- CONSOLIDAÇÃO: REMOVER TABELA DOUTORES E USAR APENAS DENTISTAS
-- Migração 38 - Odonto PRO
-- ============================================

-- Esta migração consolida o uso da tabela 'dentistas' existente
-- e remove a tabela duplicada 'doutores' do sistema de procedimentos

-- ============================================
-- 1. REMOVER VIEWS QUE USAM TABELA DOUTORES
-- ============================================

DROP VIEW IF EXISTS v_procedimentos_andamento CASCADE;
DROP VIEW IF EXISTS v_proximas_entregas CASCADE;
DROP VIEW IF EXISTS v_produtividade_doutores CASCADE;
DROP VIEW IF EXISTS v_produtividade_proteticos CASCADE;

-- ============================================
-- 2. REMOVER FOREIGN KEY E ALTERAR COLUNA
-- ============================================

-- Remover a constraint de foreign key antiga
ALTER TABLE procedimentos_ppr
DROP CONSTRAINT IF EXISTS procedimentos_ppr_doutor_id_fkey;

-- Remover a coluna antiga doutor_id (BIGINT)
ALTER TABLE procedimentos_ppr
DROP COLUMN IF EXISTS doutor_id;

-- Adicionar nova coluna dentista_id (UUID) referenciando tabela dentistas
ALTER TABLE procedimentos_ppr
ADD COLUMN IF NOT EXISTS dentista_id UUID REFERENCES dentistas(id);

-- Alterar todas as colunas executor_id das etapas para TEXT (aceita UUID e números)
ALTER TABLE procedimentos_ppr
ALTER COLUMN moldagem_executor_id TYPE TEXT USING moldagem_executor_id::TEXT,
ALTER COLUMN vg_executor_id TYPE TEXT USING vg_executor_id::TEXT,
ALTER COLUMN envio_metal_lab_executor_id TYPE TEXT USING envio_metal_lab_executor_id::TEXT,
ALTER COLUMN rec_metal_lab_executor_id TYPE TEXT USING rec_metal_lab_executor_id::TEXT,
ALTER COLUMN prova_metal_executor_id TYPE TEXT USING prova_metal_executor_id::TEXT,
ALTER COLUMN plano_cera_executor_id TYPE TEXT USING plano_cera_executor_id::TEXT,
ALTER COLUMN prova_cera_executor_id TYPE TEXT USING prova_cera_executor_id::TEXT,
ALTER COLUMN montagem_dente_executor_id TYPE TEXT USING montagem_dente_executor_id::TEXT,
ALTER COLUMN prova_dente_executor_id TYPE TEXT USING prova_dente_executor_id::TEXT,
ALTER COLUMN acrilizacao_executor_id TYPE TEXT USING acrilizacao_executor_id::TEXT,
ALTER COLUMN entrega_executor_id TYPE TEXT USING entrega_executor_id::TEXT;

-- ============================================
-- 3. REMOVER ÍNDICE ANTIGO E CRIAR NOVO
-- ============================================

DROP INDEX IF EXISTS idx_procedimentos_ppr_doutor_id;
CREATE INDEX IF NOT EXISTS idx_procedimentos_ppr_dentista_id ON procedimentos_ppr(dentista_id);

-- ============================================
-- 4. RECRIAR VIEWS USANDO TABELA DENTISTAS
-- ============================================

-- View: Procedimentos em andamento
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

-- View: Próximas entregas
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

-- View: Produtividade de dentistas
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
LEFT JOIN historico_procedimentos h ON d.id::text = h.executor_id AND h.executor_tipo = 'DENTISTA'
GROUP BY d.id, d.nome;

-- View: Produtividade de protéticos
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
LEFT JOIN historico_procedimentos h ON pr.id::text = h.executor_id AND h.executor_tipo = 'PROTETICO'
GROUP BY pr.id, pr.nome;

-- ============================================
-- 5. ATUALIZAR HISTÓRICO DE PROCEDIMENTOS
-- ============================================

-- Alterar tipo da coluna executor_id para TEXT (aceita UUID e números)
ALTER TABLE historico_procedimentos
ALTER COLUMN executor_id TYPE TEXT USING executor_id::TEXT;

-- Atualizar registros históricos que usavam 'DOUTOR' para 'DENTISTA'
UPDATE historico_procedimentos
SET executor_tipo = 'DENTISTA'
WHERE executor_tipo = 'DOUTOR';

UPDATE historico_procedimentos
SET responsavel_esperado = 'DENTISTA'
WHERE responsavel_esperado = 'DOUTOR';

-- ============================================
-- 6. REMOVER TABELA DOUTORES E SEUS ÍNDICES
-- ============================================

-- Remover índices da tabela doutores
DROP INDEX IF EXISTS idx_doutores_user_id;
DROP INDEX IF EXISTS idx_doutores_ativo;

-- Remover triggers da tabela doutores
DROP TRIGGER IF EXISTS update_doutores_updated_at ON doutores;

-- Remover a tabela doutores
DROP TABLE IF EXISTS doutores CASCADE;

-- ============================================
-- 7. COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ============================================

COMMENT ON COLUMN procedimentos_ppr.dentista_id IS 'Referência UUID para a tabela dentistas';
COMMENT ON TABLE dentistas IS 'Tabela única para gerenciar dentistas - usada em todo o sistema incluindo procedimentos';

-- ============================================
-- CONCLUÍDO!
-- ============================================

SELECT 'Tabela doutores removida com sucesso! Agora usando apenas tabela dentistas.' as mensagem;
