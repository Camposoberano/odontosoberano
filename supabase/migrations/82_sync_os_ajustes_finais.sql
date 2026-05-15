-- =====================================================
-- MIGRAÇÃO: 82_SYNC_OS_AJUSTES_FINAIS.SQL
-- Descrição: Sincroniza a tabela mestre de Ordens de Serviço
-- com os dados migrados para evitar erros de duplicidade.
-- Data: 2026-04-05
-- =====================================================

-- 1. SINCRONIZAÇÃO DA TABELA MASTER 'ordem_servico'
-- Inserir qualquer OS que exista nas tabelas de procedimento mas não na mestre
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
        -- Tentar inserir na tabela mestre ignorando duplicatas
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
            WHERE paciente_id IS NOT NULL 
              AND dentista_id IS NOT NULL
            ON CONFLICT (numero_os) DO NOTHING
        ', t);
    END LOOP;
END $$;

-- 2. AJUSTE DE CONSTRAINT (Opcional - Garantir que a constraint de user_id + os seja por tabela)
-- Como cada tabela agora é individual, a constraint UNIQUE(user_id, ordem_servico) 
-- dentro de cada uma já é suficiente. 

-- 3. NOTIFICAR SCHEMA RELOAD
NOTIFY pgrst, 'reload schema';
