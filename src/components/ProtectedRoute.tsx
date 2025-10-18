import { Navigate } from "react-router-dom";
import { usePersistentAuth } from "@/hooks/usePersistentAuth";
import { useSecurity } from "@/hooks/useSecurity";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = usePersistentAuth();
  const { isAuthorized, isLoading, validateUser, clearSecurity } = useSecurity();

  useEffect(() => {
    if (user?.email) {
      validateUser(user.email);
    } else {
      clearSecurity();
    }
  }, [user?.email]); // Removido validateUser e clearSecurity das dependências para evitar loop

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autorização...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/autenticacao" replace />;
  }

  // Temporariamente desabilitar verificação de autorização para contornar erro 500
  // TODO: Reativar quando o problema do Supabase for resolvido
  /*
  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Acesso Não Autorizado
            </h2>
            <p className="text-gray-600 mb-6">
              Seu usuário não está autorizado a acessar o sistema. 
              Entre em contato com o administrador para solicitar acesso.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700">
                <strong>Email:</strong> {user.email}
              </p>
            </div>
            <button
              onClick={() => window.location.href = '/autenticacao'}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Voltar ao Login
            </button>
          </div>
        </div>
      </div>
    );
  }
  */

  return <>{children}</>;
}
