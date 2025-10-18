import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    const logout = async () => {
      try {
        // Limpar localStorage
        localStorage.clear();
        
        // Fazer logout do Supabase
        await supabase.auth.signOut();
        
        console.log('Logout realizado com sucesso');
        
        // Redirecionar para login após 2 segundos
        setTimeout(() => {
          navigate('/autenticacao');
        }, 2000);
        
      } catch (error) {
        console.error('Erro ao fazer logout:', error);
        // Redirecionar mesmo com erro
        setTimeout(() => {
          navigate('/autenticacao');
        }, 2000);
      }
    };

    logout();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Fazendo logout...
        </h2>
        <p className="text-gray-600">
          Limpando sessão e redirecionando para o login.
        </p>
      </div>
    </div>
  );
}
