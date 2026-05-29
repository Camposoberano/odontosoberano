-- Migration 118: tabela de documentos gerados por paciente
DO $$ BEGIN
  CREATE TYPE tipo_documento AS ENUM (
    'contrato',
    'tcle_cirurgia', 'tcle_implante', 'tcle_ortodontia', 'tcle_clareamento',
    'tcle_endodontia', 'tcle_protese', 'tcle_faceta', 'tcle_enxerto',
    'tcle_periodontal', 'tcle_imagem', 'tcle_sedacao',
    'receituario_pdf', 'atestado',
    'anamnese_padrao', 'anamnese_infantil', 'anamnese_transicao',
    'anamnese_resumida', 'anamnese_completa', 'anamnese_periodontal', 'anamnese_pcd'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS documentos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  paciente_id   UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  dentista_id   UUID REFERENCES dentistas(id),
  orcamento_id  UUID REFERENCES orcamentos(id),
  tipo          tipo_documento NOT NULL,
  titulo        TEXT NOT NULL,
  conteudo_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  pdf_url       TEXT,
  assinado_em   TIMESTAMPTZ,
  assinatura_paciente_url TEXT,
  docuseal_id   TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "documentos_user_policy"
  ON documentos FOR ALL
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION update_documentos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS documentos_updated_at ON documentos;
CREATE TRIGGER documentos_updated_at
  BEFORE UPDATE ON documentos
  FOR EACH ROW
  EXECUTE FUNCTION update_documentos_updated_at();
