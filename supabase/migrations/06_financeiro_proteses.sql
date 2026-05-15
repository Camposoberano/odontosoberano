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
    table_name text;
BEGIN
    FOREACH table_name IN ARRAY tables LOOP
        -- Adicionar valor_lab
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = table_name AND column_name = 'valor_lab') THEN
            EXECUTE format('ALTER TABLE public.%I ADD COLUMN valor_lab numeric DEFAULT 0', table_name);
        END IF;

        -- Adicionar pagamento_lab_status
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = table_name AND column_name = 'pagamento_lab_status') THEN
            EXECUTE format('ALTER TABLE public.%I ADD COLUMN pagamento_lab_status text DEFAULT ''Pendente''', table_name);
        END IF;

        -- Adicionar pagamento_lab_data
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = table_name AND column_name = 'pagamento_lab_data') THEN
            EXECUTE format('ALTER TABLE public.%I ADD COLUMN pagamento_lab_data timestamp with time zone', table_name);
        END IF;
    END LOOP;
END $$;
