import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { startOfMonth, endOfMonth, startOfDay, endOfDay } from "date-fns";

export const useDashboardStats = () => {
  const { user } = useAuth();

  // Total de Pacientes
  const { data: totalPacientes = 0 } = useQuery({
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
  const { data: agendamentosHoje } = useQuery({
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

      const confirmados = data?.filter(a => a.status === "Confirmado").length || 0;
      const pendentes = data?.filter(a => a.status === "Agendado").length || 0;

      return {
        total: data?.length || 0,
        confirmados,
        pendentes,
      };
    },
    enabled: !!user?.id,
  });

  // Faturamento mensal (contas recebidas este mês)
  const { data: faturamentoMensal = 0 } = useQuery({
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

  // Novos Status de OS (Otimizado via VIEW)
  const { data: osStats = { emAndamento: 0, atrasadas: 0 } } = useQuery({
    queryKey: ["dashboard-os-stats-v2", user?.id],
    queryFn: async () => {
      if (!user?.id) return { emAndamento: 0, atrasadas: 0 };

      const { data, error } = await (supabase
        .from('v_todos_procedimentos_full' as any)
        .select('status_geral, data_entrega')
        .eq('user_id', user.id)
        .in('status_geral', ['Pendente', 'Em andamento']) as any);

      if (error) {
          console.error("Erro ao buscar estatísticas de OS:", error);
          return { emAndamento: 0, atrasadas: 0 };
      }

      let emAndamento = 0;
      let atrasadas = 0;
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      if (data) {
        (data as any[]).forEach(proc => {
          emAndamento++;
          if (proc.data_entrega) {
            const dataEntrega = new Date(proc.data_entrega);
            if (dataEntrega < hoje) {
              atrasadas++;
            }
          }
        });
      }

      return { emAndamento, atrasadas };
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

  return {
    stats: {
      totalPacientes,
      agendamentosHoje: agendamentosHoje || { total: 0, confirmados: 0, pendentes: 0 },
      faturamentoMensal,
      faturamentoPrevisto,
      produtosFalta,
      osEmAndamento: osStats.emAndamento,
      osAtrasadas: osStats.atrasadas,
    },
    proximosAgendamentos,
    estoqueBaixo,
    isLoading: !user?.id,
  };
};
