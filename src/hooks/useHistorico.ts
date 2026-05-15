import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface HistoricoItem {
  id: string;
  user_id: string;
  paciente_id?: string;
  procedimento_id?: string;
  tipo_procedimento?: string;
  ordem_servico?: number;
  usuario_nome: string;
  acao: string;
  detalhes?: string;
  tipo: 'STATUS' | 'TECNICA' | 'FINANCEIRO' | 'SISTEMA';
  data: string;
}

export function useHistorico(procedimentoId?: string, tipoProcedimento?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: itens = [], isLoading } = useQuery({
    queryKey: ['historico', procedimentoId, tipoProcedimento],
    queryFn: async () => {
      if (!procedimentoId || !tipoProcedimento) return [];

      const { data, error } = await (supabase as any)
        .from('historico_atividades')
        .select('*')
        .eq('procedimento_id', procedimentoId)
        .eq('tipo_procedimento', tipoProcedimento)
        .order('data', { ascending: false });

      if (error) {
        console.error('Erro ao buscar histórico:', error);
        return [];
      }

      return data as HistoricoItem[];
    },
    enabled: !!procedimentoId && !!tipoProcedimento,
  });

  const adicionarEvento = useMutation({
    mutationFn: async (evento: Omit<HistoricoItem, 'id' | 'user_id' | 'data'>) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await (supabase as any)
        .from('historico_atividades')
        .insert({
          ...evento,
          user_id: user.id,
          data: new Date().toISOString(),
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['historico', procedimentoId, tipoProcedimento] });
    },
    onError: (error) => {
      console.error('Erro ao registrar histórico:', error);
    }
  });

  return {
    itens,
    isLoading,
    adicionarEvento: adicionarEvento.mutateAsync
  };
}
