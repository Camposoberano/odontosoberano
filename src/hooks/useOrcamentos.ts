import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type StatusOrcamento =
  | "rascunho"
  | "enviado"
  | "aprovado"
  | "recusado"
  | "contrato_assinado";

export interface OrcamentoItem {
  id: string;
  orcamento_id: string;
  procedimento_id: string | null;
  nome_procedimento: string;
  quantidade: number;
  preco_unitario: number;
  preco_total: number;
  observacao: string | null;
}

export interface Orcamento {
  id: string;
  numero_orcamento: number;
  paciente_id: string | null;
  dentista_id: string | null;
  status: StatusOrcamento;
  desconto_tipo: "percentual" | "valor";
  desconto_valor: number;
  forma_pagamento: string | null;
  parcelas: number;
  total_bruto: number;
  total_liquido: number;
  observacoes: string | null;
  docuseal_submission_id: string | null;
  pdf_url: string | null;
  validade_dias: number;
  data_envio: string | null;
  data_aprovacao: string | null;
  created_at: string;
  updated_at: string;
  // joins
  paciente?: { id: string; nome: string; telefone?: string; email?: string } | null;
  dentista?: { id: string; nome: string } | null;
  orcamento_itens?: OrcamentoItem[];
}

export interface NovoOrcamentoInput {
  paciente_id?: string;
  dentista_id?: string;
  status?: StatusOrcamento;
  desconto_tipo?: "percentual" | "valor";
  desconto_valor?: number;
  forma_pagamento?: string;
  parcelas?: number;
  total_bruto?: number;
  total_liquido?: number;
  observacoes?: string;
  validade_dias?: number;
}

export interface NovoItemInput {
  procedimento_id?: string;
  nome_procedimento: string;
  quantidade: number;
  preco_unitario: number;
  preco_total: number;
  observacao?: string;
}

const QUERY_KEY = "orcamentos";

export function useOrcamentos() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const lista = useQuery({
    queryKey: [QUERY_KEY],
    queryFn: async (): Promise<Orcamento[]> => {
      const { data, error } = await supabase
        .from("orcamentos")
        .select(`
          *,
          paciente:pacientes(id, nome, telefone, email),
          dentista:dentistas(id, nome),
          orcamento_itens(*)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as unknown as Orcamento[];
    },
  });

  const criar = useMutation({
    mutationFn: async (input: NovoOrcamentoInput): Promise<Orcamento> => {
      const { data, error } = await supabase
        .from("orcamentos")
        .insert(input)
        .select(`
          *,
          paciente:pacientes(id, nome, telefone, email),
          dentista:dentistas(id, nome),
          orcamento_itens(*)
        `)
        .single();

      if (error) throw error;
      return data as unknown as Orcamento;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast({ title: "Orçamento criado com sucesso" });
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao criar orçamento", description: err.message, variant: "destructive" });
    },
  });

  const atualizar = useMutation({
    mutationFn: async ({ id, ...input }: NovoOrcamentoInput & { id: string }): Promise<Orcamento> => {
      const { data, error } = await supabase
        .from("orcamentos")
        .update(input)
        .eq("id", id)
        .select(`
          *,
          paciente:pacientes(id, nome, telefone, email),
          dentista:dentistas(id, nome),
          orcamento_itens(*)
        `)
        .single();

      if (error) throw error;
      return data as unknown as Orcamento;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao atualizar orçamento", description: err.message, variant: "destructive" });
    },
  });

  const mudarStatus = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: StatusOrcamento;
    }) => {
      const extra: Record<string, unknown> = {};
      if (status === "enviado") extra.data_envio = new Date().toISOString();
      if (status === "aprovado") extra.data_aprovacao = new Date().toISOString();

      const { error } = await supabase
        .from("orcamentos")
        .update({ status, ...extra })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast({ title: "Status atualizado" });
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao mudar status", description: err.message, variant: "destructive" });
    },
  });

  const deletar = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("orcamentos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast({ title: "Orçamento excluído" });
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao excluir", description: err.message, variant: "destructive" });
    },
  });

  const adicionarItem = useMutation({
    mutationFn: async ({
      orcamentoId,
      item,
    }: {
      orcamentoId: string;
      item: NovoItemInput;
    }): Promise<OrcamentoItem> => {
      const { data, error } = await supabase
        .from("orcamento_itens")
        .insert({ ...item, orcamento_id: orcamentoId })
        .select()
        .single();

      if (error) throw error;
      return data as unknown as OrcamentoItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  const removerItem = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase.from("orcamento_itens").delete().eq("id", itemId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  const atualizarItem = useMutation({
    mutationFn: async ({
      id,
      ...fields
    }: Partial<OrcamentoItem> & { id: string }) => {
      const { error } = await supabase
        .from("orcamento_itens")
        .update(fields)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  return {
    orcamentos: lista.data ?? [],
    isLoading: lista.isLoading,
    isError: lista.isError,
    criar,
    atualizar,
    mudarStatus,
    deletar,
    adicionarItem,
    removerItem,
    atualizarItem,
  };
}

export function useOrcamento(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    enabled: !!id,
    queryFn: async (): Promise<Orcamento | null> => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("orcamentos")
        .select(`
          *,
          paciente:pacientes(id, nome, telefone, email),
          dentista:dentistas(id, nome),
          orcamento_itens(*)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as unknown as Orcamento;
    },
  });
}
