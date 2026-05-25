-- Migration 109: tabela de anamneses por paciente
CREATE TABLE IF NOT EXISTS anamneses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  alergias TEXT,
  medicamentos_uso TEXT,
  doencas_sistemicas JSONB DEFAULT '[]'::jsonb,
  historico_cirurgias TEXT,
  gestante BOOLEAN DEFAULT FALSE,
  fumante BOOLEAN DEFAULT FALSE,
  alcool BOOLEAN DEFAULT FALSE,
  pressao_arterial VARCHAR(20),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE anamneses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anamneses_user_policy"
  ON anamneses FOR ALL
  USING (auth.uid() = user_id);

-- Um registro de anamnese por paciente por usuário
CREATE UNIQUE INDEX IF NOT EXISTS anamneses_paciente_unique
  ON anamneses(user_id, paciente_id);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_anamneses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS anamneses_updated_at ON anamneses;
CREATE TRIGGER anamneses_updated_at
  BEFORE UPDATE ON anamneses
  FOR EACH ROW
  EXECUTE FUNCTION update_anamneses_updated_at();
