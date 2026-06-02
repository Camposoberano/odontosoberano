-- Odontograma: acesso compartilhado entre todos os usuários autenticados da clínica.
-- A política anterior (uid() = user_id) bloqueava um dentista de ver/editar
-- odontogramas criados por outro dentista do mesmo consultório.
DROP POLICY IF EXISTS "Users can view their own odontograma" ON odontograma;
DROP POLICY IF EXISTS "Users can update their own odontograma" ON odontograma;
DROP POLICY IF EXISTS "Users can create their own odontograma" ON odontograma;
DROP POLICY IF EXISTS "Users can delete their own odontograma" ON odontograma;

CREATE POLICY "odontograma_authenticated_access" ON odontograma
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
