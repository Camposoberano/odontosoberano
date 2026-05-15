-- =====================================================
-- SCRIPT: Verificar e Atualizar Perfil do Usuário para DEV
-- Descrição: Garantir que sua conta tenha role DEV com acesso total
-- Data: 2025-01-26
-- =====================================================

-- 1. VERIFICAR PERFIL ATUAL
-- Execute esta query para ver seu perfil atual:
SELECT
    id,
    user_id,
    email,
    nome,
    role,
    ativo,
    created_at
FROM user_profiles
WHERE email = 'SEU_EMAIL_AQUI@example.com'; -- SUBSTITUA pelo seu email

-- =====================================================
-- 2. ATUALIZAR PERFIL PARA DEV
-- =====================================================
-- IMPORTANTE: Substitua 'SEU_EMAIL_AQUI@example.com' pelo seu email real

UPDATE user_profiles
SET
    role = 'DEV',
    updated_at = NOW()
WHERE email = 'SEU_EMAIL_AQUI@example.com'; -- SUBSTITUA pelo seu email

-- =====================================================
-- 3. VERIFICAR ATUALIZAÇÃO
-- =====================================================
SELECT
    id,
    email,
    nome,
    role,
    ativo
FROM user_profiles
WHERE role = 'DEV';

-- =====================================================
-- 4. LISTAR TODOS OS PERFIS (opcional)
-- =====================================================
SELECT
    email,
    nome,
    role,
    ativo,
    created_at
FROM user_profiles
ORDER BY created_at ASC;

-- =====================================================
-- INFORMAÇÕES SOBRE PERMISSÕES DO ROLE DEV:
-- =====================================================
-- O role DEV tem acesso a:
-- ✅ Todos os módulos do sistema
-- ✅ Todas as ações (view, create, edit, delete)
-- ✅ Executar etapas de DENTISTA
-- ✅ Executar etapas de PROTÉTICO
-- ✅ Executar etapas de SECRETARIA
-- ✅ Acesso total a configurações e usuários

COMMENT ON TABLE user_profiles IS 'Perfis de usuário com controle de permissões por role';
