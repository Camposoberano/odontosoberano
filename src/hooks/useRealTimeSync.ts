import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useRealTimeSync = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log('🔄 Inicializando Supabase Real-time Sync...');

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        (payload) => {
          console.log('📡 Real-time Payload Recebido:', payload);

          // Identificar a tabela que mudou
          const table = payload.table;
          
          // Invalida o cache baseado na tabela afetada para forçar re-fetch
          switch (table) {
            case 'clientes':
              queryClient.invalidateQueries({ queryKey: ['clientes'] });
              queryClient.invalidateQueries({ queryKey: ['pacientes'] }); // Caso tenha alias
              toast.info('Base de pacientes atualizada em tempo real.');
              break;
            case 'pedidos':
              queryClient.invalidateQueries({ queryKey: ['pedidos'] });
              break;
            case 'interacoes':
              queryClient.invalidateQueries({ queryKey: ['interacoes'] });
              break;
            case 'tarefas':
              queryClient.invalidateQueries({ queryKey: ['tarefas'] });
              break;
            case 'notas':
              queryClient.invalidateQueries({ queryKey: ['notas'] });
              break;
            // Tabelas de Procedimentos (Odonto Pro)
            case 'procedimentos_ppr':
            case 'procedimentos_pt_pm':
            case 'procedimentos_fixa':
              queryClient.invalidateQueries({ queryKey: ['procedimentos'] });
              break;
            default:
              // Para tabelas genéricas, pode-se tentar invalidar a queryKey com o nome da tabela
              queryClient.invalidateQueries({ queryKey: [table] });
              break;
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Conectado ao Supabase Real-time com sucesso!');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};
