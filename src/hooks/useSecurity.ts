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

// Helper para cache localStorage persistente
const getLocalStorageCache = (email: string) => {
  try {
    const cached = localStorage.getItem(`auth_cache_${email}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CACHE_DURATION) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Erro ao ler cache localStorage:', e);
  }
  return null;
};

const setLocalStorageCache = (email: string, data: { isAuthorized: boolean; role: 'admin' | 'user' | null }) => {
  try {
    localStorage.setItem(`auth_cache_${email}`, JSON.stringify({
      ...data,
      timestamp: Date.now()
    }));
  } catch (e) {
    console.error('Erro ao salvar cache localStorage:', e);
  }
};

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

      // 1. Verificar cache em memória primeiro
      const memCache = authCache.get(userEmail);
      if (memCache && (Date.now() - memCache.timestamp) < CACHE_DURATION) {
        console.log('✅ checkUserAuthorization: Usando cache em memória:', memCache.isAuthorized);
        return memCache.isAuthorized;
      }

      // 2. Verificar cache localStorage (persiste entre refreshes)
      const localCache = getLocalStorageCache(userEmail);
      if (localCache) {
        console.log('✅ checkUserAuthorization: Usando cache localStorage:', localCache.isAuthorized);
        // Atualizar cache em memória também
        authCache.set(userEmail, {
          isAuthorized: localCache.isAuthorized,
          role: localCache.role,
          timestamp: localCache.timestamp
        });
        return localCache.isAuthorized;
      }

      // 3. Sem cache, consultar Supabase com timeout aumentado (20s primeira vez)
      console.log('🔍 checkUserAuthorization: Consultando Supabase (sem cache)...');

      const queryPromise = supabase
        .from('authorized_users')
        .select('email, role')
        .eq('email', userEmail)
        .maybeSingle();

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout: 20 segundos')), 20000)
      );

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

      console.log('🔍 checkUserAuthorization: Resposta Supabase:', { data, error });

      if (error) {
        console.error('❌ checkUserAuthorization: Erro:', error);
        // Usar cache antigo se disponível (mesmo expirado)
        if (memCache || localCache) {
          console.log('🔄 checkUserAuthorization: Usando cache expirado por erro');
          return memCache?.isAuthorized || localCache?.isAuthorized || false;
        }
        return false;
      }

      const result = !!data;
      console.log('✅ checkUserAuthorization: Resultado:', result);

      // Atualizar ambos os caches
      if (data) {
        const cacheData = {
          isAuthorized: result,
          role: data.role as 'admin' | 'user',
          timestamp: Date.now()
        };
        authCache.set(userEmail, cacheData);
        setLocalStorageCache(userEmail, {
          isAuthorized: result,
          role: data.role as 'admin' | 'user'
        });
      }

      return result;

    } catch (err) {
      console.error('❌ checkUserAuthorization: Exception:', err);

      // Tentar usar qualquer cache disponível (memória ou localStorage)
      const memCache = authCache.get(userEmail);
      const localCache = getLocalStorageCache(userEmail);

      if (memCache || localCache) {
        console.log('🔄 checkUserAuthorization: Usando cache por timeout/erro');
        return memCache?.isAuthorized || localCache?.isAuthorized || false;
      }

      // ÚLTIMA OPÇÃO: Se for dasilva6r@gmail.com, permitir (temporário para debug)
      if (userEmail === 'dasilva6r@gmail.com') {
        console.warn('⚠️ FALLBACK TEMPORÁRIO: Permitindo acesso para dasilva6r@gmail.com');
        return true;
      }

      return false;
    }
  }, []);

  const getUserRole = useCallback(async (userEmail: string): Promise<'admin' | 'user' | null> => {
    try {
      console.log('🔍 getUserRole: Iniciando para:', userEmail);

      // 1. Verificar cache em memória
      const memCache = authCache.get(userEmail);
      if (memCache && (Date.now() - memCache.timestamp) < CACHE_DURATION) {
        console.log('✅ getUserRole: Usando cache em memória:', memCache.role);
        return memCache.role;
      }

      // 2. Verificar cache localStorage
      const localCache = getLocalStorageCache(userEmail);
      if (localCache) {
        console.log('✅ getUserRole: Usando cache localStorage:', localCache.role);
        return localCache.role;
      }

      // 3. Consultar Supabase
      console.log('🔍 getUserRole: Consultando Supabase (sem cache)...');

      const queryPromise = supabase
        .from('authorized_users')
        .select('role')
        .eq('email', userEmail)
        .maybeSingle();

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout: 20 segundos')), 20000)
      );

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

      console.log('🔍 getUserRole: Resposta Supabase:', { data, error });

      if (error) {
        console.error('❌ getUserRole: Erro:', error);
        // Usar cache mesmo expirado
        return memCache?.role || localCache?.role || null;
      }

      if (!data) {
        console.log('❌ getUserRole: Usuário não encontrado na tabela');
        return null;
      }

      const result = data.role as 'admin' | 'user';
      console.log('✅ getUserRole: Role encontrado:', result);

      // Atualizar cache se já existir
      const existingMemCache = authCache.get(userEmail);
      const existingLocalCache = getLocalStorageCache(userEmail);

      if (existingMemCache || existingLocalCache) {
        authCache.set(userEmail, {
          isAuthorized: existingMemCache?.isAuthorized || existingLocalCache?.isAuthorized || false,
          role: result,
          timestamp: Date.now()
        });
        setLocalStorageCache(userEmail, {
          isAuthorized: existingMemCache?.isAuthorized || existingLocalCache?.isAuthorized || false,
          role: result
        });
      }

      return result;

    } catch (err) {
      console.error('❌ getUserRole: Exception:', err);

      // Usar cache em caso de timeout
      const memCache = authCache.get(userEmail);
      const localCache = getLocalStorageCache(userEmail);

      if (memCache || localCache) {
        console.log('🔄 getUserRole: Usando cache por timeout');
        return memCache?.role || localCache?.role || null;
      }

      // FALLBACK TEMPORÁRIO para debug
      if (userEmail === 'dasilva6r@gmail.com') {
        console.warn('⚠️ FALLBACK TEMPORÁRIO: Definindo role admin para dasilva6r@gmail.com');
        return 'admin';
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
        // Limpar caches
        authCache.delete(userEmail);
        try {
          localStorage.removeItem(`auth_cache_${userEmail}`);
        } catch (e) {
          // Ignorar erro de localStorage
        }
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
