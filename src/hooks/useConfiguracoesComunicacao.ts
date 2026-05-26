import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface ConfiguracaoComunicacao {
  id: string;
  user_id: string;
  confirmacao_ativa: boolean;
  confirmacao_horas_antes: number;
  confirmacao_canal: "whatsapp" | "sms";
  lembrete_ativo: boolean;
  lembrete_horas_antes: number;
  lembrete_canal: "whatsapp" | "sms";
  alerta_saldo_ativo: boolean;
}

const defaults: Omit<ConfiguracaoComunicacao, "id" | "user_id"> = {
  confirmacao_ativa: false,
  confirmacao_horas_antes: 24,
  confirmacao_canal: "whatsapp",
  lembrete_ativo: false,
  lembrete_horas_antes: 2,
  lembrete_canal: "whatsapp",
  alerta_saldo_ativo: false,
};

export function useConfiguracoesComunicacao() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: config, isLoading } = useQuery({
    queryKey: ["configuracoes-comunicacao", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("configuracoes_comunicacao")
        .select("*")
        .maybeSingle();
      if (error) throw error;
      return (data as ConfiguracaoComunicacao | null) ?? { ...defaults, id: "", user_id: user!.id };
    },
  });

  const saveConfig = useMutation({
    mutationFn: async (values: Partial<Omit<ConfiguracaoComunicacao, "id" | "user_id">>) => {
      const { error } = await supabase
        .from("configuracoes_comunicacao")
        .upsert({ ...values, user_id: user!.id }, { onConflict: "user_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["configuracoes-comunicacao"] });
      toast({ title: "Configurações salvas." });
    },
    onError: (e: any) => toast({ title: "Erro ao salvar configurações", description: e.message, variant: "destructive" }),
  });

  return {
    config: config ?? { ...defaults, id: "", user_id: user?.id ?? "" },
    isLoading,
    saveConfig: (values: Partial<Omit<ConfiguracaoComunicacao, "id" | "user_id">>) => saveConfig.mutateAsync(values),
    isSaving: saveConfig.isPending,
  };
}
