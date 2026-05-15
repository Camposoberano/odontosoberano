-- Migration 98: Estrutura Multi-Kanban e Colunas Dinâmicas

-- Tabela de Quadros (Boards)
CREATE TABLE IF NOT EXISTS public.kanban_boards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT 'blue',
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Alterar kanban_columns para suportar board_id
ALTER TABLE public.kanban_columns 
ADD COLUMN IF NOT EXISTS board_id UUID REFERENCES public.kanban_boards(id) ON DELETE CASCADE;

-- Criar política de RLS para Boards
ALTER TABLE public.kanban_boards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso total boards para usuários autenticados" 
ON public.kanban_boards FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Função para inicializar colunas padrão de um novo quadro
CREATE OR REPLACE FUNCTION public.initialize_kanban_columns()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.kanban_columns (title, position, color, board_id)
    VALUES 
    ('Ideias', 1, 'blue', NEW.id),
    ('Em Análise', 2, 'amber', NEW.id),
    ('Finalizado', 3, 'slate', NEW.id);
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para criar colunas automaticamente ao criar um board
DROP TRIGGER IF EXISTS on_board_created ON public.kanban_boards;
CREATE TRIGGER on_board_created
AFTER INSERT ON public.kanban_boards
FOR EACH ROW EXECUTE PROCEDURE public.initialize_kanban_columns();

-- Limpar dados órfãos ou antigos de teste (Opcional, mas recomendado para consistência)
DELETE FROM public.kanban_cards;
DELETE FROM public.kanban_columns WHERE board_id IS NULL;

-- Habilitar Realtime para Boards
ALTER PUBLICATION supabase_realtime ADD TABLE public.kanban_boards;
