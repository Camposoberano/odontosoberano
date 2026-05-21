-- Fix: procedimentos_ppr tinha RLS desativado — todos os usuários viam dados uns dos outros
ALTER TABLE procedimentos_ppr ENABLE ROW LEVEL SECURITY;
