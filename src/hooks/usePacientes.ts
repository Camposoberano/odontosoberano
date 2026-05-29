import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Paciente {
  id: string;
  user_id: string;
  nome: string;
  email: string;
  telefone: string;
  data_nascimento?: string | null;
  status: 'Ativo' | 'Inativo';
  endereco?: string | null;
  rua?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  observacao_endereco?: string | null;
  cpf?: string | null;
  cep?: string | null;
  ultima_consulta?: string | null;
  // novos campos
  apelido?: string | null;
  area_tratamento?: string | null;
  genero?: string | null;
  profissao?: string | null;
  como_conheceu?: string | null;
  nome_responsavel?: string | null;
  cpf_responsavel?: string | null;
  telefone_responsavel?: string | null;
  // campos extras (migração 116)
  etiquetas?: string[] | null;
  numero_prontuario?: string | null;
  rede_social?: string | null;
  paciente_estrangeiro?: boolean | null;
  data_nasc_responsavel?: string | null;
  email_responsavel?: string | null;
  plano_id?: string | null;
  numero_carteirinha?: string | null;
  titular_plano?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type CreatePacienteData = Omit<
  Paciente,
  'id' | 'user_id' | 'created_at' | 'updated_at'
>;

export function usePaciente(id: string | undefined) {
  return useQuery({
    queryKey: ["paciente", id],
    enabled: !!id,
    queryFn: async (): Promise<Paciente | null> => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("pacientes")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return { ...data, status: data.status as "Ativo" | "Inativo" };
    },
  });
}

export function usePacientes() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchPacientes = async () => {
    if (!user) {
      setPacientes([]);
      return;
    }
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('pacientes')
        .select('*')
        .eq('status', 'Ativo')
        .order('nome')
        .limit(1000);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      const processedData = (data || []).map(p => ({
        ...p,
        status: p.status as 'Ativo' | 'Inativo'
      }));
      
      setPacientes(processedData);
    } catch (error: any) {
      console.error('fetchPacientes error:', error);
      toast.error('Erro ao carregar pacientes: ' + error.message);
      setPacientes([]);
    } finally {
      setLoading(false);
    }
  };

  const createPaciente = async (pacienteData: CreatePacienteData) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      const sanitizedData = {
        ...pacienteData,
        data_nascimento: pacienteData.data_nascimento || null,
      };

      const { data, error } = await supabase
        .from('pacientes')
        .insert([{
          ...sanitizedData,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      const processedPaciente = {
        ...data,
        status: data.status as 'Ativo' | 'Inativo'
      };
      setPacientes(prev => [...prev, processedPaciente]);
      toast.success('Paciente criado com sucesso!');
      return processedPaciente;
    } catch (error: any) {
      console.error('createPaciente error:', error);
      toast.error('Erro ao criar paciente: ' + error.message);
      throw error;
    }
  };

  const updatePaciente = async (id: string, pacienteData: Partial<CreatePacienteData>) => {
    try {
      const sanitizedData = {
        ...pacienteData,
        data_nascimento: pacienteData.data_nascimento === '' ? null : pacienteData.data_nascimento,
      };

      const { data, error } = await supabase
        .from('pacientes')
        .update(sanitizedData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const processedPaciente = {
        ...data,
        status: data.status as 'Ativo' | 'Inativo'
      };
      setPacientes(prev => prev.map(p => p.id === id ? processedPaciente : p));
      toast.success('Paciente atualizado com sucesso!');
      return processedPaciente;
    } catch (error: any) {
      console.error('updatePaciente error:', error);
      toast.error('Erro ao atualizar paciente: ' + error.message);
      throw error;
    }
  };

  const deletePaciente = async (id: string) => {
    try {
      const { error } = await supabase
        .from('pacientes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPacientes(prev => prev.filter(p => p.id !== id));
      toast.success('Paciente excluído com sucesso!');
    } catch (error: any) {
      console.error('deletePaciente error:', error);
      toast.error('Erro ao excluir paciente: ' + error.message);
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      fetchPacientes();
    } else {
      setPacientes([]);
      setLoading(false);
    }
  }, [user?.id]);

  return {
    pacientes,
    loading,
    createPaciente,
    updatePaciente,
    deletePaciente,
    refetch: fetchPacientes
  };
}