-- Migration 114: Contas Financeiras (múltiplas caixas/contas)
-- Permite controlar receitas e despesas por conta diferente (ex: Caixa Clínica, Conta Banco)

CREATE TABLE IF NOT EXISTS contas_financeiras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome VARCHAR(150) NOT NULL,
  ativo BOOLEAN DEFAULT true,
  is_padrao BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice
CREATE INDEX IF NOT EXISTS idx_contas_financeiras_user ON contas_financeiras(user_id);

-- RLS
ALTER TABLE contas_financeiras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage contas_financeiras"
  ON contas_financeiras FOR ALL
  USING (auth.uid() = user_id);

-- Adicionar coluna conta_financeira_id em contas_pagar e contas_receber
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contas_pagar' AND column_name = 'conta_financeira_id'
  ) THEN
    ALTER TABLE contas_pagar ADD COLUMN conta_financeira_id UUID REFERENCES contas_financeiras(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contas_receber' AND column_name = 'conta_financeira_id'
  ) THEN
    ALTER TABLE contas_receber ADD COLUMN conta_financeira_id UUID REFERENCES contas_financeiras(id) ON DELETE SET NULL;
  END IF;
END $$;
