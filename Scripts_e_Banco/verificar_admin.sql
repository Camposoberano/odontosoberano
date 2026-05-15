-- 1. Ver seu perfil atual
SELECT email, nome, role, ativo
FROM user_profiles
WHERE email = 'seu_email@example.com';

-- 2. Se não estiver como ADMIN, atualize:
UPDATE user_profiles
SET role = 'ADMIN', ativo = true, updated_at = NOW()
WHERE email = 'seu_email@example.com';

-- 3. Confirme a atualização
SELECT email, nome, role
FROM user_profiles
WHERE role = 'ADMIN';
