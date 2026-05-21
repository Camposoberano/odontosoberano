import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAllProcedimentos } from './useProcedimentoGenerico';
import { isBefore, startOfDay, parseISO } from 'date-fns';

export interface Notificacao {
  id: string;
  tipo: 'FALTA' | 'ATRASO_OS' | 'SUCESSO';
  titulo: string;
  mensagem: string;
  data: string;
  lida: boolean;
  link?: string;
}

export function useNotificacoes() {
  const { data: todosProcedimentos } = useAllProcedimentos();

  return useQuery({
    queryKey: ['notificacoes', todosProcedimentos?.length],
    queryFn: async () => {
      const notificacoes: Notificacao[] = [];
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // 1. Buscar agendamentos recentes do tipo "Faltou" (Últimos 15 dias)
      const quinzeDiasAtras = new Date();
      quinzeDiasAtras.setDate(quinzeDiasAtras.getDate() - 15);
      
      const { data: faltas } = await supabase
        .from('agendamentos')
        .select(`
          id, 
          data_agendamento, 
          status,
          pacientes (nome)
        `)
        .eq('user_id', user.id)
        .eq('status', '7-Faltou')
        .gte('data_agendamento', quinzeDiasAtras.toISOString());

      if (faltas) {
        faltas.forEach(falta => {
          notificacoes.push({
            id: `falta-${falta.id}`,
            tipo: 'FALTA',
            titulo: 'Alerta de Falta',
            mensagem: `Paciente ${(falta.pacientes as any)?.nome || 'Desconhecido'} faltou à consulta.`,
            data: falta.data_agendamento,
            lida: false,
            link: '/appointments'
          });
        });
      }

      // 3. Verificar Estoque (abaixo do mínimo)
      const { data: estoque } = await supabase
        .from('estoque')
        .select('*')
        .eq('user_id', user.id);

      if (estoque) {
        estoque.forEach(item => {
          if (item.estoque < item.minimo) {
            notificacoes.push({
              id: `estoque-${item.id}`,
              tipo: 'FALTA',
              titulo: 'Estoque Baixo!',
              mensagem: `${item.item} está com apenas ${item.estoque} unidades (mínimo: ${item.minimo}).`,
              data: new Date().toISOString(),
              lida: false,
              link: '/estoque'
            });
          }
        });
      }

      // Ordenar para mostrar mais urgentes/recentes no topo
      return notificacoes.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
    },
    enabled: todosProcedimentos !== undefined,
    staleTime: 5 * 60 * 1000,
  });
}
