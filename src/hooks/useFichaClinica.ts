import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface FichaClinica {
  id: string;
  user_id: string;
  paciente_id: string;
  contato_emergencia_nome?: string;
  contato_emergencia_telefone?: string;
  contato_emergencia_parentesco?: string;
  queixa_principal?: string;
  historico_medico?: string;
  alergias?: string;
  pressao_arterial?: string;
  temperatura?: string;
  peso?: string;
  exame_extraoral?: string;
  exame_intraoral?: string;
  diagnostico?: string;
  plano_tratamento?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface FichaClinicaInput {
  paciente_id: string;
  contato_emergencia_nome?: string;
  contato_emergencia_telefone?: string;
  contato_emergencia_parentesco?: string;
  queixa_principal?: string;
  historico_medico?: string;
  alergias?: string;
  pressao_arterial?: string;
  temperatura?: string;
  peso?: string;
  exame_extraoral?: string;
  exame_intraoral?: string;
  diagnostico?: string;
  plano_tratamento?: string;
  observacoes?: string;
}

export function useFichaClinica(pacienteId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: fichaClinica, isLoading } = useQuery({
    queryKey: ["ficha_clinica", pacienteId],
    queryFn: async () => {
      if (!user?.id || !pacienteId) return null;

      const { data, error } = await supabase
        .from("ficha_clinica")
        .select("*")
        .eq("paciente_id", pacienteId)
        .maybeSingle();

      if (error) throw error;
      return data as FichaClinica | null;
    },
    enabled: !!user?.id && !!pacienteId,
  });

  const saveFichaClinica = useMutation({
    mutationFn: async (input: FichaClinicaInput) => {
      if (!user?.id) throw new Error("User not authenticated");

      // Upsert atômico — sem race condition (constraint: user_id + paciente_id)
      const { data, error } = await supabase
        .from("ficha_clinica")
        .upsert(
          { ...input, user_id: user.id },
          { onConflict: "user_id,paciente_id" }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_data, input) => {
      // Invalida só a ficha do paciente salvo, não todas
      queryClient.invalidateQueries({ queryKey: ["ficha_clinica", input.paciente_id] });
      toast({
        title: "Ficha salva",
        description: "A ficha clínica foi salva com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a ficha clínica.",
        variant: "destructive",
      });
    },
  });

  return {
    fichaClinica,
    isLoading,
    saveFichaClinica,
  };
}
