-- Migration 107: Integração Chatwoot / n8n

-- 1. pacientes: colunas para sync WhatsApp/Chatwoot
ALTER TABLE pacientes
  ADD COLUMN IF NOT EXISTS whatsapp_id              text,
  ADD COLUMN IF NOT EXISTS chatwoot_contact_id      text,
  ADD COLUMN IF NOT EXISTS chatwoot_conversation_id text,
  ADD COLUMN IF NOT EXISTS origem                   varchar(50) DEFAULT 'direto';

CREATE UNIQUE INDEX IF NOT EXISTS pacientes_whatsapp_id_idx
  ON pacientes(whatsapp_id) WHERE whatsapp_id IS NOT NULL;

-- 2. agendamentos: id externo do KanbanCW
ALTER TABLE agendamentos
  ADD COLUMN IF NOT EXISTS chatwoot_appointment_id text;

CREATE UNIQUE INDEX IF NOT EXISTS agendamentos_chatwoot_id_idx
  ON agendamentos(chatwoot_appointment_id) WHERE chatwoot_appointment_id IS NOT NULL;

-- 3. Tabela interacoes (mensagens WhatsApp via Chatwoot)
CREATE TABLE IF NOT EXISTS interacoes (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id   uuid REFERENCES pacientes(id) ON DELETE SET NULL,
  tipo         varchar(50)  NOT NULL DEFAULT 'mensagem',
  canal        varchar(50)  NOT NULL DEFAULT 'whatsapp',
  direcao      varchar(20)  CHECK (direcao IN ('entrada', 'saida')),
  conteudo     text,
  atendente_id uuid,
  lida         boolean      NOT NULL DEFAULT false,
  created_at   timestamptz  NOT NULL DEFAULT now()
);

ALTER TABLE interacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "interacoes_all" ON interacoes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. RPC upsert_agendamento — usado pelo n8n (KanbanCW → Supabase)
CREATE OR REPLACE FUNCTION upsert_agendamento(dados jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result      jsonb;
  v_existing_id uuid;
  v_status_map  jsonb := '{
    "scheduled":   "1-Agendado",
    "confirmed":   "2-Confirmado",
    "cancelled":   "Cancelado",
    "completed":   "5-Atendido",
    "no_show":     "7-Faltou",
    "waiting":     "3-Em espera",
    "in_progress": "4-Em atendimento"
  }';
  v_status text;
BEGIN
  v_status := COALESCE(
    v_status_map ->> (dados->>'status'),
    dados->>'status',
    '1-Agendado'
  );

  IF (dados->>'chatwoot_appointment_id') IS NOT NULL THEN
    SELECT id INTO v_existing_id
    FROM agendamentos
    WHERE chatwoot_appointment_id = dados->>'chatwoot_appointment_id'
    LIMIT 1;
  END IF;

  IF v_existing_id IS NOT NULL THEN
    UPDATE agendamentos SET
      paciente_id      = COALESCE((dados->>'paciente_id')::uuid,           paciente_id),
      data_agendamento = COALESCE((dados->>'data_agendamento')::timestamptz, data_agendamento),
      duracao          = COALESCE((dados->>'duracao')::int,                 duracao),
      procedimento     = COALESCE(dados->>'procedimento',                   procedimento),
      status           = v_status,
      tipo_atendimento = COALESCE(dados->>'tipo_atendimento',               tipo_atendimento),
      valor            = COALESCE((dados->>'valor')::numeric,               valor),
      observacoes      = COALESCE(dados->>'observacoes',                    observacoes),
      confirmado       = COALESCE((dados->>'confirmado')::boolean,          confirmado),
      updated_at       = now()
    WHERE id = v_existing_id
    RETURNING to_jsonb(agendamentos.*) INTO v_result;
  ELSE
    INSERT INTO agendamentos (
      user_id, paciente_id, data_agendamento, duracao,
      procedimento, status, tipo_atendimento, valor,
      observacoes, confirmado, chatwoot_appointment_id, marcadores
    ) VALUES (
      (dados->>'user_id')::uuid,
      (dados->>'paciente_id')::uuid,
      (dados->>'data_agendamento')::timestamptz,
      COALESCE((dados->>'duracao')::int, 30),
      COALESCE(dados->>'procedimento', 'Consulta'),
      v_status,
      COALESCE(dados->>'tipo_atendimento', 'Consulta'),
      CASE WHEN dados->>'valor' IN ('null','') THEN NULL
           ELSE (dados->>'valor')::numeric END,
      CASE WHEN dados->>'observacoes' IN ('null','') THEN NULL
           ELSE dados->>'observacoes' END,
      COALESCE((dados->>'confirmado')::boolean, false),
      CASE WHEN dados->>'chatwoot_appointment_id' IN ('null','') THEN NULL
           ELSE dados->>'chatwoot_appointment_id' END,
      '[]'::jsonb
    )
    RETURNING to_jsonb(agendamentos.*) INTO v_result;
  END IF;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION upsert_agendamento(jsonb) TO authenticated, anon;
