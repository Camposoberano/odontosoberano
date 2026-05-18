-- Migration 106: Ordens de Serviço (vinculadas a orçamentos aprovados)

CREATE TABLE IF NOT EXISTS ordens_servico (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_os serial,
  orcamento_id uuid REFERENCES orcamentos(id) ON DELETE SET NULL,
  paciente_id uuid REFERENCES pacientes(id) ON DELETE SET NULL,
  dentista_id uuid REFERENCES dentistas(id) ON DELETE SET NULL,
  protetico_id bigint REFERENCES proteticos(id) ON DELETE SET NULL,
  status varchar(30) NOT NULL DEFAULT 'pendente'
    CHECK (status IN ('pendente','em_andamento','concluido','entregue','cancelado')),
  prazo date,
  cor_dente varchar(20),
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ordem_servico_itens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ordem_servico_id uuid NOT NULL REFERENCES ordens_servico(id) ON DELETE CASCADE,
  orcamento_item_id uuid REFERENCES orcamento_itens(id) ON DELETE SET NULL,
  dente_numero varchar(10),
  descricao text NOT NULL,
  quantidade integer NOT NULL DEFAULT 1,
  status varchar(30) NOT NULL DEFAULT 'pendente',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE ordens_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordem_servico_itens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ordens_servico_all" ON ordens_servico
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "ordem_servico_itens_all" ON ordem_servico_itens
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
