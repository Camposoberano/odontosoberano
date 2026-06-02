-- ============================================================
-- Migration 126: Acesso compartilhado para toda a clínica
-- Todos os usuários autenticados veem e operam todos os dados.
-- user_id mantido nos registros para auditoria.
-- ============================================================

-- Função auxiliar
CREATE OR REPLACE FUNCTION drop_and_open(tbl text) RETURNS void AS $$
BEGIN
  -- Remove políticas restritivas por user_id
  EXECUTE format('DROP POLICY IF EXISTS "Users can view their own %s" ON %I', tbl, tbl);
  EXECUTE format('DROP POLICY IF EXISTS "Users can create their own %s" ON %I', tbl, tbl);
  EXECUTE format('DROP POLICY IF EXISTS "Users can update their own %s" ON %I', tbl, tbl);
  EXECUTE format('DROP POLICY IF EXISTS "Users can delete their own %s" ON %I', tbl, tbl);
  -- Cria política única: qualquer autenticado, acesso total
  EXECUTE format('DROP POLICY IF EXISTS "clinic_shared_access_%s" ON %I', tbl, tbl);
  EXECUTE format(
    'CREATE POLICY "clinic_shared_access_%s" ON %I FOR ALL TO authenticated USING (true) WITH CHECK (true)',
    tbl, tbl
  );
END;
$$ LANGUAGE plpgsql;

-- Tabelas core da clínica
SELECT drop_and_open('agendamentos');
SELECT drop_and_open('anamneses');
SELECT drop_and_open('anamnese_tokens');
SELECT drop_and_open('cheques');
SELECT drop_and_open('comissoes');
SELECT drop_and_open('configuracoes_sistema');
SELECT drop_and_open('contas_pagar');
SELECT drop_and_open('contas_receber');
SELECT drop_and_open('contatos_uteis');
SELECT drop_and_open('convenios');
SELECT drop_and_open('dentistas');
SELECT drop_and_open('documentos');
SELECT drop_and_open('estoque');
SELECT drop_and_open('evolucoes');
SELECT drop_and_open('ficha_clinica');
SELECT drop_and_open('fluxo_caixa');
SELECT drop_and_open('fornecedores');
SELECT drop_and_open('fotos');
SELECT drop_and_open('funcionarios');
SELECT drop_and_open('honorarios');
SELECT drop_and_open('horarios_disponiveis');
SELECT drop_and_open('informacoes_clinica');
SELECT drop_and_open('laboratorio');
SELECT drop_and_open('manuais_codigos');
SELECT drop_and_open('marcadores_agenda');
SELECT drop_and_open('odontograma');
SELECT drop_and_open('ordem_servico');
SELECT drop_and_open('orcamento_itens');
SELECT drop_and_open('orcamentos');
SELECT drop_and_open('ortodontia');
SELECT drop_and_open('pacientes');
SELECT drop_and_open('patrimonio');
SELECT drop_and_open('procedimentos_adesiva');
SELECT drop_and_open('procedimentos_bruxismo');
SELECT drop_and_open('procedimentos_clareamento');
SELECT drop_and_open('procedimentos_coroa_implante');
SELECT drop_and_open('procedimentos_fixa');
SELECT drop_and_open('procedimentos_fixa_ceramica');
SELECT drop_and_open('procedimentos_fixa_impressa');
SELECT drop_and_open('procedimentos_fixa_zirconia');
SELECT drop_and_open('procedimentos_lab_externo');
SELECT drop_and_open('procedimentos_placa');
SELECT drop_and_open('procedimentos_pm');
SELECT drop_and_open('procedimentos_protocolo');
SELECT drop_and_open('procedimentos_pt');
SELECT drop_and_open('procedimentos_pt_pm');
SELECT drop_and_open('procedimentos_restauracao_indireta');
SELECT drop_and_open('profiles');
SELECT drop_and_open('proteticos');
SELECT drop_and_open('radiografias');
SELECT drop_and_open('receituario');
-- Remove função auxiliar
DROP FUNCTION drop_and_open(text);
