import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { startOfMonth, endOfMonth } from 'date-fns';

export interface PerformanceItem {
  id: string;
  nome: string;
  totalConcluido: number;
  tipo: 'DENTISTA' | 'PROTETICO';
}

export function usePerformanceStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['performance-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return { dentistas: [], proteticos: [] };

      const tables = [
        'procedimentos_ppr', 'procedimentos_pt_pm', 'procedimentos_fixa',
        'procedimentos_protocolo', 'procedimentos_resina_impressa',
        'procedimentos_ceramica', 'procedimentos_placa',
        'procedimentos_provisorio', 'procedimentos_lab_externo'
      ];

      const hoje = new Date();
      const inicioMes = startOfMonth(hoje).toISOString();
      const fimMes = endOfMonth(hoje).toISOString();

      // Buscar todos os procedimentos concluídos no mês
      let results: any[] = [];
      try {
        results = await Promise.all(
          tables.map(table => 
            supabase
              .from(table as any)
              .select('dentista_id, protetico_id, status_geral, updated_at')
              .eq('user_id', user.id)
              .eq('status_geral', 'Concluído')
              .gte('updated_at', inicioMes)
              .lte('updated_at', fimMes)
          )
        );
      } catch (err) {
        console.error('❌ Falha ao buscar estatísticas de tabelas:', err);
        return { dentistas: [], proteticos: [] };
      }

      const dentistaCount: Record<string, number> = {};
      const proteticoCount: Record<string, number> = {};

      results.forEach(({ data }) => {
        if (data) {
          (data as any[]).forEach(proc => {
            if (proc.dentista_id) {
              dentistaCount[proc.dentista_id] = (dentistaCount[proc.dentista_id] || 0) + 1;
            }
            if (proc.protetico_id) {
              proteticoCount[proc.protetico_id] = (proteticoCount[proc.protetico_id] || 0) + 1;
            }
          });
        }
      });

      // Buscar nomes dos profissionais
      const dentistaIds = Object.keys(dentistaCount);
      const proteticoIds = Object.keys(proteticoCount);

      if (dentistaIds.length === 0 && proteticoIds.length === 0) {
        return { dentistas: [], proteticos: [] };
      }

      let dentistasData: any[] = [];
      let proteticosData: any[] = [];

      try {
        const [resDentistas, resProteticos] = await Promise.all([
          dentistaIds.length > 0 
            ? (supabase as any).from('dentistas').select('id, nome').in('id', dentistaIds)
            : Promise.resolve({ data: [] }),
          proteticoIds.length > 0
            ? (supabase as any).from('proteticos').select('id, nome').in('id', proteticoIds)
            : Promise.resolve({ data: [] })
        ]);
        
        dentistasData = resDentistas.data || [];
        proteticosData = resProteticos.data || [];
      } catch (err) {
        console.error('❌ Falha ao buscar nomes de profissionais:', err);
      }

      const performanceDentistas = (dentistasData || []).map((d: any) => ({
        id: d.id,
        nome: d.nome,
        totalConcluido: dentistaCount[d.id] || 0,
        tipo: 'DENTISTA' as const
      })).sort((a: any, b: any) => b.totalConcluido - a.totalConcluido);

      const performanceProteticos = (proteticosData || []).map((p: any) => ({
        id: p.id,
        nome: p.nome,
        totalConcluido: proteticoCount[p.id] || 0,
        tipo: 'PROTETICO' as const
      })).sort((a: any, b: any) => b.totalConcluido - a.totalConcluido);

      return {
        dentistas: performanceDentistas,
        proteticos: performanceProteticos
      };
    },
    enabled: !!user?.id,
  });
}
