-- =====================================================
-- CORREÇÃO URGENTE: Atualizar perfil agrovittairece para ADMIN
-- =====================================================

-- 1. VERIFICAR PERFIL ATUAL (deve mostrar SECRETARIA)
SELECT id, user_id, email, nome, role, ativo
FROM user_profiles
WHERE email = 'agrovittairece@gmail.com';

-- 2. ATUALIZAR PARA ADMIN (use o email EXATO que apareceu acima)
UPDATE user_profiles
SET
    role = 'ADMIN',
    ativo = true,
    updated_at = NOW()
WHERE email = 'agrovittairece@gmail.com';

-- 3. CONFIRMAR ATUALIZAÇÃO
SELECT id, user_id, email, nome, role, ativo, updated_at
FROM user_profiles
WHERE email = 'agrovittairece@gmail.com';

-- 4. VERIFICAR SE HÁ DUPLICATAS (não deve ter mais de 1 resultado)
SELECT COUNT(*) as total_registros
FROM user_profiles
WHERE email = 'agrovittairece@gmail.com';

-- 5. LISTAR TODOS OS PERFIS ADMIN
SELECT email, nome, role
FROM user_profiles
WHERE role IN ('ADMIN', 'DEV')
ORDER BY email;
