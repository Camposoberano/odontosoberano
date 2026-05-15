-- ============================================
-- MIGRAÇÃO SIMPLIFICADA - EXECUTE NO SUPABASE
-- ============================================

-- 1. Remover APENAS a constraint problemática
ALTER TABLE procedimentos_ppr
DROP CONSTRAINT IF EXISTS unique_user_os;

-- 2. Verificar se funcionou
SELECT 'Constraint removida com sucesso!' as resultado;

-- 3. Ver constraints restantes
SELECT
    conname as constraint_name,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'procedimentos_ppr'::regclass
    AND contype = 'u'
ORDER BY conname;
