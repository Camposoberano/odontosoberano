import { useState, useEffect, useCallback } from "react";
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
  marcadores: Marcador[] | any;
  checkin_responsavel?: string;
  checkin_hora?: string;
  profissional_nome_manual?: string;
  created_at?: string;
  updated_at?: string;
  pacientes?: { nome: string; telefone: string; email: string; };
  dentistas?: { nome: string; };
  proteticos?: { nome: string; };
  convenios?: { nome: string; };
}

export const useAgendamentos = () => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchAgendamentos = useCallback(async (startDate?: Date, endDate?: Date) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error("Usuário não autenticado");

      let query = supabase
        .from("agendamentos")
        .select("*")
        .eq("user_id", user.id)
        .order("data_agendamento", { ascending: true });

      if (startDate) query = query.gte("data_agendamento", startDate.toISOString());
      if (endDate) query = query.lte("data_agendamento", endDate.toISOString());

      const { data, error } = await query;
      if (error) throw error;

      if (data && data.length > 0) {
        const pacienteIds = [...new Set(data.map(a => a.paciente_id))];
        const dentistaIds = [...new Set(data.map(a => a.dentista_id).filter(Boolean))];
        const proteticoIds = [...new Set(data.map(a => a.protetico_id).filter(Boolean))];
        const convenioIds = [...new Set(data.map(a => a.convenio_id).filter(Boolean))];

        const [pacientesData, dentistasData, proteticosData, conveniosData] = await Promise.all([
          supabase.from("pacientes").select("id, nome, telefone, email").in("id", pacienteIds),
          dentistaIds.length > 0
            ? supabase.from("dentistas").select("id, nome").in("id", dentistaIds as string[])
            : Promise.resolve({ data: [] }),
          proteticoIds.length > 0
            ? (supabase as any).from("proteticos").select("id, nome").in("id", proteticoIds)
            : Promise.resolve({ data: [] as any[] }),
          convenioIds.length > 0
            ? supabase.from("convenios").select("id, nome").in("id", convenioIds as string[])
            : Promise.resolve({ data: [] })
        ]);

        const pacientesMap = new Map<string, any>();
        pacientesData.data?.forEach(p => pacientesMap.set(p.id, p));

        const dentistaMap = new Map<string, any>();
        dentistasData.data?.forEach(d => dentistaMap.set(d.id, d));

        const proteticosMap = new Map<number, any>();
        if (proteticosData.data && Array.isArray(proteticosData.data)) {
          proteticosData.data.forEach((p: any) => proteticosMap.set(p.id, p));
        }

        const conveniosMap = new Map<string, any>();
        conveniosData.data?.forEach(c => conveniosMap.set(c.id, c));

        const agendamentosWithRelations = data.map(a => ({
          ...a,
          pacientes: pacientesMap.get(a.paciente_id),
          dentistas: a.dentista_id ? dentistaMap.get(a.dentista_id) : undefined,
          proteticos: a.protetico_id ? proteticosMap.get(a.protetico_id) : undefined,
          convenios: a.convenio_id ? conveniosMap.get(a.convenio_id) : undefined
        }));

        setAgendamentos(agendamentosWithRelations as Agendamento[]);
      } else {
        setAgendamentos([]);
      }
    } catch (error: any) {
      toast({
        title: "Erro ao carregar agendamentos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Realtime: atualiza automaticamente quando há mudanças na tabela
  useEffect(() => {
    const channel = supabase
      .channel('agendamentos-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'agendamentos' },
        () => {
          fetchAgendamentos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAgendamentos]);

  const createAgendamento = async (agendamento: Omit<Agendamento, "id" | "created_at" | "updated_at" | "pacientes" | "dentistas" | "convenios">) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from("agendamentos")
        .insert([{ ...agendamento, user_id: user.id }]);

      if (error) throw error;

      toast({ title: "Agendamento criado", description: "Agendamento cadastrado com sucesso!" });
      await fetchAgendamentos();
    } catch (error: any) {
      toast({ title: "Erro ao criar agendamento", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const updateAgendamento = async (id: string, agendamento: Partial<Agendamento>) => {
    try {
      setLoading(true);
      const { error } = await supabase.from("agendamentos").update(agendamento).eq("id", id);
      if (error) throw error;
      toast({ title: "Agendamento atualizado", description: "Agendamento atualizado com sucesso!" });
      await fetchAgendamentos();
    } catch (error: any) {
      toast({ title: "Erro ao atualizar agendamento", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const deleteAgendamento = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.from("agendamentos").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Agendamento excluído", description: "Agendamento excluído com sucesso!" });
      await fetchAgendamentos();
    } catch (error: any) {
      toast({ title: "Erro ao excluir agendamento", description: error.message, variant: "destructive" });
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
      toast({ title: "Agendamento confirmado", description: "Agendamento confirmado com sucesso!" });
      await fetchAgendamentos();
    } catch (error: any) {
      toast({ title: "Erro ao confirmar agendamento", description: error.message, variant: "destructive" });
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
