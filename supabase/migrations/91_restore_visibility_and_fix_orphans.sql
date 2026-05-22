-- =====================================================
-- MIGRAÇÃO: 91_RESTORE_VISIBILITY_AND_FIX_ORPHANS.SQL
-- Descrição: Restaura a visibilidade de dados legados e corrige registros órfãos.
-- =====================================================

-- 1. RELAXAR RLS DE PROTÉTICOS (Garanta que o legado seja visível)
DROP POLICY IF EXISTS "Usuários podem ver seus próprios protéticos" ON proteticos;
CREATE POLICY "Usuários podem ver seus próprios protéticos" 
ON proteticos FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

-- 2. FUNÇÃO PARA POPULAR USER_ID EM REGISTROS ANTIGOS
-- Se o user_id for NULL, tentamos associar ao primeiro perfil encontrado (Admin/Dev)
DO $$ 
DECLARE 
    first_user_id UUID;
    t text;
    tables text[] := ARRAY[
        'pacientes', 'proteticos', 'dentistas', 'ordem_servico',
        'procedimentos_ppr', 'procedimentos_pt', 'procedimentos_pm', 
        'procedimentos_protocolo', 'procedimentos_fixa', 'procedimentos_fixa_ceramica', 
        'procedimentos_fixa_impressa', 'procedimentos_adesiva', 
        'procedimentos_restauracao_indireta', 'procedimentos_bruxismo', 
        'procedimentos_clareamento', 'procedimentos_coroa_implante', 
        'procedimentos_fixa_zirconia', 'procedimentos_lab_externo'
    ];
BEGIN 
    -- 2.1 Buscar o primeiro usuário administrador ou o primeiro perfil disponível
    SELECT user_id INTO first_user_id 
    FROM public.user_profiles 
    ORDER BY role = 'ADMIN' DESC, created_at ASC 
    LIMIT 1;

    IF first_user_id IS NOT NULL THEN
        RAISE NOTICE 'Populando registros órfãos com user_id: %', first_user_id;
        
        FOREACH t IN ARRAY tables LOOP
            BEGIN
                EXECUTE format('
                    UPDATE %I 
                    SET user_id = %L 
                    WHERE user_id IS NULL
                ', t, first_user_id);
            EXCEPTION WHEN OTHERS THEN
                RAISE NOTICE 'Tabela % não possui coluna user_id ou erro ao atualizar.', t;
            END;
        END LOOP;
    ELSE
        RAISE NOTICE 'Nenhum usuário encontrado para herdar registros órfãos.';
    END IF;
END $$;

-- 3. AJUSTE DE VIEW UNIFICADA (Garantir que todos os campos existam para não quebrar o dashboard)
-- Adiciona colunas que podem estar faltando em tabelas específicas
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
        EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS status_geral VARCHAR(50) DEFAULT ''Aberto''', t);
        EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS valor_lab DECIMAL(10,2) DEFAULT 0', t);
        EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS pagamento_lab_status VARCHAR(20) DEFAULT ''Pendente''', t);
        
        -- Garantir dentista_id e doutor_id coexistam para evitar quebra da view
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = t AND column_name = 'dentista_id') THEN
            EXECUTE format('ALTER TABLE %I ADD COLUMN dentista_id UUID REFERENCES dentistas(id)', t);
        END IF;
    END LOOP;
END $$;

NOTIFY pgrst, 'reload schema';
