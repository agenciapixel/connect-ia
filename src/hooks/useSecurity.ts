import { useState, useCallback, useRef } from 'react';
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

// Cache em memória para evitar consultas repetidas
const authCache = new Map<string, { isAuthorized: boolean; role: 'admin' | 'user' | null; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

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

  // Ref para evitar validações duplicadas
  const isValidatingRef = useRef(false);
  const lastValidatedEmailRef = useRef<string>('');

  const checkUserAuthorization = useCallback(async (userEmail: string): Promise<boolean> => {
    try {
      console.log('🔍 checkUserAuthorization: Iniciando para:', userEmail);

      // Verificar cache primeiro
      const cached = authCache.get(userEmail);
      if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        console.log('✅ checkUserAuthorization: Usando cache:', cached.isAuthorized);
        return cached.isAuthorized;
      }

      // Timeout de 10 segundos (balanceado)
      const queryPromise = supabase
        .from('authorized_users')
        .select('email, role')
        .eq('email', userEmail)
        .maybeSingle();

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout: 10 segundos')), 10000)
      );

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

      console.log('🔍 checkUserAuthorization: Resposta:', { data, error });

      if (error) {
        console.error('❌ checkUserAuthorization: Erro:', error);
        // Verificar cache antigo em caso de erro
        if (cached) {
          console.log('🔄 checkUserAuthorization: Usando cache antigo por erro');
          return cached.isAuthorized;
        }
        return false;
      }

      const result = !!data;
      console.log('✅ checkUserAuthorization: Resultado:', result);

      // Atualizar cache
      if (data) {
        authCache.set(userEmail, {
          isAuthorized: result,
          role: data.role as 'admin' | 'user',
          timestamp: Date.now()
        });
      }

      return result;

    } catch (err) {
      console.error('❌ checkUserAuthorization: Exception:', err);

      // Verificar cache em caso de timeout
      const cached = authCache.get(userEmail);
      if (cached) {
        console.log('🔄 checkUserAuthorization: Usando cache por timeout/erro');
        return cached.isAuthorized;
      }

      return false;
    }
  }, []);

  const getUserRole = useCallback(async (userEmail: string): Promise<'admin' | 'user' | null> => {
    try {
      console.log('🔍 getUserRole: Iniciando para:', userEmail);

      // Verificar cache primeiro
      const cached = authCache.get(userEmail);
      if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        console.log('✅ getUserRole: Usando cache:', cached.role);
        return cached.role;
      }

      // Timeout de 10 segundos
      const queryPromise = supabase
        .from('authorized_users')
        .select('role')
        .eq('email', userEmail)
        .maybeSingle();

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout: 10 segundos')), 10000)
      );

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

      console.log('🔍 getUserRole: Resposta:', { data, error });

      if (error) {
        console.error('❌ getUserRole: Erro:', error);
        // Usar cache em caso de erro
        if (cached) {
          console.log('🔄 getUserRole: Usando cache por erro');
          return cached.role;
        }
        return null;
      }

      if (!data) {
        console.log('❌ getUserRole: Usuário não encontrado na tabela');
        return null;
      }

      const result = data.role as 'admin' | 'user';
      console.log('✅ getUserRole: Role encontrado:', result);

      // Atualizar cache se já existir
      const existingCache = authCache.get(userEmail);
      if (existingCache) {
        authCache.set(userEmail, {
          ...existingCache,
          role: result,
          timestamp: Date.now()
        });
      }

      return result;

    } catch (err) {
      console.error('❌ getUserRole: Exception:', err);

      // Usar cache em caso de timeout
      const cached = authCache.get(userEmail);
      if (cached) {
        console.log('🔄 getUserRole: Usando cache por timeout');
        return cached.role;
      }

      return null;
    }
  }, []);

  const getPermissions = useCallback((role: 'admin' | 'user' | null) => {
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
  }, []);

  const validateUser = useCallback(async (userEmail: string) => {
    // Evitar validações duplicadas
    if (isValidatingRef.current && lastValidatedEmailRef.current === userEmail) {
      console.log('🔍 useSecurity: Validação já em andamento para', userEmail, ', pulando...');
      return;
    }

    isValidatingRef.current = true;
    lastValidatedEmailRef.current = userEmail;

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

      console.log('✅ useSecurity: Validação concluída:', { isAuthorized, userRole, permissions });

      if (!isAuthorized) {
        console.log('❌ useSecurity: Usuário não autorizado, fazendo logout');
        toast.error('Usuário não autorizado. Entre em contato com o administrador.');
        await supabase.auth.signOut();
        // Limpar cache
        authCache.delete(userEmail);
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
    } finally {
      isValidatingRef.current = false;
    }
  }, [checkUserAuthorization, getUserRole, getPermissions]);

  const clearSecurity = useCallback(() => {
    setSecurity({
      isAuthorized: false,
      isLoading: false,
      userRole: null,
      permissions: getPermissions(null)
    });
    isValidatingRef.current = false;
    lastValidatedEmailRef.current = '';
  }, [getPermissions]);

  return {
    ...security,
    validateUser,
    clearSecurity
  };
}
