-- ============================================
-- CRM SOBERANO - Schema Completo Supabase
-- Versão: 1.0.0
-- ============================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- TABELA: users (Usuários/Atendentes)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT DEFAULT 'atendente', -- admin, gerente, atendente
  ativo BOOLEAN DEFAULT true,

  -- Configurações
  configuracoes JSONB DEFAULT '{}',

  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- TABELA: categorias
-- ============================================
CREATE TABLE IF NOT EXISTS categorias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  descricao TEXT,
  cor TEXT DEFAULT '#3B82F6',
  icone TEXT DEFAULT 'tag',

  -- Organização
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: funil_vendas
-- ============================================
CREATE TABLE IF NOT EXISTS funil_vendas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  descricao TEXT,
  cor TEXT DEFAULT '#10B981',
  ordem INTEGER NOT NULL,

  -- Configurações
  meta_conversao DECIMAL(5,2), -- % esperada
  tempo_medio_dias INTEGER, -- Tempo médio nesta etapa

  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: clientes
-- ============================================
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Identificação WhatsApp
  whatsapp_id TEXT UNIQUE NOT NULL,
  telefone TEXT,

  -- Dados Pessoais
  nome TEXT,
  email TEXT,
  cpf_cnpj TEXT,
  data_nascimento DATE,
  genero TEXT, -- masculino, feminino, outro, nao_informado

  -- Endereço (JSON para flexibilidade)
  endereco JSONB DEFAULT '{}',
  -- Exemplo: {"rua": "...", "numero": "...", "bairro": "...", "cidade": "...", "estado": "...", "cep": "..."}

  -- Segmentação
  categoria_id UUID REFERENCES categorias(id),
  tags TEXT[] DEFAULT '{}',

  -- Funil de Vendas
  funil_stage_id UUID REFERENCES funil_vendas(id),
  funil_updated_at TIMESTAMP WITH TIME ZONE,

  -- Score (0-100)
  score INTEGER DEFAULT 0,
  score_breakdown JSONB DEFAULT '{}',
  -- Exemplo: {"recency": 30, "frequency": 40, "monetary": 30}

  -- Status
  status TEXT DEFAULT 'lead', -- lead, cliente, vip, inativo, bloqueado
  origem TEXT, -- whatsapp, indicacao, site, instagram, facebook, outro

  -- Dados Comerciais
  primeira_compra_em TIMESTAMP WITH TIME ZONE,
  ultima_compra_em TIMESTAMP WITH TIME ZONE,
  ultima_interacao_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  total_compras INTEGER DEFAULT 0,
  valor_total_gasto DECIMAL(10,2) DEFAULT 0,
  ticket_medio DECIMAL(10,2) DEFAULT 0,

  -- Social Media
  instagram TEXT,
  facebook TEXT,
  linkedin TEXT,

  -- Preferências
  preferencias JSONB DEFAULT '{}',
  -- Exemplo: {"comunicacao": "whatsapp", "horario_preferido": "manha", "produtos_favoritos": []}

  -- Observações
  observacoes TEXT,

  -- Relacionamento
  indicado_por UUID REFERENCES clientes(id),
  total_indicacoes INTEGER DEFAULT 0,

  -- Controle
  user_id UUID REFERENCES users(id), -- Responsável

  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Índices para performance
CREATE INDEX idx_clientes_whatsapp ON clientes(whatsapp_id);
CREATE INDEX idx_clientes_status ON clientes(status);
CREATE INDEX idx_clientes_categoria ON clientes(categoria_id);
CREATE INDEX idx_clientes_funil ON clientes(funil_stage_id);
CREATE INDEX idx_clientes_tags ON clientes USING GIN(tags);

-- ============================================
-- TABELA: produtos
-- ============================================
CREATE TABLE IF NOT EXISTS produtos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Identificação
  sku TEXT UNIQUE,
  codigo_barras TEXT,
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT,
  subcategoria TEXT,

  -- Preços
  preco DECIMAL(10,2) NOT NULL,
  preco_promocional DECIMAL(10,2),
  custo DECIMAL(10,2),
  margem_lucro DECIMAL(5,2),

  -- Estoque
  estoque_atual INTEGER DEFAULT 0,
  estoque_minimo INTEGER DEFAULT 0,
  estoque_maximo INTEGER DEFAULT 0,
  controla_estoque BOOLEAN DEFAULT true,

  -- Dimensões/Peso
  peso DECIMAL(10,3), -- em kg
  dimensoes JSONB, -- {largura, altura, profundidade} em cm

  -- Mídia
  imagem_principal TEXT,
  imagens TEXT[] DEFAULT '{}',

  -- Variações
  tem_variacoes BOOLEAN DEFAULT false,
  variacoes JSONB DEFAULT '[]',
  -- Exemplo: [{"cor": "azul", "tamanho": "M", "sku": "...", "preco": 100}]

  -- SEO/Busca
  tags TEXT[] DEFAULT '{}',
  palavras_chave TEXT,

  -- Status
  ativo BOOLEAN DEFAULT true,
  destaque BOOLEAN DEFAULT false,

  -- Vendas
  total_vendido INTEGER DEFAULT 0,
  ultima_venda_em TIMESTAMP WITH TIME ZONE,

  -- Fornecedor
  fornecedor TEXT,
  link_fornecedor TEXT,

  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_produtos_sku ON produtos(sku);
CREATE INDEX idx_produtos_nome ON produtos USING GIN(to_tsvector('portuguese', nome));
CREATE INDEX idx_produtos_categoria ON produtos(categoria);
CREATE INDEX idx_produtos_ativo ON produtos(ativo);

-- ============================================
-- TABELA: pedidos
-- ============================================
CREATE TABLE IF NOT EXISTS pedidos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Relacionamentos
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,

  -- Identificação
  numero_pedido TEXT UNIQUE NOT NULL,
  pedido_externo TEXT, -- ID de sistema externo (Shopify, etc)

  -- Status
  status TEXT DEFAULT 'pendente',
  -- pendente, confirmado, preparando, enviado, entregue, cancelado, devolvido

  -- Valores
  subtotal DECIMAL(10,2) NOT NULL,
  desconto DECIMAL(10,2) DEFAULT 0,
  cupom_codigo TEXT,
  frete DECIMAL(10,2) DEFAULT 0,
  taxa_adicional DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,

  -- Pagamento
  forma_pagamento TEXT,
  -- pix, cartao_credito, cartao_debito, boleto, dinheiro, transferencia
  status_pagamento TEXT DEFAULT 'pendente',
  -- pendente, pago, estornado, cancelado
  data_pagamento TIMESTAMP WITH TIME ZONE,
  parcelas INTEGER DEFAULT 1,

  -- Link de pagamento
  link_pagamento TEXT,

  -- Entrega
  tipo_entrega TEXT, -- delivery, retirada, correios
  endereco_entrega JSONB,
  codigo_rastreio TEXT,
  transportadora TEXT,
  previsao_entrega DATE,
  data_envio TIMESTAMP WITH TIME ZONE,
  data_entrega TIMESTAMP WITH TIME ZONE,

  -- Observações
  observacoes TEXT,
  observacoes_internas TEXT,

  -- Cancelamento
  motivo_cancelamento TEXT,
  cancelado_por UUID REFERENCES users(id),
  cancelado_em TIMESTAMP WITH TIME ZONE,

  -- Controle
  atendente_id UUID REFERENCES users(id),

  -- Origem
  origem TEXT, -- whatsapp, site, loja_fisica, telefone

  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_pedidos_cliente ON pedidos(cliente_id);
CREATE INDEX idx_pedidos_numero ON pedidos(numero_pedido);
CREATE INDEX idx_pedidos_status ON pedidos(status);
CREATE INDEX idx_pedidos_data ON pedidos(created_at DESC);

-- ============================================
-- TABELA: itens_pedido
-- ============================================
CREATE TABLE IF NOT EXISTS itens_pedido (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES produtos(id) ON DELETE SET NULL,

  -- Dados do produto (snapshot no momento da venda)
  produto_nome TEXT NOT NULL,
  produto_sku TEXT,
  variacao JSONB, -- Se houver variação escolhida

  -- Valores
  quantidade INTEGER NOT NULL,
  preco_unitario DECIMAL(10,2) NOT NULL,
  desconto DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,

  -- Observações
  observacoes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice
CREATE INDEX idx_itens_pedido ON itens_pedido(pedido_id);

-- ============================================
-- TABELA: interacoes
-- ============================================
CREATE TABLE IF NOT EXISTS interacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,

  -- Tipo de interação
  tipo TEXT NOT NULL,
  -- mensagem, ligacao, email, reuniao, nota, automacao

  canal TEXT,
  -- whatsapp, telefone, email, presencial, instagram, facebook

  -- Direção
  direcao TEXT,
  -- entrada (cliente enviou), saida (nós enviamos)

  -- Conteúdo
  assunto TEXT,
  conteudo TEXT,
  anexos TEXT[] DEFAULT '{}',

  -- Classificação
  sentimento TEXT, -- positivo, neutro, negativo
  tags TEXT[] DEFAULT '{}',

  -- Se for resposta
  resposta_de UUID REFERENCES interacoes(id),

  -- Controle
  atendente_id UUID REFERENCES users(id),
  lida BOOLEAN DEFAULT false,
  importante BOOLEAN DEFAULT false,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_interacoes_cliente ON interacoes(cliente_id);
CREATE INDEX idx_interacoes_tipo ON interacoes(tipo);
CREATE INDEX idx_interacoes_data ON interacoes(created_at DESC);

-- ============================================
-- TABELA: notas
-- ============================================
CREATE TABLE IF NOT EXISTS notas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,

  titulo TEXT,
  conteudo TEXT NOT NULL,

  tipo TEXT DEFAULT 'observacao',
  -- observacao, lembrete, alerta, tarefa

  prioridade TEXT DEFAULT 'media',
  -- baixa, media, alta, urgente

  -- Lembrete
  lembrar_em TIMESTAMP WITH TIME ZONE,
  notificado BOOLEAN DEFAULT false,

  -- Tarefa
  status TEXT DEFAULT 'aberta',
  -- aberta, em_andamento, concluida, cancelada
  concluida_em TIMESTAMP WITH TIME ZONE,

  -- Controle
  user_id UUID REFERENCES users(id),
  atribuida_para UUID REFERENCES users(id),

  -- Anexos
  anexos TEXT[] DEFAULT '{}',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_notas_cliente ON notas(cliente_id);
CREATE INDEX idx_notas_pedido ON notas(pedido_id);
CREATE INDEX idx_notas_lembrete ON notas(lembrar_em) WHERE lembrar_em IS NOT NULL;

-- ============================================
-- TABELA: tarefas
-- ============================================
CREATE TABLE IF NOT EXISTS tarefas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  pedido_id UUID REFERENCES pedidos(id) ON DELETE SET NULL,

  titulo TEXT NOT NULL,
  descricao TEXT,

  status TEXT DEFAULT 'pendente',
  -- pendente, em_andamento, concluida, cancelada

  prioridade TEXT DEFAULT 'media',
  -- baixa, media, alta, urgente

  tipo TEXT,
  -- followup, ligacao, reuniao, email, whatsapp, outro

  -- Prazo
  vencimento TIMESTAMP WITH TIME ZONE,
  concluida_em TIMESTAMP WITH TIME ZONE,

  -- Atribuição
  criada_por UUID REFERENCES users(id),
  atribuida_para UUID REFERENCES users(id),

  -- Lembrete
  lembrete_antes INTEGER, -- minutos antes
  lembrete_enviado BOOLEAN DEFAULT false,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_tarefas_cliente ON tarefas(cliente_id);
CREATE INDEX idx_tarefas_atribuida ON tarefas(atribuida_para);
CREATE INDEX idx_tarefas_vencimento ON tarefas(vencimento);
CREATE INDEX idx_tarefas_status ON tarefas(status);

-- ============================================
-- TABELA: metricas_diarias
-- ============================================
CREATE TABLE IF NOT EXISTS metricas_diarias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  data DATE UNIQUE NOT NULL,

  -- Vendas
  total_vendas DECIMAL(10,2) DEFAULT 0,
  quantidade_pedidos INTEGER DEFAULT 0,
  ticket_medio DECIMAL(10,2) DEFAULT 0,

  -- Produtos
  produtos_vendidos INTEGER DEFAULT 0,
  produto_mais_vendido_id UUID REFERENCES produtos(id),
  produto_mais_vendido_nome TEXT,
  produto_mais_vendido_qtd INTEGER,

  -- Clientes
  novos_clientes INTEGER DEFAULT 0,
  clientes_ativos INTEGER DEFAULT 0,
  clientes_retornantes INTEGER DEFAULT 0,

  -- Interações
  total_mensagens INTEGER DEFAULT 0,
  total_atendimentos INTEGER DEFAULT 0,
  tempo_medio_resposta INTEGER, -- em minutos

  -- Conversão
  taxa_conversao DECIMAL(5,2),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice
CREATE INDEX idx_metricas_data ON metricas_diarias(data DESC);

-- ============================================
-- TABELA: cupons
-- ============================================
CREATE TABLE IF NOT EXISTS cupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  codigo TEXT UNIQUE NOT NULL,
  descricao TEXT,

  -- Tipo de desconto
  tipo TEXT NOT NULL, -- percentual, valor_fixo
  valor DECIMAL(10,2) NOT NULL,

  -- Restrições
  valor_minimo_pedido DECIMAL(10,2),
  quantidade_maxima INTEGER, -- Limite de uso total
  quantidade_usada INTEGER DEFAULT 0,
  uso_por_cliente INTEGER DEFAULT 1,

  -- Produtos aplicáveis
  produtos_ids UUID[] DEFAULT '{}',
  categorias TEXT[] DEFAULT '{}',

  -- Validade
  data_inicio TIMESTAMP WITH TIME ZONE,
  data_fim TIMESTAMP WITH TIME ZONE,

  -- Status
  ativo BOOLEAN DEFAULT true,

  -- Controle
  criado_por UUID REFERENCES users(id),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice
CREATE INDEX idx_cupons_codigo ON cupons(codigo);

-- ============================================
-- TABELA: uso_cupons
-- ============================================
CREATE TABLE IF NOT EXISTS uso_cupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  cupom_id UUID REFERENCES cupons(id) ON DELETE CASCADE,
  pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,

  valor_desconto DECIMAL(10,2),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: templates_mensagens
-- ============================================
CREATE TABLE IF NOT EXISTS templates_mensagens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  nome TEXT NOT NULL,
  categoria TEXT,

  -- Conteúdo
  assunto TEXT,
  mensagem TEXT NOT NULL,

  -- Variáveis disponíveis
  variaveis TEXT[] DEFAULT '{}',
  -- Exemplo: ['{{nome}}', '{{pedido}}', '{{valor}}']

  -- Mídia
  tem_midia BOOLEAN DEFAULT false,
  midia_url TEXT,
  midia_tipo TEXT, -- imagem, video, audio, documento

  -- Gatilho automático
  gatilho TEXT,
  -- pedido_criado, pedido_pago, pedido_enviado, aniversario, carrinho_abandonado

  ativo BOOLEAN DEFAULT true,

  -- Controle
  user_id UUID REFERENCES users(id),

  -- Estatísticas
  total_usado INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: automacoes
-- ============================================
CREATE TABLE IF NOT EXISTS automacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  nome TEXT NOT NULL,
  descricao TEXT,

  -- Gatilho
  gatilho TEXT NOT NULL,
  -- novo_cliente, nova_compra, aniversario, sem_compra_30_dias, etc

  -- Condições (JSON)
  condicoes JSONB DEFAULT '{}',

  -- Ações (JSON)
  acoes JSONB NOT NULL,
  -- Exemplo: [{"tipo": "enviar_mensagem", "template_id": "..."}, {"tipo": "adicionar_tag", "tag": "vip"}]

  -- Status
  ativo BOOLEAN DEFAULT true,

  -- Estatísticas
  total_executada INTEGER DEFAULT 0,
  ultima_execucao TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: logs_automacoes
-- ============================================
CREATE TABLE IF NOT EXISTS logs_automacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  automacao_id UUID REFERENCES automacoes(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,

  gatilho TEXT,
  acoes_executadas JSONB,

  sucesso BOOLEAN DEFAULT true,
  erro TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categorias_updated_at BEFORE UPDATE ON categorias FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_produtos_updated_at BEFORE UPDATE ON produtos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pedidos_updated_at BEFORE UPDATE ON pedidos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para atualizar métricas do cliente após compra
CREATE OR REPLACE FUNCTION atualizar_metricas_cliente()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.status != 'pago' AND NEW.status = 'pago') THEN
        UPDATE clientes
        SET
            total_compras = total_compras + 1,
            valor_total_gasto = valor_total_gasto + NEW.total,
            ticket_medio = (valor_total_gasto + NEW.total) / (total_compras + 1),
            ultima_compra_em = NEW.created_at,
            primeira_compra_em = COALESCE(primeira_compra_em, NEW.created_at),
            status = CASE
                WHEN status = 'lead' THEN 'cliente'
                ELSE status
            END
        WHERE id = NEW.cliente_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualizar_metricas_cliente
AFTER INSERT OR UPDATE ON pedidos
FOR EACH ROW
EXECUTE FUNCTION atualizar_metricas_cliente();

-- Função para gerar número de pedido automaticamente
CREATE OR REPLACE FUNCTION gerar_numero_pedido()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.numero_pedido IS NULL THEN
        NEW.numero_pedido := 'PED-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('seq_pedido')::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Sequence para número de pedido
CREATE SEQUENCE IF NOT EXISTS seq_pedido START 1;

CREATE TRIGGER trigger_gerar_numero_pedido
BEFORE INSERT ON pedidos
FOR EACH ROW
EXECUTE FUNCTION gerar_numero_pedido();

-- Função para atualizar estoque após venda
CREATE OR REPLACE FUNCTION atualizar_estoque()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE produtos
        SET
            estoque_atual = estoque_atual - NEW.quantidade,
            total_vendido = total_vendido + NEW.quantidade,
            ultima_venda_em = NOW()
        WHERE id = NEW.produto_id AND controla_estoque = true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualizar_estoque
AFTER INSERT ON itens_pedido
FOR EACH ROW
EXECUTE FUNCTION atualizar_estoque();

-- ============================================
-- VIEWS ÚTEIS
-- ============================================

-- View: Clientes VIP (top 20% que geram 80% da receita)
CREATE OR REPLACE VIEW vw_clientes_vip AS
SELECT
    c.*,
    RANK() OVER (ORDER BY c.valor_total_gasto DESC) as ranking
FROM clientes c
WHERE c.status != 'inativo'
ORDER BY c.valor_total_gasto DESC;

-- View: Dashboard Resumo
CREATE OR REPLACE VIEW vw_dashboard_resumo AS
SELECT
    (SELECT COUNT(*) FROM clientes WHERE status = 'cliente') as total_clientes,
    (SELECT COUNT(*) FROM clientes WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as novos_clientes_mes,
    (SELECT COUNT(*) FROM pedidos WHERE status IN ('confirmado', 'preparando', 'enviado', 'entregue')) as pedidos_ativos,
    (SELECT COALESCE(SUM(total), 0) FROM pedidos WHERE status_pagamento = 'pago' AND created_at >= CURRENT_DATE - INTERVAL '30 days') as faturamento_mes,
    (SELECT COALESCE(AVG(ticket_medio), 0) FROM clientes WHERE total_compras > 0) as ticket_medio_geral,
    (SELECT COUNT(*) FROM produtos WHERE estoque_atual <= estoque_minimo AND controla_estoque = true) as produtos_estoque_baixo;

-- ============================================
-- POLÍTICAS RLS (Row Level Security)
-- ============================================

-- Habilitar RLS nas tabelas principais
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE interacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notas ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarefas ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver seus próprios dados
-- (Ajuste conforme sua autenticação)
-- Exemplo básico:
CREATE POLICY "Users can view own clients" ON clientes
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));

-- ============================================
-- DADOS INICIAIS (SEED)
-- ============================================

-- Inserir categorias padrão
INSERT INTO categorias (nome, cor, icone, ordem) VALUES
    ('Lead Qualificado', '#3B82F6', 'star', 1),
    ('Cliente Regular', '#10B981', 'users', 2),
    ('VIP', '#F59E0B', 'crown', 3),
    ('Atacado', '#8B5CF6', 'package', 4)
ON CONFLICT DO NOTHING;

-- Inserir etapas do funil padrão
INSERT INTO funil_vendas (nome, cor, ordem, meta_conversao) VALUES
    ('Novo Contato', '#94A3B8', 1, 80.00),
    ('Qualificação', '#3B82F6', 2, 60.00),
    ('Proposta Enviada', '#F59E0B', 3, 40.00),
    ('Negociação', '#EF4444', 4, 70.00),
    ('Fechado', '#10B981', 5, 100.00)
ON CONFLICT DO NOTHING;

-- Inserir templates de mensagens padrão
INSERT INTO templates_mensagens (nome, categoria, mensagem, variaveis) VALUES
    ('Boas-vindas', 'Atendimento', 'Olá {{nome}}! 👋 Seja bem-vindo(a)! Como posso ajudar você hoje?', ARRAY['{{nome}}']),
    ('Confirmação de Pedido', 'Vendas', 'Olá {{nome}}! Seu pedido #{{pedido}} no valor de R$ {{valor}} foi confirmado! 🎉', ARRAY['{{nome}}', '{{pedido}}', '{{valor}}']),
    ('Pedido Enviado', 'Vendas', 'Seu pedido #{{pedido}} foi enviado! 📦 Código de rastreio: {{rastreio}}', ARRAY['{{pedido}}', '{{rastreio}}']),
    ('Aniversário', 'Relacionamento', 'Feliz aniversário, {{nome}}! 🎂🎉 Preparamos um presente especial para você!', ARRAY['{{nome}}'])
ON CONFLICT DO NOTHING;

-- ============================================
-- COMENTÁRIOS NAS TABELAS
-- ============================================

COMMENT ON TABLE clientes IS 'Cadastro completo de clientes com histórico e métricas';
COMMENT ON TABLE pedidos IS 'Gestão completa de pedidos e vendas';
COMMENT ON TABLE produtos IS 'Catálogo de produtos com controle de estoque';
COMMENT ON TABLE interacoes IS 'Histórico de todas as interações com clientes';
COMMENT ON TABLE notas IS 'Notas e lembretes associados a clientes e pedidos';
COMMENT ON TABLE tarefas IS 'Gestão de tarefas e follow-ups';
COMMENT ON TABLE automacoes IS 'Regras de automação de marketing e vendas';
