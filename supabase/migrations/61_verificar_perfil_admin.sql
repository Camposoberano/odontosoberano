-- =====================================================
-- SCRIPT: Verificar Perfil ADMIN
-- Garantir que você está como ADMIN no banco
-- =====================================================

-- 1. VERIFICAR SEU PERFIL ATUAL
-- Substitua o email pelo seu email de login
SELECT
    id,
    user_id,
    email,
    nome,
    role,
    ativo,
    created_at,
    updated_at
FROM user_profiles
WHERE email = 'SEU_EMAIL_AQUI@example.com'; -- SUBSTITUA pelo seu email

-- =====================================================
-- 2. GARANTIR QUE ESTÁ COMO ADMIN
-- =====================================================
UPDATE user_profiles
SET
    role = 'ADMIN',
    ativo = true,
    updated_at = NOW()
WHERE email = 'SEU_EMAIL_AQUI@example.com'; -- SUBSTITUA pelo seu email

-- =====================================================
-- 3. VERIFICAR TODOS OS ADMINS
-- =====================================================
SELECT
    email,
    nome,
    role,
    ativo,
    created_at
FROM user_profiles
WHERE role IN ('ADMIN', 'DEV')
ORDER BY created_at ASC;

-- =====================================================
-- 4. VERIFICAR PERMISSÕES (devem ser idênticas)
-- =====================================================
-- ADMIN e DEV têm EXATAMENTE as mesmas permissões:
--
-- ✅ Módulos: dashboard, pacientes, agendamentos, procedimentos,
--            cadastros, financeiro, relatorios, configuracoes, utilitarios
--
-- ✅ Ações: view, create, edit, delete,
--          execute_etapa_dentista, execute_etapa_protetico, execute_etapa_secretaria
--
-- ✅ Acesso Total: Sim para ADMIN e DEV

-- =====================================================
-- INFORMAÇÕES IMPORTANTES:
-- =====================================================
-- O código em src/types/permissions.ts linha 128:
--   if (role === 'ADMIN' || role === 'DEV') return true;
--
-- Isso significa que ADMIN e DEV são tratados IGUALMENTE
-- com ACESSO TOTAL a todas as etapas!
