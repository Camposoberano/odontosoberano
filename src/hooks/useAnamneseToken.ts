import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface TokenInfo {
  valid: boolean;
  expired: boolean;
  used: boolean;
  paciente_nome: string | null;
}

export interface AnamneseToken {
  token: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
}

export function buildAnamneseUrl(token: string): string {
  return `${window.location.origin}/belem/anamnese/${token}`;
}

export function useTokenInfo(token: string | undefined) {
  return useQuery({
    queryKey: ["anamnese-token-info", token],
    enabled: !!token,
    retry: false,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_anamnese_token_info", {
        p_token: token!,
      });
      if (error) throw error;
      return data as TokenInfo;
    },
  });
}

export function useActiveTokens(pacienteId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["anamnese-tokens", pacienteId],
    enabled: !!pacienteId && !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("anamnese_tokens" as any)
        .select("token, expires_at, used_at, created_at")
        .eq("paciente_id", pacienteId)
        .order("created_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return (data ?? []) as AnamneseToken[];
    },
  });
}

export function useGenerateAnamneseToken(pacienteId: string, pacienteNome: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from("anamnese_tokens" as any)
        .insert({
          paciente_id: pacienteId,
          user_id: user!.id,
          paciente_nome: pacienteNome,
        })
        .select("token")
        .single();
      if (error) throw error;
      return buildAnamneseUrl((data as { token: string }).token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["anamnese-tokens", pacienteId] });
    },
  });
}
