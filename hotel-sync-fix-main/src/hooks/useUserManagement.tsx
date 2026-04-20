import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { UserRole } from '@/types/hotel';

export interface ManagedUser {
  user_id: string;
  email: string;
  nome: string;
  role: UserRole;
  created_at: string;
}

export function useUserManagement() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const { data, error } = await (supabase as any).rpc('list_users_with_roles');

      if (error) throw error;

      setUsers((data || []) as ManagedUser[]);
    } catch (error: any) {
      console.error('Erro ao carregar usuários:', error);
      toast.error(error?.message || 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const setUserRole = async (targetUserId: string, role: UserRole) => {
    try {
      setUpdatingUserId(targetUserId);

      const { error } = await (supabase as any).rpc('set_user_role', {
        p_target_user_id: targetUserId,
        p_new_role: role,
      });

      if (error) throw error;

      toast.success('Permissão atualizada com sucesso!');
      await fetchUsers();
      return true;
    } catch (error: any) {
      console.error('Erro ao atualizar role:', error);
      toast.error(error?.message || 'Erro ao atualizar permissão');
      return false;
    } finally {
      setUpdatingUserId(null);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    updatingUserId,
    refetch: fetchUsers,
    setUserRole,
  };
}
