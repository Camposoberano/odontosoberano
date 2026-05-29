import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { TipoDocumento } from '@/utils/documentoUtils';

export interface Documento {
  id: string;
  user_id: string;
  paciente_id: string;
  dentista_id: string | null;
  orcamento_id: string | null;
  tipo: TipoDocumento;
  titulo: string;
  conteudo_json: Record<string, any>;
  pdf_url: string | null;
  assinado_em: string | null;
  assinatura_paciente_url: string | null;
  docuseal_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateDocumentoData {
  paciente_id: string;
  dentista_id?: string;
  orcamento_id?: string;
  tipo: TipoDocumento;
  titulo: string;
  conteudo_json: Record<string, any>;
  pdf_url?: string;
}

export function useDocumentos(pacienteId?: string) {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchDocumentos = async (pid: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('documentos')
        .select('*')
        .eq('paciente_id', pid)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setDocumentos(data as unknown as Documento[]);
    } catch (err: any) {
      console.error('useDocumentos fetch:', err);
      toast.error('Erro ao carregar documentos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && pacienteId) {
      fetchDocumentos(pacienteId);
    } else {
      setLoading(false);
      setDocumentos([]);
    }
  }, [user, pacienteId]);

  const createDocumento = async (data: CreateDocumentoData): Promise<Documento | undefined> => {
    if (!user) { toast.error('Usuário não autenticado'); return; }
    try {
      const { data: result, error } = await supabase
        .from('documentos')
        .insert([{ ...data, user_id: user.id }])
        .select()
        .single();
      if (error) throw error;
      const doc = result as unknown as Documento;
      setDocumentos(prev => [doc, ...prev]);
      toast.success('Documento salvo!');
      return doc;
    } catch (err: any) {
      console.error('useDocumentos create:', err);
      toast.error('Erro ao salvar documento');
    }
  };

  const deleteDocumento = async (id: string) => {
    try {
      const { error } = await supabase.from('documentos').delete().eq('id', id);
      if (error) throw error;
      setDocumentos(prev => prev.filter(d => d.id !== id));
      toast.success('Documento excluído');
    } catch (err: any) {
      console.error('useDocumentos delete:', err);
      toast.error('Erro ao excluir documento');
    }
  };

  const refetch = () => {
    if (user && pacienteId) fetchDocumentos(pacienteId);
  };

  return { documentos, loading, createDocumento, deleteDocumento, refetch };
}
