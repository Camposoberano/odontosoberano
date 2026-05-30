-- Migration 121: submit_anamnese_publica v2 — salva dados_completos + alertas_medicos
-- Isso garante que os dados do paciente apareçam no AnamneseFormulario do painel

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
    habitos, historico_dental,
    dados_completos, alertas_medicos
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
    COALESCE(p_data->'historico_dental', '{}'::jsonb),
    NULLIF(p_data->'dados_completos', 'null'::jsonb),
    ARRAY(SELECT jsonb_array_elements_text(COALESCE(p_data->'alertas_medicos', '[]'::jsonb)))
  )
  ON CONFLICT (user_id, paciente_id)
  DO UPDATE SET
    alergias                = EXCLUDED.alergias,
    medicamentos_uso        = EXCLUDED.medicamentos_uso,
    doencas_sistemicas      = EXCLUDED.doencas_sistemicas,
    historico_cirurgias     = EXCLUDED.historico_cirurgias,
    gestante                = EXCLUDED.gestante,
    fumante                 = EXCLUDED.fumante,
    alcool                  = EXCLUDED.alcool,
    pressao_arterial        = EXCLUDED.pressao_arterial,
    observacoes             = EXCLUDED.observacoes,
    queixa_principal        = EXCLUDED.queixa_principal,
    habitos                 = EXCLUDED.habitos,
    historico_dental        = EXCLUDED.historico_dental,
    dados_completos         = EXCLUDED.dados_completos,
    alertas_medicos         = EXCLUDED.alertas_medicos,
    updated_at              = NOW();

  UPDATE anamnese_tokens SET used_at = NOW() WHERE id = v_rec.id;

  RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION submit_anamnese_publica(UUID, JSONB) TO anon;
