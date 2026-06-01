-- Adiciona whatsapp separado do telefone e parentesco do responsável
ALTER TABLE pacientes
  ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(20),
  ADD COLUMN IF NOT EXISTS parentesco_responsavel VARCHAR(50);
