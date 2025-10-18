import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SecurityContext {
  isAuthorized: boolean;
  isLoading: boolean;
}

// Cache em memória para autorização (NÃO inclui role - role vem do OrganizationContext)
const authCache = new Map<string, { isAuthorized: boolean; timestamp: number }>();
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

const setLocalStorageCache = (email: string, isAuthorized: boolean) => {
  try {
    localStorage.setItem(`auth_cache_${email}`, JSON.stringify({
      isAuthorized,
      timestamp: Date.now()
    }));
  } catch (e) {
    console.error('Erro ao salvar cache localStorage:', e);
  }
};

/**
 * Hook de segurança focado APENAS em autorização (acesso ao sistema).
 *
 * RESPONSABILIDADES:
 * - Verificar se usuário está na tabela authorized_users
 * - Gerenciar cache de autorização (memória + localStorage)
 *
 * NÃO É RESPONSÁVEL POR:
 * - Determinar role do usuário (isso vem do OrganizationContext via tabela members)
 * - Calcular permissões (isso é feito pelo usePermissions)
 *
 * ARQUITETURA:
 * 1. useSecurity → Autorização (sim/não para acessar o sistema)
 * 2. OrganizationContext → Role por organização (admin/manager/agent/viewer)
 * 3. usePermissions → Permissões granulares baseadas no role
 */
export function useSecurity() {
  const [security, setSecurity] = useState<SecurityContext>({
    isAuthorized: false,
    isLoading: true,
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
          timestamp: localCache.timestamp
        });
        return localCache.isAuthorized;
      }

      // 3. Sem cache, consultar Supabase
      console.log('🔍 checkUserAuthorization: Consultando Supabase (sem cache)...');

      const queryPromise = supabase
        .from('authorized_users')
        .select('email')
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
      if (result) {
        authCache.set(userEmail, {
          isAuthorized: result,
          timestamp: Date.now()
        });
        setLocalStorageCache(userEmail, result);
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

      return false;
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

    console.log('🔍 useSecurity: Iniciando validação de autorização para:', userEmail);
    setSecurity(prev => ({ ...prev, isLoading: true }));

    try {
      const isAuthorized = await checkUserAuthorization(userEmail);
      console.log('🔍 useSecurity: Autorização:', isAuthorized);

      setSecurity({
        isAuthorized,
        isLoading: false,
      });

      console.log('✅ useSecurity: Validação de autorização concluída:', { isAuthorized });

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
      setSecurity({
        isAuthorized: false,
        isLoading: false,
      });
    } finally {
      isValidatingRef.current = false;
    }
  }, [checkUserAuthorization]);

  const clearSecurity = useCallback(() => {
    setSecurity({
      isAuthorized: false,
      isLoading: false,
    });
    isValidatingRef.current = false;
    lastValidatedEmailRef.current = '';
  }, []);

  return {
    ...security,
    validateUser,
    clearSecurity
  };
}
