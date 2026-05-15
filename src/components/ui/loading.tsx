import React from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from './skeleton';

// =====================================================
// LOADING SPINNER
// =====================================================

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const LoadingSpinner = ({ size = 'md', className }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  return (
    <Loader2
      className={cn('animate-spin text-primary', sizeClasses[size], className)}
      aria-label="Carregando"
    />
  );
};

// =====================================================
// LOADING OVERLAY (Fullscreen)
// =====================================================

interface LoadingOverlayProps {
  message?: string;
  transparent?: boolean;
}

export const LoadingOverlay = ({ message, transparent = false }: LoadingOverlayProps) => {
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center',
        transparent ? 'bg-background/80 backdrop-blur-sm' : 'bg-background'
      )}
      role="status"
      aria-live="polite"
      aria-label={message || 'Carregando'}
    >
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="xl" />
        {message && (
          <p className="text-sm text-muted-foreground animate-pulse">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

// =====================================================
// LOADING CARD (Para cards e seções)
// =====================================================

interface LoadingCardProps {
  lines?: number;
  className?: string;
}

export const LoadingCard = ({ lines = 3, className }: LoadingCardProps) => {
  return (
    <div className={cn('space-y-3 p-4', className)} role="status" aria-label="Carregando">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
    </div>
  );
};

// =====================================================
// LOADING TABLE (Para tabelas)
// =====================================================

interface LoadingTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export const LoadingTable = ({ rows = 5, columns = 4, className }: LoadingTableProps) => {
  return (
    <div className={cn('space-y-2', className)} role="status" aria-label="Carregando tabela">
      {/* Header */}
      <div className="flex gap-4 pb-2 border-b">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
};

// =====================================================
// LOADING BUTTON (Estado de loading em botões)
// =====================================================

interface LoadingButtonContentProps {
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export const LoadingButtonContent = ({
  loading,
  loadingText,
  children
}: LoadingButtonContentProps) => {
  if (loading) {
    return (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {loadingText || 'Carregando...'}
      </>
    );
  }
  return <>{children}</>;
};

// =====================================================
// LOADING PAGE (Página inteira)
// =====================================================

interface LoadingPageProps {
  message?: string;
}

export const LoadingPage = ({ message = 'Carregando...' }: LoadingPageProps) => {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-background"
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="flex flex-col items-center gap-6 p-8">
        <div className="relative">
          <div className="absolute inset-0 animate-ping opacity-75">
            <div className="w-16 h-16 rounded-full bg-primary/20" />
          </div>
          <LoadingSpinner size="xl" className="relative" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold">{message}</h2>
          <p className="text-sm text-muted-foreground">
            Por favor, aguarde um momento...
          </p>
        </div>
      </div>
    </div>
  );
};

// =====================================================
// LOADING CONTAINER (Para envolver conteúdo)
// =====================================================

interface LoadingContainerProps {
  loading: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  skeletonLines?: number;
}

export const LoadingContainer = ({
  loading,
  children,
  fallback,
  skeletonLines = 5
}: LoadingContainerProps) => {
  if (loading) {
    return <>{fallback || <LoadingCard lines={skeletonLines} />}</>;
  }
  return <>{children}</>;
};

// =====================================================
// LOADING DOTS (Animação de 3 pontos)
// =====================================================

export const LoadingDots = () => {
  return (
    <span className="inline-flex gap-1" aria-label="Carregando">
      <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </span>
  );
};

// =====================================================
// LOADING LIST (Para listas)
// =====================================================

interface LoadingListProps {
  items?: number;
  className?: string;
}

export const LoadingList = ({ items = 5, className }: LoadingListProps) => {
  return (
    <div className={cn('space-y-3', className)} role="status" aria-label="Carregando lista">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
};

// =====================================================
// LOADING REFRESH (Botão de refresh com loading)
// =====================================================

interface LoadingRefreshProps {
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

export const LoadingRefresh = ({ loading, onClick, className }: LoadingRefreshProps) => {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={cn(
        'inline-flex items-center gap-2 px-3 py-2 rounded-md',
        'hover:bg-accent transition-colors',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      aria-label={loading ? 'Atualizando' : 'Atualizar'}
    >
      <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
      <span className="text-sm">{loading ? 'Atualizando...' : 'Atualizar'}</span>
    </button>
  );
};

// =====================================================
// EXEMPLO DE USO
// =====================================================

/*
// 1. Loading Spinner simples
<LoadingSpinner size="md" />

// 2. Loading Overlay (fullscreen)
{isLoading && <LoadingOverlay message="Salvando dados..." />}

// 3. Loading Card (skeleton)
<LoadingCard lines={5} />

// 4. Loading Table
<LoadingTable rows={10} columns={5} />

// 5. Loading Button
<Button disabled={isLoading}>
  <LoadingButtonContent loading={isLoading} loadingText="Salvando...">
    Salvar
  </LoadingButtonContent>
</Button>

// 6. Loading Page (página inteira)
{isInitializing && <LoadingPage message="Inicializando aplicação..." />}

// 7. Loading Container (condicional)
<LoadingContainer loading={isLoading} skeletonLines={3}>
  <ConteudoReal />
</LoadingContainer>

// 8. Loading Dots
<span>Processando<LoadingDots /></span>

// 9. Loading List
<LoadingList items={5} />

// 10. Loading Refresh
<LoadingRefresh loading={isRefreshing} onClick={handleRefresh} />
*/
