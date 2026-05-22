-- =====================================================
-- MIGRAÇÃO: 95_ADD_EM_ANDAMENTO_TO_ENUM.SQL
-- Descrição: Adiciona o valor 'Em andamento' ao tipo ENUM status_etapa.
-- =====================================================

-- Em Postgres, ALTER TYPE ADD VALUE não pode ser executado dentro de um bloco transacional (DO $$)
-- Portanto, executamos como um comando simples.
-- Se o valor já existir, o Postgres avisará, mas para evitar erros em alguns ambientes
-- podemos usar a verificação de existência se necessário, mas o padrão é catch error.

ALTER TYPE status_etapa ADD VALUE IF NOT EXISTS 'Em andamento';

-- Recarregar esquema para PostgREST
NOTIFY pgrst, 'reload schema';
