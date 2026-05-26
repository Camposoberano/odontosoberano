-- Migration 113: Categorias de Despesa
-- Categorias padrão para organização financeira das despesas

CREATE TABLE IF NOT EXISTS categorias_despesa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome VARCHAR(150) NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice
CREATE INDEX IF NOT EXISTS idx_categorias_despesa_user ON categorias_despesa(user_id);

-- RLS
ALTER TABLE categorias_despesa ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their categorias_despesa"
  ON categorias_despesa FOR ALL
  USING (auth.uid() = user_id);

-- Adicionar coluna categoria_id em contas_pagar (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contas_pagar' AND column_name = 'categoria_id'
  ) THEN
    ALTER TABLE contas_pagar ADD COLUMN categoria_id UUID REFERENCES categorias_despesa(id) ON DELETE SET NULL;
  END IF;
END $$;
