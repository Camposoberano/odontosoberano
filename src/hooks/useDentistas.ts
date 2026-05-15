import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Dentista {
  id: string;
  user_id: string;
  nome: string;
  cro: string;
  especialidade: string;
  telefone: string;
  email: string;
  cpf: string;
  endereco?: string;
  data_nascimento?: string;
  status: 'Ativo' | 'Inativo';
  created_at: string;
  updated_at: string;
}

export interface CreateDentistaData {
  nome: string;
  cro: string;
  especialidade: string;
  telefone: string;
  email: string;
  cpf: string;
  endereco?: string;
  data_nascimento?: string;
  status: 'Ativo' | 'Inativo';
}

export function useDentistas() {
  const [dentistas, setDentistas] = useState<Dentista[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchDentistas = async () => {
    if (!user) {
      console.log('fetchDentistas: no user, returning');
      setDentistas([]);
      return;
    }
    
    try {
      console.log('fetchDentistas: starting fetch for user:', user.id);
      setLoading(true);
      
      const { data, error } = await supabase
        .from('dentistas')
        .select('*')
        .order('nome');

      console.log('fetchDentistas result:', { data, error });
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      const processedData = (data || []).map(d => ({
        ...d,
        status: d.status as 'Ativo' | 'Inativo'
      }));
      
      console.log('Processed data:', processedData);
      setDentistas(processedData);
      console.log('fetchDentistas: dentistas set successfully');
    } catch (error: any) {
      console.error('fetchDentistas error:', error);
      toast.error('Erro ao carregar dentistas: ' + error.message);
      setDentistas([]);
    } finally {
      setLoading(false);
      console.log('fetchDentistas: loading set to false');
    }
  };

  const createDentista = async (dentistaData: CreateDentistaData) => {
    if (!user) return null;

    try {
      const sanitizedData = {
        ...dentistaData,
        data_nascimento: dentistaData.data_nascimento || null,
      };

      const { data, error } = await supabase
        .from('dentistas')
        .insert([{
          ...sanitizedData,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      
      await fetchDentistas();
      toast.success('Dentista cadastrado com sucesso!');
      return data;
    } catch (error: any) {
      console.error('createDentista error:', error);
      
      if (error.code === '23505') {
        const message = error.message.includes('dentistas_cro_key') || error.message.includes('cro')
          ? 'Este CRO já está cadastrado para outro dentista nesta clínica.'
          : error.message.includes('dentistas_cpf_key') || error.message.includes('cpf')
            ? 'Este CPF já está cadastrado para outro dentista nesta clínica.'
            : 'Já existe um registro com estes dados nesta clínica.';
        toast.error('Erro ao cadastrar dentista: ' + message);
      } else {
        toast.error('Erro ao cadastrar dentista: ' + error.message);
      }
      return null;
    }
  };

  const updateDentista = async (id: string, dentistaData: Partial<CreateDentistaData>) => {
    try {
      const sanitizedData = {
        ...dentistaData,
        data_nascimento: dentistaData.data_nascimento === '' ? null : dentistaData.data_nascimento,
      };

      const { error } = await supabase
        .from('dentistas')
        .update(sanitizedData)
        .eq('id', id);

      if (error) throw error;
      
      await fetchDentistas();
      toast.success('Dentista atualizado com sucesso!');
      return true;
    } catch (error: any) {
      console.error('updateDentista error:', error);
      
      if (error.code === '23505') {
        const message = error.message.includes('dentistas_cro_key') || error.message.includes('cro')
          ? 'Este CRO já está cadastrado para outro dentista nesta clínica.'
          : error.message.includes('dentistas_cpf_key') || error.message.includes('cpf')
            ? 'Este CPF já está cadastrado para outro dentista nesta clínica.'
            : 'Já existe um registro com estes dados nesta clínica.';
        toast.error('Erro ao atualizar dentista: ' + message);
      } else {
        toast.error('Erro ao atualizar dentista: ' + error.message);
      }
      return false;
    }
  };

  const deleteDentista = async (id: string) => {
    try {
      const { error } = await supabase
        .from('dentistas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchDentistas();
      toast.success('Dentista removido com sucesso!');
      return true;
    } catch (error: any) {
      toast.error('Erro ao remover dentista: ' + error.message);
      return false;
    }
  };

  // Carregar dados quando o usuário estiver disponível
  useEffect(() => {
    if (user) {
      console.log('useEffect triggered, user:', user.id);
      fetchDentistas();
    } else {
      console.log('useEffect: no user, clearing data');
      setDentistas([]);
      setLoading(false);
    }
  }, [user?.id]); // Dependência específica no ID do usuário

  return {
    dentistas,
    loading,
    createDentista,
    updateDentista,
    deleteDentista,
    refetch: fetchDentistas
  };
}