-- =====================================================
-- MIGRAÇÃO: 96_AGENDA_MODERNA.SQL
-- Descrição: Infraestrutura para a Agenda Clínica Imersiva
-- =====================================================

-- 1. Tabela de Marcadores (Etiquetas Globais)
CREATE TABLE IF NOT EXISTS public.marcadores_agenda (
    id BIGSERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    cor TEXT NOT NULL, -- Hexadecimal ou classe Tailwind
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS para Marcadores
ALTER TABLE public.marcadores_agenda ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Marcadores are viewable by owner" ON public.marcadores_agenda
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Marcadores insert by owner" ON public.marcadores_agenda
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Marcadores update by owner" ON public.marcadores_agenda
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Marcadores delete by owner" ON public.marcadores_agenda
FOR DELETE USING (auth.uid() = user_id);

-- 2. Atualização da tabela de Agendamentos
ALTER TABLE public.agendamentos 
ADD COLUMN IF NOT EXISTS marcadores JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS checkin_responsavel TEXT,
ADD COLUMN IF NOT EXISTS checkin_hora TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS profissional_nome_manual TEXT; -- Caso o profissional não seja um dentista/protético cadastrado

-- Comentários para documentação de Status sugeridos:
-- 1-Confirmado
-- 2-Em espera
-- 3-Em atendimento
-- 4-Atendido
-- 5-Atrasado
-- 6-Faltou

-- 3. Inserir marcadores padrão (Inspirados nos prints do usuário)
-- Nota: O user_id será preenchido via aplicação ou trigger se necessário.
-- Para esta migração, deixaremos apenas a estrutura pronta.

-- Recarregar PostgREST
NOTIFY pgrst, 'reload schema';
