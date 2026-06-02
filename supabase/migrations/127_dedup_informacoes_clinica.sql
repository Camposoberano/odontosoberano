-- Remove linhas duplicadas em informacoes_clinica (geradas por múltiplos usuários da clínica
-- cada um inserindo sua própria linha). Mantém somente a linha mais recente.
DELETE FROM informacoes_clinica
WHERE id NOT IN (
  SELECT id
  FROM informacoes_clinica
  ORDER BY updated_at DESC NULLS LAST
  LIMIT 1
);
