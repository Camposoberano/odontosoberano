import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Marcador {
  id: number;
  nome: string;
  cor: string;
  user_id: string;
}

export const useMarcadores = () => {
  const [marcadores, setMarcadores] = useState<Marcador[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchMarcadores = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("marcadores_agenda" as any)
        .select("*")
        .order("nome", { ascending: true });

      if (error) throw error;
      setMarcadores(data || []);
    } catch (error: any) {
      console.error("Erro ao buscar marcadores:", error);
    } finally {
      setLoading(false);
    }
  };

  const createMarcador = async (nome: string, cor: string) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      const { error } = await supabase
        .from("marcadores_agenda" as any)
        .insert([{ nome, cor, user_id: user.id }]);

      if (error) throw error;
      toast({ title: "Sucesso", description: "Marcador criado com sucesso!" });
      await fetchMarcadores();
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const deleteMarcador = async (id: number) => {
    try {
      const { error } = await supabase
        .from("marcadores_agenda" as any)
        .delete()
        .eq("id", id);

      if (error) throw error;
      await fetchMarcadores();
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchMarcadores();
  }, []);

  return { marcadores, loading, fetchMarcadores, createMarcador, deleteMarcador };
};
