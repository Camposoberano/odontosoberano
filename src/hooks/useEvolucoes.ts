import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Evolucao {
  id: string;
  user_id: string;
  paciente_id: string;
  profissional_id?: string | null;
  data: string;
  texto: string;
  assinatura?: string | null;
  created_at: string;
  updated_at: string;
  // join
  dentistas?: { nome: string } | null;
}

export interface CreateEvolucaoData {
  paciente_id: string;
  profissional_id?: string | null;
  data: string;
  texto: string;
  assinatura?: string | null;
}

export function useEvolucoes(pacienteId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: evolucoes = [], isLoading } = useQuery({
    queryKey: ['evolucoes', pacienteId],
    enabled: !!pacienteId && !!user,
    queryFn: async (): Promise<Evolucao[]> => {
      const { data, error } = await supabase
        .from('evolucoes')
        .select('*, dentistas(nome)')
        .eq('paciente_id', pacienteId!)
        .order('data', { ascending: false })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Evolucao[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (evolucaoData: CreateEvolucaoData) => {
      if (!user) throw new Error('Não autenticado');
      const { data, error } = await supabase
        .from('evolucoes')
        .insert([{ ...evolucaoData, user_id: user.id }])
        .select('*, dentistas(nome)')
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evolucoes', pacienteId] });
      toast.success('Evolução registrada!');
    },
    onError: (err: any) => {
      toast.error('Erro ao salvar evolução: ' + err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('evolucoes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evolucoes', pacienteId] });
      toast.success('Evolução excluída.');
    },
    onError: (err: any) => {
      toast.error('Erro ao excluir: ' + err.message);
    },
  });

  return {
    evolucoes,
    isLoading,
    createEvolucao: createMutation.mutate,
    deleteEvolucao: deleteMutation.mutate,
    isCreating: createMutation.isPending,
  };
}
