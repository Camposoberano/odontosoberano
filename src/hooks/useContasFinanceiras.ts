import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface ContaFinanceira {
  id: string;
  user_id: string;
  nome: string;
  ativo: boolean;
  is_padrao: boolean;
  created_at: string;
}

export function useContasFinanceiras() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: contas = [], isLoading } = useQuery({
    queryKey: ["contas-financeiras", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contas_financeiras")
        .select("*")
        .order("nome");
      if (error) throw error;
      return data as ContaFinanceira[];
    },
  });

  const createConta = useMutation({
    mutationFn: async ({ nome, is_padrao }: { nome: string; is_padrao?: boolean }) => {
      const { data, error } = await supabase
        .from("contas_financeiras")
        .insert({ nome, is_padrao: is_padrao ?? false, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contas-financeiras"] });
      toast({ title: "Conta criada com sucesso." });
    },
    onError: (e: any) => toast({ title: "Erro ao criar conta", description: e.message, variant: "destructive" }),
  });

  const updateConta = useMutation({
    mutationFn: async ({ id, ...fields }: { id: string; nome?: string; ativo?: boolean; is_padrao?: boolean }) => {
      const { error } = await supabase.from("contas_financeiras").update(fields).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["contas-financeiras"] }),
    onError: (e: any) => toast({ title: "Erro ao atualizar conta", description: e.message, variant: "destructive" }),
  });

  const deleteConta = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contas_financeiras").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contas-financeiras"] });
      toast({ title: "Conta removida." });
    },
    onError: (e: any) => toast({ title: "Erro ao remover conta", description: e.message, variant: "destructive" }),
  });

  const setPadrao = useMutation({
    mutationFn: async (id: string) => {
      // Unset all, then set this one
      await supabase.from("contas_financeiras").update({ is_padrao: false }).neq("id", "");
      const { error } = await supabase.from("contas_financeiras").update({ is_padrao: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["contas-financeiras"] }),
    onError: (e: any) => toast({ title: "Erro ao definir padrão", description: e.message, variant: "destructive" }),
  });

  return {
    contas,
    isLoading,
    createConta: (args: { nome: string; is_padrao?: boolean }) => createConta.mutateAsync(args),
    updateConta: (args: { id: string; nome?: string; ativo?: boolean; is_padrao?: boolean }) => updateConta.mutateAsync(args),
    deleteConta: (id: string) => deleteConta.mutateAsync(id),
    setPadrao: (id: string) => setPadrao.mutateAsync(id),
    isCreating: createConta.isPending,
  };
}
