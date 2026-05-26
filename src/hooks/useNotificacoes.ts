import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Notificacao {
  id: string;
  tipo: 'FALTA' | 'ESTOQUE' | 'SUCESSO';
  titulo: string;
  mensagem: string;
  data: string;
  lida: boolean;
  link?: string;
}

export function useNotificacoes() {
  return useQuery({
    queryKey: ['notificacoes'],
    queryFn: async () => {
      const notificacoes: Notificacao[] = [];
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Faltas nos últimos 15 dias (status "7-Faltou", sem join FK)
      const quinzeDiasAtras = new Date();
      quinzeDiasAtras.setDate(quinzeDiasAtras.getDate() - 15);

      const { data: faltas } = await supabase
        .from('agendamentos')
        .select('id, data_agendamento, status, paciente_id')
        .eq('user_id', user.id)
        .eq('status', '7-Faltou')
        .gte('data_agendamento', quinzeDiasAtras.toISOString());

      if (faltas?.length) {
        // Buscar nomes dos pacientes separadamente
        const pacIds = [...new Set(faltas.map(f => f.paciente_id).filter(Boolean))] as string[];
        const { data: pacs } = await supabase
          .from('pacientes')
          .select('id, nome')
          .in('id', pacIds);
        const pacsMap = new Map((pacs || []).map(p => [p.id, p.nome]));

        faltas.forEach(falta => {
          notificacoes.push({
            id: `falta-${falta.id}`,
            tipo: 'FALTA',
            titulo: 'Alerta de Falta',
            mensagem: `Paciente ${pacsMap.get(falta.paciente_id || '') || 'Desconhecido'} faltou à consulta.`,
            data: falta.data_agendamento,
            lida: false,
            link: '/appointments'
          });
        });
      }

      // Estoque abaixo do mínimo
      const { data: estoque } = await supabase
        .from('estoque')
        .select('*')
        .eq('user_id', user.id);

      if (estoque) {
        estoque.forEach(item => {
          if (item.estoque < item.minimo) {
            notificacoes.push({
              id: `estoque-${item.id}`,
              tipo: 'ESTOQUE',
              titulo: 'Estoque Baixo!',
              mensagem: `${item.item} está com apenas ${item.estoque} unidades (mínimo: ${item.minimo}).`,
              data: new Date().toISOString(),
              lida: false,
              link: '/cadastros/estoque'
            });
          }
        });
      }

      return notificacoes.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
    },
    staleTime: 5 * 60 * 1000,
  });
}
