import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { del } from 'idb-keyval';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Registrar auditoria de login bem-sucedido
    if (!error && data.user) {
      try {
        await supabase.rpc('log_audit', {
          p_action: 'LOGIN',
          p_table_name: 'auth.users',
          p_record_id: data.user.id,
          p_new_data: {
            email: data.user.email,
            timestamp: new Date().toISOString()
          }
        });
      } catch (auditError) {
        // Não falhar o login se a auditoria falhar
        // TODO: Implementar logging service em produção (Sentry/LogRocket)
      }
    }

    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/orto/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { error };
  };

  const signOut = async () => {
    try {
      // Registrar auditoria de logout ANTES de limpar estado
      const currentUser = user;
      if (currentUser) {
        try {
          await supabase.rpc('log_audit', {
            p_action: 'LOGOUT',
            p_table_name: 'auth.users',
            p_record_id: currentUser.id,
            p_old_data: {
              email: currentUser.email,
              timestamp: new Date().toISOString()
            }
          });
        } catch (auditError) {
          // Não falhar o logout se a auditoria falhar
        }
      }

      // Hard Clear local state (Security measure)
      setSession(null);
      setUser(null);
      
      // Clear persistence and cache
      await del('REACT_QUERY_OFFLINE_CACHE');

      // Then try to sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Supabase signout soft-failed:", error);
      }

      window.location.href = '/orto/auth';
    } catch (error) {
      await del('REACT_QUERY_OFFLINE_CACHE');
      window.location.href = '/orto/auth';
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};