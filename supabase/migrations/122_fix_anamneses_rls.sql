-- Migration 122: corrige RLS da tabela anamneses
-- FOR ALL USING sem WITH CHECK não cobre INSERT corretamente em todas versões do PG

DROP POLICY IF EXISTS "anamneses_user_policy" ON anamneses;

-- SELECT / UPDATE / DELETE: filtra por user_id
CREATE POLICY "anamneses_select" ON anamneses
  FOR SELECT USING (auth.uid() = user_id);

-- INSERT: verifica que o user_id inserido é o do usuário logado
CREATE POLICY "anamneses_insert" ON anamneses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- UPDATE: garante que só altera seus próprios registros
CREATE POLICY "anamneses_update" ON anamneses
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE
CREATE POLICY "anamneses_delete" ON anamneses
  FOR DELETE USING (auth.uid() = user_id);
