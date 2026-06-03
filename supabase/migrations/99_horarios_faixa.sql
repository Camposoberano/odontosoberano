-- Adiciona suporte a faixas de horário (hora_inicio + hora_fim) por dia
ALTER TABLE horarios_disponiveis
  ADD COLUMN IF NOT EXISTS hora_inicio TIME,
  ADD COLUMN IF NOT EXISTS hora_fim TIME;

-- Migra dados existentes: hora existente vira hora_inicio
UPDATE horarios_disponiveis
SET hora_inicio = hora::time
WHERE hora IS NOT NULL AND hora_inicio IS NULL;

-- hora agora é opcional (dados legados)
ALTER TABLE horarios_disponiveis
  ALTER COLUMN hora DROP NOT NULL;
