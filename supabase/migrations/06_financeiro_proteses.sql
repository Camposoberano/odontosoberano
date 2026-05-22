-- Adicionar campos financeiros às tabelas de procedimentos
DO $$
DECLARE
    tables text[] := ARRAY[
        'procedimentos_ppr',
        'procedimentos_pt_pm',
        'procedimentos_fixa',
        'procedimentos_protocolo',
        'procedimentos_resina_impressa',
        'procedimentos_ceramica',
        'procedimentos_placa',
        'procedimentos_provisorio',
        'procedimentos_lab_externo'
    ];
    tbl text;
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        -- Adicionar valor_lab
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = tbl AND column_name = 'valor_lab') THEN
            EXECUTE format('ALTER TABLE public.%I ADD COLUMN valor_lab numeric DEFAULT 0', tbl);
        END IF;

        -- Adicionar pagamento_lab_status
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = tbl AND column_name = 'pagamento_lab_status') THEN
            EXECUTE format('ALTER TABLE public.%I ADD COLUMN pagamento_lab_status text DEFAULT ''Pendente''', tbl);
        END IF;

        -- Adicionar pagamento_lab_data
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = tbl AND column_name = 'pagamento_lab_data') THEN
            EXECUTE format('ALTER TABLE public.%I ADD COLUMN pagamento_lab_data timestamp with time zone', tbl);
        END IF;
    END LOOP;
END $$;
