-- =====================================================
-- ATUALIZAR PERFIL PELO USER_ID CORRETO
-- User ID detectado: d2f6002e-37d6-495f-b00c-2e79f97c13b4
-- =====================================================

-- 1. VERIFICAR PERFIL ATUAL PELO USER_ID
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
WHERE user_id = 'd2f6002e-37d6-495f-b00c-2e79f97c13b4';

-- 2. ATUALIZAR PARA ADMIN USANDO USER_ID (mais confiável)
UPDATE user_profiles
SET
    role = 'ADMIN',
    ativo = true,
    updated_at = NOW()
WHERE user_id = 'd2f6002e-37d6-495f-b00c-2e79f97c13b4';

-- 3. CONFIRMAR ATUALIZAÇÃO
SELECT
    user_id,
    email,
    nome,
    role,
    ativo,
    updated_at
FROM user_profiles
WHERE user_id = 'd2f6002e-37d6-495f-b00c-2e79f97c13b4';

-- 4. VERIFICAR SE HÁ MÚLTIPLOS REGISTROS PARA ESTE USER
SELECT COUNT(*) as total_registros
FROM user_profiles
WHERE user_id = 'd2f6002e-37d6-495f-b00c-2e79f97c13b4';

-- 5. VERIFICAR POLÍTICAS RLS (se retornar vazio, há problema de permissão)
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'user_profiles';
