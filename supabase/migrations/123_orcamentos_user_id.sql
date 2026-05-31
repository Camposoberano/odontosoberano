-- Migration 123: adicionar user_id em orcamentos para isolamento multi-usuário
-- Problema: tabela não tinha user_id, RLS usava USING(true) — todos viam tudo

-- 1. Coluna nullable (backfill antes de impor NOT NULL)
ALTER TABLE orcamentos
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Backfill via pacientes (relação já existe)
UPDATE orcamentos o
SET user_id = p.user_id
FROM pacientes p
WHERE o.paciente_id = p.id
  AND o.user_id IS NULL;

-- 3. Índice para performance
CREATE INDEX IF NOT EXISTS idx_orcamentos_user_id ON orcamentos(user_id);

-- 4. Trigger: auto-set user_id em novos inserts
CREATE OR REPLACE FUNCTION set_orcamento_user_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
    IF NEW.user_id IS NULL AND NEW.paciente_id IS NOT NULL THEN
      SELECT user_id INTO NEW.user_id FROM pacientes WHERE id = NEW.paciente_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_orcamentos_user_id ON orcamentos;
CREATE TRIGGER trg_orcamentos_user_id
  BEFORE INSERT ON orcamentos
  FOR EACH ROW EXECUTE FUNCTION set_orcamento_user_id();

-- 5. Substituir RLS permissivo por isolamento por usuário
DROP POLICY IF EXISTS "orcamentos_all" ON orcamentos;

-- USING: lê apenas os próprios (ou órfãos sem user_id, safety net de backfill incompleto)
-- WITH CHECK: só insere/atualiza registros do próprio usuário
CREATE POLICY "orcamentos_user" ON orcamentos
  FOR ALL TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL)
  WITH CHECK (auth.uid() = user_id);

-- Itens: herdam isolamento via JOIN; manter acesso amplo mas proteger com USING no pai
DROP POLICY IF EXISTS "orcamento_itens_all" ON orcamento_itens;
CREATE POLICY "orcamento_itens_user" ON orcamento_itens
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orcamentos o
      WHERE o.id = orcamento_itens.orcamento_id
        AND (o.user_id = auth.uid() OR o.user_id IS NULL)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orcamentos o
      WHERE o.id = orcamento_itens.orcamento_id
        AND o.user_id = auth.uid()
    )
  );
