-- Migration 130: submit_anamnese_publica atualiza dados pessoais do paciente
-- CPF, telefone e data_nascimento preenchidos pelo paciente no form público
-- são gravados de volta em pacientes (se não vazio e válido)

CREATE OR REPLACE FUNCTION submit_anamnese_publica(p_token UUID, p_data JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_rec         anamnese_tokens%ROWTYPE;
  v_cpf         TEXT;
  v_telefone    TEXT;
  v_nascimento  TEXT;
  v_nasc_date   DATE;
BEGIN
  -- Validar token
  SELECT * INTO v_rec
  FROM anamnese_tokens
  WHERE token = p_token
    AND used_at IS NULL
    AND expires_at > NOW();

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Token inválido ou expirado');
  END IF;

  -- Salvar anamnese clínica
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

  -- Atualizar dados pessoais do paciente (só sobrescreve se vier preenchido)

  -- CPF: strip não-dígitos, só salva se 11 dígitos
  v_cpf := REGEXP_REPLACE(COALESCE(p_data->>'cpf', ''), '[^0-9]', '', 'g');
  IF LENGTH(v_cpf) <> 11 THEN v_cpf := NULL; END IF;

  -- Telefone: strip não-dígitos, formata (DDD) XXXXX-XXXX ou (DDD) XXXX-XXXX
  v_telefone := REGEXP_REPLACE(COALESCE(p_data->>'telefone', ''), '[^0-9]', '', 'g');
  IF LENGTH(v_telefone) = 11 THEN
    v_telefone := '(' || SUBSTRING(v_telefone,1,2) || ') ' ||
                  SUBSTRING(v_telefone,3,5) || '-' || SUBSTRING(v_telefone,8,4);
  ELSIF LENGTH(v_telefone) = 10 THEN
    v_telefone := '(' || SUBSTRING(v_telefone,1,2) || ') ' ||
                  SUBSTRING(v_telefone,3,4) || '-' || SUBSTRING(v_telefone,7,4);
  ELSE
    v_telefone := NULL;
  END IF;

  -- Data nascimento: aceita DDMMYYYY (8 dígitos sem separador) ou YYYY-MM-DD
  v_nascimento := REGEXP_REPLACE(COALESCE(p_data->>'data_nascimento', ''), '[^0-9]', '', 'g');
  BEGIN
    IF LENGTH(v_nascimento) = 8 THEN
      -- DDMMYYYY → DATE
      v_nasc_date := TO_DATE(v_nascimento, 'DDMMYYYY');
    ELSE
      v_nasc_date := NULL;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    v_nasc_date := NULL;
  END;

  -- UPDATE pacientes apenas campos com valor novo
  UPDATE pacientes SET
    cpf             = COALESCE(v_cpf,            cpf),
    telefone        = COALESCE(v_telefone,        telefone),
    data_nascimento = COALESCE(v_nasc_date,        data_nascimento),
    updated_at      = NOW()
  WHERE id = v_rec.paciente_id;

  -- Marcar token como usado
  UPDATE anamnese_tokens SET used_at = NOW() WHERE id = v_rec.id;

  RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION submit_anamnese_publica(UUID, JSONB) TO anon;
