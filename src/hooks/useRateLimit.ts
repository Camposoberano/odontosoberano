import { useRef, useCallback } from 'react';
import { useToast } from './use-toast';

interface RateLimitOptions {
  maxAttempts: number;
  windowMs: number;
  message?: string;
}

interface RateLimitState {
  attempts: number[];
  blockedUntil: number | null;
}

/**
 * Hook para implementar rate limiting no frontend
 * Útil para prevenir spam de requisições e proteger contra brute force
 *
 * @example
 * const { checkRateLimit, getRemainingAttempts, isBlocked } = useRateLimit({
 *   maxAttempts: 5,
 *   windowMs: 60000, // 1 minuto
 *   message: 'Muitas tentativas. Aguarde 1 minuto.'
 * });
 *
 * const handleSubmit = () => {
 *   if (!checkRateLimit()) {
 *     return; // Bloqueado
 *   }
 *   // Continuar com a ação
 * };
 */
export function useRateLimit(options: RateLimitOptions) {
  const { maxAttempts, windowMs, message } = options;
  const { toast } = useToast();

  // Usar useRef para persistir estado entre renders sem causar re-render
  const stateRef = useRef<RateLimitState>({
    attempts: [],
    blockedUntil: null,
  });

  /**
   * Verifica se a ação está bloqueada por rate limiting
   */
  const isBlocked = useCallback((): boolean => {
    const now = Date.now();
    const state = stateRef.current;

    // Verificar se está em período de bloqueio
    if (state.blockedUntil && now < state.blockedUntil) {
      return true;
    }

    // Limpar bloqueio se o tempo passou
    if (state.blockedUntil && now >= state.blockedUntil) {
      state.blockedUntil = null;
      state.attempts = [];
    }

    // Remover tentativas antigas (fora da janela de tempo)
    state.attempts = state.attempts.filter(
      (timestamp) => now - timestamp < windowMs
    );

    // Verificar se excedeu o número de tentativas
    return state.attempts.length >= maxAttempts;
  }, [maxAttempts, windowMs]);

  /**
   * Tenta executar uma ação, registrando a tentativa
   * Retorna true se permitido, false se bloqueado
   */
  const checkRateLimit = useCallback((): boolean => {
    const now = Date.now();
    const state = stateRef.current;

    // Verificar se está bloqueado
    if (isBlocked()) {
      const remainingTime = state.blockedUntil
        ? Math.ceil((state.blockedUntil - now) / 1000)
        : Math.ceil(windowMs / 1000);

      toast({
        title: 'Ação bloqueada',
        description:
          message ||
          `Você excedeu o limite de tentativas. Aguarde ${remainingTime} segundos.`,
        variant: 'destructive',
      });

      return false;
    }

    // Registrar tentativa
    state.attempts.push(now);

    // Se atingiu o limite, bloquear
    if (state.attempts.length >= maxAttempts) {
      state.blockedUntil = now + windowMs;

      toast({
        title: 'Limite atingido',
        description:
          message ||
          `Você atingiu o limite de ${maxAttempts} tentativas. Aguarde ${Math.ceil(windowMs / 1000)} segundos.`,
        variant: 'destructive',
      });

      return false;
    }

    return true;
  }, [isBlocked, maxAttempts, windowMs, message, toast]);

  /**
   * Retorna o número de tentativas restantes
   */
  const getRemainingAttempts = useCallback((): number => {
    const state = stateRef.current;

    if (isBlocked()) {
      return 0;
    }

    return maxAttempts - state.attempts.length;
  }, [isBlocked, maxAttempts]);

  /**
   * Retorna o tempo restante de bloqueio em segundos
   * Retorna 0 se não estiver bloqueado
   */
  const getRemainingBlockTime = useCallback((): number => {
    const state = stateRef.current;

    if (!state.blockedUntil) {
      return 0;
    }

    const remaining = state.blockedUntil - Date.now();
    return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
  }, []);

  /**
   * Reseta o rate limit (útil para testes ou após sucesso)
   */
  const reset = useCallback(() => {
    stateRef.current = {
      attempts: [],
      blockedUntil: null,
    };
  }, []);

  return {
    checkRateLimit,
    isBlocked,
    getRemainingAttempts,
    getRemainingBlockTime,
    reset,
  };
}

/**
 * Hook especializado para rate limiting de login
 * Configurado com valores padrão seguros para autenticação
 */
export function useLoginRateLimit() {
  return useRateLimit({
    maxAttempts: 5,
    windowMs: 5 * 60 * 1000, // 5 minutos
    message: 'Muitas tentativas de login. Por segurança, aguarde 5 minutos antes de tentar novamente.',
  });
}

/**
 * Hook especializado para rate limiting de formulários
 * Previne spam de submissões
 */
export function useFormRateLimit() {
  return useRateLimit({
    maxAttempts: 10,
    windowMs: 60 * 1000, // 1 minuto
    message: 'Você está enviando formulários muito rapidamente. Aguarde um momento.',
  });
}

/**
 * Hook especializado para rate limiting de busca/pesquisa
 * Previne sobrecarga de queries
 */
export function useSearchRateLimit() {
  return useRateLimit({
    maxAttempts: 20,
    windowMs: 60 * 1000, // 1 minuto
    message: 'Você está fazendo buscas muito rapidamente. Aguarde um momento.',
  });
}

/**
 * Hook especializado para rate limiting de APIs externas
 * Configurado para respeitar limites típicos de APIs
 */
export function useApiRateLimit() {
  return useRateLimit({
    maxAttempts: 30,
    windowMs: 60 * 1000, // 1 minuto
    message: 'Limite de requisições atingido. Aguarde um momento.',
  });
}

// =====================================================
// EXEMPLO DE USO
// =====================================================

/*
// 1. Rate limit para login
function LoginForm() {
  const { checkRateLimit, getRemainingAttempts } = useLoginRateLimit();

  const handleSubmit = async (email: string, password: string) => {
    if (!checkRateLimit()) {
      return; // Bloqueado
    }

    // Continuar com login
    const { error } = await signIn(email, password);

    if (error) {
      // Mostrar tentativas restantes
      const remaining = getRemainingAttempts();
      toast({
        title: 'Erro no login',
        description: `Tentativas restantes: ${remaining}`,
      });
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}

// 2. Rate limit para formulário
function PacienteForm() {
  const { checkRateLimit } = useFormRateLimit();

  const handleSubmit = async (data: FormData) => {
    if (!checkRateLimit()) {
      return;
    }

    await savePaciente(data);
  };

  return <form onSubmit={handleSubmit}>...</form>;
}

// 3. Rate limit personalizado
function CustomComponent() {
  const { checkRateLimit, isBlocked, getRemainingBlockTime } = useRateLimit({
    maxAttempts: 3,
    windowMs: 30000, // 30 segundos
    message: 'Aguarde 30 segundos entre tentativas.',
  });

  if (isBlocked()) {
    const remaining = getRemainingBlockTime();
    return <p>Bloqueado por {remaining} segundos</p>;
  }

  return <Button onClick={() => checkRateLimit() && doAction()}>Ação</Button>;
}
*/
