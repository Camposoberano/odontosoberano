import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface AnamneseRecord {
  id: string;
  user_id: string;
  paciente_id: string;
  alergias?: string | null;
  medicamentos_uso?: string | null;
  doencas_sistemicas?: string[] | null;
  historico_cirurgias?: string | null;
  gestante?: boolean | null;
  fumante?: boolean | null;
  alcool?: boolean | null;
  pressao_arterial?: string | null;
  observacoes?: string | null;
  queixa_principal?: string | null;
  habitos?: Record<string, boolean> | null;
  historico_dental?: Record<string, boolean> | null;
  aleitamento?: string | null;
  perfil_facial?: string | null;
  sobremordida?: string | null;
  trespasse_horizontal?: string | null;
  mordida_cruzada?: boolean | null;
  desvio_linha_media?: string | null;
  classe_canino_d?: string | null;
  classe_canino_e?: string | null;
  classe_paciente?: string | null;
  frequencia_respiratoria?: number | null;
  fc_bpm?: number | null;
  alteracao_ganglionar?: boolean | null;
  dados_completos?: Record<string, string> | null;
  alertas_medicos?: string[] | null;
  created_at: string;
  updated_at: string;
}

export function useAnamnese(pacienteId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["anamnese", pacienteId],
    enabled: !!pacienteId && !!user,
    staleTime: 1000 * 60 * 5, // 5 min cache
    queryFn: async (): Promise<AnamneseRecord | null> => {
      const { data, error } = await supabase
        .from("anamneses")
        .select("*")
        .eq("paciente_id", pacienteId!)
        .maybeSingle();

      if (error) {
        if ((error as any).status === 404 || error.message?.includes("relation")) return null;
        throw error;
      }
      return data as AnamneseRecord | null;
    },
  });
}
