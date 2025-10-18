import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SecurityContext {
  isAuthorized: boolean;
  isLoading: boolean;
  userRole: 'admin' | 'user' | null;
  permissions: {
    canManageContacts: boolean;
    canManageCampaigns: boolean;
    canCreateProspects: boolean;
    canManageAttendants: boolean;
    canManageCRM: boolean;
    canManageSettings: boolean;
    canManageAIAgents: boolean;
    canManageIntegrations: boolean;
  };
}

export function useSecurity() {
  const [security, setSecurity] = useState<SecurityContext>({
    isAuthorized: false,
    isLoading: true,
    userRole: null,
    permissions: {
      canManageContacts: false,
      canManageCampaigns: false,
      canCreateProspects: false,
      canManageAttendants: false,
      canManageCRM: false,
      canManageSettings: false,
      canManageAIAgents: false,
      canManageIntegrations: false,
    }
  });

  const checkUserAuthorization = async (userEmail: string): Promise<boolean> => {
    try {
      console.log('🔍 checkUserAuthorization: Iniciando para:', userEmail);

      // Timeout de 15 segundos (mais realista para Supabase)
      const queryPromise = supabase
        .from('authorized_users')
        .select('email')
        .eq('email', userEmail)
        .maybeSingle();

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout: 15 segundos')), 15000)
      );

      try {
        const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

        console.log('🔍 checkUserAuthorization: Resposta:', { data, error });

        if (error) {
          console.error('❌ checkUserAuthorization: Erro:', error);
          // Em caso de erro do banco, negar acesso (segurança primeiro)
          return false;
        }

        const result = !!data;
        console.log('🔍 checkUserAuthorization: Resultado:', result);
        return result;

      } catch (timeoutError) {
        console.log('⏱️ checkUserAuthorization: Timeout detectado');
        // Em caso de timeout, negar acesso por segurança
        console.error('❌ checkUserAuthorization: Acesso negado por timeout');
        return false;
      }

    } catch (err) {
      console.error('❌ checkUserAuthorization: Exception:', err);
      // Em caso de erro, negar acesso (fail-secure)
      return false;
    }
  };

  const getUserRole = async (userEmail: string): Promise<'admin' | 'user' | null> => {
    try {
      console.log('🔍 getUserRole: Iniciando para:', userEmail);

      // Timeout de 15 segundos (consistente com checkUserAuthorization)
      const queryPromise = supabase
        .from('authorized_users')
        .select('role')
        .eq('email', userEmail)
        .maybeSingle();

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout: 15 segundos')), 15000)
      );

      try {
        const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

        console.log('🔍 getUserRole: Resposta:', { data, error });

        if (error) {
          console.error('❌ getUserRole: Erro:', error);
          return null; // Retornar null em caso de erro
        }

        if (!data) {
          console.log('❌ getUserRole: Usuário não encontrado na tabela');
          return null; // Usuário não está na tabela authorized_users
        }

        const result = data.role as 'admin' | 'user';
        console.log('✅ getUserRole: Role encontrado:', result);
        return result;

      } catch (timeoutError) {
        console.error('⏱️ getUserRole: Timeout detectado');
        return null; // Retornar null em caso de timeout
      }

    } catch (err) {
      console.error('❌ getUserRole: Exception:', err);
      return null; // Retornar null em caso de exceção
    }
  };


  const getPermissions = (role: 'admin' | 'user' | null) => {
    if (role === 'admin') {
      return {
        canManageContacts: true,
        canManageCampaigns: true,
        canCreateProspects: true,
        canManageAttendants: true,
        canManageCRM: true,
        canManageSettings: true,
        canManageAIAgents: true,
        canManageIntegrations: true,
      };
    } else if (role === 'user') {
      return {
        canManageContacts: true,
        canManageCampaigns: true,
        canCreateProspects: true,
        canManageAttendants: false,
        canManageCRM: true,
        canManageSettings: false,
        canManageAIAgents: false,
        canManageIntegrations: false,
      };
    } else {
      return {
        canManageContacts: false,
        canManageCampaigns: false,
        canCreateProspects: false,
        canManageAttendants: false,
        canManageCRM: false,
        canManageSettings: false,
        canManageAIAgents: false,
        canManageIntegrations: false,
      };
    }
  };

  const validateUser = async (userEmail: string) => {
    // Evitar validações duplicadas
    if (security.isLoading) {
      console.log('🔍 useSecurity: Validação já em andamento, pulando...');
      return;
    }

    console.log('🔍 useSecurity: Iniciando validação para:', userEmail);
    setSecurity(prev => ({ ...prev, isLoading: true }));

    try {
      console.log('🔍 useSecurity: Verificando autorização...');
      const isAuthorized = await checkUserAuthorization(userEmail);
      console.log('🔍 useSecurity: Autorização:', isAuthorized);
      
      console.log('🔍 useSecurity: Obtendo role...');
      const userRole = await getUserRole(userEmail);
      console.log('🔍 useSecurity: Role obtido:', userRole);

      const permissions = getPermissions(userRole);

      setSecurity({
        isAuthorized,
        isLoading: false,
        userRole,
        permissions
      });

      console.log('🔍 useSecurity: Validação concluída:', { isAuthorized, userRole, permissions });

      if (!isAuthorized) {
        console.log('❌ useSecurity: Usuário não autorizado, fazendo logout');
        toast.error('Usuário não autorizado. Entre em contato com o administrador.');
        await supabase.auth.signOut();
      }

    } catch (error) {
      console.error('❌ useSecurity: Erro na validação:', error);
      setSecurity(prev => ({
        ...prev,
        isAuthorized: false,
        isLoading: false,
        userRole: null,
        permissions: getPermissions(null)
      }));
    }
  };

  const clearSecurity = () => {
    setSecurity({
      isAuthorized: false,
      isLoading: false,
      userRole: null,
      permissions: getPermissions(null)
    });
  };

  return {
    ...security,
    validateUser,
    clearSecurity
  };
}

