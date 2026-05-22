-- Migração 86: Adicionar 'cep' à tabela 'pacientes'
ALTER TABLE pacientes ADD COLUMN IF NOT EXISTS cep TEXT;
