import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient, useQueries } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  TipoProcedimento, 
  StatusEtapa, 
  ETAPAS_PPR, 
  ETAPAS_PT, 
  ETAPAS_PM,
  ETAPAS_PROTOCOLO,
  ETAPAS_PROTOCOLO_PROVISORIO,
  ETAPAS_FIXA,
  ETAPAS_FIXA_CERAMICA,
  ETAPAS_FIXA_IMPRESSA,
  ETAPAS_ADESIVA,
  ETAPAS_RESTAURACAO_INDIRETA,
  ETAPAS_BRUXISMO,
  ETAPAS_CLAREAMENTO,
  ETAPAS_LAB_EXTERNO,
  ETAPAS_COROA_IMPLANTE,
  ETAPAS_FIXA_ZIRCONIA,
  TipoExecutor 
} from '@/types/procedimentos';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast'; 
import { ensureOrdemServicoExists } from '@/utils/syncOS';
import { getBrasiliaDateTime } from '@/utils/timezone';

export interface ProcedimentoUnified {
  id: string;
  user_id: string;
  ordem_servico: string | number;
  nome_paciente: string;
  paciente_id: string | null;
  data_inicial: string;
  tipo: string;
  arcada: string | null;
  dente: string | null;
  dentista_id: string | null;
  protetico_id: string | number | null;
  valor_lab: number | null;
  pagamento_lab_status: string | null;
  status_geral: string;
  data_entrega: string | null;
  observacoes: string | null;
  dentista_nome: string | null;
  protetico_nome: string | null;
  protetico_laboratorio: string | null;
  dentista?: { nome: string } | null;
  protetico?: { nome: string, laboratorio: string | null } | null;
}

// Mapeamento de Slugs para Nomes Exibição
export const NOME_POR_TIPO: Record<string, string> = {
  'ppr': 'PPR',
  'pt': 'Prótese Total',
  'pm': 'Ponte Móvel',
  'protocolo-definitivo': 'Protocolo Definitivo',
  'protocolo-provisorio': 'Protocolo Provisório',
  'fixa': 'Fixa Provisória',
  'fixa-ceramica': 'Fixa de Cerâmica',
  'fixa-impressa': 'Fixa Impressa',
  'adesiva': 'Adesiva',
  'restauracao-indireta': 'Restauração Indireta',
  'bruxismo': 'Placa de Bruxismo',
  'clareamento': 'Clareamento',
  'lab-externo': 'Laboratório Externo',
  'coroa-implante': 'Coroa Sobre Implante',
  'fixa-zirconia': 'Fixa de Zircônia',
};

// Mapeamento de Tipo para Tabela
export const TABELA_POR_TIPO: Record<string, string> = {
  'ppr': 'procedimentos_ppr',
  'pt': 'procedimentos_pt',
  'pm': 'procedimentos_pm',
  'protocolo-definitivo': 'procedimentos_protocolo',
  'protocolo-provisorio': 'procedimentos_protocolo',
  'fixa': 'procedimentos_fixa',
  'fixa-ceramica': 'procedimentos_ceramica',
  'fixa-impressa': 'procedimentos_resina_impressa',
  'adesiva': 'procedimentos_provisorio',
  'restauracao-indireta': 'procedimentos_restauracao_indireta',
  'bruxismo': 'procedimentos_bruxismo',
  'clareamento': 'procedimentos_clareamento',
  'lab-externo': 'procedimentos_lab_externo',
  'coroa-implante': 'procedimentos_coroa_implante',
  'fixa-zirconia': 'procedimentos_fixa_zirconia',
};

// Mapeamento de Tipo para Etapas
export const ETAPAS_POR_TIPO: Record<string, any[]> = {
  'ppr': ETAPAS_PPR,
  'pt': ETAPAS_PT,
  'pm': ETAPAS_PM,
  'protocolo-definitivo': ETAPAS_PROTOCOLO,
  'protocolo-provisorio': ETAPAS_PROTOCOLO_PROVISORIO,
  'fixa': ETAPAS_FIXA,
  'fixa-ceramica': ETAPAS_FIXA_CERAMICA,
  'fixa-impressa': ETAPAS_FIXA_IMPRESSA,
  'adesiva': ETAPAS_ADESIVA,
  'restauracao-indireta': ETAPAS_RESTAURACAO_INDIRETA,
  'bruxismo': ETAPAS_BRUXISMO,
  'clareamento': ETAPAS_CLAREAMENTO,
  'lab-externo': ETAPAS_LAB_EXTERNO,
  'coroa-implante': ETAPAS_COROA_IMPLANTE,
  'fixa-zirconia': ETAPAS_FIXA_ZIRCONIA,
};

// Hook Genérico para Listar Procedimentos por Tipo (Usa a View Unificada Expandida)
export function useProcedimentosByType(tipoParam: string) {
  const { user } = useAuth();
  const tipo = (tipoParam?.toLowerCase() || '') as string;

  return useQuery({
    queryKey: ['procedimentos', tipo, user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Usuário não autenticado');

      // Consultamos a View Expandida filtrando pelo tipo para garantir consistência total com o Dashboard
      const { data, error } = await supabase
        .from('v_todos_procedimentos_full_exp' as any)
        .select('*')
        .eq('tipo', tipo)
        .order('ordem_servico', { ascending: false });

      if (error) throw error;
      
      // Mapear estrutura para manter compatibilidade com o formato esperado pelo frontend
      return (data || []).map((p: any) => ({
        ...p,
        dentista: p.dentista_nome ? { nome: p.dentista_nome } : null,
        protetico: p.protetico_nome ? { nome: p.protetico_nome, laboratorio: p.protetico_laboratorio } : null
      }));
    },
    enabled: !!user && !!tipo,
  });
}

export function useProcedimentoById(tipoParam: string, id: string) {
  const { user } = useAuth();
  const tipo = (tipoParam?.toLowerCase() || '') as string;

  return useQuery({
    queryKey: ['procedimento', tipo, id, user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Usuário não autenticado');

      // RESOLUÇÃO DE DADOS: Para o detalhe técnico, precisamos da tabela ORIGINAL
      // pois a view unificada não possui todas as colunas de status de todos os tipos.
      const tabelaReal = TABELA_POR_TIPO[tipo];
      const source = tabelaReal || 'v_todos_procedimentos_full_exp';

      console.log(`Buscando detalhes do procedimento [${tipo}] na tabela/view: ${source}`);

      const { data, error } = await supabase
        .from(source as any)
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Erro ao buscar procedimento por ID:', error);
        throw error;
      }
      return data as any;
    },
    enabled: !!user && !!id,
  });
}

// Hook Genérico para Criar
export function useCreateProcedimento(tipoParam: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const tipo = (tipoParam?.toLowerCase() || '') as string;
  const tabela = TABELA_POR_TIPO[tipo];

  return useMutation({
    mutationFn: async (data: any) => {
      if (!user) throw new Error('Usuário não autenticado');
      if (!tabela) throw new Error(`Tabela não encontrada para o tipo: ${tipo}`);

      if (data.ordem_servico) {
        await ensureOrdemServicoExists(data.ordem_servico, user.id, data.paciente_id, data.dentista_id, data.protetico_id);
      }

      // Sanitização Nuclear: Garante que campos de ID ou financeiros nunca enviem "" para o Postgres
      const sanitizePayload = (obj: any) => {
        const cleaned: any = {};
        Object.entries(obj).forEach(([key, value]) => {
          if (value === "" || value === "none" || value === undefined || value === null) {
            return;
          }
          cleaned[key] = value;
        });
        return cleaned;
      };

      if (!data.paciente_id) {
        throw new Error('Você precisa selecionar um paciente para criar o procedimento.');
      }

      const rawPayload = { 
        ...data, 
        user_id: user.id,
        // RESOLUÇÃO DE TIPO: Extraímos apenas os dígitos para as tabelas técnicas (que são INTEGER no banco)
        // O número completo (ex: 03/PPR) continua existindo apenas na tabela mestre e na UI
        ordem_servico: data.ordem_servico ? String(data.ordem_servico).replace(/\D/g, '') : data.ordem_servico
      };

      // RESOLUÇÃO DE SUBTIPO DE PROTOCOLO: Garante o preenchimento da coluna obrigatória no banco
      if (tipo === 'protocolo-provisorio') {
        rawPayload.tipo_protocolo = 'PROVISORIO';
      } else if (tipo === 'protocolo-definitivo') {
        rawPayload.tipo_protocolo = 'DEFINITIVO';
      }
      
      console.log('Procedimento Mutation - Raw Payload (After Numeric OS Extraction & Protocol Resolution):', rawPayload);
      
      if (rawPayload.dentista_id && rawPayload.dentista_id !== "none") {
        rawPayload.doutor_id = rawPayload.doutor_id || null; 
      }

      // Progressão Automática: Todo novo procedimento já nasce com a primeira etapa "Em andamento" (Amarelo)
      const etapasConfig = ETAPAS_POR_TIPO[tipo];
      if (etapasConfig && etapasConfig.length > 0) {
        const firstEtapaKey = etapasConfig[0].key;
        rawPayload[`${firstEtapaKey}_status`] = 'Em andamento';
        rawPayload.proxima_etapa = etapasConfig[0].label;
        rawPayload.proxima_etapa_responsavel = etapasConfig[0].responsavel;
        console.info(`Criação de Procedimento: Definindo '${etapasConfig[0].label}' como Próxima Ação automática.`);
      }

      const payload = sanitizePayload(rawPayload);
      console.log('Procedimento Mutation - Sanitized Payload:', payload);
      
      const { data: result, error } = await supabase
        .from(tabela as any)
        .insert([payload]) // Usando array para insert
        .select()
        .maybeSingle();

      if (error) {
        console.error('Supabase Procedimento Insert Error:', error);
        throw error;
      }
      
      if (!result) {
        console.warn('Procedimento inserido mas nenhum dado retornado.');
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procedimentos'] });
      toast({ title: 'Sucesso!', description: `Procedimento criado com sucesso` });
    },
    onError: (error: any) => {
      console.error('Final Procedure Mutation Error:', error);
      toast({ 
        title: 'Erro ao salvar', 
        description: error.message || 'Erro desconhecido ao persistir procedimento', 
        variant: 'destructive' 
      });
    },
  });
}

// Hook Genérico para Atualizar Etapa
export function useUpdateEtapaGenerica(tipoParam: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const tipo = (tipoParam?.toLowerCase() || '') as string;
  const tabela = TABELA_POR_TIPO[tipo];
  const etapasConfig = ETAPAS_POR_TIPO[tipo];
  
  return useMutation({
    mutationFn: async ({
      procedimentoId,
      etapaKey,
      status,
      data,
      executorId,
      executorNome,
      tipoExecutor,
      extraData,
    }: {
      procedimentoId: string;
      etapaKey: string;
      status: StatusEtapa;
      data?: string;
      executorId?: string | number;
      executorNome?: string;
      tipoExecutor?: TipoExecutor;
      extraData?: Record<string, any>;
    }) => {
      if (!user) throw new Error('Usuário não autenticado');
      if (!tabela) throw new Error(`Tabela não encontrada para o tipo: ${tipo}`);

      const updateData: any = {
        [`${etapaKey}_status`]: status,
        ...extraData
      };

      if (data) {
        updateData[`${etapaKey}_data`] = data;
      }

      if (executorNome) {
        if (executorId !== undefined && tipoExecutor !== 'SECRETARIA') {
          updateData[`${etapaKey}_executor_id`] = executorId;
        }
        updateData[`${etapaKey}_executado_em`] = getBrasiliaDateTime();
        updateData[`${etapaKey}_executado_por`] = executorNome;
      }

      // Progressão Automática: Calcular tudo antes de enviar para o banco
      const statusNormalizado = status?.toLowerCase();
      if (statusNormalizado === 'finalizado' || statusNormalizado === 'concluido') {
        const currentEtapaIndex = etapasConfig?.findIndex(e => e.key === etapaKey);
        if (currentEtapaIndex !== -1) {
          if (currentEtapaIndex < (etapasConfig?.length ?? 0) - 1) {
            const nextEtapa = etapasConfig?.[currentEtapaIndex + 1];
            if (nextEtapa) {
               updateData[`${nextEtapa.key}_status`] = 'Em andamento';
               updateData.proxima_etapa = nextEtapa.label;
               updateData.proxima_etapa_responsavel = nextEtapa.responsavel;
               updateData.status_geral = 'Em andamento'; // Garante que não fique pendente se já andou
            }
          } else {
            // Se não houver próxima etapa, o procedimento está oficializado como concluído
            updateData.proxima_etapa = 'Concluído';
            updateData.proxima_etapa_responsavel = 'SISTEMA';
            updateData.status_geral = 'Concluído';
          }
        }
      }

      const { data: result, error } = await supabase
        .from(tabela as any)
        .update(updateData)
        .eq('id', procedimentoId)
        .select()
        .single();

      // Histórico
      const etapaConfig = etapasConfig?.find((e) => e.key === etapaKey);
      if (etapaConfig && result) {
        await supabase.from('historico_procedimentos' as any).insert({
          procedimento_tipo: tipo,
          procedimento_id: procedimentoId,
          ordem_servico: (result as any).ordem_servico,
          nome_paciente: (result as any).nome_paciente,
          etapa: etapaKey,
          etapa_label: etapaConfig.label,
          acao: status === 'Finalizado' ? 'CONCLUIU' : 'ALTEROU_STATUS',
          status_novo: status,
          executor_tipo: tipoExecutor,
          executor_id: typeof executorId === 'number' ? executorId : null,
          executor_nome: executorNome,
          responsavel_esperado: etapaConfig.responsavel,
        });
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procedimentos'] }); 
      queryClient.invalidateQueries({ queryKey: ['procedimento'] }); 
      queryClient.invalidateQueries({ queryKey: ['todos-procedimentos'] }); // Invalidação crítica do Dashboard
      queryClient.invalidateQueries({ queryKey: ['historico-procedimento'] });
      toast({ title: 'Sucesso!', description: 'Fluxo atualizado e sincronizado' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' });
    },
  });
}

// Hook para Atualizar Campos Genéricos do Procedimento (Cores, Observações, etc)
export function useUpdateProcedimentoGenerico(tipoParam: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const tipo = (tipoParam?.toLowerCase() || '') as string;
  const tabela = TABELA_POR_TIPO[tipo];

  return useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      if (!user) throw new Error('Usuário não autenticado');
      if (!tabela) throw new Error(`Tabela não encontrada para o tipo: ${tipo}`);

      const { data: result, error } = await supabase
        .from(tabela as any)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procedimento'] });
      toast({ title: 'Sucesso!', description: 'Informações atualizadas' });
    },
    onError: (error: any) => {
      toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' });
    },
  });
}

// Hook unificado e performático para buscar todos os procedimentos de uma vez via VIEW
export function useAllProcedimentos() {
  const { user } = useAuth();

  return useQuery<ProcedimentoUnified[]>({
    queryKey: ['procedimentos', 'todos', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await (supabase
        .from('v_todos_procedimentos_full' as any)
        .select('*')
        .order('ordem_servico', { ascending: false }) as any);

      if (error) throw error;
      
      // Mapear estrutura para manter compatibilidade com o formato esperado pelo frontend
      return (data || []).map((p: any) => ({
        ...p,
        dentista: p.dentista_nome ? { nome: p.dentista_nome } : null,
        protetico: p.protetico_nome ? { nome: p.protetico_nome, laboratorio: p.protetico_laboratorio } : null
      }));
    },
    enabled: !!user,
    staleTime: 30 * 1000, 
  });
}

// Hook para buscar o histórico de um procedimento unificado por Ordem de Serviço
export function useHistoricoProcedimento(ordemServico?: number | string) {
  return useQuery({
    queryKey: ['historico-procedimento', ordemServico],
    queryFn: async () => {
      if (!ordemServico) return [];

      const { data, error } = await supabase
        .from('historico_procedimentos' as any)
        .select('*')
        .eq('ordem_servico', ordemServico.toString())
        .order('executado_em', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!ordemServico,
  });
}

