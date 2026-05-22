-- =====================================================
-- MIGRAÇÃO: SEPARAÇÃO TOTAL DOS 15 PROCEDIMENTOS
-- Descrição: Cria as tabelas individuais para garantir que cada 
-- tipo de procedimento tenha sua própria persistência e regras.
-- Data: 2024-12-04
-- =====================================================

-- 1. CLAREAMENTO (Separado de Placa)
CREATE TABLE IF NOT EXISTS procedimentos_clareamento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    ordem_servico INTEGER NOT NULL,
    nome_paciente VARCHAR(255) NOT NULL,
    paciente_id UUID REFERENCES pacientes(id),
    data_inicial DATE NOT NULL,
    arcada VARCHAR(20),
    copia VARCHAR(50),
    observacoes TEXT,
    dentista_id UUID REFERENCES dentistas(id),
    protetico_id BIGINT REFERENCES proteticos(id),
    valor_lab DECIMAL(10,2),
    pagamento_lab_status VARCHAR(20) DEFAULT 'Pendente',
    status_geral status_procedimento DEFAULT 'Pendente',
    data_entrega DATE,
    -- Etapas (Duplicadas de Placa conforme Tópico 02)
    escaner_status status_etapa DEFAULT 'Pendente',
    escaner_data DATE,
    escaner_executado_em TIMESTAMP,
    escaner_executado_por VARCHAR(255),
    exocad_status status_etapa DEFAULT 'Pendente',
    exocad_data DATE,
    exocad_executado_em TIMESTAMP,
    exocad_executado_por VARCHAR(255),
    impressao_status status_etapa DEFAULT 'Pendente',
    impressao_data DATE,
    impressao_executado_em TIMESTAMP,
    impressao_executado_por VARCHAR(255),
    moldagem_status status_etapa DEFAULT 'Pendente',
    moldagem_data DATE,
    moldagem_executado_em TIMESTAMP,
    moldagem_executado_por VARCHAR(255),
    vg_status status_etapa DEFAULT 'Pendente',
    vg_data DATE,
    vg_executado_em TIMESTAMP,
    vg_executado_por VARCHAR(255),
    confeccao_placa_status status_etapa DEFAULT 'Pendente',
    confeccao_placa_data DATE,
    confeccao_placa_executado_em TIMESTAMP,
    confeccao_placa_executado_por VARCHAR(255),
    paciente3_status status_etapa DEFAULT 'Pendente',
    paciente3_data DATE,
    paciente3_agenda DATE,
    paciente3_executado_em TIMESTAMP,
    paciente3_executado_por VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PLACA DE BRUXISMO (Renomear/Garantir Tabela Específica)
CREATE TABLE IF NOT EXISTS procedimentos_bruxismo (
    LIKE procedimentos_clareamento INCLUDING ALL
);

-- 3. COROA SOBRE IMPLANTE (Duplicada de Lab Externo)
CREATE TABLE IF NOT EXISTS procedimentos_coroa_implante (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    ordem_servico INTEGER NOT NULL,
    nome_paciente VARCHAR(255) NOT NULL,
    paciente_id UUID REFERENCES pacientes(id),
    data_inicial DATE NOT NULL,
    arcada VARCHAR(20),
    observacoes TEXT,
    dentista_id UUID REFERENCES dentistas(id),
    protetico_id BIGINT REFERENCES proteticos(id),
    valor_lab DECIMAL(10,2),
    pagamento_lab_status VARCHAR(20) DEFAULT 'Pendente',
    status_geral status_procedimento DEFAULT 'Pendente',
    data_entrega DATE,
    -- Etapas do Lab Externo
    escaner_status status_etapa DEFAULT 'Pendente',
    escaner_data DATE,
    escaner_executado_em TIMESTAMP,
    escaner_executado_por VARCHAR(255),
    envio_arquivo_status status_etapa DEFAULT 'Pendente',
    envio_arquivo_data DATE,
    envio_arquivo_executado_em TIMESTAMP,
    envio_arquivo_executado_por VARCHAR(255),
    moldagem_status status_etapa DEFAULT 'Pendente',
    moldagem_data DATE,
    moldagem_executado_em TIMESTAMP,
    moldagem_executado_por VARCHAR(255),
    vg_status status_etapa DEFAULT 'Pendente',
    vg_data DATE,
    vg_executado_em TIMESTAMP,
    vg_executado_por VARCHAR(255),
    env_lab_status status_etapa DEFAULT 'Pendente',
    env_lab_data DATE,
    env_lab_executado_em TIMESTAMP,
    env_lab_executado_por VARCHAR(255),
    rec_lab_copping_status status_etapa DEFAULT 'Pendente',
    rec_lab_copping_data DATE,
    rec_lab_copping_executado_em TIMESTAMP,
    rec_lab_copping_executado_por VARCHAR(255),
    prova_coping_status status_etapa DEFAULT 'Pendente',
    prova_coping_data DATE,
    prova_coping_agenda DATE,
    prova_coping_executado_em TIMESTAMP,
    prova_coping_executado_por VARCHAR(255),
    envio_lb_status status_etapa DEFAULT 'Pendente',
    envio_lb_data DATE,
    envio_lb_executado_em TIMESTAMP,
    envio_lb_executado_por VARCHAR(255),
    recebimento_lab_status status_etapa DEFAULT 'Pendente',
    recebimento_lab_data DATE,
    recebimento_lab_executado_em TIMESTAMP,
    recebimento_lab_executado_por VARCHAR(255),
    paciente3_status status_etapa DEFAULT 'Pendente',
    paciente3_data DATE,
    paciente3_agenda DATE,
    paciente3_executado_em TIMESTAMP,
    paciente3_executado_por VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. FIXA DE ZIRCÔNIA (Duplicada de Lab Externo)
CREATE TABLE IF NOT EXISTS procedimentos_fixa_zirconia (
    LIKE procedimentos_coroa_implante INCLUDING ALL
);

-- RLS PARA TODAS AS NOVAS TABELAS
ALTER TABLE procedimentos_clareamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedimentos_bruxismo ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedimentos_coroa_implante ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedimentos_fixa_zirconia ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Users can manage their own clareamento" ON procedimentos_clareamento FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own bruxismo" ON procedimentos_bruxismo FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own coroa_implante" ON procedimentos_coroa_implante FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own fixa_zirconia" ON procedimentos_fixa_zirconia FOR ALL USING (auth.uid() = user_id);

-- Triggers de updated_at
CREATE TRIGGER tr_clareamento_updated_at BEFORE UPDATE ON procedimentos_clareamento FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER tr_bruxismo_updated_at BEFORE UPDATE ON procedimentos_bruxismo FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER tr_coroa_implante_updated_at BEFORE UPDATE ON procedimentos_coroa_implante FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER tr_fixa_zirconia_updated_at BEFORE UPDATE ON procedimentos_fixa_zirconia FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
