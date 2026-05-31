import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { startOfMonth, endOfMonth, startOfDay, endOfDay, subMonths, subDays, addDays, format } from "date-fns";

export const useDashboardStats = () => {
  const { user } = useAuth();

  // Total de Pacientes
  const { data: totalPacientes = 0, isLoading: loadingPacientes } = useQuery({
    queryKey: ["dashboard-total-pacientes", user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;

      const { count, error } = await supabase
        .from("pacientes")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "Ativo");

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user?.id,
  });

  // Agendamentos de hoje
  const { data: agendamentosHoje, isLoading: loadingAgendamentos } = useQuery({
    queryKey: ["dashboard-agendamentos-hoje", user?.id],
    queryFn: async () => {
      if (!user?.id) return { total: 0, confirmados: 0, pendentes: 0 };

      const hoje = new Date();
      const inicioHoje = startOfDay(hoje).toISOString();
      const fimHoje = endOfDay(hoje).toISOString();

      const { data, error } = await supabase
        .from("agendamentos")
        .select("status")
        .eq("user_id", user.id)
        .gte("data_agendamento", inicioHoje)
        .lte("data_agendamento", fimHoje);

      if (error) throw error;

      const confirmados = data?.filter(a => a.status === "2-Confirmado").length || 0;
      const pendentes = data?.filter(a => a.status === "1-Agendado").length || 0;

      return {
        total: data?.length || 0,
        confirmados,
        pendentes,
      };
    },
    enabled: !!user?.id,
  });

  // Faturamento mensal (contas recebidas este mês)
  const { data: faturamentoMensal = 0, isLoading: loadingFaturamento } = useQuery({
    queryKey: ["dashboard-faturamento-mensal", user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;

      const hoje = new Date();
      const inicioMes = startOfMonth(hoje).toISOString();
      const fimMes = endOfMonth(hoje).toISOString();

      const { data, error } = await supabase
        .from("contas_receber")
        .select("valor")
        .eq("user_id", user.id)
        .eq("status", "Recebida")
        .gte("data_recebimento", inicioMes)
        .lte("data_recebimento", fimMes);

      if (error) throw error;

      const total = data?.reduce((sum, item) => sum + Number(item.valor || 0), 0) || 0;
      return total;
    },
    enabled: !!user?.id,
  });

  // Produtos com estoque baixo
  const { data: produtosFalta = 0 } = useQuery({
    queryKey: ["dashboard-produtos-falta", user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;

      const { data, error } = await supabase
        .from("estoque")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;

      // Contar produtos onde estoque atual está abaixo do mínimo
      const produtosAbaixoMinimo = data?.filter(
        item => item.estoque < item.minimo
      ).length || 0;

      return produtosAbaixoMinimo;
    },
    enabled: !!user?.id,
  });

  // Faturamento Previsto (Pendente para o mês atual)
  const { data: faturamentoPrevisto = 0 } = useQuery({
    queryKey: ["dashboard-faturamento-previsto", user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;

      const hoje = new Date();
      const inicioMes = startOfMonth(hoje).toISOString();
      const fimMes = endOfMonth(hoje).toISOString();

      const { data, error } = await supabase
        .from("contas_receber")
        .select("valor")
        .eq("user_id", user.id)
        .eq("status", "Pendente")
        .gte("data_vencimento", inicioMes)
        .lte("data_vencimento", fimMes);

      if (error) throw error;

      return data?.reduce((sum, item) => sum + Number(item.valor || 0), 0) || 0;
    },
    enabled: !!user?.id,
  });

  // Próximos agendamentos do dia
  const { data: proximosAgendamentos = [] } = useQuery({
    queryKey: ["dashboard-proximos-agendamentos", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const hoje = new Date();
      const inicioHoje = startOfDay(hoje).toISOString();
      const fimHoje = endOfDay(hoje).toISOString();

      const { data: agendamentos, error } = await supabase
        .from("agendamentos")
        .select("*")
        .eq("user_id", user.id)
        .gte("data_agendamento", inicioHoje)
        .lte("data_agendamento", fimHoje)
        .order("data_agendamento", { ascending: true })
        .limit(5);

      if (error) throw error;
      if (!agendamentos) return [];

      // Buscar nomes dos pacientes e dentistas
      const pacienteIds = [...new Set(agendamentos.map(a => a.paciente_id))].filter(Boolean) as string[];
      const dentistaIds = [...new Set(agendamentos.map(a => a.dentista_id))].filter(Boolean) as string[];

      const { data: pacientes } = await supabase
        .from("pacientes")
        .select("id, nome")
        .in("id", pacienteIds);

      const { data: dentistas } = await supabase
        .from("dentistas")
        .select("id, nome")
        .in("id", dentistaIds);

      const pacientesMap = new Map(pacientes?.map(p => [p.id, p.nome]) || []);
      const dentistasMap = new Map(dentistas?.map(d => [d.id, d.nome]) || []);

      return agendamentos.map(agendamento => ({
        id: agendamento.id,
        time: new Date(agendamento.data_agendamento).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        patient: pacientesMap.get(agendamento.paciente_id || '') || "Paciente não encontrado",
        dentista: dentistasMap.get(agendamento.dentista_id || '') || "Dentista não identificado",
        procedure: agendamento.procedimento || "Consulta Geral",
        status: agendamento.status || "Agendado",
      }));
    },
    enabled: !!user?.id,
  });

  // Itens de estoque baixo (detalhados)
  const { data: estoqueBaixo = [] } = useQuery({
    queryKey: ["dashboard-estoque-baixo", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("estoque")
        .select("*")
        .eq("user_id", user.id)
        .order("estoque", { ascending: true });

      if (error) throw error;

      // Retornar apenas produtos abaixo do mínimo
      return data?.filter(item => item.estoque < item.minimo)
        .slice(0, 5)
        .map(item => ({
          name: item.item,
          current: item.estoque,
          minimum: item.minimo,
        })) || [];
    },
    enabled: !!user?.id,
  });

  // Débitos em atraso (contas_receber vencidas e não recebidas)
  const { data: debitosAtraso = { count: 0, total: 0 } } = useQuery({
    queryKey: ["dashboard-debitos-atraso", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user?.id) return { count: 0, total: 0 };
      const { data, error } = await supabase
        .from("contas_receber")
        .select("valor")
        .eq("user_id", user.id)
        .neq("status", "Recebida")
        .lt("data_vencimento", new Date().toISOString());
      if (error) throw error;
      return {
        count: data?.length || 0,
        total: data?.reduce((s, r) => s + Number(r.valor || 0), 0) || 0,
      };
    },
  });

  // Orçamentos stats (mês atual)
  const { data: orcamentosStats = { aprovados: 0, reprovados: 0, emAberto: 0 } } = useQuery({
    queryKey: ["dashboard-orcamentos-stats", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user?.id) return { aprovados: 0, reprovados: 0, emAberto: 0 };
      const { data, error } = await supabase
        .from("orcamentos")
        .select("status");
      if (error) throw error;
      return {
        aprovados: data?.filter(o => o.status === "aprovado").length || 0,
        reprovados: data?.filter(o => o.status === "reprovado").length || 0,
        emAberto: data?.filter(o => o.status === "em_aberto").length || 0,
      };
    },
  });

  // Orçamentos por mês (últimos 6 meses) para gráfico
  const { data: orcamentosMensais = [] } = useQuery({
    queryKey: ["dashboard-orcamentos-mensais", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("orcamentos")
        .select("status, created_at")
        .gte("created_at", subMonths(new Date(), 6).toISOString());
      if (error) throw error;
      const meses: Record<string, { mes: string; aprovados: number; reprovados: number; emAberto: number }> = {};
      for (const o of (data || [])) {
        const key = format(new Date(o.created_at), "MM/yyyy");
        const label = format(new Date(o.created_at), "MMM");
        if (!meses[key]) meses[key] = { mes: label, aprovados: 0, reprovados: 0, emAberto: 0 };
        if (o.status === "aprovado") meses[key].aprovados++;
        else if (o.status === "reprovado") meses[key].reprovados++;
        else meses[key].emAberto++;
      }
      return Object.values(meses).slice(-6);
    },
  });

  // Aniversariantes próximos 30 dias
  const { data: aniversariantesCount = 0 } = useQuery({
    queryKey: ["dashboard-aniversariantes", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user?.id) return 0;
      const { data, error } = await supabase
        .from("pacientes")
        .select("data_nascimento")
        .eq("user_id", user.id)
        .not("data_nascimento", "is", null);
      if (error) throw error;
      const hoje = new Date();
      let count = 0;
      for (const p of (data || [])) {
        if (!p.data_nascimento) continue;
        const dn = new Date(p.data_nascimento);
        const aniv = new Date(hoje.getFullYear(), dn.getMonth(), dn.getDate());
        if (aniv < hoje) aniv.setFullYear(hoje.getFullYear() + 1);
        const dias = Math.ceil((aniv.getTime() - hoje.getTime()) / 86400000);
        if (dias <= 30) count++;
      }
      return count;
    },
  });

  // Pacientes novos no mês
  const { data: pacientesNovos = 0 } = useQuery({
    queryKey: ["dashboard-pacientes-novos", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user?.id) return 0;
      const { count, error } = await supabase
        .from("pacientes")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", startOfMonth(new Date()).toISOString());
      if (error) throw error;
      return count || 0;
    },
  });

  // Pacientes atendidos nos últimos 6 meses
  const { data: pacientesAtendidos6M = 0 } = useQuery({
    queryKey: ["dashboard-pacientes-atendidos-6m", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user?.id) return 0;
      const { data, error } = await supabase
        .from("agendamentos")
        .select("paciente_id")
        .eq("user_id", user.id)
        .not("status", "in", '("7-Faltou","6-Atrasado")')
        .gte("data_agendamento", subMonths(new Date(), 6).toISOString());
      if (error) throw error;
      return new Set((data || []).map(a => a.paciente_id).filter(Boolean)).size;
    },
  });

  // Pacientes com tratamento aberto sem agendamento futuro
  const { data: tratamentosAbertosCount = 0 } = useQuery({
    queryKey: ["dashboard-tratamentos-abertos", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user?.id) return 0;
      const [{ data: orcData }, { data: agData }] = await Promise.all([
        supabase.from("orcamentos").select("paciente_id").eq("status", "aprovado"),
        supabase.from("agendamentos").select("paciente_id").eq("user_id", user.id).gte("data_agendamento", new Date().toISOString()).neq("status", "cancelado"),
      ]);
      const comAgend = new Set((agData || []).map(a => a.paciente_id));
      const pacsSemAgend = new Set((orcData || []).filter(o => o.paciente_id && !comAgend.has(o.paciente_id)).map(o => o.paciente_id));
      return pacsSemAgend.size;
    },
  });

  // Agendamentos cancelados recentemente (Tarefas)
  const { data: cancelados = [] } = useQuery({
    queryKey: ["dashboard-cancelados", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("agendamentos")
        .select("id, data_agendamento, procedimento, paciente_id, dentista_id")
        .eq("user_id", user.id)
        .eq("status", "7-Faltou")
        .gte("data_agendamento", subDays(new Date(), 30).toISOString())
        .order("data_agendamento", { ascending: false })
        .limit(20);
      if (error) throw error;
      if (!data?.length) return [];

      const pacIds = [...new Set(data.map(a => a.paciente_id).filter(Boolean))] as string[];
      const dentIds = [...new Set(data.map(a => a.dentista_id).filter(Boolean))] as string[];

      const [{ data: pacs }, { data: dens }] = await Promise.all([
        supabase.from("pacientes").select("id, nome, telefone").in("id", pacIds),
        supabase.from("dentistas").select("id, nome").in("id", dentIds),
      ]);

      const pacsMap = new Map((pacs || []).map(p => [p.id, p]));
      const densMap = new Map((dens || []).map(d => [d.id, d.nome]));

      return data.map(a => ({
        id: a.id,
        data: a.data_agendamento,
        procedimento: a.procedimento || "Consulta",
        paciente: pacsMap.get(a.paciente_id || "")?.nome || "—",
        telefone: pacsMap.get(a.paciente_id || "")?.telefone || null,
        dentista: densMap.get(a.dentista_id || "") || "—",
      }));
    },
  });

  // Ortodontia — pacientes ativos com ortodontia
  const { data: ortodontiaStats = { ativos: 0, novosMes: 0 } } = useQuery({
    queryKey: ["dashboard-ortodontia", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user?.id) return { ativos: 0, novosMes: 0 };
      const { data, error } = await supabase
        .from("orcamentos")
        .select("paciente_id, created_at, status")
        .eq("status", "aprovado");
      if (error) throw error;
      // rough proxy: distinct pacientes with orcamento aprovado this month = novos
      const novosMes = new Set((data || [])
        .filter(o => new Date(o.created_at) >= startOfMonth(new Date()))
        .map(o => o.paciente_id)).size;
      const ativos = new Set((data || []).map(o => o.paciente_id)).size;
      return { ativos, novosMes };
    },
  });

  return {
    stats: {
      totalPacientes,
      agendamentosHoje: agendamentosHoje || { total: 0, confirmados: 0, pendentes: 0 },
      faturamentoMensal,
      faturamentoPrevisto,
      produtosFalta,
    },
    proximosAgendamentos,
    estoqueBaixo,
    debitosAtraso,
    orcamentosStats,
    orcamentosMensais,
    aniversariantesCount,
    pacientesNovos,
    pacientesAtendidos6M,
    tratamentosAbertosCount,
    cancelados,
    ortodontiaStats,
    isLoading: !user?.id || loadingPacientes || loadingAgendamentos || loadingFaturamento,
  };
};
