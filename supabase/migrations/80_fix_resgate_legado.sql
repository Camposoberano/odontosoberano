-- ============================================
-- 80. RESGATE DE DADOS LEGADOS E NIVELAMENTO (TABELAS CONSOLIDADAS)
-- Finalidade: Recuperar OS que "não se conectam" pois estão em tabelas antigas (pt_pm, placa).
-- ============================================

DO $$ 
DECLARE 
    t text;
    tables text[] := ARRAY[
        'procedimentos_pt_pm', 'procedimentos_placa'
    ];
BEGIN 
    FOREACH t IN ARRAY tables LOOP
        -- Só nivela se a tabela existir
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = t) THEN
            EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS doutor_id BIGINT', t);
            EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS dentista_id UUID REFERENCES dentistas(id)', t);
            EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS dente VARCHAR(100)', t);
            EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS arcada VARCHAR(100)', t);
            EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS protetico_id BIGINT REFERENCES proteticos(id)', t);
            EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS valor_lab DECIMAL(10,2)', t);
            EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS pagamento_lab_status VARCHAR(20) DEFAULT ''Pendente''', t);
            EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS observacoes TEXT', t);
            
            -- Trigger de Sanitização
            EXECUTE format('DROP TRIGGER IF EXISTS tr_sanitizar_nuclear_%I ON %I', t, t);
            EXECUTE format('CREATE TRIGGER tr_sanitizar_nuclear_%I BEFORE INSERT OR UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION fn_sanitizar_procedimentos_nuclear()', t, t);
        END IF;
    END LOOP;
END $$;

-- ============================================
-- 4. VIEW UNIFICADA COM LEGADO (TOTAL 16 TABELAS)
-- ============================================
DROP VIEW IF EXISTS v_todos_procedimentos_full CASCADE;

CREATE OR REPLACE VIEW v_todos_procedimentos_full WITH (security_invoker = true) AS
-- Tabelas Modernas Separadas (14)
SELECT id, user_id, ordem_servico, nome_paciente, paciente_id, data_inicial, 'ppr' as tipo, arcada::text, dente, COALESCE(dentista_id, (SELECT id::uuid FROM dentistas LIMIT 1)) as dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral::text, data_entrega, observacoes, created_at, updated_at FROM procedimentos_ppr
UNION ALL
SELECT id, user_id, ordem_servico, nome_paciente, paciente_id, data_inicial, 'pt' as tipo, arcada::text, dente, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral::text, data_entrega, observacoes, created_at, updated_at FROM procedimentos_pt
UNION ALL
SELECT id, user_id, ordem_servico, nome_paciente, paciente_id, data_inicial, 'pm' as tipo, arcada::text, dente, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral::text, data_entrega, observacoes, created_at, updated_at FROM procedimentos_pm
UNION ALL
SELECT id, user_id, ordem_servico, nome_paciente, paciente_id, data_inicial, 'protocolo-definitivo' as tipo, arcada::text, dente, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral::text, data_entrega, observacoes, created_at, updated_at FROM procedimentos_protocolo
UNION ALL
SELECT id, user_id, ordem_servico, nome_paciente, paciente_id, data_inicial, 'fixa' as tipo, arcada::text, dente, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral::text, data_entrega, observacoes, created_at, updated_at FROM procedimentos_fixa
UNION ALL
SELECT id, user_id, ordem_servico, nome_paciente, paciente_id, data_inicial, 'fixa-ceramica' as tipo, arcada::text, dente, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral::text, data_entrega, observacoes, created_at, updated_at FROM procedimentos_ceramica
UNION ALL
SELECT id, user_id, ordem_servico, nome_paciente, paciente_id, data_inicial, 'fixa-impressa' as tipo, arcada::text, dente, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral::text, data_entrega, observacoes, created_at, updated_at FROM procedimentos_resina_impressa
UNION ALL
SELECT id, user_id, ordem_servico, nome_paciente, paciente_id, data_inicial, 'adesiva' as tipo, arcada::text, dente, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral::text, data_entrega, observacoes, created_at, updated_at FROM procedimentos_provisorio
UNION ALL
SELECT id, user_id, ordem_servico, nome_paciente, paciente_id, data_inicial, 'restauracao-indireta' as tipo, arcada::text, dente, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral::text, data_entrega, observacoes, created_at, updated_at FROM procedimentos_restauracao_indireta
UNION ALL
SELECT id, user_id, ordem_servico, nome_paciente, paciente_id, data_inicial, 'bruxismo' as tipo, arcada::text, dente, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral::text, data_entrega, observacoes, created_at, updated_at FROM procedimentos_bruxismo
UNION ALL
SELECT id, user_id, ordem_servico, nome_paciente, paciente_id, data_inicial, 'clareamento' as tipo, arcada::text, dente, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral::text, data_entrega, observacoes, created_at, updated_at FROM procedimentos_clareamento
UNION ALL
SELECT id, user_id, ordem_servico, nome_paciente, paciente_id, data_inicial, 'coroa-implante' as tipo, arcada::text, dente, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral::text, data_entrega, observacoes, created_at, updated_at FROM procedimentos_coroa_implante
UNION ALL
SELECT id, user_id, ordem_servico, nome_paciente, paciente_id, data_inicial, 'fixa-zirconia' as tipo, arcada::text, dente, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral::text, data_entrega, observacoes, created_at, updated_at FROM procedimentos_fixa_zirconia
UNION ALL
SELECT id, user_id, ordem_servico, nome_paciente, paciente_id, data_inicial, 'lab-externo' as tipo, arcada::text, dente, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral::text, data_entrega, observacoes, created_at, updated_at FROM procedimentos_lab_externo
UNION ALL
-- Tabelas Legadas (2)
SELECT id, user_id, ordem_servico, nome_paciente, paciente_id, data_inicial, 'pt' as tipo, arcada::text, dente, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral::text, data_entrega, observacoes, created_at, updated_at FROM procedimentos_pt_pm 
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'procedimentos_pt_pm')
UNION ALL
SELECT id, user_id, ordem_servico, nome_paciente, paciente_id, data_inicial, 'bruxismo' as tipo, arcada::text, dente, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral::text, data_entrega, observacoes, created_at, updated_at FROM procedimentos_placa
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'procedimentos_placa');

-- Recriar a View Expandida
DROP VIEW IF EXISTS v_todos_procedimentos_full_exp CASCADE;
CREATE OR REPLACE VIEW v_todos_procedimentos_full_exp WITH (security_invoker = true) AS
SELECT 
    v.*,
    COALESCE(d1.nome, 'Não definido') as dentista_nome,
    COALESCE(p.nome, 'Não definido') as protetico_nome,
    p.laboratorio as protetico_laboratorio
FROM v_todos_procedimentos_full v
LEFT JOIN dentistas d1 ON v.dentista_id = d1.id
LEFT JOIN proteticos p ON v.protetico_id = p.id;

NOTIFY pgrst, 'reload schema';
