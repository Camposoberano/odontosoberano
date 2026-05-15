import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export interface Protetico {
  id: number;
  nome: string;
  especialidade?: string | null;
  telefone?: string | null;
  email?: string | null;
  laboratorio?: string | null;
  ativo: boolean;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export function useProteticos() {
  const [proteticos, setProteticos] = useState<Protetico[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchProteticos = async () => {
    if (!user) {
      setProteticos([]);
      return;
    }
    
    try {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from('proteticos')
        .select('*')
        .order('nome');

      if (error) throw error;
      setProteticos(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar protéticos:', error);
      toast.error('Erro ao carregar protéticos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const createProtetico = async (proteticoData: Omit<Protetico, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return null;
    }

    try {
      const { data, error } = await (supabase as any)
        .from('proteticos')
        .insert([{
          ...proteticoData,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      
      await fetchProteticos();
      toast.success('Protético cadastrado com sucesso!');
      return data;
    } catch (error: any) {
      console.error('Erro ao cadastrar protético:', error);
      toast.error('Erro ao cadastrar protético: ' + error.message);
      return null;
    }
  };

  const updateProtetico = async (id: number, proteticoData: Partial<Protetico>) => {
    try {
      const { error } = await (supabase as any)
        .from('proteticos')
        .update(proteticoData)
        .eq('id', id);

      if (error) throw error;
      
      await fetchProteticos();
      toast.success('Protético atualizado com sucesso!');
      return true;
    } catch (error: any) {
      console.error('Erro ao atualizar protético:', error);
      toast.error('Erro ao atualizar protético: ' + error.message);
      return false;
    }
  };

  const deleteProtetico = async (id: number) => {
    try {
      const { error } = await (supabase as any)
        .from('proteticos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchProteticos();
      toast.success('Protético removido com sucesso!');
      return true;
    } catch (error: any) {
      console.error('Erro ao remover protético:', error);
      toast.error('Erro ao remover protético: ' + error.message);
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchProteticos();
    }
  }, [user?.id]);

  return {
    data: proteticos,
    isLoading: loading,
    createProtetico,
    updateProtetico,
    deleteProtetico,
    refetch: fetchProteticos
  };
}
