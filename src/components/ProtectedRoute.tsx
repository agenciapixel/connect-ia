import { Navigate } from "react-router-dom";
import { usePersistentAuth } from "@/hooks/usePersistentAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute simplificado - APENAS verifica se está logado.
 *
 * Sistema de autorização (useSecurity) foi DESABILITADO temporariamente.
 * Backup em: .backup/auth-system-v1.1/
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = usePersistentAuth();

  // Se não está carregando e não tem usuário, redirecionar para login
  if (!loading && !user) {
    return <Navigate to="/autenticacao" replace />;
  }

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Usuário logado, permitir acesso
  return <>{children}</>;
}
