-- =====================================================
-- AUDITORIA: 86_AUDITORIA_INTEGRIDADE_OS.SQL
-- Descrição: Verifica e corrige OS órfãs que não estão na tabela mestre.
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
    missing_count int;
BEGIN 
    RAISE NOTICE 'Iniciando auditoria de integridade de Ordens de Serviço...';

    FOREACH t IN ARRAY tables LOOP
        -- Verificar quantos registros não estão na tabela mestre
        EXECUTE format('
            SELECT count(*) 
            FROM %I p
            LEFT JOIN ordem_servico o ON p.ordem_servico::text = o.numero_os
            WHERE o.numero_os IS NULL AND p.ordem_servico IS NOT NULL
        ', t) INTO missing_count;

        IF missing_count > 0 THEN
            RAISE NOTICE 'Tabela %: Encontradas % OS órfãs. Sincronizando...', t, missing_count;
            
            EXECUTE format('
                INSERT INTO ordem_servico (numero_os, user_id, paciente_id, dentista_id, data_abertura, status, valor_total)
                SELECT DISTINCT 
                    ordem_servico::text, 
                    user_id, 
                    paciente_id, 
                    dentista_id, 
                    data_inicial, 
                    ''Aberta'', 
                    0
                FROM %I
                WHERE ordem_servico IS NOT NULL
                  AND NOT EXISTS (SELECT 1 FROM ordem_servico WHERE numero_os = %I.ordem_servico::text)
                ON CONFLICT (numero_os) DO NOTHING
            ', t, t);
        ELSE
            RAISE NOTICE 'Tabela %: Integridade OK.', t;
        END IF;
    END LOOP;

    RAISE NOTICE 'Auditoria concluída com sucesso.';
END $$;
