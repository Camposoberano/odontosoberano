// Types para o sistema de procedimentos odontológicos

export type TipoProcedimento =
  | 'PPR'
  | 'PT'
  | 'PM'
  | 'PROTOCOLO DEFINITIVO'
  | 'PROTOCOLO PROVISORIO'
  | 'FIXA PROVISÓRIA'
  | 'FIXA DE CERÂMICA'
  | 'FIXA IMPRESSA'
  | 'ADESIVA'
  | 'RESTAURAÇÃO INDIRETA'
  | 'PLACA DE BRUXISMO'
  | 'CLAREAMENTO'
  | 'LAB EXTERNO'
  | 'COROA SOBRE IMPLANTE'
  | 'FIXA DE ZIRCÔNIA';

export type StatusEtapa =
  | 'Pendente'
  | 'Finalizado'
  | 'Aguardando'
  | 'Enviado'
  | 'Concluido'
  | 'Procedimento OK'
  | 'Em andamento';

export type TipoArcada = 'SUP' | 'INF' | 'SUP/INF';

export type StatusProcedimento = 'Pendente' | 'Em andamento' | 'Concluído';

export type TipoExecutor = 'DENTISTA' | 'PROTETICO' | 'SECRETARIA';

export type TipoProtesePTPM = 'PT' | 'PM';

export type TipoProtocolo = 'PROVISORIO' | 'DEFINITIVO';

export interface Dentista {
  id: string; // UUID
  nome: string;
  cro: string;
  especialidade: string;
  telefone: string;
  email: string;
  cpf: string;
  endereco?: string | null;
  data_nascimento?: string | null;
  status: 'Ativo' | 'Inativo';
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Protetico {
  id: number;
  nome: string;
  especialidade?: string | null;
  telefone?: string | null;
  email?: string | null;
  laboratorio?: string | null;
  ativo: boolean;
  user_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface EtapaInfo {
  status: StatusEtapa;
  data?: string | null;
  executor_id?: number | null;
  executado_em?: string | null;
  executado_por?: string | null;
}

export interface CamposTecnicosMoldagem {
  cor_dente?: string | null;
  cor_gengiva?: string | null;
  registro_mordida?: boolean | null;
  moldagem_superior?: boolean | null;
  moldagem_inferior?: boolean | null;
  marca_dente?: string | null;
}

export interface ProcedimentoPPR {
  // Identificação
  id: string;
  user_id: string;

  // Financeiro Laboratório
  valor_lab?: number | null;
  pagamento_lab_status?: 'Pendente' | 'Pago' | 'Não Pago' | null;
  pagamento_lab_data?: string | null;

  // Informações básicas
  ordem_servico: number;
  nome_paciente: string;
  paciente_id?: string | null;
  data_inicial: string;

  // Detalhes técnicos
  arcada?: TipoArcada | null;
  dente?: string | null;

  // Profissionais responsáveis
  dentista_id?: string | null; // UUID referenciando tabela dentistas
  protetico_id?: number | null;

  // Status geral
  status_geral: StatusProcedimento;
  data_entrega?: string | null;

  // Campos Técnicos Moldagem (Tópico 04)
  cor_dente?: string | null;
  cor_gengiva?: string | null;
  registro_mordida?: boolean | null;
  moldagem_superior?: boolean | null;
  moldagem_inferior?: boolean | null;
  marca_dente?: string | null;

  // Etapas (11 etapas do PPR)
  moldagem_status: StatusEtapa;
  moldagem_data?: string | null;
  moldagem_executor_id?: number | null;
  moldagem_executado_em?: string | null;
  moldagem_executado_por?: string | null;

  vg_status: StatusEtapa;
  vg_data?: string | null;
  vg_executor_id?: number | null;
  vg_executado_em?: string | null;
  vg_executado_por?: string | null;

  envio_metal_lab_status: StatusEtapa;
  envio_metal_lab_data?: string | null;
  envio_metal_lab_executor_id?: number | null;
  envio_metal_lab_executado_em?: string | null;
  envio_metal_lab_executado_por?: string | null;

  rec_metal_lab_status: StatusEtapa;
  rec_metal_lab_data?: string | null;
  rec_metal_lab_executor_id?: number | null;
  rec_metal_lab_executado_em?: string | null;
  rec_metal_lab_executado_por?: string | null;

  prova_metal_status: StatusEtapa;
  prova_metal_data?: string | null;
  prova_metal_executor_id?: number | null;
  prova_metal_executado_em?: string | null;
  prova_metal_executado_por?: string | null;

  plano_cera_status: StatusEtapa;
  plano_cera_data?: string | null;
  plano_cera_executor_id?: number | null;
  plano_cera_executado_em?: string | null;
  plano_cera_executado_por?: string | null;

  prova_cera_status: StatusEtapa;
  prova_cera_data?: string | null;
  prova_cera_executor_id?: number | null;
  prova_cera_executado_em?: string | null;
  prova_cera_executado_por?: string | null;

  montagem_dente_status: StatusEtapa;
  montagem_dente_data?: string | null;
  montagem_dente_executor_id?: number | null;
  montagem_dente_executado_em?: string | null;
  montagem_dente_executado_por?: string | null;

  prova_dente_status: StatusEtapa;
  prova_dente_data?: string | null;
  prova_dente_executor_id?: number | null;
  prova_dente_executado_em?: string | null;
  prova_dente_executado_por?: string | null;

  acrilizacao_status: StatusEtapa;
  acrilizacao_data?: string | null;
  acrilizacao_executor_id?: number | null;
  acrilizacao_executado_em?: string | null;
  acrilizacao_executado_por?: string | null;

  entrega_status: StatusEtapa;
  entrega_data?: string | null;
  entrega_executor_id?: number | null;
  entrega_executado_em?: string | null;
  entrega_executado_por?: string | null;

  // Metadados
  created_at: string;
  updated_at: string;
}

export interface HistoricoProcedimento {
  id: number;
  user_id: string;

  // Identificação do procedimento
  procedimento_tipo: string;
  procedimento_id: string;
  ordem_servico: number;
  nome_paciente: string;

  // Detalhes da etapa
  etapa: string;
  etapa_label: string;

  // Ação realizada
  acao: string;
  status_anterior?: StatusEtapa | null;
  status_novo?: StatusEtapa | null;

  // Executor
  executor_tipo?: TipoExecutor | null;
  executor_id?: number | null;
  executor_nome?: string | null;
  responsavel_esperado?: TipoExecutor | null;

  // Observações
  observacoes?: string | null;

  // Rastreamento
  executado_em: string;
  ip_address?: string | null;
  user_agent?: string | null;

  created_at: string;
}

// Informações das etapas do PPR
export interface EtapaPPRConfig {
  key: string;
  label: string;
  responsavel: TipoExecutor;
  ordem: number;
  cor: string; // Cor para UI
}

export const ETAPAS_PPR: EtapaPPRConfig[] = [
  {
    key: 'moldagem',
    label: 'Moldagem',
    responsavel: 'DENTISTA',
    ordem: 1,
    cor: 'blue',
  },
  {
    key: 'vg',
    label: 'VG - Gesso/Guia',
    responsavel: 'PROTETICO',
    ordem: 2,
    cor: 'orange',
  },
  {
    key: 'envio_metal_lab',
    label: 'Envio Metal Lab',
    responsavel: 'SECRETARIA',
    ordem: 3,
    cor: 'green',
  },
  {
    key: 'rec_metal_lab',
    label: 'Rec. Metal Lab',
    responsavel: 'SECRETARIA',
    ordem: 4,
    cor: 'green',
  },
  {
    key: 'prova_metal',
    label: 'Prova Metal',
    responsavel: 'DENTISTA',
    ordem: 5,
    cor: 'blue',
  },
  {
    key: 'plano_cera',
    label: 'Plano Cera',
    responsavel: 'PROTETICO',
    ordem: 6,
    cor: 'orange',
  },
  {
    key: 'prova_cera',
    label: 'Prova Cera',
    responsavel: 'DENTISTA',
    ordem: 7,
    cor: 'blue',
  },
  {
    key: 'montagem_dente',
    label: 'Montagem Dente',
    responsavel: 'PROTETICO',
    ordem: 8,
    cor: 'orange',
  },
  {
    key: 'prova_dente',
    label: 'Prova Dente',
    responsavel: 'DENTISTA',
    ordem: 9,
    cor: 'blue',
  },
  {
    key: 'acrilizacao',
    label: 'Acrilização',
    responsavel: 'PROTETICO',
    ordem: 10,
    cor: 'orange',
  },
  {
    key: 'entrega',
    label: 'Entrega',
    responsavel: 'DENTISTA',
    ordem: 11,
    cor: 'blue',
  },
];

// Helper para pegar cor do badge de responsável
export function getCorResponsavel(responsavel: TipoExecutor): string {
  switch (responsavel) {
    case 'DENTISTA':
      return 'bg-blue-100 text-blue-800 border-blue-300 shadow-[0_1px_2px_rgba(59,130,246,0.1)]';
    case 'PROTETICO':
      return 'bg-orange-100 text-orange-800 border-orange-300 shadow-[0_1px_2px_rgba(249,115,22,0.1)]';
    case 'SECRETARIA':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300 shadow-[0_1px_2px_rgba(16,185,129,0.1)]';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}

// Helper para pegar cor do badge de status
export function getCorStatus(status: StatusEtapa): string {
  switch (status) {
    case 'Finalizado':
    case 'Concluido':
    case 'Procedimento OK':
      return 'bg-emerald-500 text-white border-emerald-600 font-bold shadow-md animate-pulse-subtle';
    case 'Em andamento':
      return 'bg-amber-400 text-amber-950 border-amber-500 font-bold shadow-sm';
    case 'Pendente':
      return 'bg-slate-50 text-slate-400 border-slate-200';
    case 'Aguardando':
      return 'bg-amber-100 text-amber-800 border-amber-300';
    case 'Enviado':
      return 'bg-sky-100 text-sky-800 border-sky-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}

// ============================================
// PT/PM - PRÓTESE TOTAL/MÓVEL
// ============================================

export interface ProcedimentoPTPM {
  // Identificação
  id: string;
  user_id: string;

  // Financeiro Laboratório
  valor_lab?: number | null;
  pagamento_lab_status?: 'Pendente' | 'Pago' | 'Não Pago' | null;
  pagamento_lab_data?: string | null;

  // Informações básicas
  ordem_servico: number;
  nome_paciente: string;
  paciente_id?: string | null;
  data_inicial: string;

  // Detalhes técnicos
  arcada?: TipoArcada | null;
  tipo_protese?: TipoProtesePTPM | null;
  observacoes?: string | null;

  // Profissionais responsáveis
  dentista_id?: string | null;
  protetico_id?: number | null;

  // Status geral
  status_geral: StatusProcedimento;
  data_entrega?: string | null;

  // Etapa 1: Moldagem (Dentista)
  moldagem_status: StatusEtapa;
  moldagem_data?: string | null;
  moldagem_executor_id?: string | null;
  moldagem_executado_em?: string | null;
  moldagem_executado_por?: string | null;

  // Etapa 2: Vazamento de Gesso (Protético)
  vazamento_gesso_status: StatusEtapa;
  vazamento_gesso_data?: string | null;
  vazamento_gesso_executor_id?: number | null;
  vazamento_gesso_executado_em?: string | null;
  vazamento_gesso_executado_por?: string | null;

  // Etapa 3: Confecção de Moldeira (Protético)
  confeccao_moldeira_status: StatusEtapa;
  confeccao_moldeira_data?: string | null;
  confeccao_moldeira_executor_id?: number | null;
  confeccao_moldeira_executado_em?: string | null;
  confeccao_moldeira_executado_por?: string | null;

  // Etapa 4: Moldagem Funcional (Dentista)
  moldagem_funcional_status: StatusEtapa;
  moldagem_funcional_data?: string | null;
  moldagem_funcional_executor_id?: string | null;
  moldagem_funcional_executado_em?: string | null;
  moldagem_funcional_executado_por?: string | null;
  moldagem_funcional_agenda?: string | null;

  // Etapa 5: VG (Protético)
  vg_status: StatusEtapa;
  vg_data?: string | null;
  vg_executor_id?: number | null;
  vg_executado_em?: string | null;
  vg_executado_por?: string | null;

  // Etapa 6: Plano de Cera (Protético)
  plano_cera_status: StatusEtapa;
  plano_cera_data?: string | null;
  plano_cera_executor_id?: number | null;
  plano_cera_executado_em?: string | null;
  plano_cera_executado_por?: string | null;
  plano_cera_agenda?: string | null;

  // Etapa 7: Prova de Cera (Dentista)
  prova_cera_status: StatusEtapa;
  prova_cera_data?: string | null;
  prova_cera_executor_id?: string | null;
  prova_cera_executado_em?: string | null;
  prova_cera_executado_por?: string | null;
  prova_cera_agenda?: string | null;

  // Etapa 8: Montagem de Dente (Protético)
  montagem_dente_status: StatusEtapa;
  montagem_dente_data?: string | null;
  montagem_dente_executor_id?: number | null;
  montagem_dente_executado_em?: string | null;
  montagem_dente_executado_por?: string | null;

  // Etapa 9: Prova de Dente (Dentista)
  prova_dente_status: StatusEtapa;
  prova_dente_data?: string | null;
  prova_dente_executor_id?: string | null;
  prova_dente_executado_em?: string | null;
  prova_dente_executado_por?: string | null;
  prova_dente_agenda?: string | null;

  // Etapa 10: Acrilização e Acabamento (Protético)
  acrilizacao_acabamento_status: StatusEtapa;
  acrilizacao_acabamento_data?: string | null;
  acrilizacao_acabamento_executor_id?: number | null;
  acrilizacao_acabamento_executado_em?: string | null;
  acrilizacao_acabamento_executado_por?: string | null;

  // Etapa 11: Entrega (Dentista)
  entrega_status: StatusEtapa;
  entrega_data?: string | null;
  entrega_executor_id?: string | null;
  entrega_executado_em?: string | null;
  entrega_executado_por?: string | null;
  entrega_agenda?: string | null;

  // Metadados
  created_at: string;
  updated_at: string;
  marca_dente?: string | null;
}

// Informações das etapas do PT/PM
export interface EtapaPTPMConfig {
  key: string;
  label: string;
  responsavel: TipoExecutor;
  ordem: number;
  cor: string;
  temAgenda: boolean;
}

export const ETAPAS_PT: EtapaPTPMConfig[] = [
  {
    key: 'moldagem',
    label: 'Moldagem',
    responsavel: 'DENTISTA',
    ordem: 1,
    cor: 'blue',
    temAgenda: false,
  },
  {
    key: 'vazamento_gesso',
    label: 'Vazamento de Gesso',
    responsavel: 'PROTETICO',
    ordem: 2,
    cor: 'orange',
    temAgenda: false,
  },
  {
    key: 'confeccao_moldeira',
    label: 'Confecção de Moldeira',
    responsavel: 'PROTETICO',
    ordem: 3,
    cor: 'orange',
    temAgenda: false,
  },
  {
    key: 'moldagem_funcional',
    label: 'Moldagem Funcional',
    responsavel: 'DENTISTA',
    ordem: 4,
    cor: 'blue',
    temAgenda: true,
  },
  {
    key: 'vg',
    label: 'VG',
    responsavel: 'PROTETICO',
    ordem: 5,
    cor: 'orange',
    temAgenda: false,
  },
  {
    key: 'plano_cera',
    label: 'Plano de Cera',
    responsavel: 'PROTETICO',
    ordem: 6,
    cor: 'orange',
    temAgenda: true,
  },
  {
    key: 'prova_cera',
    label: 'Prova de Cera',
    responsavel: 'DENTISTA',
    ordem: 7,
    cor: 'blue',
    temAgenda: true,
  },
  {
    key: 'montagem_dente',
    label: 'Montagem de Dente',
    responsavel: 'PROTETICO',
    ordem: 8,
    cor: 'orange',
    temAgenda: false,
  },
  {
    key: 'prova_dente',
    label: 'Prova de Dente',
    responsavel: 'DENTISTA',
    ordem: 9,
    cor: 'blue',
    temAgenda: true,
  },
  {
    key: 'acrilizacao_acabamento',
    label: 'Acrilização e Acabamento',
    responsavel: 'PROTETICO',
    ordem: 10,
    cor: 'orange',
    temAgenda: false,
  },
  {
    key: 'entrega',
    label: 'Entrega',
    responsavel: 'DENTISTA',
    ordem: 11,
    cor: 'blue',
    temAgenda: true,
  },
];

export const ETAPAS_PM: EtapaPTPMConfig[] = [...ETAPAS_PT];

// ============================================
// FIXA ORTOVITAL - PRÓTESE FIXA
// ============================================

export interface ProcedimentoFixa {
  // Identificação
  id: string;
  user_id: string;

  // Financeiro Laboratório
  valor_lab?: number | null;
  pagamento_lab_status?: 'Pendente' | 'Pago' | 'Não Pago' | null;
  pagamento_lab_data?: string | null;

  // Informações básicas
  ordem_servico: number;
  nome_paciente: string;
  paciente_id?: string | null;
  data_inicial: string;

  // Detalhes técnicos
  dente?: string | null;
  observacoes?: string | null;

  // Profissionais responsáveis
  dentista_id?: string | null;
  protetico_id?: number | null;

  // Status geral
  status_geral: StatusProcedimento;
  data_entrega?: string | null;

  // Etapa 0: Moldagem de Estudo (Dentista) [NOVA]
  moldagem_estudo_status: StatusEtapa;
  moldagem_estudo_data?: string | null;
  moldagem_estudo_executor_id?: string | null;
  moldagem_estudo_executado_em?: string | null;
  moldagem_estudo_executado_por?: string | null;

  // Etapa 0.5: Compra de Dentes (Dentista) [NOVA]
  compra_dentes_status: StatusEtapa;
  compra_dentes_data?: string | null;
  compra_dentes_executor_id?: string | null;
  compra_dentes_executado_em?: string | null;
  compra_dentes_executado_por?: string | null;

  // Etapa 1: Moldagem (Dentista)
  moldagem_status: StatusEtapa;
  moldagem_data?: string | null;
  moldagem_executor_id?: string | null;
  moldagem_executado_em?: string | null;
  moldagem_executado_por?: string | null;

  // Etapa 2: VG (Protético)
  vg_status: StatusEtapa;
  vg_data?: string | null;
  vg_executor_id?: number | null;
  vg_executado_em?: string | null;
  vg_executado_por?: string | null;

  // Etapa 3: Montagem de Dente (Protético)
  montagem_dente_status: StatusEtapa;
  montagem_dente_data?: string | null;
  montagem_dente_executor_id?: number | null;
  montagem_dente_executado_em?: string | null;
  montagem_dente_executado_por?: string | null;

  // Etapa 4: Prova de Dente (Dentista) [COM AGENDA]
  prova_dente_status: StatusEtapa;
  prova_dente_data?: string | null;
  prova_dente_agenda?: string | null;
  prova_dente_executor_id?: string | null;
  prova_dente_executado_em?: string | null;
  prova_dente_executado_por?: string | null;

  // Etapa 5: Prova Cera (Dentista) [COM AGENDA]
  prova_cera_status: StatusEtapa;
  prova_cera_data?: string | null;
  prova_cera_agenda?: string | null;
  prova_cera_executor_id?: string | null;
  prova_cera_executado_em?: string | null;
  prova_cera_executado_por?: string | null;

  // Etapa 6: Entrega (Dentista)
  entrega_status: StatusEtapa;
  entrega_data?: string | null;
  entrega_executor_id?: string | null;
  entrega_executado_em?: string | null;
  entrega_executado_por?: string | null;

  // Metadados
  created_at: string;
  updated_at: string;
  marca_dente?: string | null;
}

// Informações das etapas do FIXA ORTOVITAL
export interface EtapaFixaConfig {
  key: string;
  label: string;
  responsavel: TipoExecutor;
  ordem: number;
  cor: string;
  temAgenda: boolean;
}

export const ETAPAS_FIXA: EtapaFixaConfig[] = [
  {
    key: 'moldagem_estudo',
    label: 'Moldagem de Estudo',
    responsavel: 'DENTISTA',
    ordem: 1,
    cor: 'purple',
    temAgenda: false,
  },
  {
    key: 'compra_dentes',
    label: 'Compra de Dentes',
    responsavel: 'DENTISTA',
    ordem: 2,
    cor: 'emerald',
    temAgenda: false,
  },
  {
    key: 'moldagem',
    label: 'Moldagem',
    responsavel: 'DENTISTA',
    ordem: 3,
    cor: 'blue',
    temAgenda: false,
  },
  {
    key: 'vg',
    label: 'VG',
    responsavel: 'PROTETICO',
    ordem: 4,
    cor: 'orange',
    temAgenda: false,
  },
  {
    key: 'montagem_dente',
    label: 'Montagem de Dente',
    responsavel: 'PROTETICO',
    ordem: 5,
    cor: 'orange',
    temAgenda: false,
  },
  {
    key: 'prova_dente',
    label: 'Prova de Dente',
    responsavel: 'DENTISTA',
    ordem: 6,
    cor: 'blue',
    temAgenda: true,
  },
  {
    key: 'prova_cera',
    label: 'Prova Cera',
    responsavel: 'DENTISTA',
    ordem: 7,
    cor: 'blue',
    temAgenda: true,
  },
  {
    key: 'entrega',
    label: 'Entrega',
    responsavel: 'DENTISTA',
    ordem: 8,
    cor: 'blue',
    temAgenda: false,
  },
];

// ============================================
// PROTOCOLO (Provisório e Definitivo)
// ============================================

export interface ProcedimentoProtocolo {
  // Identificação
  id: string;
  user_id: string;

  // Financeiro Laboratório
  valor_lab?: number | null;
  pagamento_lab_status?: 'Pendente' | 'Pago' | 'Não Pago' | null;
  pagamento_lab_data?: string | null;

  // Informações básicas
  ordem_servico: number;
  nome_paciente: string;
  paciente_id?: string | null;
  data_inicial: string;

  // Detalhes técnicos
  tipo_protocolo: TipoProtocolo;
  arcada?: TipoArcada | null;
  observacoes?: string | null;

  // Profissionais responsáveis
  dentista_id?: string | null;
  protetico_id?: number | null;

  // Status geral
  status_geral: StatusProcedimento;
  data_entrega?: string | null;
  marca_dente?: string | null;

  // Etapa 1: Moldagem (Dentista)
  moldagem_status: StatusEtapa;
  moldagem_data?: string | null;
  moldagem_executor_id?: string | null;
  moldagem_executado_em?: string | null;
  moldagem_executado_por?: string | null;

  // Etapa 1.1: Envio para Laboratório (Secretaria) [NOVA]
  envio_laboratorio_status: StatusEtapa;
  envio_laboratorio_data?: string | null;
  envio_laboratorio_executor_id?: string | null;
  envio_laboratorio_executado_em?: string | null;
  envio_laboratorio_executado_por?: string | null;

  // Etapa 1.2: Recebimento do Laboratório (Secretaria) [NOVA]
  recebimento_laboratorio_status: StatusEtapa;
  recebimento_laboratorio_data?: string | null;
  recebimento_laboratorio_executor_id?: string | null;
  recebimento_laboratorio_executado_em?: string | null;
  recebimento_laboratorio_executado_por?: string | null;

  // Etapa 1.3: Agendamento do Paciente (Secretaria) [NOVA]
  agendamento_paciente_status: StatusEtapa;
  agendamento_paciente_data?: string | null;
  agendamento_paciente_agenda?: string | null;
  agendamento_paciente_executor_id?: string | null;
  agendamento_paciente_executado_em?: string | null;
  agendamento_paciente_executado_por?: string | null;

  // Etapa 2: VG (Protético)
  vg_status: StatusEtapa;
  vg_data?: string | null;
  vg_executor_id?: number | null;
  vg_executado_em?: string | null;
  vg_executado_por?: string | null;

  // Etapa 3: Prova de Barra (Dentista) - APENAS DEFINITIVO
  prova_barra_status: StatusEtapa;
  prova_barra_data?: string | null;
  prova_barra_executor_id?: string | null;
  prova_barra_executado_em?: string | null;
  prova_barra_executado_por?: string | null;

  // Etapa 4: Plano de Cera (Protético) - COM AGENDA
  plano_cera_status: StatusEtapa;
  plano_cera_data?: string | null;
  plano_cera_executor_id?: number | null;
  plano_cera_executado_em?: string | null;
  plano_cera_executado_por?: string | null;
  plano_cera_agenda?: string | null;

  // Etapa 5: Prova de Cera (Dentista) - COM AGENDA (F1)
  prova_cera_status: StatusEtapa;
  prova_cera_data?: string | null;
  prova_cera_executor_id?: string | null;
  prova_cera_executado_em?: string | null;
  prova_cera_executado_por?: string | null;
  prova_cera_agenda?: string | null;

  // Etapa 6: Montagem de Dente (Protético)
  montagem_dente_status: StatusEtapa;
  montagem_dente_data?: string | null;
  montagem_dente_executor_id?: number | null;
  montagem_dente_executado_em?: string | null;
  montagem_dente_executado_por?: string | null;

  // Etapa 7: Prova de Dente (Dentista) - COM AGENDA (F2)
  prova_dente_status: StatusEtapa;
  prova_dente_data?: string | null;
  prova_dente_executor_id?: string | null;
  prova_dente_executado_em?: string | null;
  prova_dente_executado_por?: string | null;
  prova_dente_agenda?: string | null;

  // Etapa 8: Acrilização e Acabamento (Protético)
  acrilizacao_acabamento_status: StatusEtapa;
  acrilizacao_acabamento_data?: string | null;
  acrilizacao_acabamento_executor_id?: number | null;
  acrilizacao_acabamento_executado_em?: string | null;
  acrilizacao_acabamento_executado_por?: string | null;

  // Etapa 9: Entrega (Dentista) - COM AGENDA (F3)
  entrega_status: StatusEtapa;
  entrega_data?: string | null;
  entrega_executor_id?: string | null;
  entrega_executado_em?: string | null;
  entrega_executado_por?: string | null;
  entrega_agenda?: string | null;

  // Metadados
  created_at: string;
  updated_at: string;
}

// Informações das etapas do PROTOCOLO
export interface EtapaProtocoloConfig {
  key: string;
  label: string;
  responsavel: TipoExecutor;
  ordem: number;
  cor: string;
  temAgenda: boolean;
}

export const ETAPAS_PROTOCOLO: EtapaProtocoloConfig[] = [
  {
    key: 'moldagem',
    label: 'Moldagem',
    responsavel: 'DENTISTA',
    ordem: 1,
    cor: 'blue',
    temAgenda: false,
  },
  {
    key: 'vg',
    label: 'VG de Gesso',
    responsavel: 'PROTETICO',
    ordem: 2,
    cor: 'orange',
    temAgenda: false,
  },
  {
    key: 'envio_laboratorio',
    label: 'Envio Laboratorio',
    responsavel: 'SECRETARIA',
    ordem: 3,
    cor: 'green',
    temAgenda: false,
  },
  {
    key: 'recebimento_laboratorio',
    label: 'Recebimento Laboratorio',
    responsavel: 'SECRETARIA',
    ordem: 4,
    cor: 'green',
    temAgenda: false,
  },
  {
    key: 'prova_barra',
    label: 'Prova de Barra',
    responsavel: 'DENTISTA',
    ordem: 5,
    cor: 'blue',
    temAgenda: false,
  },
  {
    key: 'plano_cera',
    label: 'Plano de Cera',
    responsavel: 'PROTETICO',
    ordem: 6,
    cor: 'orange',
    temAgenda: true,
  },
  {
    key: 'prova_cera',
    label: 'Prova de Cera',
    responsavel: 'DENTISTA',
    ordem: 7,
    cor: 'blue',
    temAgenda: true,
  },
  {
    key: 'montagem_dente',
    label: 'Montagem de Dentes',
    responsavel: 'PROTETICO',
    ordem: 8,
    cor: 'orange',
    temAgenda: false,
  },
  {
    key: 'prova_dente',
    label: 'Prova de Dentes',
    responsavel: 'DENTISTA',
    ordem: 9,
    cor: 'blue',
    temAgenda: true,
  },
  {
    key: 'acrilizacao_acabamento',
    label: 'Acrilização - Acabamento',
    responsavel: 'PROTETICO',
    ordem: 10,
    cor: 'orange',
    temAgenda: false,
  },
  {
    key: 'entrega',
    label: 'Entrega',
    responsavel: 'DENTISTA',
    ordem: 11,
    cor: 'blue',
    temAgenda: true,
  },
];

export const ETAPAS_PROTOCOLO_PROVISORIO: EtapaProtocoloConfig[] = [
  {
    key: 'moldagem',
    label: 'Moldagem',
    responsavel: 'DENTISTA',
    ordem: 1,
    cor: 'blue',
    temAgenda: false,
  },
  {
    key: 'vg',
    label: 'VG de Gesso',
    responsavel: 'PROTETICO',
    ordem: 2,
    cor: 'orange',
    temAgenda: false,
  },
  {
    key: 'envio_laboratorio',
    label: 'Envio Laboratorio',
    responsavel: 'SECRETARIA',
    ordem: 3,
    cor: 'green',
    temAgenda: false,
  },
  {
    key: 'recebimento_laboratorio',
    label: 'Recebimento Laboratorio',
    responsavel: 'SECRETARIA',
    ordem: 4,
    cor: 'green',
    temAgenda: false,
  },
  {
    key: 'plano_cera',
    label: 'Plano de Cera',
    responsavel: 'PROTETICO',
    ordem: 5,
    cor: 'orange',
    temAgenda: true,
  },
  {
    key: 'prova_cera',
    label: 'Prova de Cera',
    responsavel: 'DENTISTA',
    ordem: 6,
    cor: 'blue',
    temAgenda: true,
  },
  {
    key: 'montagem_dente',
    label: 'Montagem de Dentes',
    responsavel: 'PROTETICO',
    ordem: 7,
    cor: 'orange',
    temAgenda: false,
  },
  {
    key: 'prova_dente',
    label: 'Prova de Dentes',
    responsavel: 'DENTISTA',
    ordem: 8,
    cor: 'blue',
    temAgenda: true,
  },
  {
    key: 'acrilizacao_acabamento',
    label: 'Acrilização - Acabamento',
    responsavel: 'PROTETICO',
    ordem: 9,
    cor: 'orange',
    temAgenda: false,
  },
  {
    key: 'entrega',
    label: 'Entrega',
    responsavel: 'DENTISTA',
    ordem: 10,
    cor: 'blue',
    temAgenda: true,
  },
];


// ============================================
// RESINA IMPRESSA
// ============================================

export interface ProcedimentoResinaImpressa {
  // Identificação
  id: string;
  user_id: string;

  // Financeiro Laboratório
  valor_lab?: number | null;
  pagamento_lab_status?: 'Pendente' | 'Pago' | 'Não Pago' | null;
  pagamento_lab_data?: string | null;

  // Informações básicas
  ordem_servico: number;
  nome_paciente: string;
  paciente_id?: string | null;
  data_inicial: string;

  // Detalhes técnicos
  dente?: string | null;
  observacoes?: string | null;

  // Profissionais responsáveis
  dentista_id?: string | null;
  protetico_id?: number | null;

  // Status geral
  status_geral: StatusProcedimento;
  data_entrega?: string | null;

  // Campos Técnicos Moldagem (Tópico 04)
  cor_dente?: string | null;
  cor_gengiva?: string | null;
  registro_mordida?: boolean | null;
  moldagem_superior?: boolean | null;
  moldagem_inferior?: boolean | null;

  // Etapa 1: Escaner (Protético)
  escaner_status: StatusEtapa;
  escaner_data?: string | null;
  escaner_executor_id?: number | null;
  escaner_executado_em?: string | null;
  escaner_executado_por?: string | null;

  // Etapa 2: Exocad (Protético)
  exocad_status: StatusEtapa;
  exocad_data?: string | null;
  exocad_executor_id?: number | null;
  exocad_executado_em?: string | null;
  exocad_executado_por?: string | null;

  // Etapa 3: Impressão (Protético)
  impressao_status: StatusEtapa;
  impressao_data?: string | null;
  impressao_executor_id?: number | null;
  impressao_executado_em?: string | null;
  impressao_executado_por?: string | null;

  // Etapa 3.5: Resina Impressa ou Calcinável (Protético) [NOVA]
  resina_impressa_ou_calcinavel_status: StatusEtapa;
  resina_impressa_ou_calcinavel_data?: string | null;
  resina_impressa_ou_calcinavel_executor_id?: number | null;
  resina_impressa_ou_calcinavel_executado_at?: string | null;
  resina_impressa_ou_calcinavel_executado_por?: string | null;

  // Etapa 4: Maquiagem (Protético)
  maquiagem_status: StatusEtapa;
  maquiagem_data?: string | null;
  maquiagem_executor_id?: number | null;
  maquiagem_executado_em?: string | null;
  maquiagem_executado_por?: string | null;

  // Etapa 4.5: Acabamento (Protético) [NOVA]
  acabamento_status: StatusEtapa;
  acabamento_data?: string | null;
  acabamento_executor_id?: number | null;
  acabamento_executado_at?: string | null;
  acabamento_executado_por?: string | null;

  // Etapa 5: Paciente 3 (Dentista) [COM AGENDA]
  paciente3_status: StatusEtapa;
  paciente3_data?: string | null;
  paciente3_agenda?: string | null;
  paciente3_executor_id?: string | null;
  paciente3_executado_em?: string | null;
  paciente3_executado_por?: string | null;

  // Metadados
  created_at: string;
  updated_at: string;
}

export interface EtapaResinaImpressaConfig {
  key: string;
  label: string;
  responsavel: TipoExecutor;
  ordem: number;
  cor: string;
  temAgenda: boolean;
}

export const ETAPAS_FIXA_IMPRESSA: EtapaResinaImpressaConfig[] = [
  {
    key: 'escaner',
    label: 'Escaner',
    responsavel: 'PROTETICO',
    ordem: 1,
    cor: 'orange',
    temAgenda: false,
  },
  {
    key: 'exocad',
    label: 'Exocad',
    responsavel: 'PROTETICO',
    ordem: 2,
    cor: 'orange',
    temAgenda: false,
  },
  {
    key: 'impressao',
    label: 'Impressão de Modelo / Calcinável',
    responsavel: 'PROTETICO',
    ordem: 3,
    cor: 'orange',
    temAgenda: false,
  },
  {
    key: 'resina_impressa_ou_calcinavel',
    label: 'Resina Impressa ou Calcinável',
    responsavel: 'PROTETICO',
    ordem: 4,
    cor: 'orange',
    temAgenda: false,
  },
  {
    key: 'maquiagem',
    label: 'Maquiagem',
    responsavel: 'PROTETICO',
    ordem: 5,
    cor: 'orange',
    temAgenda: false,
  },
  {
    key: 'acabamento',
    label: 'Acabamento',
    responsavel: 'PROTETICO',
    ordem: 6,
    cor: 'orange',
    temAgenda: false,
  },
  {
    key: 'paciente3',
    label: 'Paciente 3 (Prova Final)',
    responsavel: 'DENTISTA',
    ordem: 7,
    cor: 'blue',
    temAgenda: true,
  },
];

// ============================================
// CERAMICA ORTOVITAL
// ============================================

export interface ProcedimentoCeramica {
  // Identificação
  id: string;
  user_id: string;

  // Financeiro Laboratório
  valor_lab?: number | null;
  pagamento_lab_status?: 'Pendente' | 'Pago' | 'Não Pago' | null;
  pagamento_lab_data?: string | null;

  // Informações básicas
  ordem_servico: number;
  nome_paciente: string;
  paciente_id?: string | null;
  data_inicial: string;

  // Detalhes técnicos
  dente?: string | null;
  copia?: string | null; // ESCANEAMENTO ou MOLDAGEM
  observacoes?: string | null;

  // Profissionais responsáveis
  dentista_id?: string | null;
  protetico_id?: number | null;

  // Status geral
  status_geral: StatusProcedimento;
  data_entrega?: string | null;
  marca_dente?: string | null;

  // Campos Técnicos Moldagem (Tópico 04)
  cor_dente?: string | null;
  cor_gengiva?: string | null;
  registro_mordida?: boolean | null;
  moldagem_superior?: boolean | null;
  moldagem_inferior?: boolean | null;

  // Etapa 1: Escaner (Protético)
  escaner_status: StatusEtapa;
  escaner_data?: string | null;
  escaner_executor_id?: number | null;
  escaner_executado_em?: string | null;
  escaner_executado_por?: string | null;

  // Etapa 2: Exocad (Protético)
  exocad_status: StatusEtapa;
  exocad_data?: string | null;
  exocad_executor_id?: number | null;
  exocad_executado_em?: string | null;
  exocad_executado_por?: string | null;

  // Etapa 3: IMP RES CALCINAVEL (Protético)
  imp_res_calcinavel_status: StatusEtapa;
  imp_res_calcinavel_data?: string | null;
  imp_res_calcinavel_executor_id?: number | null;
  imp_res_calcinavel_executado_em?: string | null;
  imp_res_calcinavel_executado_por?: string | null;

  // Etapa 4: Moldagem (Dentista)
  moldagem_status: StatusEtapa;
  moldagem_data?: string | null;
  moldagem_executor_id?: string | null;
  moldagem_executado_em?: string | null;
  moldagem_executado_por?: string | null;

  // Etapa 5: VG (Protético)
  vg_status: StatusEtapa;
  vg_data?: string | null;
  vg_executor_id?: number | null;
  vg_executado_em?: string | null;
  vg_executado_por?: string | null;

  // Etapa 6: Enceramento (Protético)
  enceramento_status: StatusEtapa;
  enceramento_data?: string | null;
  enceramento_executor_id?: number | null;
  enceramento_executado_em?: string | null;
  enceramento_executado_por?: string | null;

  // Etapa 7: Queima de Cerâmica (Protético)
  queima_ceramica_status: StatusEtapa;
  queima_ceramica_data?: string | null;
  queima_ceramica_executor_id?: number | null;
  queima_ceramica_executado_em?: string | null;
  queima_ceramica_executado_por?: string | null;

  // Etapa 8: Injeção (Protético)
  injecao_status: StatusEtapa;
  injecao_data?: string | null;
  injecao_executor_id?: number | null;
  injecao_executado_em?: string | null;
  injecao_executado_por?: string | null;

  // Etapa 9: Maquiagem (Protético)
  maquiagem_status: StatusEtapa;
  maquiagem_data?: string | null;
  maquiagem_executor_id?: number | null;
  maquiagem_executado_em?: string | null;
  maquiagem_executado_por?: string | null;

  // Etapa 10: Paciente 3 (Dentista) [COM AGENDA]
  paciente3_status: StatusEtapa;
  paciente3_data?: string | null;
  paciente3_agenda?: string | null;
  paciente3_executor_id?: string | null;
  paciente3_executado_em?: string | null;
  paciente3_executado_por?: string | null;

  // Metadados
  created_at: string;
  updated_at: string;
}

export interface EtapaCeramicaConfig {
  key: string;
  label: string;
  responsavel: TipoExecutor;
  ordem: number;
  cor: string;
  temAgenda: boolean;
}

export const ETAPAS_FIXA_CERAMICA: EtapaCeramicaConfig[] = [
  {
    key: 'escaner',
    label: 'Escaner',
    responsavel: 'PROTETICO',
    ordem: 1,
    cor: 'orange',
    temAgenda: false,
  },
  {
    key: 'exocad',
    label: 'Exocad',
    responsavel: 'PROTETICO',
    ordem: 2,
    cor: 'orange',
    temAgenda: false,
  },
  {
    key: 'imp_res_calcinavel',
    label: 'IMP RES CALCINAVEL',
    responsavel: 'PROTETICO',
    ordem: 3,
    cor: 'orange',
    temAgenda: false,
  },
  {
    key: 'moldagem',
    label: 'Moldagem',
    responsavel: 'DENTISTA',
    ordem: 4,
    cor: 'blue',
    temAgenda: false,
  },
  {
    key: 'vg',
    label: 'VG',
    responsavel: 'PROTETICO',
    ordem: 5,
    cor: 'orange',
    temAgenda: false,
  },
  {
    key: 'enceramento',
    label: 'Enceramento',
    responsavel: 'PROTETICO',
    ordem: 6,
    cor: 'orange',
    temAgenda: false,
  },
  {
    key: 'queima_ceramica',
    label: 'Queima de Cerâmica',
    responsavel: 'PROTETICO',
    ordem: 7,
    cor: 'orange',
    temAgenda: false,
  },
  {
    key: 'injecao',
    label: 'Injeção',
    responsavel: 'PROTETICO',
    ordem: 8,
    cor: 'orange',
    temAgenda: false,
  },
  {
    key: 'maquiagem',
    label: 'Maquiagem',
    responsavel: 'PROTETICO',
    ordem: 9,
    cor: 'orange',
    temAgenda: false,
  },
  {
    key: 'paciente3',
    label: 'Paciente 3 (Prova Final)',
    responsavel: 'DENTISTA',
    ordem: 10,
    cor: 'blue',
    temAgenda: true,
  },
];

// ============================================
// PLACA DE BRUXISMO/CLAREAMENTO
// ============================================

export interface ProcedimentoPlaca {
  // Identificação
  id: string;
  user_id: string;

  // Financeiro Laboratório
  valor_lab?: number | null;
  pagamento_lab_status?: 'Pendente' | 'Pago' | 'Não Pago' | null;
  pagamento_lab_data?: string | null;

  // Informações básicas
  ordem_servico: number;
  nome_paciente: string;
  paciente_id?: string | null;
  data_inicial: string;

  // Detalhes técnicos
  arcada?: string | null; // SUP/INF
  copia?: string | null; // ESCANEAMENTO ou MOLDAGEM
  observacoes?: string | null;

  // Profissionais responsáveis
  dentista_id?: string | null;
  protetico_id?: number | null;

  // Status geral
  status_geral: StatusProcedimento;
  data_entrega?: string | null;
  marca_dente?: string | null;

  // Campos Técnicos Moldagem (Tópico 04)
  cor_dente?: string | null;
  cor_gengiva?: string | null;
  registro_mordida?: boolean | null;
  moldagem_superior?: boolean | null;
  moldagem_inferior?: boolean | null;

  // Etapa 1: Escaner (Protético)
  escaner_status: StatusEtapa;
  escaner_data?: string | null;
  escaner_executor_id?: number | null;
  escaner_executado_em?: string | null;
  escaner_executado_por?: string | null;

  // Etapa 2: Exocad (Protético)
  exocad_status: StatusEtapa;
  exocad_data?: string | null;
  exocad_executor_id?: number | null;
  exocad_executado_em?: string | null;
  exocad_executado_por?: string | null;

  // Etapa 3: Impressão (Protético)
  impressao_status: StatusEtapa;
  impressao_data?: string | null;
  impressao_executor_id?: number | null;
  impressao_executado_em?: string | null;
  impressao_executado_por?: string | null;

  // Etapa 4: Moldagem (Dentista)
  moldagem_status: StatusEtapa;
  moldagem_data?: string | null;
  moldagem_executor_id?: string | null;
  moldagem_executado_em?: string | null;
  moldagem_executado_por?: string | null;

  // Etapa 5: VG (Protético)
  vg_status: StatusEtapa;
  vg_data?: string | null;
  vg_executor_id?: number | null;
  vg_executado_em?: string | null;
  vg_executado_por?: string | null;

  // Etapa 6: Confecção de Placa (Protético)
  confeccao_placa_status: StatusEtapa;
  confeccao_placa_data?: string | null;
  confeccao_placa_executor_id?: number | null;
  confeccao_placa_executado_em?: string | null;
  confeccao_placa_executado_por?: string | null;

  // Etapa 7: Paciente 3 (Dentista) [COM AGENDA]
  paciente3_status: StatusEtapa;
  paciente3_data?: string | null;
  paciente3_agenda?: string | null;
  paciente3_executor_id?: string | null;
  paciente3_executado_em?: string | null;
  paciente3_executado_por?: string | null;

  // Metadados
  created_at: string;
  updated_at: string;
}

export interface EtapaPlacaConfig {
  key: string;
  label: string;
  responsavel: TipoExecutor;
  ordem: number;
  cor: string;
  temAgenda: boolean;
}

export const ETAPAS_BRUXISMO: EtapaPlacaConfig[] = [
  {
    key: 'escaner',
    label: 'Escaner',
    responsavel: 'PROTETICO',
    ordem: 1,
    cor: 'orange',
    temAgenda: false,
  },
  {
    key: 'exocad',
    label: 'Exocad',
    responsavel: 'PROTETICO',
    ordem: 2,
    cor: 'orange',
    temAgenda: false,
  },
  {
    key: 'impressao',
    label: 'Impressão',
    responsavel: 'PROTETICO',
    ordem: 3,
    cor: 'orange',
    temAgenda: false,
  },
  {
    key: 'moldagem',
    label: 'Moldagem',
    responsavel: 'DENTISTA',
    ordem: 4,
    cor: 'blue',
    temAgenda: false,
  },
  {
    key: 'vg',
    label: 'VG',
    responsavel: 'PROTETICO',
    ordem: 5,
    cor: 'orange',
    temAgenda: false,
  },
  {
    key: 'confeccao_placa',
    label: 'Confecção de Placa',
    responsavel: 'PROTETICO',
    ordem: 6,
    cor: 'orange',
    temAgenda: false,
  },
  {
    key: 'paciente3',
    label: 'Paciente 3 (Prova Final)',
    responsavel: 'DENTISTA',
    ordem: 7,
    cor: 'blue',
    temAgenda: true,
  },
];

export const ETAPAS_CLAREAMENTO: EtapaPlacaConfig[] = [...ETAPAS_BRUXISMO];

// ============================================
// PROVISORIO/ADESIVA
// ============================================

export interface ProcedimentoProvisorio {
  // Identificação
  id: string;
  user_id: string;

  // Financeiro Laboratório
  valor_lab?: number | null;
  pagamento_lab_status?: 'Pendente' | 'Pago' | 'Não Pago' | null;
  pagamento_lab_data?: string | null;

  // Informações básicas
  ordem_servico: number;
  nome_paciente: string;
  paciente_id?: string | null;
  data_inicial: string;

  // Detalhes técnicos
  dente?: string | null;
  copia?: string | null; // ESCANEAMENTO ou MOLDAGEM
  observacoes?: string | null;

  // Profissionais responsáveis
  dentista_id?: string | null;
  protetico_id?: number | null;

  // Status geral
  status_geral: StatusProcedimento;
  data_entrega?: string | null;
  marca_dente?: string | null;

  // Campos Técnicos Moldagem (Tópico 04)
  cor_dente?: string | null;
  cor_gengiva?: string | null;
  registro_mordida?: boolean | null;
  moldagem_superior?: boolean | null;
  moldagem_inferior?: boolean | null;

  // Etapa 1: Escaner (Protético)
  escaner_status: StatusEtapa;
  escaner_data?: string | null;
  escaner_executor_id?: number | null;
  escaner_executado_em?: string | null;
  escaner_executado_por?: string | null;

  // Etapa 2: Exocad (Protético)
  exocad_status: StatusEtapa;
  exocad_data?: string | null;
  exocad_executor_id?: number | null;
  exocad_executado_em?: string | null;
  exocad_executado_por?: string | null;

  // Etapa 3: Impressão (Protético)
  impressao_status: StatusEtapa;
  impressao_data?: string | null;
  impressao_executor_id?: number | null;
  impressao_executado_em?: string | null;
  impressao_executado_por?: string | null;

  // Etapa 4: Maquiagem (Protético)
  maquiagem_status: StatusEtapa;
  maquiagem_data?: string | null;
  maquiagem_executor_id?: number | null;
  maquiagem_executado_em?: string | null;
  maquiagem_executado_por?: string | null;

  // Etapa 5: Moldagem (Dentista)
  moldagem_status: StatusEtapa;
  moldagem_data?: string | null;
  moldagem_executor_id?: string | null;
  moldagem_executado_em?: string | null;
  moldagem_executado_por?: string | null;

  // Etapa 6: VG (Protético)
  vg_status: StatusEtapa;
  vg_data?: string | null;
  vg_executor_id?: number | null;
  vg_executado_em?: string | null;
  vg_executado_por?: string | null;

  // Etapa 7: Montagem de Dente (Protético)
  montagem_dente_status: StatusEtapa;
  montagem_dente_data?: string | null;
  montagem_dente_executor_id?: number | null;
  montagem_dente_executado_em?: string | null;
  montagem_dente_executado_por?: string | null;

  // Etapa 8: Paciente 2 (Dentista) [COM AGENDA]
  paciente2_status: StatusEtapa;
  paciente2_data?: string | null;
  paciente2_agenda?: string | null;
  paciente2_executor_id?: string | null;
  paciente2_executado_em?: string | null;
  paciente2_executado_por?: string | null;

  // Metadados
  created_at: string;
  updated_at: string;
}

export interface EtapaProvisorioConfig {
  key: string;
  label: string;
  responsavel: TipoExecutor;
  ordem: number;
  cor: string;
  temAgenda: boolean;
}

export const ETAPAS_ADESIVA: EtapaProvisorioConfig[] = [
  {
    key: 'escaner',
    label: 'Escaner',
    responsavel: 'PROTETICO',
    ordem: 1,
    cor: 'orange',
    temAgenda: false,
  },
  {
    key: 'exocad',
    label: 'Exocad',
    responsavel: 'PROTETICO',
    ordem: 2,
    cor: 'orange',
    temAgenda: false,
  },
  {
    key: 'impressao',
    label: 'Impressão',
    responsavel: 'PROTETICO',
    ordem: 3,
    cor: 'orange',
    temAgenda: false,
  },
  {
    key: 'maquiagem',
    label: 'Maquiagem',
    responsavel: 'PROTETICO',
    ordem: 4,
    cor: 'orange',
    temAgenda: false,
  },
  {
    key: 'moldagem',
    label: 'Moldagem',
    responsavel: 'DENTISTA',
    ordem: 5,
    cor: 'blue',
    temAgenda: false,
  },
  {
    key: 'vg',
    label: 'VG',
    responsavel: 'PROTETICO',
    ordem: 6,
    cor: 'orange',
    temAgenda: false,
  },
  {
    key: 'montagem_dente',
    label: 'Montagem de Dente',
    responsavel: 'PROTETICO',
    ordem: 7,
    cor: 'orange',
    temAgenda: false,
  },
  {
    key: 'paciente2',
    label: 'Paciente 2 (Prova)',
    responsavel: 'DENTISTA',
    ordem: 8,
    cor: 'blue',
    temAgenda: true,
  },
];

export const ETAPAS_RESTAURACAO_INDIRETA: EtapaProvisorioConfig[] = [...ETAPAS_ADESIVA];

// ============================================
// LAB EXTERNO
// ============================================

export interface ProcedimentoLabExterno {
  // Identificação
  id: string;
  user_id: string;

  // Financeiro Laboratório
  valor_lab?: number | null;
  pagamento_lab_status?: 'Pendente' | 'Pago' | 'Não Pago' | null;
  pagamento_lab_data?: string | null;

  // Informações básicas
  ordem_servico: number;
  nome_paciente: string;
  paciente_id?: string | null;
  data_inicial: string;

  // Detalhes técnicos
  arcada?: string | null;
  observacoes?: string | null;

  // Profissionais responsáveis
  dentista_id?: string | null;
  protetico_id?: number | null;

  // Status geral
  status_geral: StatusProcedimento;
  data_entrega?: string | null;
  marca_dente?: string | null;

  // Campos Técnicos Moldagem (Tópico 04)
  cor_dente?: string | null;
  cor_gengiva?: string | null;
  registro_mordida?: boolean | null;
  moldagem_superior?: boolean | null;
  moldagem_inferior?: boolean | null;

  // Etapa 1: Escaner (Protético)
  escaner_status: StatusEtapa;
  escaner_data?: string | null;
  escaner_executor_id?: number | null;
  escaner_executado_em?: string | null;
  escaner_executado_por?: string | null;

  // Etapa 2: Envio de Arquivo (Secretária)
  envio_arquivo_status: StatusEtapa;
  envio_arquivo_data?: string | null;
  envio_arquivo_executor_id?: string | null;
  envio_arquivo_executado_em?: string | null;
  envio_arquivo_executado_por?: string | null;

  // Etapa 3: Moldagem (Dentista)
  moldagem_status: StatusEtapa;
  moldagem_data?: string | null;
  moldagem_executor_id?: string | null;
  moldagem_executado_em?: string | null;
  moldagem_executado_por?: string | null;

  // Etapa 4: VG (Protético)
  vg_status: StatusEtapa;
  vg_data?: string | null;
  vg_executor_id?: number | null;
  vg_executado_em?: string | null;
  vg_executado_por?: string | null;

  // Etapa 5: ENV LAB - Envio Lab (Secretária)
  env_lab_status: StatusEtapa;
  env_lab_data?: string | null;
  env_lab_executor_id?: string | null;
  env_lab_executado_em?: string | null;
  env_lab_executado_por?: string | null;

  // Etapa 6: REC DO LAB COPPING (Secretária)
  rec_lab_copping_status: StatusEtapa;
  rec_lab_copping_data?: string | null;
  rec_lab_copping_executor_id?: string | null;
  rec_lab_copping_executado_em?: string | null;
  rec_lab_copping_executado_por?: string | null;

  // Etapa 7: Prova de Coping (Dentista) [COM AGENDA]
  prova_coping_status: StatusEtapa;
  prova_coping_data?: string | null;
  prova_coping_agenda?: string | null;
  prova_coping_executor_id?: string | null;
  prova_coping_executado_em?: string | null;
  prova_coping_executado_por?: string | null;

  // Etapa 8: ENVIO DE LB (Secretária)
  envio_lb_status: StatusEtapa;
  envio_lb_data?: string | null;
  envio_lb_executor_id?: string | null;
  envio_lb_executado_em?: string | null;
  envio_lb_executado_por?: string | null;

  // Etapa 9: Recebimento Lab (Secretária)
  recebimento_lab_status: StatusEtapa;
  recebimento_lab_data?: string | null;
  recebimento_lab_executor_id?: string | null;
  recebimento_lab_executado_em?: string | null;
  recebimento_lab_executado_por?: string | null;

  // Etapa 10: Paciente 3 (Dentista) [COM AGENDA]
  paciente3_status: StatusEtapa;
  paciente3_data?: string | null;
  paciente3_agenda?: string | null;
  paciente3_executor_id?: string | null;
  paciente3_executado_em?: string | null;
  paciente3_executado_por?: string | null;

  // Metadados
  created_at: string;
  updated_at: string;
}

export interface EtapaLabExternoConfig {
  key: string;
  label: string;
  responsavel: TipoExecutor;
  ordem: number;
  cor: string;
  temAgenda: boolean;
}

export const ETAPAS_LAB_EXTERNO: EtapaLabExternoConfig[] = [
  {
    key: 'escaner',
    label: 'Escaner',
    responsavel: 'PROTETICO',
    ordem: 1,
    cor: 'orange',
    temAgenda: false,
  },
  {
    key: 'envio_arquivo',
    label: 'Envio de Arquivo',
    responsavel: 'SECRETARIA',
    ordem: 2,
    cor: 'green',
    temAgenda: false,
  },
  {
    key: 'moldagem',
    label: 'Moldagem',
    responsavel: 'DENTISTA',
    ordem: 3,
    cor: 'blue',
    temAgenda: false,
  },
  {
    key: 'vg',
    label: 'VG',
    responsavel: 'PROTETICO',
    ordem: 4,
    cor: 'orange',
    temAgenda: false,
  },
  {
    key: 'env_lab',
    label: 'Envio Lab',
    responsavel: 'SECRETARIA',
    ordem: 5,
    cor: 'green',
    temAgenda: false,
  },
  {
    key: 'rec_lab_copping',
    label: 'Rec. Lab Coping',
    responsavel: 'SECRETARIA',
    ordem: 6,
    cor: 'green',
    temAgenda: false,
  },
  {
    key: 'prova_coping',
    label: 'Prova de Coping',
    responsavel: 'DENTISTA',
    ordem: 7,
    cor: 'blue',
    temAgenda: true,
  },
  {
    key: 'envio_lb',
    label: 'Envio de LB',
    responsavel: 'SECRETARIA',
    ordem: 8,
    cor: 'green',
    temAgenda: false,
  },
  {
    key: 'recebimento_lab',
    label: 'Recebimento de Lab',
    responsavel: 'SECRETARIA',
    ordem: 9,
    cor: 'green',
    temAgenda: false,
  },
  {
    key: 'paciente3',
    label: 'Paciente 3 (Finalização)',
    responsavel: 'DENTISTA',
    ordem: 10,
    cor: 'blue',
    temAgenda: true,
  },
];

export const ETAPAS_COROA_IMPLANTE: EtapaLabExternoConfig[] = [...ETAPAS_LAB_EXTERNO];
export const ETAPAS_FIXA_ZIRCONIA: EtapaLabExternoConfig[] = [...ETAPAS_LAB_EXTERNO];
