-- ============================================
-- 78. NIVELAMENTO NUCLEAR DEFINITIVO (15 TABELAS)
-- Finalidade: Acabar com o erro "doutor_id not found" e preencher o dashboard com TODOS os tipos.
-- ============================================

DO $$ 
DECLARE 
    t text;
    tables text[] := ARRAY[
        'procedimentos_ppr', 'procedimentos_pt', 'procedimentos_pm', 
        'procedimentos_protocolo', 'procedimentos_fixa', 'procedimentos_ceramica', 
        'procedimentos_resina_impressa', 'procedimentos_provisorio', 
        'procedimentos_restauracao_indireta', 'procedimentos_bruxismo', 
        'procedimentos_clareamento', 'procedimentos_coroa_implante', 
        'procedimentos_fixa_zirconia', 'procedimentos_lab_externo'
    ];
BEGIN 
    FOREACH t IN ARRAY tables LOOP
        -- 1. Forçar existência de AMBOS os campos de identificação (Compatibilidade Nuclear)
        EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS doutor_id BIGINT', t);
        EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS dentista_id UUID REFERENCES dentistas(id)', t);
        
        -- 2. Forçar campos de laboratório e dente (Nivelamento)
        EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS dente VARCHAR(100)', t);
        EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS arcada VARCHAR(100)', t);
        EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS protetico_id BIGINT REFERENCES proteticos(id)', t);
        EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS valor_lab DECIMAL(10,2)', t);
        EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS pagamento_lab_status VARCHAR(20) DEFAULT ''Pendente''', t);
        EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS observacoes TEXT', t);
        
        -- 3. Trigger de Sanitização (Garantir que strings vazias do frontend virem NULL)
        EXECUTE format('DROP TRIGGER IF EXISTS tr_sanitizar_nuclear_%I ON %I', t, t);
        EXECUTE format('CREATE TRIGGER tr_sanitizar_nuclear_%I BEFORE INSERT OR UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION fn_sanitizar_procedimentos_nuclear()', t, t);
    END LOOP;
END $$;

-- ============================================
-- 4. VIEW UNIFICADA TOTAL (15 TABELAS)
-- ============================================
DROP VIEW IF EXISTS v_todos_procedimentos_full CASCADE;

CREATE OR REPLACE VIEW v_todos_procedimentos_full WITH (security_invoker = true) AS
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
SELECT id, user_id, ordem_servico, nome_paciente, paciente_id, data_inicial, 'lab-externo' as tipo, arcada::text, dente, dentista_id, protetico_id, valor_lab, pagamento_lab_status, status_geral::text, data_entrega, observacoes, created_at, updated_at FROM procedimentos_lab_externo;

-- Sincronizar nomes de dentista e protético para facilitar a leitura na view
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
