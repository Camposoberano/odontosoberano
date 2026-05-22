-- ============================================================
-- ADICIONANDO CAMPOS LGPD NA TABELA DE CLIENTES (MIGRATIONS)
-- ============================================================

ALTER TABLE clientes 
ADD COLUMN se_not_exists aceitou_lgpd BOOLEAN DEFAULT false,
ADD COLUMN se_not_exists data_aceite_lgpd TIMESTAMP WITH TIME ZONE,
ADD COLUMN se_not_exists ip_aceite_lgpd TEXT;

-- Comentários para documentação
COMMENT ON COLUMN clientes.aceitou_lgpd IS 'Flag indicando se o paciente aceitou o termo de tratamento de dados LGPD';
COMMENT ON COLUMN clientes.data_aceite_lgpd IS 'Data e hora exata em que o paciente aceitou o termo LGPD';
COMMENT ON COLUMN clientes.ip_aceite_lgpd IS 'Endereço IP registrado no momento do aceite para fins legais';
