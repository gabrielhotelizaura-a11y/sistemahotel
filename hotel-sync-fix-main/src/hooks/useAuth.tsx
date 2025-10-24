import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { UserRole } from '@/types/hotel';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          setTimeout(() => {
            fetchUserRole(session.user.id);
          }, 0);
        } else {
          setUserRole(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      console.log('🔍 Buscando role para user_id:', userId);

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('❌ Erro ao buscar role:', error);
        throw error;
      }

      console.log('📋 DADOS BRUTOS do banco:', JSON.stringify(data));
      console.log('📋 Tipo de data.role:', typeof data?.role);
      console.log('📋 Valor exato de data.role:', data?.role);

      if (data) {
        const roleValue = data.role as UserRole;
        setUserRole(roleValue);
        console.log('✅ UserRole definido como:', roleValue);
        console.log('✅ userRole === "admin"?', roleValue === 'admin');
        console.log('✅ userRole === "funcionario"?', roleValue === 'funcionario');
      } else {
        console.warn('⚠️ Nenhuma role encontrada para este usuário');
        setUserRole(null);
      }
    } catch (error) {
      console.error('❌ Error fetching user role:', error);
      setUserRole(null);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, nome: string) => {
    const redirectUrl = `${window.location.origin}/`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { nome }
      }
    });

    if (error) throw error;

    // Role is created automatically by database trigger
    return data;
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const isAdmin = userRole === 'admin';
  const isFuncionario = userRole === 'funcionario';

  // 🔍 DEBUG: Log final dos valores
  console.log('🎯 useAuth Return:', {
    userRole,
    isAdmin,
    isFuncionario,
    userId: user?.id
  });

  return {
    user,
    session,
    userRole,
    loading,
    signUp,
    signIn,
    signOut,
    isAdmin,
    isFuncionario,
  };
}
