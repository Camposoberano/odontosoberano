-- FIX: RESTAURAR RELACIONAMENTOS E RECARREGAR CACHE
-- Este script corrige o erro de relacionamento detectado pelo PostgREST (PGRST200)

-- 1. Reafirmar Relacionamentos (Chaves Estrangeiras)
-- Garante que o Supabase reconheça que dentista_id aponta para a tabela dentistas
DO $$ 
DECLARE 
    t text;
    tables text[] := ARRAY[
        'procedimentos_clareamento', 
        'procedimentos_bruxismo', 
        'procedimentos_coroa_implante', 
        'procedimentos_fixa_zirconia',
        'procedimentos_pt_pm',
        'procedimentos_ppr',
        'procedimentos_protocolo',
        'procedimentos_fixa',
        'procedimentos_ceramica',
        'procedimentos_resina_impressa',
        'procedimentos_provisorio',
        'procedimentos_lab_externo'
    ];
BEGIN 
    FOREACH t IN ARRAY tables LOOP
        -- Tentar adicionar a FK de dentista se não existir
        BEGIN
            EXECUTE format('ALTER TABLE %I ADD CONSTRAINT %I_dentista_fkey FOREIGN KEY (dentista_id) REFERENCES dentistas(id)', t, t);
        EXCEPTION WHEN duplicate_object OR duplicate_table OR undefined_column THEN 
            NULL; -- Já existe ou coluna não existe nesta tabela específica
        END;

        -- Tentar adicionar a FK de paciente se não existir
        BEGIN
            EXECUTE format('ALTER TABLE %I ADD CONSTRAINT %I_paciente_fkey FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE', t, t);
        EXCEPTION WHEN duplicate_object OR duplicate_table OR undefined_column THEN 
            NULL;
        END;
    END LOOP;
END $$;

-- 2. RECARREGAR CACHE DO POSTGREST (CRÍTICO)
-- Comanda o Supabase a reler as definições de todas as tabelas e relacionamentos
NOTIFY pgrst, 'reload schema';
