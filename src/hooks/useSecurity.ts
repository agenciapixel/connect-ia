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
      const { data, error } = await supabase
        .rpc('is_user_authorized', {
          user_email: userEmail
        });

      if (error) {
        console.error('Erro ao verificar autorização:', error);
        return false;
      }

      return data || false;
    } catch (err) {
      console.error('Erro ao verificar autorização:', err);
      return false;
    }
  };

  const getUserRole = async (userEmail: string): Promise<'admin' | 'user' | null> => {
    try {
      const { data, error } = await supabase
        .from('authorized_users')
        .select('role')
        .eq('email', userEmail)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return null;
      }

      return data.role as 'admin' | 'user';
    } catch (err) {
      console.error('Erro ao obter role do usuário:', err);
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
    setSecurity(prev => ({ ...prev, isLoading: true }));

    try {
      const [isAuthorized, userRole] = await Promise.all([
        checkUserAuthorization(userEmail),
        getUserRole(userEmail)
      ]);

      const permissions = getPermissions(userRole);

      setSecurity({
        isAuthorized,
        isLoading: false,
        userRole,
        permissions
      });

      if (!isAuthorized) {
        toast.error('Usuário não autorizado. Entre em contato com o administrador.');
        await supabase.auth.signOut();
      }

    } catch (error) {
      console.error('Erro na validação de segurança:', error);
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

