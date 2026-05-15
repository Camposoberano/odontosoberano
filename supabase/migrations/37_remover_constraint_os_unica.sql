-- ============================================
-- REMOVER CONSTRAINT DE OS ÚNICA
-- Permitir múltiplos procedimentos PPR para a mesma OS
-- ============================================

-- Verificar se a coluna user_id existe, se não, adicionar
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

-- Remover a constraint antiga que impedia múltiplos procedimentos por OS
ALTER TABLE procedimentos_ppr
DROP CONSTRAINT IF EXISTS unique_user_os;

-- Remover constraint se já existir
ALTER TABLE procedimentos_ppr
DROP CONSTRAINT IF EXISTS unique_procedimento_completo;

-- Adicionar nova constraint que permite múltiplos procedimentos por OS
-- mas evita procedimentos completamente duplicados (mesma OS + mesmo paciente + mesma arcada + mesmo dente)
-- NOTA: Removemos user_id da constraint pois pode não existir em todas as instâncias
ALTER TABLE procedimentos_ppr
ADD CONSTRAINT unique_procedimento_completo
UNIQUE NULLS NOT DISTINCT (ordem_servico, nome_paciente, arcada, dente);

-- Comentário explicativo
COMMENT ON CONSTRAINT unique_procedimento_completo ON procedimentos_ppr IS
'Permite múltiplos procedimentos para a mesma OS, mas evita duplicatas exatas (mesma OS + paciente + arcada + dente)';
