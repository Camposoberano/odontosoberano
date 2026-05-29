-- Migration 119: expandir status de orçamentos + novos campos de acompanhamento
-- Dropar CHECK constraint antiga e recriar com novos valores
ALTER TABLE orcamentos DROP CONSTRAINT IF EXISTS orcamentos_status_check;

ALTER TABLE orcamentos ADD CONSTRAINT orcamentos_status_check
  CHECK (status IN (
    'rascunho', 'enviado', 'aprovado', 'recusado', 'contrato_assinado',
    'em_andamento', 'finalizado', 'entregue'
  ));

-- Sessões de atendimento vinculadas ao orçamento
CREATE TABLE IF NOT EXISTS orcamento_sessoes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  orcamento_id UUID NOT NULL REFERENCES orcamentos(id) ON DELETE CASCADE,
  dentista_id UUID REFERENCES dentistas(id),
  data        DATE NOT NULL DEFAULT CURRENT_DATE,
  duracao_min INTEGER,
  procedimentos_realizados TEXT,
  observacoes TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE orcamento_sessoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sessoes_user" ON orcamento_sessoes FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_orcamento_sessoes_orcamento ON orcamento_sessoes(orcamento_id);
