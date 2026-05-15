-- =====================================================
-- MIGRAÇÃO: 92_FINAL_STRUCTURAL_LEVELING.SQL
-- Descrição: Nivelamento definitivo de colunas e reconstrução da View Unificada.
-- =====================================================

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
        RAISE NOTICE 'Nivelando tabela: %', t;
        
        -- 1. IDENTIDADE E SEGURANÇA
        EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS user_id UUID', t);
        
        -- 2. DADOS BÁSICOS (Garantir nomes e tipos)
        EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS ordem_servico TEXT', t);
        EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS nome_paciente TEXT', t);
        
        -- 3. RELACIONAMENTOS (Convertendo ou Criando)
        EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS paciente_id UUID REFERENCES pacientes(id)', t);
        -- Se existe doutor_id, garantir que dentista_id receba o dado ou exista
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = t AND column_name = 'dentista_id') THEN
            EXECUTE format('ALTER TABLE %I ADD COLUMN dentista_id UUID REFERENCES dentistas(id)', t);
        END IF;
        
        EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS protetico_id BIGINT REFERENCES proteticos(id)', t);
        
        -- 4. METADADOS DO PROCEDIMENTO
        EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS arcada VARCHAR(50)', t);
        EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS dente VARCHAR(100)', t);
        EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS status_geral VARCHAR(50) DEFAULT ''Aberto''', t);
        
        -- 5. FINANCEIRO E PRAZOS
        EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS valor_lab DECIMAL(10,2) DEFAULT 0', t);
        EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS pagamento_lab_status VARCHAR(20) DEFAULT ''Pendente''', t);
        EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS data_inicial DATE DEFAULT CURRENT_DATE', t);
        EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS data_entrega DATE', t);
        EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS observacoes TEXT', t);
        
        -- 6. TIMESTAMPS
        EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()', t);
        EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()', t);
    END LOOP;
END $$;

-- =====================================================
-- RECONSTRUÇÃO DA VIEW UNIFICADA (V_TODOS_PROCEDIMENTOS_FULL)
-- =====================================================
DROP VIEW IF EXISTS v_todos_procedimentos_full_exp CASCADE;
DROP VIEW IF EXISTS v_todos_procedimentos_full CASCADE;

CREATE OR REPLACE VIEW v_todos_procedimentos_full AS
SELECT id, user_id, ordem_servico::text, nome_paciente, paciente_id, data_inicial, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, updated_at, 'ppr' as tipo FROM procedimentos_ppr
UNION ALL
SELECT id, user_id, ordem_servico::text, nome_paciente, paciente_id, data_inicial, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, updated_at, 'pt' as tipo FROM procedimentos_pt
UNION ALL
SELECT id, user_id, ordem_servico::text, nome_paciente, paciente_id, data_inicial, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, updated_at, 'pm' as tipo FROM procedimentos_pm
UNION ALL
SELECT id, user_id, ordem_servico::text, nome_paciente, paciente_id, data_inicial, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, updated_at, 'protocolo' as tipo FROM procedimentos_protocolo
UNION ALL
SELECT id, user_id, ordem_servico::text, nome_paciente, paciente_id, data_inicial, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, updated_at, 'fixa' as tipo FROM procedimentos_fixa
UNION ALL
SELECT id, user_id, ordem_servico::text, nome_paciente, paciente_id, data_inicial, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, updated_at, 'fixa-ceramica' as tipo FROM procedimentos_fixa_ceramica
UNION ALL
SELECT id, user_id, ordem_servico::text, nome_paciente, paciente_id, data_inicial, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, updated_at, 'fixa-impressa' as tipo FROM procedimentos_fixa_impressa
UNION ALL
SELECT id, user_id, ordem_servico::text, nome_paciente, paciente_id, data_inicial, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, updated_at, 'adesiva' as tipo FROM procedimentos_adesiva
UNION ALL
SELECT id, user_id, ordem_servico::text, nome_paciente, paciente_id, data_inicial, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, updated_at, 'restauracao-indireta' as tipo FROM procedimentos_restauracao_indireta
UNION ALL
SELECT id, user_id, ordem_servico::text, nome_paciente, paciente_id, data_inicial, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, updated_at, 'bruxismo' as tipo FROM procedimentos_bruxismo
UNION ALL
SELECT id, user_id, ordem_servico::text, nome_paciente, paciente_id, data_inicial, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, updated_at, 'clareamento' as tipo FROM procedimentos_clareamento
UNION ALL
SELECT id, user_id, ordem_servico::text, nome_paciente, paciente_id, data_inicial, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, updated_at, 'coroa-implante' as tipo FROM procedimentos_coroa_implante
UNION ALL
SELECT id, user_id, ordem_servico::text, nome_paciente, paciente_id, data_inicial, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, updated_at, 'fixa-zirconia' as tipo FROM procedimentos_fixa_zirconia
UNION ALL
SELECT id, user_id, ordem_servico::text, nome_paciente, paciente_id, data_inicial, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral, data_entrega, updated_at, 'lab-externo' as tipo FROM procedimentos_lab_externo;

-- =====================================================
-- VIEW EXPANDIDA (COM NOMES)
-- =====================================================
CREATE OR REPLACE VIEW v_todos_procedimentos_full_exp WITH (security_invoker = true) AS
SELECT 
    v.*,
    d.nome as dentista_nome,
    p.nome as protetico_nome,
    p.laboratorio as protetico_laboratorio
FROM v_todos_procedimentos_full v
LEFT JOIN dentistas d ON v.dentista_id = d.id
LEFT JOIN proteticos p ON v.protetico_id = p.id;

NOTIFY pgrst, 'reload schema';
