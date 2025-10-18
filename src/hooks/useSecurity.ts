import { useState, useEffect } from 'react';
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
      
      // Verificar diretamente na tabela authorized_users em vez de usar RPC
      const { data, error } = await supabase
        .from('authorized_users')
        .select('email')
        .eq('email', userEmail)
        .single();

      console.log('🔍 checkUserAuthorization: Resposta:', { data, error });

      if (error) {
        console.error('❌ checkUserAuthorization: Erro:', error);
        return false;
      }

      const result = !!data;
      console.log('🔍 checkUserAuthorization: Resultado:', result);
      return result;
    } catch (err) {
      console.error('❌ checkUserAuthorization: Exception:', err);
      return false;
    }
  };

  const getUserRole = async (userEmail: string): Promise<'admin' | 'user' | null> => {
    try {
      console.log('🔍 getUserRole: Iniciando para:', userEmail);
      
      const { data, error } = await supabase
        .from('authorized_users')
        .select('role')
        .eq('email', userEmail)
        .single();

      console.log('🔍 getUserRole: Resposta:', { data, error });

      if (error || !data) {
        console.log('❌ getUserRole: Erro ou sem dados:', error);
        return null;
      }

      const result = data.role as 'admin' | 'user';
      console.log('🔍 getUserRole: Resultado:', result);
      return result;
    } catch (err) {
      console.error('❌ getUserRole: Exception:', err);
      return null;
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
    // Evitar validações desnecessárias se já está carregando ou já validado
    if (security.isLoading || (security.isAuthorized && security.userRole)) {
      console.log('🔍 useSecurity: Validação já em andamento ou concluída, pulando...');
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
      console.log('🔍 useSecurity: Role:', userRole);

      const permissions = getPermissions(userRole);

      setSecurity({
        isAuthorized,
        isLoading: false,
        userRole,
        permissions
      });

      console.log('🔍 useSecurity: Validação concluída:', { isAuthorized, userRole });

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

