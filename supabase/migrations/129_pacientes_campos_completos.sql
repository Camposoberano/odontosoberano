-- Migration 129: aplicar campos extras de pacientes (migration 116 não aplicada) + campo rg

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pacientes' AND column_name='numero_prontuario') THEN
    ALTER TABLE pacientes ADD COLUMN numero_prontuario VARCHAR(50);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pacientes' AND column_name='rede_social') THEN
    ALTER TABLE pacientes ADD COLUMN rede_social VARCHAR(255);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pacientes' AND column_name='paciente_estrangeiro') THEN
    ALTER TABLE pacientes ADD COLUMN paciente_estrangeiro BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pacientes' AND column_name='data_nasc_responsavel') THEN
    ALTER TABLE pacientes ADD COLUMN data_nasc_responsavel DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pacientes' AND column_name='email_responsavel') THEN
    ALTER TABLE pacientes ADD COLUMN email_responsavel VARCHAR(255);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pacientes' AND column_name='plano_id') THEN
    ALTER TABLE pacientes ADD COLUMN plano_id UUID REFERENCES convenios(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pacientes' AND column_name='numero_carteirinha') THEN
    ALTER TABLE pacientes ADD COLUMN numero_carteirinha VARCHAR(100);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pacientes' AND column_name='titular_plano') THEN
    ALTER TABLE pacientes ADD COLUMN titular_plano VARCHAR(255);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pacientes' AND column_name='etiquetas') THEN
    ALTER TABLE pacientes ADD COLUMN etiquetas JSONB DEFAULT '[]';
  END IF;
  -- rg para importação do Simples Dental
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pacientes' AND column_name='rg') THEN
    ALTER TABLE pacientes ADD COLUMN rg VARCHAR(20);
  END IF;
  -- id original do Simples Dental (para rastreabilidade)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pacientes' AND column_name='simples_dental_id') THEN
    ALTER TABLE pacientes ADD COLUMN simples_dental_id VARCHAR(20);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_pacientes_plano ON pacientes(plano_id) WHERE plano_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pacientes_prontuario ON pacientes(numero_prontuario) WHERE numero_prontuario IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pacientes_simples_dental ON pacientes(simples_dental_id) WHERE simples_dental_id IS NOT NULL;
