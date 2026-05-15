// Tipos de perfil de usuário
export type UserRole =
  | 'ADMIN'
  | 'DEV'
  | 'FINANCEIRO'
  | 'DENTISTA'
  | 'PROTETICO'
  | 'SECRETARIA';

// Módulos do sistema
export type SystemModule =
  | 'dashboard'
  | 'pacientes'
  | 'agendamentos'
  | 'procedimentos'
  | 'cadastros'
  | 'financeiro'
  | 'relatorios'
  | 'configuracoes'
  | 'utilitarios';

// Ações específicas
export type SystemAction =
  | 'view'
  | 'create'
  | 'edit'
  | 'delete'
  | 'execute_etapa_dentista'
  | 'execute_etapa_protetico'
  | 'execute_etapa_secretaria';

// Interface do perfil de usuário
export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  nome: string;
  role: UserRole;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

// Configuração de permissões por role
export const ROLE_PERMISSIONS: Record<UserRole, {
  modules: SystemModule[];
  actions: SystemAction[];
  description: string;
}> = {
  DEV: {
    modules: ['dashboard', 'pacientes', 'agendamentos', 'procedimentos', 'cadastros', 'financeiro', 'relatorios', 'configuracoes', 'utilitarios'],
    actions: ['view', 'create', 'edit', 'delete', 'execute_etapa_dentista', 'execute_etapa_protetico', 'execute_etapa_secretaria'],
    description: 'Desenvolvedor - Acesso total ao sistema'
  },
  ADMIN: {
    modules: ['dashboard', 'pacientes', 'agendamentos', 'procedimentos', 'cadastros', 'financeiro', 'relatorios', 'configuracoes', 'utilitarios'],
    actions: ['view', 'create', 'edit', 'delete', 'execute_etapa_dentista', 'execute_etapa_protetico', 'execute_etapa_secretaria'],
    description: 'Administrador - Acesso total ao sistema'
  },
  FINANCEIRO: {
    modules: ['dashboard', 'financeiro', 'relatorios'],
    actions: ['view', 'create', 'edit', 'delete'],
    description: 'Financeiro - Acesso ao módulo financeiro e relatórios'
  },
  DENTISTA: {
    modules: ['dashboard', 'pacientes', 'agendamentos', 'procedimentos'],
    actions: ['view', 'create', 'edit', 'execute_etapa_dentista'],
    description: 'Dentista - Acesso a pacientes, agendamentos e procedimentos'
  },
  PROTETICO: {
    modules: ['dashboard', 'procedimentos'],
    actions: ['view', 'execute_etapa_protetico'],
    description: 'Protético - Acesso às etapas de protético nos procedimentos'
  },
  SECRETARIA: {
    modules: ['dashboard', 'pacientes', 'agendamentos', 'procedimentos'],
    actions: ['view', 'create', 'edit', 'execute_etapa_secretaria'],
    description: 'Secretária - Acesso a pacientes, agendamentos e etapas de secretária'
  }
};

// Labels amigáveis para os roles
export const ROLE_LABELS: Record<UserRole, string> = {
  DEV: 'Desenvolvedor',
  ADMIN: 'Administrador',
  FINANCEIRO: 'Financeiro',
  DENTISTA: 'Dentista',
  PROTETICO: 'Protético',
  SECRETARIA: 'Secretária'
};

// Cores para os roles
export const ROLE_COLORS: Record<UserRole, string> = {
  DEV: 'bg-purple-100 text-purple-800 border-purple-300',
  ADMIN: 'bg-red-100 text-red-800 border-red-300',
  FINANCEIRO: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  DENTISTA: 'bg-blue-100 text-blue-800 border-blue-300',
  PROTETICO: 'bg-orange-100 text-orange-800 border-orange-300',
  SECRETARIA: 'bg-green-100 text-green-800 border-green-300'
};

// Mapear rotas para módulos
export const ROUTE_MODULE_MAP: Record<string, SystemModule> = {
  '/dashboard': 'dashboard',
  '/patients': 'pacientes',
  '/appointments': 'agendamentos',
  '/procedimentos': 'procedimentos',
  '/cadastros': 'cadastros',
  '/financeiro': 'financeiro',
  '/relatorios': 'relatorios',
  '/configuracoes': 'configuracoes',
  '/utilitarios': 'utilitarios'
};

// Função para verificar se um role tem acesso a um módulo
export function hasModuleAccess(role: UserRole, module: SystemModule): boolean {
  return ROLE_PERMISSIONS[role].modules.includes(module);
}

// Função para verificar se um role tem uma ação específica
export function hasActionAccess(role: UserRole, action: SystemAction): boolean {
  return ROLE_PERMISSIONS[role].actions.includes(action);
}

// Função para verificar se pode executar etapa de procedimento
export function canExecuteEtapa(role: UserRole, tipoEtapa: 'DENTISTA' | 'PROTETICO' | 'SECRETARIA'): boolean {
  // Admin e Dev podem tudo
  if (role === 'ADMIN' || role === 'DEV') {
    return true;
  }

  // Mapear tipo de etapa para ação
  const actionMap: Record<string, SystemAction> = {
    'DENTISTA': 'execute_etapa_dentista',
    'PROTETICO': 'execute_etapa_protetico',
    'SECRETARIA': 'execute_etapa_secretaria'
  };

  return hasActionAccess(role, actionMap[tipoEtapa]);
}
