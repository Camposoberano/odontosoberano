-- Add user_id for multi-tenant isolation + enable RLS on historico_procedimentos
ALTER TABLE historico_procedimentos ADD COLUMN IF NOT EXISTS user_id UUID;

ALTER TABLE historico_procedimentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select_own_historico"
  ON historico_procedimentos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_historico"
  ON historico_procedimentos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_historico_procedimento_id ON historico_procedimentos(procedimento_id);
CREATE INDEX IF NOT EXISTS idx_historico_user_id ON historico_procedimentos(user_id);
CREATE INDEX IF NOT EXISTS idx_historico_created_at ON historico_procedimentos(created_at DESC);
