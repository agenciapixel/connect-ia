import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export function usePersistentAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (session?.user) {
          setUser(session.user);
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    try {
      // Limpar dados de "permanecer logado"
      localStorage.removeItem('rememberMe');
      localStorage.removeItem('userEmail');
      
      // Fazer logout
      await supabase.auth.signOut();
      
      console.log('Logout realizado');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const clearRememberMe = () => {
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('userEmail');
  };

  return {
    user,
    loading,
    logout,
    clearRememberMe,
    isRemembered: localStorage.getItem('rememberMe') === 'true'
  };
}
