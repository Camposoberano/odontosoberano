import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Orcamento, OrcamentoItem } from "./useOrcamentos";

export type StatusOS =
  | "pendente"
  | "em_andamento"
  | "concluido"
  | "entregue"
  | "cancelado";

export interface OrdemServicoItem {
  id: string;
  ordem_servico_id: string;
  orcamento_item_id: string | null;
  dente_numero: string | null;
  descricao: string;
  quantidade: number;
  status: string;
  created_at: string;
}

export interface OrdemServico {
  id: string;
  numero_os: number;
  orcamento_id: string | null;
  paciente_id: string | null;
  dentista_id: string | null;
  protetico_id: number | null;
  status: StatusOS;
  prazo: string | null;
  cor_dente: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
  paciente?: { id: string; nome: string; telefone?: string } | null;
  dentista?: { id: string; nome: string } | null;
  protetico?: { id: number; nome: string } | null;
  orcamento?: { id: string; numero_orcamento: number } | null;
  ordem_servico_itens?: OrdemServicoItem[];
}

const QUERY_KEY = "ordens_servico";

export const STATUS_OS_CONFIG: Record<
  StatusOS,
  { label: string; color: string; bgColor: string }
> = {
  pendente:    { label: "Pendente",    color: "text-yellow-700", bgColor: "bg-yellow-50" },
  em_andamento:{ label: "Em Andamento",color: "text-blue-700",   bgColor: "bg-blue-50" },
  concluido:   { label: "Concluído",   color: "text-green-700",  bgColor: "bg-green-50" },
  entregue:    { label: "Entregue",    color: "text-purple-700", bgColor: "bg-purple-50" },
  cancelado:   { label: "Cancelado",   color: "text-red-700",    bgColor: "bg-red-50" },
};

export function useOrdensServico() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const lista = useQuery({
    queryKey: [QUERY_KEY],
    queryFn: async (): Promise<OrdemServico[]> => {
      const { data, error } = await supabase
        .from("ordens_servico")
        .select(`
          *,
          paciente:pacientes(id, nome),
          dentista:dentistas(id, nome),
          protetico:proteticos(id, nome),
          orcamento:orcamentos(id, numero_orcamento),
          ordem_servico_itens(*)
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as OrdemServico[];
    },
  });

  const criarOSFromOrcamento = useMutation({
    mutationFn: async ({
      orcamento,
      itens,
    }: {
      orcamento: Orcamento;
      itens: OrcamentoItem[];
    }): Promise<{ id: string; numero_os: number }> => {
      const { data: os, error: osErr } = await supabase
        .from("ordens_servico")
        .insert({
          orcamento_id: orcamento.id,
          paciente_id: orcamento.paciente_id,
          dentista_id: orcamento.dentista_id,
          status: "pendente",
        })
        .select("id, numero_os")
        .single();
      if (osErr) throw osErr;

      if (itens.length > 0) {
        const osItens = itens.map((item) => ({
          ordem_servico_id: os.id,
          orcamento_item_id: item.id,
          dente_numero: item.dente_numero ?? null,
          descricao: item.nome_procedimento,
          quantidade: item.quantidade,
          status: "pendente",
        }));
        const { error: itensErr } = await supabase
          .from("ordem_servico_itens")
          .insert(osItens);
        if (itensErr) throw itensErr;
      }

      return os as { id: string; numero_os: number };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (err: Error) => {
      toast({
        title: "Erro ao criar OS",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const atualizar = useMutation({
    mutationFn: async ({
      id,
      ...campos
    }: {
      id: string;
      protetico_id?: number | null;
      prazo?: string | null;
      cor_dente?: string | null;
      observacoes?: string | null;
    }) => {
      const { error } = await supabase
        .from("ordens_servico")
        .update({ ...campos, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast({ title: "OS atualizada" });
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao atualizar OS", description: err.message, variant: "destructive" });
    },
  });

  const mudarStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: StatusOS }) => {
      const { error } = await supabase
        .from("ordens_servico")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast({ title: "Status da OS atualizado" });
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao atualizar status", description: err.message, variant: "destructive" });
    },
  });

  const deletar = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ordens_servico").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast({ title: "OS removida" });
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao remover OS", description: err.message, variant: "destructive" });
    },
  });

  return {
    ordensServico: lista.data ?? [],
    isLoading: lista.isLoading,
    criarOSFromOrcamento,
    atualizar,
    mudarStatus,
    deletar,
  };
}

export function useOrdemServico(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    enabled: !!id,
    queryFn: async (): Promise<OrdemServico> => {
      const { data, error } = await supabase
        .from("ordens_servico")
        .select(`
          *,
          paciente:pacientes(id, nome, telefone),
          dentista:dentistas(id, nome),
          protetico:proteticos(id, nome),
          orcamento:orcamentos(id, numero_orcamento),
          ordem_servico_itens(*)
        `)
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data as unknown as OrdemServico;
    },
  });
}
