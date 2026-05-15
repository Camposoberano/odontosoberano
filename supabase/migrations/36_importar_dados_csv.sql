-- Importação dos dados do CSV ortovital - PPR.csv
-- Este script insere os procedimentos PPR do sistema antigo

-- Inserir os 9 procedimentos do CSV
INSERT INTO procedimentos_ppr (
  ordem_servico,
  nome_paciente,
  data_inicial,
  arcada,
  status_geral,
  moldagem_status,
  vg_status,
  envio_metal_lab_status,
  envio_metal_lab_data,
  rec_metal_lab_status,
  prova_metal_status,
  plano_cera_status,
  prova_cera_status,
  montagem_dente_status,
  prova_dente_status,
  acrilizacao_status,
  entrega_status
) VALUES
  -- OS 3: CICERA DA SILVA GOMES
  (
    3,
    'CICERA DA SILVA GOMES',
    '2025-10-20',
    'INF',
    'Em andamento',
    'Finalizado',
    'Finalizado',
    'Enviado',
    '2025-10-22',
    'Aguardando',
    'Pendente',
    'Pendente',
    'Pendente',
    'Pendente',
    'Pendente',
    'Pendente',
    'Pendente'
  ),

  -- OS 8: ERALDO FERREIRA MIRANDA
  (
    8,
    'ERALDO FERREIRA MIRANDA',
    '2025-10-20',
    'INF',
    'Em andamento',
    'Finalizado',
    'Pendente',
    'Enviado',
    '2025-10-17',
    'Pendente',
    'Pendente',
    'Pendente',
    'Pendente',
    'Pendente',
    'Pendente',
    'Pendente',
    'Pendente'
  ),

  -- OS 12: DUCILEIDE MOREIRA DE LIMA
  (
    12,
    'DUCILEIDE MOREIRA DE LIMA',
    '2025-10-20',
    'SUP/INF',
    'Em andamento',
    'Finalizado',
    'Pendente',
    'Enviado',
    '2025-10-22',
    'Pendente',
    'Pendente',
    'Pendente',
    'Pendente',
    'Pendente',
    'Pendente',
    'Pendente',
    'Pendente'
  ),

  -- OS 13: FRANCISCO ANTONIO TIAGO
  (
    13,
    'FRANCISCO ANTONIO TIAGO',
    '2025-10-20',
    'INF',
    'Em andamento',
    'Finalizado',
    'Pendente',
    'Enviado',
    '2025-10-22',
    'Pendente',
    'Pendente',
    'Pendente',
    'Pendente',
    'Pendente',
    'Pendente',
    'Pendente',
    'Pendente'
  ),

  -- OS 16: MARIA NAUCIRENE DA SILVA
  (
    16,
    'MARIA NAUCIRENE DA SILVA',
    '2025-10-22',
    'INF',
    'Em andamento',
    'Finalizado',
    'Pendente',
    'Enviado',
    '2025-10-22',
    'Pendente',
    'Pendente',
    'Pendente',
    'Pendente',
    'Pendente',
    'Pendente',
    'Pendente',
    'Pendente'
  ),

  -- OS 17: ERIVANO BATISTA
  (
    17,
    'ERIVANO BATISTA',
    '2025-10-22',
    'SUP/INF',
    'Em andamento',
    'Finalizado',
    'Pendente',
    'Pendente',
    NULL,
    'Pendente',
    'Pendente',
    'Pendente',
    'Pendente',
    'Pendente',
    'Pendente',
    'Pendente',
    'Pendente'
  ),

  -- OS 19: JOSEFA PEREIRA DA SILVA
  (
    19,
    'JOSEFA PEREIRA DA SILVA',
    '2025-10-22',
    'INF',
    'Em andamento',
    'Finalizado',
    'Pendente',
    'Pendente',
    NULL,
    'Pendente',
    'Pendente',
    'Pendente',
    'Pendente',
    'Pendente',
    'Pendente',
    'Pendente',
    'Pendente'
  ),

  -- OS 20: CLAUDINOR BENJAMIN
  (
    20,
    'CLAUDINOR BENJAMIN',
    '2025-10-22',
    'SUP',
    'Em andamento',
    'Finalizado',
    'Pendente',
    'Enviado',
    '2025-10-17',
    'Pendente',
    'Pendente',
    'Pendente',
    'Pendente',
    'Pendente',
    'Pendente',
    'Pendente',
    'Pendente'
  ),

  -- OS 21: MARIA JOSE CONCEIÇÃO SOUSA
  (
    21,
    'MARIA JOSE CONCEIÇÃO SOUSA',
    '2025-10-22',
    'SUP/INF',
    'Em andamento',
    'Finalizado',
    'Pendente',
    'Enviado',
    '2025-10-17',
    'Pendente',
    'Pendente',
    'Pendente',
    'Pendente',
    'Pendente',
    'Pendente',
    'Pendente',
    'Pendente'
  );

-- Mensagem de confirmação
DO $$
BEGIN
  RAISE NOTICE '✅ Importação concluída! 9 procedimentos PPR foram inseridos com sucesso.';
END $$;
