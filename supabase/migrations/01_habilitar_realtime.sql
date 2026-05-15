-- ============================================================
-- ATIVAR REAL-TIME PARA TABELAS DO SOBERANO
-- ============================================================

-- Primeiro, ativamos a publicação padrão para a role anon e authenticated, se não existir
BEGIN;

  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;

COMMIT;

-- Adicionar as tabelas desejadas à publicação realtime
ALTER PUBLICATION supabase_realtime ADD TABLE clientes;
ALTER PUBLICATION supabase_realtime ADD TABLE pedidos;
ALTER PUBLICATION supabase_realtime ADD TABLE interacoes;
ALTER PUBLICATION supabase_realtime ADD TABLE notas;
ALTER PUBLICATION supabase_realtime ADD TABLE tarefas;

-- Isso permite que eventos INSERT, UPDATE e DELETE sejam transmitidos por WebSockets.
