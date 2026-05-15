import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
