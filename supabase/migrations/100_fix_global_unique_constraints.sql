-- ============================================
-- MIGRAÇÃO: 100_FIX_GLOBAL_UNIQUE_CONSTRAINTS.SQL
-- Descrição: Altera restrições UNIQUE globais para serem restritas por user_id.
-- ============================================

-- 1. TABELA DENTISTAS
-- Remover restrições globais
ALTER TABLE public.dentistas DROP CONSTRAINT IF EXISTS dentistas_cro_key;
ALTER TABLE public.dentistas DROP CONSTRAINT IF EXISTS dentistas_cpf_key;

-- Adicionar restrições compostas (user_id + campo)
-- Isso permite que o mesmo dentista (CRO/CPF) seja cadastrado em diferentes clínicas/contas (user_id)
-- mas evita duplicidade dentro da mesma clínica.
ALTER TABLE public.dentistas ADD CONSTRAINT dentistas_user_cro_unique UNIQUE (user_id, cro);
ALTER TABLE public.dentistas ADD CONSTRAINT dentistas_user_cpf_unique UNIQUE (user_id, cpf);

-- 2. TABELA ORDEM_SERVICO
-- Remover restrição global de número de OS
ALTER TABLE public.ordem_servico DROP CONSTRAINT IF EXISTS ordem_servico_numero_os_key;

-- Adicionar restrição composta
-- Isso permite que diferentes clínicas comecem sua numeração de OS independentemente.
ALTER TABLE public.ordem_servico ADD CONSTRAINT ordem_servico_user_numero_unique UNIQUE (user_id, numero_os);

-- 3. COMENTÁRIOS PARA DOCUMENTAÇÃO
COMMENT ON CONSTRAINT dentistas_user_cro_unique ON public.dentistas IS 'CRO deve ser único por clínica (user_id)';
COMMENT ON CONSTRAINT dentistas_user_cpf_unique ON public.dentistas IS 'CPF deve ser único por clínica (user_id)';
COMMENT ON CONSTRAINT ordem_servico_user_numero_unique ON public.ordem_servico IS 'Número da OS deve ser único por clínica (user_id)';

NOTIFY pgrst, 'reload schema';
