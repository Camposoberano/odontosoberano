import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface CategoriaDespesa {
  id: string;
  user_id: string;
  nome: string;
  ativo: boolean;
  created_at: string;
}

export function useCategoriasDespesa() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: categorias = [], isLoading } = useQuery({
    queryKey: ["categorias-despesa", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categorias_despesa")
        .select("*")
        .order("nome");
      if (error) throw error;
      return data as CategoriaDespesa[];
    },
  });

  const createCategoria = useMutation({
    mutationFn: async (nome: string) => {
      const { data, error } = await supabase
        .from("categorias_despesa")
        .insert({ nome, user_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias-despesa"] });
      toast({ title: "Categoria criada com sucesso." });
    },
    onError: (e: any) => toast({ title: "Erro ao criar categoria", description: e.message, variant: "destructive" }),
  });

  const updateCategoria = useMutation({
    mutationFn: async ({ id, nome, ativo }: { id: string; nome?: string; ativo?: boolean }) => {
      const { error } = await supabase
        .from("categorias_despesa")
        .update({ ...(nome !== undefined && { nome }), ...(ativo !== undefined && { ativo }) })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias-despesa"] });
    },
    onError: (e: any) => toast({ title: "Erro ao atualizar categoria", description: e.message, variant: "destructive" }),
  });

  const deleteCategoria = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categorias_despesa").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias-despesa"] });
      toast({ title: "Categoria removida." });
    },
    onError: (e: any) => toast({ title: "Erro ao remover categoria", description: e.message, variant: "destructive" }),
  });

  return {
    categorias,
    isLoading,
    createCategoria: (nome: string) => createCategoria.mutateAsync(nome),
    updateCategoria: (args: { id: string; nome?: string; ativo?: boolean }) => updateCategoria.mutateAsync(args),
    deleteCategoria: (id: string) => deleteCategoria.mutateAsync(id),
    isCreating: createCategoria.isPending,
  };
}
