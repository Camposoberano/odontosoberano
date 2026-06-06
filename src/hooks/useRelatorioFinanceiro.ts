import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ReceitaDetalhe {
  id: string;
  paciente: string;
  paciente_id: string | null;
  data: string;
  forma_pagamento: string;
  valor: number;
  categoria: string;
  descricao: string;
}

export interface ContaReceberItem {
  id: string;
  paciente: string;
  valor: number;
  data_vencimento: string;
  status: string;
  descricao: string;
  dias_atraso: number;
}

export interface DadosFinanceiros {
  receitas_total: number;
  despesas_total: number;
  saldo: number;
  contas_receber_pendente: number;
  contas_receber_pendente_count: number;
  contas_pagar_pendente: number;
  contas_pagar_pendente_count: number;
  receitas_por_categoria: { categoria: string; valor: number }[];
  despesas_por_categoria: { categoria: string; valor: number }[];
  fluxo_mensal: { mes: string; receitas: number; despesas: number; saldo: number }[];
  receitas_por_forma_pagamento: { forma: string; valor: number; count: number }[];
  receitas_por_dentista: { dentista: string; valor: number; count: number }[];
  receitas_detalhadas: ReceitaDetalhe[];
  contas_receber_a_entrar: ContaReceberItem[];
}

export const useRelatorioFinanceiro = (dataInicio?: Date, dataFim?: Date) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dadosFinanceiros, setDadosFinanceiros] = useState<DadosFinanceiros>({
    receitas_total: 0,
    despesas_total: 0,
    saldo: 0,
    contas_receber_pendente: 0,
    contas_receber_pendente_count: 0,
    contas_pagar_pendente: 0,
    contas_pagar_pendente_count: 0,
    receitas_por_categoria: [],
    despesas_por_categoria: [],
    fluxo_mensal: [],
    receitas_por_forma_pagamento: [],
    receitas_por_dentista: [],
    receitas_detalhadas: [],
    contas_receber_a_entrar: [],
  });

  const fetchRelatorioFinanceiro = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Buscar contas a receber (recebidas)
      let contasReceberQuery = supabase
        .from('contas_receber')
        .select('id, valor, categoria, data_recebimento, forma_pagamento, descricao, paciente_id')
        .eq('status', 'Recebida')
        .not('data_recebimento', 'is', null);

      if (dataInicio) {
        contasReceberQuery = contasReceberQuery.gte('data_recebimento', dataInicio.toISOString().split('T')[0]);
      }
      if (dataFim) {
        contasReceberQuery = contasReceberQuery.lte('data_recebimento', dataFim.toISOString().split('T')[0]);
      }

      const { data: contasReceber, error: receberError } = await contasReceberQuery;
      if (receberError) throw receberError;

      // Buscar agendamentos realizados
      let agendamentosQuery = supabase
        .from('agendamentos')
        .select('valor, procedimento, data_agendamento, dentista_id')
        .in('status', ['Concluído', 'Realizado'])
        .not('valor', 'is', null);

      if (dataInicio) {
        agendamentosQuery = agendamentosQuery.gte('data_agendamento', dataInicio.toISOString());
      }
      if (dataFim) {
        agendamentosQuery = agendamentosQuery.lte('data_agendamento', dataFim.toISOString());
      }

      const { data: agendamentos, error: agendamentosError } = await agendamentosQuery;
      if (agendamentosError) throw agendamentosError;

      // Buscar contas a pagar (pagas)
      let contasPagarQuery = supabase
        .from('contas_pagar')
        .select('valor, categoria, data_pagamento')
        .eq('status', 'Paga')
        .not('data_pagamento', 'is', null);

      if (dataInicio) {
        contasPagarQuery = contasPagarQuery.gte('data_pagamento', dataInicio.toISOString().split('T')[0]);
      }
      if (dataFim) {
        contasPagarQuery = contasPagarQuery.lte('data_pagamento', dataFim.toISOString().split('T')[0]);
      }

      const { data: contasPagar, error: pagarError } = await contasPagarQuery;
      if (pagarError) throw pagarError;

      // Buscar comissões pagas
      let comissoesQuery = supabase
        .from('comissoes')
        .select('valor_comissao, data_pagamento')
        .eq('status', 'Paga')
        .not('data_pagamento', 'is', null);

      if (dataInicio) {
        comissoesQuery = comissoesQuery.gte('data_pagamento', dataInicio.toISOString().split('T')[0]);
      }
      if (dataFim) {
        comissoesQuery = comissoesQuery.lte('data_pagamento', dataFim.toISOString().split('T')[0]);
      }

      const { data: comissoes, error: comissoesError } = await comissoesQuery;
      if (comissoesError) throw comissoesError;

      // Contas a receber pendentes (sem join — FK não existe)
      const { data: contasReceberPendentes } = await supabase
        .from('contas_receber')
        .select('id, valor, data_vencimento, descricao, paciente_id, status')
        .in('status', ['Pendente', 'Vencida'])
        .order('data_vencimento', { ascending: true });

      // Contas a pagar pendentes
      const { data: contasPagarPendentes } = await supabase
        .from('contas_pagar')
        .select('valor, status')
        .in('status', ['Pendente', 'Vencida']);

      // Dentistas para mapear nomes
      const { data: dentistas } = await supabase
        .from('dentistas')
        .select('id, nome');

      // Nomes de pacientes — coleta todos os IDs únicos das duas queries
      const pacienteIds = [
        ...new Set([
          ...(contasReceber || []).map(c => c.paciente_id).filter(Boolean),
          ...(contasReceberPendentes || []).map(c => c.paciente_id).filter(Boolean),
        ]),
      ] as string[];

      let pacientesById = new Map<string, string>();
      if (pacienteIds.length > 0) {
        const { data: pacs } = await supabase
          .from('pacientes')
          .select('id, nome')
          .in('id', pacienteIds);
        if (pacs) pacs.forEach(p => pacientesById.set(p.id, p.nome));
      }

      // ── Totais ───────────────────────────────────────────────────────────────
      const receitasContas = (contasReceber || []).reduce((sum, c) => sum + Number(c.valor || 0), 0);
      const receitasAgendamentos = (agendamentos || []).reduce((sum, a) => sum + Number(a.valor || 0), 0);
      const receitasTotal = receitasContas + receitasAgendamentos;

      const despesasContas = (contasPagar || []).reduce((sum, c) => sum + Number(c.valor || 0), 0);
      const despesasComissoes = (comissoes || []).reduce((sum, c) => sum + Number(c.valor_comissao || 0), 0);
      const despesasTotal = despesasContas + despesasComissoes;

      const saldo = receitasTotal - despesasTotal;

      // Pendências
      const contasReceberPendente = (contasReceberPendentes || []).reduce((sum, c) => sum + Number(c.valor || 0), 0);
      const contasReceberPendenteCount = (contasReceberPendentes || []).length;
      const contasPagarPendente = (contasPagarPendentes || []).reduce((sum, c) => sum + Number(c.valor || 0), 0);
      const contasPagarPendenteCount = (contasPagarPendentes || []).length;

      // ── Receitas por categoria ────────────────────────────────────────────────
      const receitasPorCategoria = new Map<string, number>();
      (contasReceber || []).forEach(c => {
        const cat = c.categoria || 'Outros';
        receitasPorCategoria.set(cat, (receitasPorCategoria.get(cat) || 0) + Number(c.valor || 0));
      });
      (agendamentos || []).forEach(a => {
        const cat = a.procedimento || 'Outros';
        receitasPorCategoria.set(cat, (receitasPorCategoria.get(cat) || 0) + Number(a.valor || 0));
      });

      // ── Despesas por categoria ────────────────────────────────────────────────
      const despesasPorCategoria = new Map<string, number>();
      (contasPagar || []).forEach(c => {
        const cat = c.categoria || 'Outros';
        despesasPorCategoria.set(cat, (despesasPorCategoria.get(cat) || 0) + Number(c.valor || 0));
      });
      if (despesasComissoes > 0) {
        despesasPorCategoria.set('Comissões', despesasComissoes);
      }

      const receitasPorCategoriaArray = Array.from(receitasPorCategoria.entries())
        .map(([categoria, valor]) => ({ categoria, valor }))
        .sort((a, b) => b.valor - a.valor);

      const despesasPorCategoriaArray = Array.from(despesasPorCategoria.entries())
        .map(([categoria, valor]) => ({ categoria, valor }))
        .sort((a, b) => b.valor - a.valor);

      // ── Fluxo mensal com saldo ────────────────────────────────────────────────
      const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

      const inicioPeriodo = dataInicio
        ? new Date(dataInicio)
        : new Date(new Date().setMonth(new Date().getMonth() - 5));
      inicioPeriodo.setDate(1);
      const fimPeriodo = dataFim ? new Date(dataFim) : new Date();

      const monthKeys: { key: string; label: string }[] = [];
      const cursor = new Date(inicioPeriodo);
      cursor.setHours(0, 0, 0, 0);
      while (cursor <= fimPeriodo) {
        const y = cursor.getFullYear();
        const m = cursor.getMonth();
        const key = `${y}-${String(m + 1).padStart(2, '0')}`;
        monthKeys.push({ key, label: mesesNomes[m] });
        cursor.setMonth(cursor.getMonth() + 1);
        cursor.setDate(1);
      }

      const mensalMap: Record<string, { mes: string; receitas: number; despesas: number; saldo: number }> = {};
      monthKeys.forEach(({ key, label }) => {
        mensalMap[key] = { mes: label, receitas: 0, despesas: 0, saldo: 0 };
      });

      const getMonthKey = (dtStr?: string | null) => {
        if (!dtStr) return null;
        const d = new Date(dtStr);
        if (isNaN(d.getTime())) return null;
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      };

      (contasReceber || []).forEach(c => {
        const key = getMonthKey(c.data_recebimento as any);
        if (key && mensalMap[key]) mensalMap[key].receitas += Number(c.valor || 0);
      });
      (agendamentos || []).forEach(a => {
        const key = getMonthKey(a.data_agendamento as any);
        if (key && mensalMap[key]) mensalMap[key].receitas += Number(a.valor || 0);
      });
      (contasPagar || []).forEach(c => {
        const key = getMonthKey(c.data_pagamento as any);
        if (key && mensalMap[key]) mensalMap[key].despesas += Number(c.valor || 0);
      });
      (comissoes || []).forEach(c => {
        const key = getMonthKey(c.data_pagamento as any);
        if (key && mensalMap[key]) mensalMap[key].despesas += Number(c.valor_comissao || 0);
      });

      // Calcular saldo acumulado por mês
      const fluxoMensal = monthKeys.map(({ key }) => {
        const m = mensalMap[key];
        return { ...m, saldo: m.receitas - m.despesas };
      });

      // ── Receitas por forma de pagamento ───────────────────────────────────────
      const formaMap = new Map<string, { valor: number; count: number }>();
      (contasReceber || []).forEach(c => {
        const forma = c.forma_pagamento || 'Não informado';
        const cur = formaMap.get(forma) || { valor: 0, count: 0 };
        formaMap.set(forma, { valor: cur.valor + Number(c.valor || 0), count: cur.count + 1 });
      });
      const receitasPorFormaPagamento = Array.from(formaMap.entries())
        .map(([forma, { valor, count }]) => ({ forma, valor, count }))
        .sort((a, b) => b.valor - a.valor);

      // ── Receitas por dentista ─────────────────────────────────────────────────
      const dentistaMap = new Map<string, { valor: number; count: number }>();
      const dentistasById = new Map((dentistas || []).map(d => [d.id, d.nome]));
      (agendamentos || []).forEach(a => {
        if (!a.dentista_id) return;
        const nome = dentistasById.get(a.dentista_id) || 'Não identificado';
        const cur = dentistaMap.get(nome) || { valor: 0, count: 0 };
        dentistaMap.set(nome, { valor: cur.valor + Number(a.valor || 0), count: cur.count + 1 });
      });
      const receitasPorDentista = Array.from(dentistaMap.entries())
        .map(([dentista, { valor, count }]) => ({ dentista, valor, count }))
        .sort((a, b) => b.valor - a.valor);

      // ── Receitas detalhadas (quem pagou, quando, como) ────────────────────────
      const receitasDetalhadas: ReceitaDetalhe[] = (contasReceber || [])
        .map(c => ({
          id: c.id,
          paciente: (c.paciente_id ? pacientesById.get(c.paciente_id) : null) ?? 'Não identificado',
          paciente_id: c.paciente_id ?? null,
          data: c.data_recebimento as string,
          forma_pagamento: c.forma_pagamento || 'Não informado',
          valor: Number(c.valor || 0),
          categoria: c.categoria || 'Outros',
          descricao: c.descricao || '',
        }))
        .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

      // ── Contas a receber pendentes (detalhe) ──────────────────────────────────
      const hoje = new Date();
      const contasReceberAEntrar: ContaReceberItem[] = (contasReceberPendentes || [])
        .map(c => {
          const venc = c.data_vencimento ? new Date(c.data_vencimento) : null;
          const diasAtraso = venc ? Math.max(0, Math.floor((hoje.getTime() - venc.getTime()) / 86400000)) : 0;
          return {
            id: c.id,
            paciente: (c.paciente_id ? pacientesById.get(c.paciente_id) : null) ?? 'Não identificado',
            valor: Number(c.valor || 0),
            data_vencimento: c.data_vencimento || '',
            status: c.status || 'Pendente',
            descricao: c.descricao || '',
            dias_atraso: diasAtraso,
          };
        });

      setDadosFinanceiros({
        receitas_total: receitasTotal,
        despesas_total: despesasTotal,
        saldo,
        contas_receber_pendente: contasReceberPendente,
        contas_receber_pendente_count: contasReceberPendenteCount,
        contas_pagar_pendente: contasPagarPendente,
        contas_pagar_pendente_count: contasPagarPendenteCount,
        receitas_por_categoria: receitasPorCategoriaArray,
        despesas_por_categoria: despesasPorCategoriaArray,
        fluxo_mensal: fluxoMensal,
        receitas_por_forma_pagamento: receitasPorFormaPagamento,
        receitas_por_dentista: receitasPorDentista,
        receitas_detalhadas: receitasDetalhadas,
        contas_receber_a_entrar: contasReceberAEntrar,
      });
    } catch (error: any) {
      console.error('Erro ao buscar relatório financeiro:', error);
      toast.error('Erro ao carregar relatório financeiro');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRelatorioFinanceiro();
  }, [user, dataInicio, dataFim]);

  return {
    dadosFinanceiros,
    loading,
    refetch: fetchRelatorioFinanceiro,
  };
};
