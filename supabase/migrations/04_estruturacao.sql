-- Migration to fix entity connections and add new patient fields

-- 1. Pacientes: Add precise address fields
ALTER TABLE public.pacientes
ADD COLUMN IF NOT EXISTS rua text,
ADD COLUMN IF NOT EXISTS numero text,
ADD COLUMN IF NOT EXISTS bairro text,
ADD COLUMN IF NOT EXISTS cidade text,
ADD COLUMN IF NOT EXISTS observacao_endereco text;

-- 2. Agendamentos: Allow associating an appointment directly with a prosthetic specialist
ALTER TABLE public.agendamentos
ADD COLUMN IF NOT EXISTS protetico_id bigint;

ALTER TABLE public.agendamentos
ALTER COLUMN dentista_id DROP NOT NULL;

ALTER TABLE public.agendamentos
DROP CONSTRAINT IF EXISTS agendamentos_protetico_id_fkey;

ALTER TABLE public.agendamentos
ADD CONSTRAINT agendamentos_protetico_id_fkey
FOREIGN KEY (protetico_id) REFERENCES public.proteticos(id) ON DELETE SET NULL;

-- 3. Ordem Servico: Link directly to prosthetic specialist and enforce UUID logic
ALTER TABLE public.ordem_servico
ADD COLUMN IF NOT EXISTS protetico_id bigint;

ALTER TABLE public.ordem_servico
ALTER COLUMN dentista_id DROP NOT NULL;

ALTER TABLE public.ordem_servico
DROP CONSTRAINT IF EXISTS ordem_servico_protetico_id_fkey;

ALTER TABLE public.ordem_servico
ADD CONSTRAINT ordem_servico_protetico_id_fkey
FOREIGN KEY (protetico_id) REFERENCES public.proteticos(id) ON DELETE SET NULL;

-- 4. Adicionalmente, as tabelas de procedimentos como `procedimentos_pt_pm` etc
-- utilizam atualmente ordem_servico como numerico/textual livre. 
-- Para não quebrar o histórico, manteremos o número original e podemos num futuro
-- atrelá-las via UUID referenciando ordem_servico(id). Para a implementação atual, 
-- a automação na aplicação criará a OS real gerando ou aproveitando o numero_os associado.
