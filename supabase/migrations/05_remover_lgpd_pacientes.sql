-- Migration para garantir que os campos antigos de LGPD sejam removidos da tabela
-- e não bloqueiem (via restrição de NOT NULL) a criação de novos pacientes.

ALTER TABLE IF EXISTS public.pacientes 
DROP COLUMN IF EXISTS aceitou_lgpd;

ALTER TABLE IF EXISTS public.pacientes 
DROP COLUMN IF EXISTS data_aceite_lgpd;

ALTER TABLE IF EXISTS public.pacientes 
DROP COLUMN IF EXISTS ip_aceite_lgpd;

ALTER TABLE IF EXISTS public.clientes 
DROP COLUMN IF EXISTS aceitou_lgpd;

ALTER TABLE IF EXISTS public.clientes 
DROP COLUMN IF EXISTS data_aceite_lgpd;

ALTER TABLE IF EXISTS public.clientes 
DROP COLUMN IF EXISTS ip_aceite_lgpd;
