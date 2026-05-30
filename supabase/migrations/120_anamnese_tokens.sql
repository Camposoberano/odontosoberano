-- Migration 120: tokens para anamnese pública (paciente preenche sem login)

CREATE TABLE IF NOT EXISTS anamnese_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
  paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  paciente_nome TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE anamnese_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anamnese_tokens_owner"
  ON anamnese_tokens FOR ALL
  USING (auth.uid() = user_id);

-- Retorna info do token sem expor paciente_id/user_id
CREATE OR REPLACE FUNCTION get_anamnese_token_info(p_token UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_rec anamnese_tokens%ROWTYPE;
BEGIN
  SELECT * INTO v_rec
  FROM anamnese_tokens
  WHERE token = p_token;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'expired', false, 'used', false, 'paciente_nome', null);
  END IF;

  IF v_rec.used_at IS NOT NULL THEN
    RETURN jsonb_build_object('valid', false, 'expired', false, 'used', true, 'paciente_nome', v_rec.paciente_nome);
  END IF;

  IF v_rec.expires_at <= NOW() THEN
    RETURN jsonb_build_object('valid', false, 'expired', true, 'used', false, 'paciente_nome', v_rec.paciente_nome);
  END IF;

  RETURN jsonb_build_object('valid', true, 'expired', false, 'used', false, 'paciente_nome', v_rec.paciente_nome);
END;
$$;

GRANT EXECUTE ON FUNCTION get_anamnese_token_info(UUID) TO anon;

-- Valida token e salva anamnese com user_id/paciente_id do token
CREATE OR REPLACE FUNCTION submit_anamnese_publica(p_token UUID, p_data JSONB)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_rec anamnese_tokens%ROWTYPE;
BEGIN
  SELECT * INTO v_rec
  FROM anamnese_tokens
  WHERE token = p_token
    AND used_at IS NULL
    AND expires_at > NOW();

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Token inválido ou expirado');
  END IF;

  INSERT INTO anamneses (
    user_id, paciente_id,
    alergias, medicamentos_uso, doencas_sistemicas,
    historico_cirurgias, gestante, fumante, alcool,
    pressao_arterial, observacoes, queixa_principal,
    habitos, historico_dental
  ) VALUES (
    v_rec.user_id, v_rec.paciente_id,
    NULLIF(p_data->>'alergias', ''),
    NULLIF(p_data->>'medicamentos_uso', ''),
    COALESCE(p_data->'doencas_sistemicas', '[]'::jsonb),
    NULLIF(p_data->>'historico_cirurgias', ''),
    COALESCE((p_data->>'gestante')::boolean, false),
    COALESCE((p_data->>'fumante')::boolean, false),
    COALESCE((p_data->>'alcool')::boolean, false),
    NULLIF(p_data->>'pressao_arterial', ''),
    NULLIF(p_data->>'observacoes', ''),
    NULLIF(p_data->>'queixa_principal', ''),
    COALESCE(p_data->'habitos', '{}'::jsonb),
    COALESCE(p_data->'historico_dental', '{}'::jsonb)
  )
  ON CONFLICT (user_id, paciente_id)
  DO UPDATE SET
    alergias = EXCLUDED.alergias,
    medicamentos_uso = EXCLUDED.medicamentos_uso,
    doencas_sistemicas = EXCLUDED.doencas_sistemicas,
    historico_cirurgias = EXCLUDED.historico_cirurgias,
    gestante = EXCLUDED.gestante,
    fumante = EXCLUDED.fumante,
    alcool = EXCLUDED.alcool,
    pressao_arterial = EXCLUDED.pressao_arterial,
    observacoes = EXCLUDED.observacoes,
    queixa_principal = EXCLUDED.queixa_principal,
    habitos = EXCLUDED.habitos,
    historico_dental = EXCLUDED.historico_dental,
    updated_at = NOW();

  UPDATE anamnese_tokens SET used_at = NOW() WHERE id = v_rec.id;

  RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION submit_anamnese_publica(UUID, JSONB) TO anon;
