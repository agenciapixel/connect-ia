import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export function usePersistentAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se há uma sessão ativa
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao verificar sessão:', error);
          return;
        }

        if (session?.user) {
          setUser(session.user);
          
          // Se o usuário escolheu "permanecer logado", manter a sessão
          const rememberMe = localStorage.getItem('rememberMe');
          if (rememberMe === 'true') {
            // Sessão já está ativa, não precisa fazer nada
            console.log('Usuário permanece logado');
          }
        } else {
          // Verificar se há dados salvos para "permanecer logado"
          const rememberMe = localStorage.getItem('rememberMe');
          const savedEmail = localStorage.getItem('userEmail');
          
          if (rememberMe === 'true' && savedEmail) {
            // Tentar restaurar a sessão automaticamente
            console.log('Tentando restaurar sessão para:', savedEmail);
            // Nota: Não podemos fazer login automático por segurança
            // O usuário precisa inserir a senha novamente
          }
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (session?.user) {
          setUser(session.user);
          
          // Salvar dados se "permanecer logado" estiver ativo
          const rememberMe = localStorage.getItem('rememberMe');
          if (rememberMe === 'true') {
            localStorage.setItem('userEmail', session.user.email || '');
          }
        } else {
          setUser(null);
          
          // Limpar dados se não estiver mais logado
          const rememberMe = localStorage.getItem('rememberMe');
          if (rememberMe !== 'true') {
            localStorage.removeItem('userEmail');
          }
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
