-- =========================================================================
-- !!! ATENÇÃO: SCRIPT DE HARD RESET (APAGARÁ TODOS OS DADOS DE TESTE) !!!
-- =========================================================================
-- Use este script apenas para LIMPAR o banco de dados antes da produção.
-- Os usuários e perfis de autenticação (auth.users) NÃO serão deletados.
-- A estrutura das tabelas será completamente preservada.
-- =========================================================================

-- Início da Limpeza
-- O comando CASCADE varre e deleta automaticamente os dados 
-- de outras tabelas que dependem destas (ex: agendamentos e procedimentos_pt 
-- que estão vinculados a pacientes ou dentistas serão zerados juntos).

TRUNCATE TABLE 
    pacientes,
    dentistas,
    doutores,
    proteticos,
    funcionarios,
    convenios,
    fornecedores,
    patrimonio,
    estoque,
    agendamentos,
    ordem_servico,
    historico_procedimentos,
    contas_pagar,
    contas_receber,
    cheques,
    kanban_boards,
    kanban_columns,
    kanban_cards,
    laboratorio,
    fotos,
    radiografias,
    receituario,
    comissoes,
    honorarios,
    pagamentos,
    ficha_clinica
CASCADE;

-- Comentário: Agendamentos e Procedimentos são apagados na cascata acima
-- se tiverem dependência direta de paciente, mas por garantia, se 
-- existir alguma tabela extra de log que você queira limpar, listamos abaixo.

-- DICA MESTRE: Após executar este comando e ver "Success, No rows returned",
-- todas as tabelas estarão limpas e prontas para o uso oficial.
-- Recarregue o dashboard do sistema para ver os contadores zerados.
