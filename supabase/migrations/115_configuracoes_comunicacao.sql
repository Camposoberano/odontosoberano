-- Migration 115: Configurações de Comunicação Automática
-- Controla confirmações e lembretes automáticos via WhatsApp/SMS

CREATE TABLE IF NOT EXISTS configuracoes_comunicacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  -- Confirmação automática (24h antes)
  confirmacao_ativa BOOLEAN DEFAULT false,
  confirmacao_horas_antes INTEGER DEFAULT 24,
  confirmacao_canal VARCHAR(20) DEFAULT 'whatsapp', -- whatsapp | sms
  -- Lembrete (2h antes)
  lembrete_ativo BOOLEAN DEFAULT false,
  lembrete_horas_antes INTEGER DEFAULT 2,
  lembrete_canal VARCHAR(20) DEFAULT 'whatsapp',
  -- Alerta saldo baixo
  alerta_saldo_ativo BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE configuracoes_comunicacao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their comunicacao config"
  ON configuracoes_comunicacao FOR ALL
  USING (auth.uid() = user_id);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_configuracoes_comunicacao_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER configuracoes_comunicacao_updated_at
  BEFORE UPDATE ON configuracoes_comunicacao
  FOR EACH ROW EXECUTE FUNCTION update_configuracoes_comunicacao_updated_at();
