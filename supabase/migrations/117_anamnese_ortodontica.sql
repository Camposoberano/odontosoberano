-- Migration 117: Campos ortodônticos na tabela anamneses
-- Expande o formulário de anamnese com campos específicos para ortodontia

DO $$
BEGIN
  -- Queixa principal do paciente
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'anamneses' AND column_name = 'queixa_principal'
  ) THEN
    ALTER TABLE anamneses ADD COLUMN queixa_principal TEXT;
  END IF;

  -- Hábitos (roer_unhas, bruxismo, chupeta, succao_dedo, bebidas)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'anamneses' AND column_name = 'habitos'
  ) THEN
    ALTER TABLE anamneses ADD COLUMN habitos JSONB DEFAULT '{}';
  END IF;

  -- Histórico dental detalhado (periodontia, cirurgias, endodontia, profilaxia, ortodontia_previa)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'anamneses' AND column_name = 'historico_dental'
  ) THEN
    ALTER TABLE anamneses ADD COLUMN historico_dental JSONB DEFAULT '{}';
  END IF;

  -- Tipo de aleitamento (materno / mamadeira / ambos)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'anamneses' AND column_name = 'aleitamento'
  ) THEN
    ALTER TABLE anamneses ADD COLUMN aleitamento VARCHAR(50);
  END IF;

  -- Perfil facial (concavo / convexo / reto)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'anamneses' AND column_name = 'perfil_facial'
  ) THEN
    ALTER TABLE anamneses ADD COLUMN perfil_facial VARCHAR(20);
  END IF;

  -- Sobremordida
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'anamneses' AND column_name = 'sobremordida'
  ) THEN
    ALTER TABLE anamneses ADD COLUMN sobremordida VARCHAR(50);
  END IF;

  -- Trespasse horizontal (overjet)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'anamneses' AND column_name = 'trespasse_horizontal'
  ) THEN
    ALTER TABLE anamneses ADD COLUMN trespasse_horizontal VARCHAR(50);
  END IF;

  -- Mordida cruzada
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'anamneses' AND column_name = 'mordida_cruzada'
  ) THEN
    ALTER TABLE anamneses ADD COLUMN mordida_cruzada BOOLEAN DEFAULT false;
  END IF;

  -- Desvio de linha média
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'anamneses' AND column_name = 'desvio_linha_media'
  ) THEN
    ALTER TABLE anamneses ADD COLUMN desvio_linha_media VARCHAR(50);
  END IF;

  -- Classe canino direito (I / II / III)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'anamneses' AND column_name = 'classe_canino_d'
  ) THEN
    ALTER TABLE anamneses ADD COLUMN classe_canino_d VARCHAR(20);
  END IF;

  -- Classe canino esquerdo (I / II / III)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'anamneses' AND column_name = 'classe_canino_e'
  ) THEN
    ALTER TABLE anamneses ADD COLUMN classe_canino_e VARCHAR(20);
  END IF;

  -- Classe do paciente (I / II / III)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'anamneses' AND column_name = 'classe_paciente'
  ) THEN
    ALTER TABLE anamneses ADD COLUMN classe_paciente VARCHAR(20);
  END IF;

  -- Frequência respiratória (rpm)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'anamneses' AND column_name = 'frequencia_respiratoria'
  ) THEN
    ALTER TABLE anamneses ADD COLUMN frequencia_respiratoria INTEGER;
  END IF;

  -- Frequência cardíaca (bpm)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'anamneses' AND column_name = 'fc_bpm'
  ) THEN
    ALTER TABLE anamneses ADD COLUMN fc_bpm INTEGER;
  END IF;

  -- Alteração ganglionar
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'anamneses' AND column_name = 'alteracao_ganglionar'
  ) THEN
    ALTER TABLE anamneses ADD COLUMN alteracao_ganglionar BOOLEAN DEFAULT false;
  END IF;
END $$;
