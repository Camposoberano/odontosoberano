-- ============================================
-- 79. REFATORAÇÃO DE VIEW PARA RESGATE INTELIGENTE DE NOMES
-- Finalidade: Garantir que o cabeçalho "Dentista" e "Protético" nunca fique "Não definido".
-- ============================================

DROP VIEW IF EXISTS v_todos_procedimentos_full_exp CASCADE;

CREATE OR REPLACE VIEW v_todos_procedimentos_full_exp WITH (security_invoker = true) AS
SELECT 
    v.*,
    -- Buscar nome do Dentista
    COALESCE(
        d1.nome,
        'Não definido'
    ) as dentista_nome,
    -- Buscar nome do Protético
    COALESCE(
        p.nome, 
        'Não definido'
    ) as protetico_nome,
    -- Laboratório
    p.laboratorio as protetico_laboratorio
FROM v_todos_procedimentos_full v
LEFT JOIN dentistas d1 ON v.dentista_id = d1.id
LEFT JOIN proteticos p ON v.protetico_id = p.id;

NOTIFY pgrst, 'reload schema';
