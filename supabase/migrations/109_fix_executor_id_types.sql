-- Migration 109: Corrige tipos de executor_id para etapas DENTISTA
-- moldagem e prova_coping são feitas por DENTISTA (uuid), não PROTETICO (bigint)

-- procedimentos_coroa_implante
ALTER TABLE procedimentos_coroa_implante
  DROP COLUMN IF EXISTS moldagem_executor_id,
  DROP COLUMN IF EXISTS prova_coping_executor_id;

ALTER TABLE procedimentos_coroa_implante
  ADD COLUMN IF NOT EXISTS moldagem_executor_id uuid REFERENCES dentistas(id),
  ADD COLUMN IF NOT EXISTS prova_coping_executor_id uuid REFERENCES dentistas(id);

-- procedimentos_fixa_zirconia
ALTER TABLE procedimentos_fixa_zirconia
  DROP COLUMN IF EXISTS moldagem_executor_id,
  DROP COLUMN IF EXISTS prova_coping_executor_id;

ALTER TABLE procedimentos_fixa_zirconia
  ADD COLUMN IF NOT EXISTS moldagem_executor_id uuid REFERENCES dentistas(id),
  ADD COLUMN IF NOT EXISTS prova_coping_executor_id uuid REFERENCES dentistas(id);

-- procedimentos_lab_externo
ALTER TABLE procedimentos_lab_externo
  DROP COLUMN IF EXISTS moldagem_executor_id,
  DROP COLUMN IF EXISTS prova_coping_executor_id;

ALTER TABLE procedimentos_lab_externo
  ADD COLUMN IF NOT EXISTS moldagem_executor_id uuid REFERENCES dentistas(id),
  ADD COLUMN IF NOT EXISTS prova_coping_executor_id uuid REFERENCES dentistas(id);

NOTIFY pgrst, 'reload schema';
