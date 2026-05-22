-- Migration 97: Kanban de Projetos (Módulo de Colaboração)

-- Tabela de Colunas do Kanban
CREATE TABLE IF NOT EXISTS public.kanban_columns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    position INTEGER NOT NULL,
    color TEXT DEFAULT 'slate',
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Cartões (Projetos/Ideias)
CREATE TABLE IF NOT EXISTS public.kanban_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    column_id UUID REFERENCES public.kanban_columns(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    department TEXT, -- Área da clínica (Financeiro, Marketing, etc)
    image_url TEXT, -- Suporte a prints/screenshots
    position INTEGER NOT NULL,
    tags JSONB DEFAULT '[]'::jsonb,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.kanban_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kanban_cards ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso (Colaborativo: Todos vêem e editam tudo dentro da clínica/user_id)
-- Nota: Em sistemas multi-tenant, o user_id aqui servirá para isolar instâncias se necessário,
-- mas a política básica permite acesso total aos registros existentes para o usuário logado.

CREATE POLICY "Acesso total colunas para usuários autenticados" 
ON public.kanban_columns FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Acesso total cards para usuários autenticados" 
ON public.kanban_cards FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Trigger para updated_at nos cards
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.kanban_cards
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Inserir Colunas Iniciais Padrão
INSERT INTO public.kanban_columns (title, position, color)
VALUES 
('Ideias', 1, 'blue'),
('Análise', 2, 'amber'),
('Projetando', 3, 'violet'),
('Em Debate', 4, 'orange'),
('Aplicando', 5, 'emerald'),
('Finalizado', 6, 'slate')
ON CONFLICT DO NOTHING;

-- Habilitar Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.kanban_columns;
ALTER PUBLICATION supabase_realtime ADD TABLE public.kanban_cards;
