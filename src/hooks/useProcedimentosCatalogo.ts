import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ProcedimentoCatalogo {
  id: string;
  codigo_tuss: string | null;
  codigo_vrpo: string | null;
  nome: string;
  categoria: string;
  preco_sugerido: number;
  ativo: boolean;
}

export const CATEGORIAS_PROCEDIMENTOS = [
  "Prevenção e Clínico Geral",
  "Cirurgia",
  "Endodontia",
  "Periodontia",
  "Implantodontia",
  "Ortodontia",
  "HOF",
  "Prótese",
] as const;

export type CategoriaProcedimento = (typeof CATEGORIAS_PROCEDIMENTOS)[number];

interface UseProcedimentosCatalogoOptions {
  categoria?: string;
  busca?: string;
  apenasAtivos?: boolean;
}

export function useProcedimentosCatalogo(options: UseProcedimentosCatalogoOptions = {}) {
  const { categoria, busca, apenasAtivos = true } = options;

  return useQuery({
    queryKey: ["procedimentos_catalogo", { categoria, busca, apenasAtivos }],
    queryFn: async (): Promise<ProcedimentoCatalogo[]> => {
      let query = supabase
        .from("procedimentos_catalogo")
        .select("*")
        .order("categoria")
        .order("nome");

      if (apenasAtivos) {
        query = query.eq("ativo", true);
      }
      if (categoria) {
        query = query.eq("categoria", categoria);
      }
      if (busca && busca.trim().length > 0) {
        query = query.ilike("nome", `%${busca.trim()}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as ProcedimentoCatalogo[];
    },
    staleTime: 1000 * 60 * 30, // catálogo muda raramente — cache 30min
  });
}

export interface CatalogoProcedimentoForm {
  nome: string;
  categoria: string;
  codigo_tuss?: string | null;
  codigo_vrpo?: string | null;
  preco_sugerido: number;
  ativo: boolean;
}

const QUERY_KEY = "procedimentos_catalogo";

export function useCatalogoCRUD() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: [QUERY_KEY] });

  const { data: todos = [], isLoading } = useQuery({
    queryKey: [QUERY_KEY, "admin"],
    queryFn: async (): Promise<ProcedimentoCatalogo[]> => {
      const { data, error } = await supabase
        .from("procedimentos_catalogo")
        .select("*")
        .order("categoria")
        .order("nome");
      if (error) throw error;
      return (data ?? []) as ProcedimentoCatalogo[];
    },
  });

  const criar = useMutation({
    mutationFn: async (form: CatalogoProcedimentoForm) => {
      const { error } = await supabase.from("procedimentos_catalogo").insert([form]);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Procedimento criado!"); invalidate(); },
    onError: (e: any) => toast.error("Erro ao criar: " + e.message),
  });

  const editar = useMutation({
    mutationFn: async ({ id, form }: { id: string; form: Partial<CatalogoProcedimentoForm> }) => {
      const { error } = await supabase.from("procedimentos_catalogo").update(form).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Procedimento atualizado!"); invalidate(); },
    onError: (e: any) => toast.error("Erro ao atualizar: " + e.message),
  });

  const toggleAtivo = useMutation({
    mutationFn: async ({ id, ativo }: { id: string; ativo: boolean }) => {
      const { error } = await supabase.from("procedimentos_catalogo").update({ ativo }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      toast.success(vars.ativo ? "Procedimento ativado!" : "Procedimento desativado!");
      invalidate();
    },
    onError: (e: any) => toast.error("Erro: " + e.message),
  });

  const remover = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("procedimentos_catalogo").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Procedimento removido!"); invalidate(); },
    onError: (e: any) => toast.error("Erro ao remover: " + e.message),
  });

  return { todos, isLoading, criar, editar, toggleAtivo, remover };
}
