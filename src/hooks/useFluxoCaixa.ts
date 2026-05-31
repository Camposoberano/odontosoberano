import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export type FluxoCaixa = {
  id: string;
  user_id: string;
  tipo: "Entrada" | "Saída";
  descricao: string;
  categoria: string;
  valor: number;
  data_movimentacao: string;
  forma_pagamento?: string;
  observacoes?: string;
  conta_receber_id?: string | null;
  created_at: string;
  updated_at: string;
};

// Previsão: conta a receber Pendente/Vencida mapeada para exibição no fluxo
export type PrevisaoEntrada = {
  id: string;
  tipo: "Previsão";
  descricao: string;
  categoria: string;
  valor: number;
  data_movimentacao: string; // = data_vencimento
  status: "Pendente" | "Vencida";
  paciente_id?: string | null;
  orcamento_id?: string | null;
  orcamento?: { id: string; numero_orcamento: number } | null;
};

export function useFluxoCaixa() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: movimentacoes = [], isLoading } = useQuery({
    queryKey: ["fluxo_caixa"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fluxo_caixa")
        .select("*")
        .order("data_movimentacao", { ascending: false });

      if (error) throw error;
      return data as FluxoCaixa[];
    },
    enabled: !!user,
  });

  // Contas a receber Pendente/Vencida como previsão de entradas
  const { data: previsoes = [], isLoading: isLoadingPrevisoes } = useQuery({
    queryKey: ["fluxo_caixa_previsoes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contas_receber")
        .select("*, orcamento:orcamentos(id, numero_orcamento)")
        .in("status", ["Pendente", "Vencida"])
        .order("data_vencimento", { ascending: true });

      if (error) throw error;
      return (data ?? []).map((c: any): PrevisaoEntrada => ({
        id: c.id,
        tipo: "Previsão",
        descricao: c.descricao,
        categoria: c.categoria,
        valor: c.valor,
        data_movimentacao: c.data_vencimento,
        status: c.status,
        paciente_id: c.paciente_id,
        orcamento_id: c.orcamento_id,
        orcamento: c.orcamento,
      }));
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<FluxoCaixa, "id" | "user_id" | "created_at" | "updated_at">) => {
      const { data: result, error } = await supabase
        .from("fluxo_caixa")
        .insert([{ ...data, user_id: user?.id }])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fluxo_caixa"] });
      toast({
        title: "Sucesso",
        description: "Movimentação cadastrada com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao cadastrar movimentação: " + error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<FluxoCaixa> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("fluxo_caixa")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fluxo_caixa"] });
      toast({
        title: "Sucesso",
        description: "Movimentação atualizada com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar movimentação: " + error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("fluxo_caixa")
        .delete()
        .eq("id", id)
        .eq("user_id", user!.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fluxo_caixa"] });
      toast({
        title: "Sucesso",
        description: "Movimentação excluída com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao excluir movimentação: " + error.message,
        variant: "destructive",
      });
    },
  });

  return {
    movimentacoes,
    previsoes,
    isLoading: isLoading || isLoadingPrevisoes,
    createMovimentacao: createMutation.mutateAsync,
    updateMovimentacao: updateMutation.mutateAsync,
    deleteMovimentacao: deleteMutation.mutateAsync,
  };
}
