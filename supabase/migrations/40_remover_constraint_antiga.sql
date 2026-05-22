-- ============================================
-- REMOVER CONSTRAINT ANTIGA - Permitir múltiplos procedimentos por OS
-- Odonto Soberano - Migração 40
-- ============================================

-- Esta migration remove a constraint antiga que impedia
-- criar múltiplos procedimentos PPR para a mesma OS

-- Remover a constraint antiga da tabela procedimentos_ppr
ALTER TABLE procedimentos_ppr
DROP CONSTRAINT IF EXISTS unique_user_os;

-- Mensagem de confirmação
SELECT 'Constraint antiga removida com sucesso! Agora você pode criar múltiplos procedimentos para a mesma OS.' as mensagem;
