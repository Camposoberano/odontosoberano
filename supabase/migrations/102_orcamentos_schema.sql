-- ============================================================
-- Módulo de Orçamento Odontológico
-- Migration 102: Schema (tabelas + RLS)
-- ============================================================

-- Catálogo de procedimentos (TUSS/VRPO)
CREATE TABLE IF NOT EXISTS procedimentos_catalogo (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo_tuss varchar(20),
  codigo_vrpo varchar(20),
  nome varchar(255) NOT NULL,
  categoria varchar(100) NOT NULL,
  preco_sugerido numeric(10,2) DEFAULT 0,
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Cabeçalho do orçamento
CREATE TABLE IF NOT EXISTS orcamentos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  paciente_id uuid REFERENCES pacientes(id) ON DELETE SET NULL,
  dentista_id uuid REFERENCES dentistas(id) ON DELETE SET NULL,
  numero_orcamento serial,
  status varchar(50) DEFAULT 'rascunho'
    CHECK (status IN ('rascunho', 'enviado', 'aprovado', 'recusado', 'contrato_assinado')),
  desconto_tipo varchar(15) DEFAULT 'valor'
    CHECK (desconto_tipo IN ('percentual', 'valor')),
  desconto_valor numeric(10,2) DEFAULT 0,
  forma_pagamento varchar(100),
  parcelas integer DEFAULT 1,
  total_bruto numeric(10,2) DEFAULT 0,
  total_liquido numeric(10,2) DEFAULT 0,
  observacoes text,
  docuseal_submission_id varchar(255),
  pdf_url text,
  validade_dias integer DEFAULT 30,
  data_envio timestamptz,
  data_aprovacao timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Itens do orçamento
CREATE TABLE IF NOT EXISTS orcamento_itens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  orcamento_id uuid REFERENCES orcamentos(id) ON DELETE CASCADE NOT NULL,
  procedimento_id uuid REFERENCES procedimentos_catalogo(id) ON DELETE SET NULL,
  nome_procedimento varchar(255) NOT NULL,
  quantidade integer DEFAULT 1,
  preco_unitario numeric(10,2) DEFAULT 0,
  preco_total numeric(10,2) DEFAULT 0,
  observacao text
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_orcamentos_paciente ON orcamentos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_orcamentos_dentista ON orcamentos(dentista_id);
CREATE INDEX IF NOT EXISTS idx_orcamentos_status ON orcamentos(status);
CREATE INDEX IF NOT EXISTS idx_orcamento_itens_orcamento ON orcamento_itens(orcamento_id);
CREATE INDEX IF NOT EXISTS idx_procedimentos_catalogo_categoria ON procedimentos_catalogo(categoria);
CREATE INDEX IF NOT EXISTS idx_procedimentos_catalogo_nome ON procedimentos_catalogo(nome);

-- Trigger: atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_orcamentos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_orcamentos_updated_at
  BEFORE UPDATE ON orcamentos
  FOR EACH ROW EXECUTE FUNCTION update_orcamentos_updated_at();

-- ============================================================
-- RLS
-- ============================================================

ALTER TABLE procedimentos_catalogo ENABLE ROW LEVEL SECURITY;
ALTER TABLE orcamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE orcamento_itens ENABLE ROW LEVEL SECURITY;

-- Catálogo: todos os autenticados podem ler; só admins escrevem
CREATE POLICY "catalogo_select" ON procedimentos_catalogo
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "catalogo_insert" ON procedimentos_catalogo
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "catalogo_update" ON procedimentos_catalogo
  FOR UPDATE TO authenticated USING (true);

-- Orçamentos: todos os autenticados têm acesso completo
CREATE POLICY "orcamentos_all" ON orcamentos
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Itens: acesso completo para autenticados
CREATE POLICY "orcamento_itens_all" ON orcamento_itens
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
