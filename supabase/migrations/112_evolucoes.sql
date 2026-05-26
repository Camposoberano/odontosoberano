-- Migration 112: Tabela de Evoluções de Pacientes
-- Registra o histórico clínico/evolução dos tratamentos por paciente

CREATE TABLE IF NOT EXISTS evolucoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  profissional_id UUID REFERENCES dentistas(id) ON DELETE SET NULL,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  texto TEXT NOT NULL,
  assinatura TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_evolucoes_paciente ON evolucoes(paciente_id);
CREATE INDEX IF NOT EXISTS idx_evolucoes_user ON evolucoes(user_id);
CREATE INDEX IF NOT EXISTS idx_evolucoes_data ON evolucoes(data DESC);

-- RLS
ALTER TABLE evolucoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own evolucoes"
  ON evolucoes FOR ALL
  USING (auth.uid() = user_id);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_evolucoes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER evolucoes_updated_at
  BEFORE UPDATE ON evolucoes
  FOR EACH ROW EXECUTE FUNCTION update_evolucoes_updated_at();
