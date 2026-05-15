-- Migration 105: campos completos do cadastro de pacientes
ALTER TABLE pacientes
  ADD COLUMN IF NOT EXISTS apelido varchar(50),
  ADD COLUMN IF NOT EXISTS area_tratamento varchar(100),
  ADD COLUMN IF NOT EXISTS genero varchar(20),
  ADD COLUMN IF NOT EXISTS profissao varchar(100),
  ADD COLUMN IF NOT EXISTS como_conheceu varchar(100),
  ADD COLUMN IF NOT EXISTS complemento varchar(100),
  ADD COLUMN IF NOT EXISTS estado varchar(2),
  ADD COLUMN IF NOT EXISTS nome_responsavel varchar(100),
  ADD COLUMN IF NOT EXISTS cpf_responsavel varchar(14),
  ADD COLUMN IF NOT EXISTS telefone_responsavel varchar(20);
