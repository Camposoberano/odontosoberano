import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  startOfDay, endOfDay, 
  startOfWeek, endOfWeek, 
  startOfMonth, endOfMonth, 
  isWithinInterval, parseISO 
} from 'date-fns';
import { StatusProcedimento } from '@/types/procedimentos';
import { NOME_POR_TIPO } from '@/hooks/useProcedimentoGenerico';

export type PeriodoFiltro = 'hoje' | 'ontem' | '7dias' | 'mes' | 'personalizado';

export interface FiltrosProtese {
  periodo: PeriodoFiltro;
  dataInicio?: Date;
  dataFim?: Date;
  tipoProtese?: string;
  profissionalId?: string;
  statusFinanceiro?: 'Pago' | 'Pendente' | 'Não Pago';
  etapa?: string;
  busca?: string;
  dentistaId?: string;
  proteticoId?: string;
}

export interface ProteseAnalyticItem {
  id: string;
  ordem_servico: number;
  nome_paciente: string;
  paciente_id?: string | null;
  tipo: string;
  status_geral: StatusProcedimento;
  dentista_id?: string | null;
  protetico_id?: number | null;
  dentista_nome?: string;
  protetico_nome?: string;
  valor_lab?: number;
  pagamento_lab_status?: string;
  pagamento_lab_data?: string;
  updated_at: string;
  created_at: string;
  etapa_atual?: string;
  producedInPeriod?: boolean;
}

export function useProteseAnalytics(filtros: FiltrosProtese) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['protese-analytics', filtros, user?.id],
    queryFn: async () => {
      try {
        if (!user?.id) return null;

        const tables = [
          { name: 'procedimentos_ppr', label: 'PPR' },
          { name: 'procedimentos_pt', label: 'Prótese Total' },
          { name: 'procedimentos_pm', label: 'Ponte Móvel' },
          { name: 'procedimentos_fixa', label: 'Fixa Provisória' },
          { name: 'procedimentos_protocolo', label: 'Protocolo' },
          { name: 'procedimentos_fixa_ceramica', label: 'Fixa de Cerâmica' },
          { name: 'procedimentos_fixa_impressa', label: 'Fixa Impressa' },
          { name: 'procedimentos_adesiva', label: 'Adesiva' },
          { name: 'procedimentos_restauracao_indireta', label: 'Restauração Indireta' },
          { name: 'procedimentos_bruxismo', label: 'Placa de Bruxismo' },
          { name: 'procedimentos_clareamento', label: 'Clareamento' },
          { name: 'procedimentos_coroa_implante', label: 'Coroa Sobre Implante' },
          { name: 'procedimentos_fixa_zirconia', label: 'Fixa de Zircônia' },
          { name: 'procedimentos_lab_externo', label: 'Lab Externo' }
        ];

        // 1. Buscar dados básicos de todos os procedimentos via VIEW unificada
        const { data: viewData, error: viewError } = await supabase
          .from('v_todos_procedimentos_full_exp' as any)
          .select('*')
          .eq('user_id', user.id);

        if (viewError) {
          console.error("Erro ao carregar View de Procedimentos:", viewError);
        }

        const nomePorDentistaId: Record<string, string> = {};
        const nomePorProteticoId: Record<string, string> = {};
        
        if (viewData) {
          (viewData as any[]).forEach(v => {
            if (v.dentista_id) nomePorDentistaId[v.dentista_id] = v.dentista_nome || 'Não definido';
            if (v.protetico_id) nomePorProteticoId[v.protetico_id.toString()] = v.protetico_nome || 'Não definido';
          });
        }

        // 2. Buscar dados de ETAPAS das tabelas individuais (Otimizado com filtro de data)
        const individualResults = await Promise.all(
          tables.map(async (table) => {
            try {
              // Reduzir payload buscando apenas o necessário e filtrando por data se possível
              // Nota: Como os campos de data variam por tabela, buscamos tudo mas limitamos por user_id
              let query = supabase
                .from(table.name as any)
                .select('*')
                .eq('user_id', user.id);
              
              const { data, error } = await query;
              
              if (error) {
                console.warn(`Aviso: Tabela ${table.name} ignorada (${error.message})`);
                return { data: null, label: table.label };
              }
              return { data: data as any[], label: table.label };
            } catch (err) {
              console.error(`Erro inesperado na tabela ${table.name}:`, err);
              return { data: null, label: table.label };
            }
          })
        );

        // 3. Unificar tudo para estatísticas
        let allData: ProteseAnalyticItem[] = [];
        if (viewData) {
          allData = (viewData as any[]).map(v => ({
            ...v,
            tipo: NOME_POR_TIPO[v.tipo] || v.tipo,
          }));
        }

        const rawItemsWithStages: (ProteseAnalyticItem & Record<string, any>)[] = [];
        individualResults.forEach((res) => {
          if (res.data) {
            const items = (res.data).map(item => ({
              ...item,
              tipo_label: res.label,
              dentista_nome: nomePorDentistaId[item.dentista_id] || item.dentista_nome || 'Não definido',
              protetico_nome: nomePorProteticoId[item.protetico_id?.toString()] || item.protetico_nome || 'Não definido',
            }));
            rawItemsWithStages.push(...items);
          }
        });

        // Intervalo de datas
        let inicio: Date;
        let fim: Date = endOfDay(new Date());

        switch (filtros.periodo) {
          case 'hoje': inicio = startOfDay(new Date()); break;
          case 'ontem': {
            const ontem = new Date();
            ontem.setDate(ontem.getDate() - 1);
            inicio = startOfDay(ontem);
            fim = endOfDay(ontem);
            break;
          }
          case '7dias': {
            inicio = startOfDay(new Date());
            inicio.setDate(inicio.getDate() - 7);
            break;
          }
          case 'mes': {
            inicio = startOfMonth(new Date());
            fim = endOfMonth(new Date());
            break;
          }
          case 'personalizado': {
            inicio = filtros.dataInicio || startOfMonth(new Date());
            fim = filtros.dataFim || endOfDay(new Date());
            break;
          }
          default: inicio = startOfMonth(new Date());
        }

        // Filtros Gerais
        const filteredData = allData.filter(item => {
          if (filtros.busca) {
            const termo = filtros.busca.toLowerCase();
            const matchPaciente = item.nome_paciente?.toLowerCase().includes(termo);
            const matchOS = item.ordem_servico?.toString().includes(termo);
            if (!matchPaciente && !matchOS) return false;
          }
          if (filtros.dentistaId && item.dentista_id !== filtros.dentistaId) return false;
          if (filtros.proteticoId && item.protetico_id?.toString() !== filtros.proteticoId) return false;
          if (filtros.tipoProtese && item.tipo !== filtros.tipoProtese) return false;
          if (filtros.statusFinanceiro && item.pagamento_lab_status !== filtros.statusFinanceiro) return false;

          const dateStr = item.updated_at || item.created_at;
          if (!dateStr) return false;
          const itemDate = parseISO(dateStr);
          if (isNaN(itemDate.getTime())) return false;
          return isWithinInterval(itemDate, { start: inicio, end: fim });
        });

        // 4. Mapeamento de Ranking por Etapas
        const rankingDoc: Record<string, { nome: string, total: number, etapas: Record<string, number> }> = {};
        const rankingLab: Record<string, { nome: string, total: number, etapas: Record<string, number> }> = {};

        const processedData = rawItemsWithStages.map(item => {
          let producedInPeriod = false;
          const stageMap: Record<string, string> = {
            'moldagem': 'Moldagem',
            'plano_cera': 'Plano de Cera',
            'prova_cera': 'Prova de Cera',
            'prova_dente': 'Prova de Dente',
            'entrega': 'Entrega',
            'vg': 'Gesso',
            'vazamento_gesso': 'Gesso',
            'montagem_dente': 'Montagem',
            'acrilizacao': 'Acrilização',
            'acrilizacao_acabamento': 'Acrilização',
            'ajuste': 'Ajuste'
          };

          Object.keys(item).forEach(key => {
            if (key.endsWith('_status')) {
              const status = item[key];
              const isCompleted = status === 'Finalizado' || status === 'Concluido' || status === 'Procedimento OK';
              if (isCompleted) {
                const executadoEm = item[key.replace('_status', '_executado_em')];
                if (executadoEm) {
                  const dateExec = parseISO(executadoEm);
                  if (!isNaN(dateExec.getTime()) && isWithinInterval(dateExec, { start: inicio, end: fim })) {
                    producedInPeriod = true;
                    const executorNome = item[key.replace('_status', '_executado_por')];
                    const executorId = item[key.replace('_status', '_executor_id')];
                    if (executorNome) {
                      const isUUID = typeof executorId === 'string' && executorId.length > 20;
                      const target = isUUID ? rankingDoc : rankingLab;
                      if (!target[executorNome]) target[executorNome] = { nome: executorNome, total: 0, etapas: {} };
                      target[executorNome].total += 1;
                      const rawLabel = key.replace('_status', '');
                      const label = stageMap[rawLabel] || rawLabel.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                      target[executorNome].etapas[label] = (target[executorNome].etapas[label] || 0) + 1;
                    }
                  }
                }
              }
            }
          });
          return { ...item, producedInPeriod };
        });

        // 5. Filtro de Etapa
        let finalItems = filteredData;
        if (filtros.etapa) {
          finalItems = processedData.filter(item => {
            return Object.keys(item).some(key => {
               if (key.endsWith('_status')) {
                 const status = (item as any)[key];
                 const matchEtapa = key.replace('_status', '').toLowerCase() === filtros.etapa?.toLowerCase();
                 if (matchEtapa && (status === 'Finalizado' || status === 'Concluido' || status === 'Procedimento OK')) {
                   const dateExec = (item as any)[key.replace('_status', '_executado_em')];
                   if (dateExec) {
                     const d = parseISO(dateExec);
                     return isWithinInterval(d, { start: inicio, end: fim });
                   }
                 }
               }
               return false;
            });
          });
        }

        // 6. Estatísticas Finais baseadas em processedData (que tem info de produção no período)
        const stats = {
          totalProduzido: processedData.filter(i => i.producedInPeriod).length,
          totalEntregue: filteredData.filter(i => i.status_geral === 'Concluído').length,
          emProducao: filteredData.filter(i => i.status_geral === 'Em andamento').length,
          totalPago: filteredData
            .filter(i => i.pagamento_lab_status === 'Pago')
            .reduce((acc, current) => acc + (current.valor_lab || 0), 0)
        };

        const porTipo: Record<string, { produzido: number, entregue: number }> = {};
        processedData.forEach(i => {
          if (!porTipo[i.tipo_label]) porTipo[i.tipo_label] = { produzido: 0, entregue: 0 };
          if (i.producedInPeriod) porTipo[i.tipo_label].produzido += 1;
        });
        filteredData.forEach(i => {
          if (!porTipo[i.tipo]) porTipo[i.tipo] = { produzido: porTipo[i.tipo]?.produzido || 0, entregue: 0 };
          if (i.status_geral === 'Concluído') porTipo[i.tipo].entregue += 1;
        });

        const financeiroPorTipo: Record<string, { pago: number, pendente: number, total: number }> = {};
        filteredData.forEach(i => {
          if (!financeiroPorTipo[i.tipo]) financeiroPorTipo[i.tipo] = { pago: 0, pendente: 0, total: 0 };
          if (i.pagamento_lab_status === 'Pago') financeiroPorTipo[i.tipo].pago += i.valor_lab || 0;
          else financeiroPorTipo[i.tipo].pendente += i.valor_lab || 0;
          financeiroPorTipo[i.tipo].total += i.valor_lab || 0;
        });

        const financeiro = {
          pago: filteredData.filter(i => i.pagamento_lab_status === 'Pago').length,
          pendente: filteredData.filter(i => i.pagamento_lab_status !== 'Pago').length,
          valorTotal: filteredData.reduce((acc, curr) => acc + (curr.valor_lab || 0), 0),
          porTipo: financeiroPorTipo
        };

        return {
          items: finalItems as any[],
          stats,
          porTipo,
          rankingDoc: Object.values(rankingDoc).sort((a, b) => b.total - a.total),
          rankingLab: Object.values(rankingLab).sort((a, b) => b.total - a.total),
          financeiro
        };
      } catch (error) {
        console.error("Erro crítico no ProteseAnalytics:", error);
        return null;
      }
    },
    enabled: !!user?.id,
  });
}
