-- Migration 116: Campos extras em pacientes (plano, etiquetas, prontuário, etc.)

DO $$
BEGIN
  -- Etiquetas (tags livres para categorizar pacientes)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pacientes' AND column_name = 'etiquetas'
  ) THEN
    ALTER TABLE pacientes ADD COLUMN etiquetas JSONB DEFAULT '[]';
  END IF;

  -- Número de prontuário (código interno da clínica)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pacientes' AND column_name = 'numero_prontuario'
  ) THEN
    ALTER TABLE pacientes ADD COLUMN numero_prontuario VARCHAR(50);
  END IF;

  -- Rede social
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pacientes' AND column_name = 'rede_social'
  ) THEN
    ALTER TABLE pacientes ADD COLUMN rede_social VARCHAR(255);
  END IF;

  -- Paciente estrangeiro (toggle)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pacientes' AND column_name = 'paciente_estrangeiro'
  ) THEN
    ALTER TABLE pacientes ADD COLUMN paciente_estrangeiro BOOLEAN DEFAULT false;
  END IF;

  -- Data nascimento do responsável
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pacientes' AND column_name = 'data_nasc_responsavel'
  ) THEN
    ALTER TABLE pacientes ADD COLUMN data_nasc_responsavel DATE;
  END IF;

  -- Email do responsável
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pacientes' AND column_name = 'email_responsavel'
  ) THEN
    ALTER TABLE pacientes ADD COLUMN email_responsavel VARCHAR(255);
  END IF;

  -- Plano/convênio do paciente (FK para convenios)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pacientes' AND column_name = 'plano_id'
  ) THEN
    ALTER TABLE pacientes ADD COLUMN plano_id UUID REFERENCES convenios(id) ON DELETE SET NULL;
  END IF;

  -- Número da carteirinha do plano
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pacientes' AND column_name = 'numero_carteirinha'
  ) THEN
    ALTER TABLE pacientes ADD COLUMN numero_carteirinha VARCHAR(100);
  END IF;

  -- Titular do plano
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pacientes' AND column_name = 'titular_plano'
  ) THEN
    ALTER TABLE pacientes ADD COLUMN titular_plano VARCHAR(255);
  END IF;
END $$;

-- Índice para busca por plano
CREATE INDEX IF NOT EXISTS idx_pacientes_plano ON pacientes(plano_id) WHERE plano_id IS NOT NULL;
