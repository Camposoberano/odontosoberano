-- Como rodar isso:
-- 1. Abra seu painel do Supabase (supabase.com)
-- 2. Vá no projeto do Odonto PRO
-- 3. No menu lateral esquero, procure por "SQL Editor"
-- 4. Clique em "New query"
-- 5. Cole todo esse código e aperte em "Run" (Executar)

ALTER TABLE IF EXISTS procedimentos_ppr DROP CONSTRAINT IF EXISTS unique_ordem_servico;
ALTER TABLE IF EXISTS procedimentos_ptpm DROP CONSTRAINT IF EXISTS unique_ordem_servico;
ALTER TABLE IF EXISTS procedimentos_fixa DROP CONSTRAINT IF EXISTS unique_ordem_servico;
ALTER TABLE IF EXISTS procedimentos_protocolo_provisorio DROP CONSTRAINT IF EXISTS unique_ordem_servico;
ALTER TABLE IF EXISTS procedimentos_protocolo_definitivo DROP CONSTRAINT IF EXISTS unique_ordem_servico;
ALTER TABLE IF EXISTS procedimentos_resina_impressa DROP CONSTRAINT IF EXISTS unique_ordem_servico;
ALTER TABLE IF EXISTS procedimentos_ceramica DROP CONSTRAINT IF EXISTS unique_ordem_servico;
ALTER TABLE IF EXISTS procedimentos_placa DROP CONSTRAINT IF EXISTS unique_ordem_servico;
ALTER TABLE IF EXISTS procedimentos_provisorio DROP CONSTRAINT IF EXISTS unique_ordem_servico;
ALTER TABLE IF EXISTS procedimentos_lab_externo DROP CONSTRAINT IF EXISTS unique_ordem_servico;

-- Também desativando as antigas "unique_user_os" caso existam:
ALTER TABLE IF EXISTS procedimentos_ppr DROP CONSTRAINT IF EXISTS unique_user_os;
ALTER TABLE IF EXISTS procedimentos_ptpm DROP CONSTRAINT IF EXISTS unique_user_os;
ALTER TABLE IF EXISTS procedimentos_fixa DROP CONSTRAINT IF EXISTS unique_user_os;
ALTER TABLE IF EXISTS procedimentos_protocolo_provisorio DROP CONSTRAINT IF EXISTS unique_user_os;
ALTER TABLE IF EXISTS procedimentos_protocolo_definitivo DROP CONSTRAINT IF EXISTS unique_user_os;
ALTER TABLE IF EXISTS procedimentos_resina_impressa DROP CONSTRAINT IF EXISTS unique_user_os;
ALTER TABLE IF EXISTS procedimentos_ceramica DROP CONSTRAINT IF EXISTS unique_user_os;
ALTER TABLE IF EXISTS procedimentos_placa DROP CONSTRAINT IF EXISTS unique_user_os;
ALTER TABLE IF EXISTS procedimentos_provisorio DROP CONSTRAINT IF EXISTS unique_user_os;
ALTER TABLE IF EXISTS procedimentos_lab_externo DROP CONSTRAINT IF EXISTS unique_user_os;

-- Se o erro estiver na tabela mãe de ordem_servico (caso ela não permita duplicar numero_os de nenhuma forma, mas geralmente a OS mãe deve ser única, então lá é OK).
