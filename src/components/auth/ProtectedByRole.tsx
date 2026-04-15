import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';
import { SystemModule, SystemAction, UserRole } from '@/types/permissions';
import { Skeleton } from '@/components/ui/skeleton';
import { ShieldAlert } from 'lucide-react';

interface ProtectedByRoleProps {
  children: ReactNode;
  // Permitir por módulo
  module?: SystemModule;
  // Permitir por ação
  action?: SystemAction;
  // Permitir por roles específicos
  allowedRoles?: UserRole[];
  // Redirecionar para outra página se não tiver acesso
  redirectTo?: string;
  // Mostrar mensagem ao invés de redirecionar
  showMessage?: boolean;
  // Esconder completamente se não tiver acesso
  hideIfNoAccess?: boolean;
  // Mensagem customizada
  customMessage?: string;
}

export function ProtectedByRole({
  children,
  module,
  action,
  allowedRoles,
  redirectTo = '/dashboard',
  showMessage = false,
  hideIfNoAccess = false,
  customMessage
}: ProtectedByRoleProps) {
  const { profile, role, isLoading, canAccessModule, canPerformAction } = usePermissions();

  // Carregando
  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  // Verificar permissão
  let hasAccess = true;

  // Verificar por módulo
  if (module && !canAccessModule(module)) {
    hasAccess = false;
  }

  // Verificar por ação
  if (action && !canPerformAction(action)) {
    hasAccess = false;
  }

  // Verificar por roles específicos
  if (allowedRoles && !allowedRoles.includes(role)) {
    hasAccess = false;
  }

  // Se não tem acesso
  if (!hasAccess) {
    // Esconder completamente
    if (hideIfNoAccess) {
      return null;
    }

    // Mostrar mensagem
    if (showMessage) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50 rounded-lg border border-red-200">
          <ShieldAlert className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Acesso Restrito
          </h3>
          <p className="text-red-600">
            {customMessage || 'Você não tem permissão para acessar este recurso.'}
          </p>
        </div>
      );
    }

    // Redirecionar
    return <Navigate to={redirectTo} replace />;
  }

  // Tem acesso
  return <>{children}</>;
}

// Componente para esconder elementos baseado em permissão
interface HideIfNoAccessProps {
  children: ReactNode;
  module?: SystemModule;
  action?: SystemAction;
  allowedRoles?: UserRole[];
}

export function HideIfNoAccess({
  children,
  module,
  action,
  allowedRoles
}: HideIfNoAccessProps) {
  return (
    <ProtectedByRole
      module={module}
      action={action}
      allowedRoles={allowedRoles}
      hideIfNoAccess
    >
      {children}
    </ProtectedByRole>
  );
}

// Componente para verificar se pode executar etapa
interface CanExecuteEtapaProps {
  children: ReactNode;
  tipoEtapa: 'DENTISTA' | 'PROTETICO' | 'SECRETARIA';
  hideIfNoAccess?: boolean;
  showMessage?: boolean;
}

export function CanExecuteEtapa({
  children,
  tipoEtapa,
  hideIfNoAccess = false,
  showMessage = false
}: CanExecuteEtapaProps) {
  const { canExecuteEtapa, isLoading } = usePermissions();

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  const hasAccess = canExecuteEtapa(tipoEtapa);

  if (!hasAccess) {
    if (hideIfNoAccess) {
      return null;
    }

    if (showMessage) {
      return (
        <div className="p-3 bg-gray-100 rounded-lg text-center text-sm text-gray-500">
          Esta etapa é de responsabilidade do {tipoEtapa.toLowerCase()}
        </div>
      );
    }

    return null;
  }

  return <>{children}</>;
}
