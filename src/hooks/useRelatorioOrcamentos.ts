import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const STATUS_LABEL: Record<string, string> = {
  rascunho: "Rascunho",
  enviado: "Enviado",
  aprovado: "Aprovado",
  recusado: "Recusado",
  contrato_assinado: "Contrato Assinado",
};

export interface RelatorioOrcamentosData {
  total: number;
  por_status: {
    status: string;
    label: string;
    count: number;
    percentual: number;
    valor_total: number;
  }[];
  taxa_aprovacao: number;
  ticket_medio: number;
  total_aprovado: number;
  total_perdido: number;
  por_mes: {
    mes: string;
    total: number;
    aprovados: number;
    recusados: number;
    valor_aprovado: number;
  }[];
  top_procedimentos: {
    nome: string;
    count: number;
    valor_total: number;
  }[];
  por_dentista: {
    nome: string;
    total: number;
    aprovados: number;
    valor_aprovado: number;
  }[];
}

const EMPTY: RelatorioOrcamentosData = {
  total: 0,
  por_status: [],
  taxa_aprovacao: 0,
  ticket_medio: 0,
  total_aprovado: 0,
  total_perdido: 0,
  por_mes: [],
  top_procedimentos: [],
  por_dentista: [],
};

export function useRelatorioOrcamentos(dataInicio: Date, dataFim: Date) {
  const { data, isLoading } = useQuery({
    queryKey: ["relatorio-orcamentos", dataInicio.toISOString(), dataFim.toISOString()],
    queryFn: async (): Promise<RelatorioOrcamentosData> => {
      const inicio = dataInicio.toISOString().split("T")[0] + "T00:00:00.000Z";
      const fim = dataFim.toISOString().split("T")[0] + "T23:59:59.999Z";

      const { data: orcamentos, error } = await supabase
        .from("orcamentos")
        .select(`
          id, status, total_liquido, created_at,
          dentista:dentistas(nome),
          orcamento_itens(nome_procedimento, preco_total, quantidade)
        `)
        .gte("created_at", inicio)
        .lte("created_at", fim)
        .order("created_at", { ascending: true });

      if (error) throw error;
      if (!orcamentos || orcamentos.length === 0) return EMPTY;

      const total = orcamentos.length;

      // por_status
      const statusMap = new Map<string, { count: number; valor: number }>();
      for (const o of orcamentos) {
        const s = o.status ?? "rascunho";
        const cur = statusMap.get(s) ?? { count: 0, valor: 0 };
        statusMap.set(s, { count: cur.count + 1, valor: cur.valor + (o.total_liquido ?? 0) });
      }
      const por_status = Array.from(statusMap.entries()).map(([status, { count, valor }]) => ({
        status,
        label: STATUS_LABEL[status] ?? status,
        count,
        percentual: total > 0 ? (count / total) * 100 : 0,
        valor_total: valor,
      }));

      // taxa_aprovacao, ticket_medio, totais
      const aprovados = orcamentos.filter((o) => o.status === "aprovado" || o.status === "contrato_assinado");
      const recusados = orcamentos.filter((o) => o.status === "recusado");
      const denominador = aprovados.length + recusados.length;
      const taxa_aprovacao = denominador > 0 ? (aprovados.length / denominador) * 100 : 0;
      const total_aprovado = aprovados.reduce((s, o) => s + (o.total_liquido ?? 0), 0);
      const total_perdido = recusados.reduce((s, o) => s + (o.total_liquido ?? 0), 0);
      const ticket_medio = aprovados.length > 0 ? total_aprovado / aprovados.length : 0;

      // por_mes
      const mesMap = new Map<string, { total: number; aprovados: number; recusados: number; valor_aprovado: number }>();
      for (const o of orcamentos) {
        const mes = format(new Date(o.created_at), "MMM/yy", { locale: ptBR });
        const cur = mesMap.get(mes) ?? { total: 0, aprovados: 0, recusados: 0, valor_aprovado: 0 };
        const isAprov = o.status === "aprovado" || o.status === "contrato_assinado";
        const isRecus = o.status === "recusado";
        mesMap.set(mes, {
          total: cur.total + 1,
          aprovados: cur.aprovados + (isAprov ? 1 : 0),
          recusados: cur.recusados + (isRecus ? 1 : 0),
          valor_aprovado: cur.valor_aprovado + (isAprov ? (o.total_liquido ?? 0) : 0),
        });
      }
      const por_mes = Array.from(mesMap.entries()).map(([mes, v]) => ({ mes, ...v }));

      // top_procedimentos — de todos os orçamentos aprovados
      const procMap = new Map<string, { count: number; valor: number }>();
      for (const o of aprovados) {
        const itens = (o as any).orcamento_itens ?? [];
        for (const item of itens) {
          const nome = item.nome_procedimento ?? "Sem nome";
          const cur = procMap.get(nome) ?? { count: 0, valor: 0 };
          procMap.set(nome, {
            count: cur.count + (item.quantidade ?? 1),
            valor: cur.valor + (item.preco_total ?? 0),
          });
        }
      }
      const top_procedimentos = Array.from(procMap.entries())
        .map(([nome, { count, valor }]) => ({ nome, count, valor_total: valor }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // por_dentista
      const dentMap = new Map<string, { total: number; aprovados: number; valor: number }>();
      for (const o of orcamentos) {
        const nome = (o as any).dentista?.nome ?? "Sem dentista";
        const cur = dentMap.get(nome) ?? { total: 0, aprovados: 0, valor: 0 };
        const isAprov = o.status === "aprovado" || o.status === "contrato_assinado";
        dentMap.set(nome, {
          total: cur.total + 1,
          aprovados: cur.aprovados + (isAprov ? 1 : 0),
          valor: cur.valor + (isAprov ? (o.total_liquido ?? 0) : 0),
        });
      }
      const por_dentista = Array.from(dentMap.entries())
        .map(([nome, { total, aprovados, valor }]) => ({
          nome,
          total,
          aprovados,
          valor_aprovado: valor,
        }))
        .sort((a, b) => b.total - a.total);

      return { total, por_status, taxa_aprovacao, ticket_medio, total_aprovado, total_perdido, por_mes, top_procedimentos, por_dentista };
    },
  });

  return { dados: data ?? EMPTY, loading: isLoading };
}
