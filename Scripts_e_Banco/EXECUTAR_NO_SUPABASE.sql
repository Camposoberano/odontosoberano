-- ============================================
-- IMPORTANTE: Execute este SQL manualmente no Supabase Dashboard
-- Menu: SQL Editor > New Query > Cole este código > Run
-- ============================================

-- 1. Verificar se a coluna user_id existe, se não, adicionar
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'procedimentos_ppr' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE procedimentos_ppr ADD COLUMN user_id UUID REFERENCES auth.users(id);
        RAISE NOTICE 'Coluna user_id adicionada';
    END IF;
END $$;

-- 2. Remover a constraint antiga que impedia múltiplos procedimentos por OS
ALTER TABLE procedimentos_ppr
DROP CONSTRAINT IF EXISTS unique_user_os;

-- 3. Remover constraint se já existir (para re-executar sem erro)
ALTER TABLE procedimentos_ppr
DROP CONSTRAINT IF EXISTS unique_procedimento_completo;

-- 4. Adicionar nova constraint que permite múltiplos procedimentos por OS
-- mas evita procedimentos completamente duplicados
ALTER TABLE procedimentos_ppr
ADD CONSTRAINT unique_procedimento_completo
UNIQUE NULLS NOT DISTINCT (ordem_servico, nome_paciente, arcada, dente);

-- 5. Adicionar comentário explicativo
COMMENT ON CONSTRAINT unique_procedimento_completo ON procedimentos_ppr IS
'Permite múltiplos procedimentos para a mesma OS, mas evita duplicatas exatas (mesma OS + paciente + arcada + dente)';

-- 6. Verificar se funcionou
SELECT
    'Migração aplicada com sucesso!' as mensagem,
    'Agora você pode criar múltiplos procedimentos para a mesma OS' as informacao;

-- 7. Verificar as constraints atuais
SELECT
    conname as constraint_name,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'procedimentos_ppr'::regclass
    AND contype = 'u'; -- unique constraints
