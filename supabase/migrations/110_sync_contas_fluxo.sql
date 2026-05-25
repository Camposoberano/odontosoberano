-- Migration 110: vincular fluxo_caixa a contas_receber para auto-sync
ALTER TABLE fluxo_caixa
  ADD COLUMN IF NOT EXISTS conta_receber_id UUID REFERENCES contas_receber(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS fluxo_caixa_conta_receber_idx
  ON fluxo_caixa(conta_receber_id)
  WHERE conta_receber_id IS NOT NULL;
