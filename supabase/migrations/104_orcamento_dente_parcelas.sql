-- Migration 104: dente por item + rastreabilidade orçamento em contas_receber

ALTER TABLE orcamento_itens
  ADD COLUMN IF NOT EXISTS dente_numero varchar(10);

ALTER TABLE contas_receber
  ADD COLUMN IF NOT EXISTS orcamento_id uuid
    REFERENCES orcamentos(id) ON DELETE SET NULL;
