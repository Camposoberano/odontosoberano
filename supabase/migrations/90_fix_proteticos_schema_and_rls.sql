-- 1. Adiciona a coluna user_id de forma simples (sem restrição de chave por enquanto)
ALTER TABLE proteticos ADD COLUMN IF NOT EXISTS user_id UUID;

-- 2. Habilita o RLS (Segurança de Linha)
ALTER TABLE proteticos ENABLE ROW LEVEL SECURITY;

-- 3. Remove políticas antigas (se houver) para evitar conflitos
DROP POLICY IF EXISTS "Usuários podem ver seus próprios protéticos" ON proteticos;
DROP POLICY IF EXISTS "Usuários podem inserir seus próprios protéticos" ON proteticos;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios protéticos" ON proteticos;
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios protéticos" ON proteticos;

-- 4. Cria as novas políticas baseadas no ID de autenticação do Supabase
CREATE POLICY "Usuários podem ver seus próprios protéticos" 
ON proteticos FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios protéticos" 
ON proteticos FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios protéticos" 
ON proteticos FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios protéticos" 
ON proteticos FOR DELETE 
USING (auth.uid() = user_id);
