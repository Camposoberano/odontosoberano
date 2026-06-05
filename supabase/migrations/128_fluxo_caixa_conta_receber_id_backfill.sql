-- Migration 128: adicionar conta_receber_id em fluxo_caixa + backfill dos 44 recebimentos perdidos

-- 1. Adicionar coluna
ALTER TABLE fluxo_caixa
  ADD COLUMN IF NOT EXISTS conta_receber_id UUID REFERENCES contas_receber(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS fluxo_caixa_conta_receber_idx
  ON fluxo_caixa(conta_receber_id)
  WHERE conta_receber_id IS NOT NULL;

-- 2. Backfill: criar entradas no fluxo_caixa para todos os recebimentos que estão em
--    contas_receber com status = 'Recebida' mas que ainda não têm entrada correspondente.
INSERT INTO fluxo_caixa (user_id, tipo, descricao, categoria, valor, data_movimentacao, forma_pagamento, conta_receber_id)
SELECT
  cr.user_id,
  'Entrada',
  cr.descricao,
  COALESCE(cr.categoria, 'Tratamento Odontológico'),
  cr.valor,
  COALESCE(cr.data_recebimento, cr.data_vencimento),
  cr.forma_pagamento,
  cr.id
FROM contas_receber cr
WHERE cr.status = 'Recebida'
  AND NOT EXISTS (
    SELECT 1 FROM fluxo_caixa fc WHERE fc.conta_receber_id = cr.id
  );
