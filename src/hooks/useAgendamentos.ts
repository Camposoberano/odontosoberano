import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Marcador {
  id: number;
  nome: string;
  cor: string;
}

export interface Agendamento {
  id: string;
  paciente_id: string;
  dentista_id?: string | null;
  protetico_id?: number | null;
  data_agendamento: string;
  duracao: number;
  procedimento: string;
  status: string;
  tipo_atendimento: string;
  convenio_id?: string;
  valor?: number;
  observacoes?: string;
  confirmado: boolean;
  marcadores: Marcador[] | any; // JSONB array of markers or marker IDs
  checkin_responsavel?: string;
  checkin_hora?: string;
  profissional_nome_manual?: string;
  created_at?: string;
  updated_at?: string;
  pacientes?: {
    nome: string;
    telefone: string;
    email: string;
  };
  dentistas?: {
    nome: string;
  };
  proteticos?: {
    nome: string;
  };
  convenios?: {
    nome: string;
  };
}


export const useAgendamentos = () => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchAgendamentos = async (startDate?: Date, endDate?: Date) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      let query = supabase
        .from("agendamentos")
        .select("*, pacientes(id, nome, telefone, email), dentistas(id, nome), convenios(id, nome)")
        .eq("user_id", user.id)
        .order("data_agendamento", { ascending: true });

      if (startDate) {
        query = query.gte("data_agendamento", startDate.toISOString());
      }
      
      if (endDate) {
        query = query.lte("data_agendamento", endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      // Relacionamentos já vêm do join no select — sem N+1
      setAgendamentos((data ?? []) as unknown as Agendamento[]);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar agendamentos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createAgendamento = async (agendamento: Omit<Agendamento, "id" | "created_at" | "updated_at" | "pacientes" | "dentistas" | "convenios">) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      const { error } = await supabase
        .from("agendamentos")
        .insert([{ ...agendamento, user_id: user.id }]);

      if (error) throw error;

      toast({
        title: "Agendamento criado",
        description: "Agendamento cadastrado com sucesso!",
      });

      await fetchAgendamentos();
    } catch (error: any) {
      toast({
        title: "Erro ao criar agendamento",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateAgendamento = async (id: string, agendamento: Partial<Agendamento>) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("agendamentos")
        .update(agendamento)
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Agendamento atualizado",
        description: "Agendamento atualizado com sucesso!",
      });

      await fetchAgendamentos();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar agendamento",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteAgendamento = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("agendamentos")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Agendamento excluído",
        description: "Agendamento excluído com sucesso!",
      });

      await fetchAgendamentos();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir agendamento",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmarAgendamento = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("agendamentos")
        .update({ confirmado: true, status: "Confirmado" })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Agendamento confirmado",
        description: "Agendamento confirmado com sucesso!",
      });

      await fetchAgendamentos();
    } catch (error: any) {
      toast({
        title: "Erro ao confirmar agendamento",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    agendamentos,
    loading,
    fetchAgendamentos,
    createAgendamento,
    updateAgendamento,
    deleteAgendamento,
    confirmarAgendamento,
  };
};
