import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AuthorizedUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useAuthControl() {
  const [authorizedUsers, setAuthorizedUsers] = useState<AuthorizedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar lista de usuários autorizados
  const fetchAuthorizedUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .rpc('get_authorized_users');

      if (error) throw error;

      setAuthorizedUsers(data || []);
    } catch (err) {
      console.error('Erro ao buscar usuários autorizados:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  // Adicionar usuário autorizado
  const addAuthorizedUser = async (email: string, name: string, role: 'admin' | 'user' = 'user') => {
    try {
      const { data, error } = await supabase
        .rpc('add_authorized_user', {
          user_email: email,
          user_name: name,
          user_role: role
        });

      if (error) throw error;

      toast.success('Usuário autorizado adicionado com sucesso!');
      await fetchAuthorizedUsers(); // Atualizar lista
      
      return data;
    } catch (err) {
      console.error('Erro ao adicionar usuário autorizado:', err);
      toast.error('Erro ao adicionar usuário autorizado');
      throw err;
    }
  };

  // Remover usuário autorizado
  const removeAuthorizedUser = async (email: string) => {
    try {
      const { data, error } = await supabase
        .rpc('remove_authorized_user', {
          user_email: email
        });

      if (error) throw error;

      toast.success('Usuário autorizado removido com sucesso!');
      await fetchAuthorizedUsers(); // Atualizar lista
      
      return data;
    } catch (err) {
      console.error('Erro ao remover usuário autorizado:', err);
      toast.error('Erro ao remover usuário autorizado');
      throw err;
    }
  };

  // Verificar se usuário está autorizado
  const isUserAuthorized = async (email: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .rpc('is_user_authorized', {
          user_email: email
        });

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Erro ao verificar autorização:', err);
      return false;
    }
  };

  // Verificar se usuário atual está autorizado
  const checkCurrentUserAuthorization = async (): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.email) return false;
      
      return await isUserAuthorized(user.email);
    } catch (err) {
      console.error('Erro ao verificar autorização do usuário atual:', err);
      return false;
    }
  };

  // Efetuar logout se usuário não estiver autorizado
  const enforceAuthorization = async () => {
    const isAuthorized = await checkCurrentUserAuthorization();
    
    if (!isAuthorized) {
      toast.error('Usuário não autorizado. Entre em contato com o administrador.');
      await supabase.auth.signOut();
      return false;
    }
    
    return true;
  };

  useEffect(() => {
    fetchAuthorizedUsers();
  }, []);

  return {
    authorizedUsers,
    isLoading,
    error,
    fetchAuthorizedUsers,
    addAuthorizedUser,
    removeAuthorizedUser,
    isUserAuthorized,
    checkCurrentUserAuthorization,
    enforceAuthorization
  };
}
