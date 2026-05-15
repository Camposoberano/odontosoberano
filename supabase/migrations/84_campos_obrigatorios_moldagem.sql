-- =====================================================
-- MIGRAÇÃO: 84_CAMPOS_OBRIGATORIOS_MOLDAGEM.SQL
-- Descrição: Adiciona campos técnicos obrigatórios à etapa 
-- de moldagem em todas as tabelas de procedimentos.
-- Data: 2026-04-05
-- =====================================================

-- 1. FUNÇÃO AUXILIAR PARA ADICIONAR COLUNAS SE NÃO EXISTIREM
DO $$ 
DECLARE 
    t text;
    tables text[] := ARRAY[
        'procedimentos_ppr', 'procedimentos_pt', 'procedimentos_pm', 
        'procedimentos_protocolo', 'procedimentos_fixa', 'procedimentos_fixa_ceramica', 
        'procedimentos_fixa_impressa', 'procedimentos_adesiva', 
        'procedimentos_restauracao_indireta', 'procedimentos_bruxismo', 
        'procedimentos_clareamento', 'procedimentos_coroa_implante', 
        'procedimentos_fixa_zirconia', 'procedimentos_lab_externo'
    ];
BEGIN 
    FOREACH t IN ARRAY tables LOOP
        -- Cor do Dente
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = t AND column_name = 'cor_dente') THEN
            EXECUTE format('ALTER TABLE %I ADD COLUMN cor_dente VARCHAR(50)', t);
        END IF;

        -- Cor da Gengiva
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = t AND column_name = 'cor_gengiva') THEN
            EXECUTE format('ALTER TABLE %I ADD COLUMN cor_gengiva VARCHAR(50)', t);
        END IF;

        -- Registro de Mordida
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = t AND column_name = 'registro_mordida') THEN
            EXECUTE format('ALTER TABLE %I ADD COLUMN registro_mordida BOOLEAN DEFAULT FALSE', t);
        END IF;

        -- Moldagem Superior
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = t AND column_name = 'moldagem_superior') THEN
            EXECUTE format('ALTER TABLE %I ADD COLUMN moldagem_superior BOOLEAN DEFAULT FALSE', t);
        END IF;

        -- Moldagem Inferior
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = t AND column_name = 'moldagem_inferior') THEN
            EXECUTE format('ALTER TABLE %I ADD COLUMN moldagem_inferior BOOLEAN DEFAULT FALSE', t);
        END IF;
    END LOOP;
END $$;

-- 2. ATUALIZAR AS VIEWS UNIFICADAS PARA INCLUIR OS NOVOS CAMPOS
-- Remover views antigas para permitir mudança na estrutura de colunas
DROP VIEW IF EXISTS v_todos_procedimentos_full_exp CASCADE;
DROP VIEW IF EXISTS v_todos_procedimentos_full CASCADE;

CREATE OR REPLACE VIEW v_todos_procedimentos_full AS
SELECT id, user_id, ordem_servico, nome_paciente, paciente_id, data_inicial, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, updated_at, cor_dente, cor_gengiva, registro_mordida, moldagem_superior, moldagem_inferior, 'ppr' as tipo FROM procedimentos_ppr
UNION ALL
SELECT id, user_id, ordem_servico, nome_paciente, paciente_id, data_inicial, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, updated_at, cor_dente, cor_gengiva, registro_mordida, moldagem_superior, moldagem_inferior, 'pt' as tipo FROM procedimentos_pt
UNION ALL
SELECT id, user_id, ordem_servico, nome_paciente, paciente_id, data_inicial, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, updated_at, cor_dente, cor_gengiva, registro_mordida, moldagem_superior, moldagem_inferior, 'pm' as tipo FROM procedimentos_pm
UNION ALL
SELECT id, user_id, ordem_servico, nome_paciente, paciente_id, data_inicial, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, updated_at, cor_dente, cor_gengiva, registro_mordida, moldagem_superior, moldagem_inferior, 'protocolo-definitivo' as tipo FROM procedimentos_protocolo
UNION ALL
SELECT id, user_id, ordem_servico, nome_paciente, paciente_id, data_inicial, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, updated_at, cor_dente, cor_gengiva, registro_mordida, moldagem_superior, moldagem_inferior, 'fixa' as tipo FROM procedimentos_fixa
UNION ALL
SELECT id, user_id, ordem_servico, nome_paciente, paciente_id, data_inicial, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, updated_at, cor_dente, cor_gengiva, registro_mordida, moldagem_superior, moldagem_inferior, 'fixa-ceramica' as tipo FROM procedimentos_fixa_ceramica
UNION ALL
SELECT id, user_id, ordem_servico, nome_paciente, paciente_id, data_inicial, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, updated_at, cor_dente, cor_gengiva, registro_mordida, moldagem_superior, moldagem_inferior, 'fixa-impressa' as tipo FROM procedimentos_fixa_impressa
UNION ALL
SELECT id, user_id, ordem_servico, nome_paciente, paciente_id, data_inicial, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, updated_at, cor_dente, cor_gengiva, registro_mordida, moldagem_superior, moldagem_inferior, 'adesiva' as tipo FROM procedimentos_adesiva
UNION ALL
SELECT id, user_id, ordem_servico, nome_paciente, paciente_id, data_inicial, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, updated_at, cor_dente, cor_gengiva, registro_mordida, moldagem_superior, moldagem_inferior, 'restauracao-indireta' as tipo FROM procedimentos_restauracao_indireta
UNION ALL
SELECT id, user_id, ordem_servico, nome_paciente, paciente_id, data_inicial, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, updated_at, cor_dente, cor_gengiva, registro_mordida, moldagem_superior, moldagem_inferior, 'bruxismo' as tipo FROM procedimentos_bruxismo
UNION ALL
SELECT id, user_id, ordem_servico, nome_paciente, paciente_id, data_inicial, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, updated_at, cor_dente, cor_gengiva, registro_mordida, moldagem_superior, moldagem_inferior, 'clareamento' as tipo FROM procedimentos_clareamento
UNION ALL
SELECT id, user_id, ordem_servico, nome_paciente, paciente_id, data_inicial, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, updated_at, cor_dente, cor_gengiva, registro_mordida, moldagem_superior, moldagem_inferior, 'coroa-implante' as tipo FROM procedimentos_coroa_implante
UNION ALL
SELECT id, user_id, ordem_servico, nome_paciente, paciente_id, data_inicial, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, updated_at, cor_dente, cor_gengiva, registro_mordida, moldagem_superior, moldagem_inferior, 'fixa-zirconia' as tipo FROM procedimentos_fixa_zirconia
UNION ALL
SELECT id, user_id, ordem_servico, nome_paciente, paciente_id, data_inicial, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, updated_at, cor_dente, cor_gengiva, registro_mordida, moldagem_superior, moldagem_inferior, 'lab-externo' as tipo FROM procedimentos_lab_externo;

CREATE OR REPLACE VIEW v_todos_procedimentos_full_exp AS
SELECT 
    v.*,
    d.nome as dentista_nome,
    p.nome as protetico_nome,
    p.laboratorio as protetico_laboratorio
FROM v_todos_procedimentos_full v
LEFT JOIN dentistas d ON v.dentista_id = d.id
LEFT JOIN proteticos p ON v.protetico_id = p.id;

NOTIFY pgrst, 'reload schema';
