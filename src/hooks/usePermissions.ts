import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  UserRole,
  UserProfile,
  SystemModule,
  SystemAction,
  hasModuleAccess,
  hasActionAccess,
  canExecuteEtapa,
  ROLE_PERMISSIONS
} from '@/types/permissions';

// Hook para obter o perfil do usuário atual
export function useUserProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // Se não encontrou perfil, retorna perfil padrão
        if (error.code === 'PGRST116') {
          return {
            id: '',
            user_id: user.id,
            email: user.email || '',
            nome: user.email?.split('@')[0] || 'Usuário',
            role: 'SECRETARIA' as UserRole,
            ativo: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          } as UserProfile;
        }
        throw error;
      }

      return data as UserProfile;
    },
    enabled: !!user,
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook principal de permissões
export function usePermissions() {
  const { data: profile, isLoading } = useUserProfile();

  const role = profile?.role || 'SECRETARIA';

  return {
    profile,
    role,
    isLoading,

    // Verificar acesso a módulo
    canAccessModule: (module: SystemModule): boolean => {
      if (!profile) return false;
      return hasModuleAccess(role, module);
    },

    // Verificar ação específica
    canPerformAction: (action: SystemAction): boolean => {
      if (!profile) return false;
      return hasActionAccess(role, action);
    },

    // Verificar se pode executar etapa de procedimento
    canExecuteEtapa: (tipoEtapa: 'DENTISTA' | 'PROTETICO' | 'SECRETARIA'): boolean => {
      if (!profile) return false;
      return canExecuteEtapa(role, tipoEtapa);
    },

    // Verificar se é admin ou dev
    isAdmin: role === 'ADMIN' || role === 'DEV',

    // Verificar se é dev
    isDev: role === 'DEV',

    // Obter permissões completas do role
    permissions: ROLE_PERMISSIONS[role]
  };
}

// Hook para listar todos os perfis (apenas admin)
export function useAllUserProfiles() {
  const { user } = useAuth();
  const { isAdmin } = usePermissions();

  return useQuery({
    queryKey: ['allUserProfiles', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('nome', { ascending: true });

      if (error) throw error;
      return data as UserProfile[];
    },
    enabled: !!user && isAdmin,
  });
}

// Hook para atualizar perfil de usuário
export function useUpdateUserProfile() {
  const { user } = useAuth();

  const updateProfile = async (
    profileId: string,
    updates: Partial<Pick<UserProfile, 'nome' | 'role' | 'ativo'>>
  ) => {
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', profileId)
      .select()
      .single();

    if (error) throw error;
    return data as UserProfile;
  };

  return { updateProfile };
}

// Hook para criar perfil de usuário
export function useCreateUserProfile() {
  const { user } = useAuth();

  const createProfile = async (
    newProfile: Pick<UserProfile, 'email' | 'nome' | 'role'>
  ) => {
    if (!user) throw new Error('Usuário não autenticado');

    // Nota: O user_id será preenchido pelo trigger quando o usuário se registrar
    // Este método é para criar perfis manualmente
    const { data, error } = await supabase
      .from('user_profiles')
      .insert(newProfile)
      .select()
      .single();

    if (error) throw error;
    return data as UserProfile;
  };

  return { createProfile };
}
