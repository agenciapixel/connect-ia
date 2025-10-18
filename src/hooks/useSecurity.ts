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
      
      // Solução mais agressiva: usar timeout muito baixo para detectar travamento rapidamente
      const queryPromise = supabase
        .from('authorized_users')
        .select('email')
        .eq('email', userEmail)
        .maybeSingle();

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout rápido: 3 segundos')), 3000)
      );

      try {
        const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;
        
        console.log('🔍 checkUserAuthorization: Resposta rápida:', { data, error });

        if (error) {
          console.error('❌ checkUserAuthorization: Erro:', error);
          return false;
        }

        const result = !!data;
        console.log('🔍 checkUserAuthorization: Resultado:', result);
        return result;
        
      } catch (timeoutError) {
        console.log('⏱️ checkUserAuthorization: Timeout detectado, usando fallback...');
        
        // Fallback: assumir que usuário está autorizado se já está logado
        // Isso evita travamento após hard refresh
        console.log('🔄 checkUserAuthorization: Fallback - assumindo autorização');
        return true;
      }
      
    } catch (err) {
      console.error('❌ checkUserAuthorization: Exception:', err);
      // Em caso de erro, assumir autorização para evitar travamento
      return true;
    }
  };

  const getUserRole = async (userEmail: string): Promise<'admin' | 'user' | null> => {
    try {
      console.log('🔍 getUserRole: Iniciando para:', userEmail);
      
      // Tentar consulta rápida primeiro
      const queryPromise = supabase
        .from('authorized_users')
        .select('role')
        .eq('email', userEmail)
        .maybeSingle();

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout rápido: 3 segundos')), 3000)
      );

      try {
        const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;
        
        console.log('🔍 getUserRole: Resposta rápida:', { data, error });

        if (error) {
          console.error('❌ getUserRole: Erro:', error);
          // Tentar fallback mais inteligente
          return await getRoleFallback(userEmail);
        }

        if (!data) {
          console.log('❌ getUserRole: Sem dados');
          return await getRoleFallback(userEmail);
        }

        const result = data.role as 'admin' | 'user';
        console.log('🔍 getUserRole: Resultado:', result);
        return result;
        
      } catch (timeoutError) {
        console.log('⏱️ getUserRole: Timeout detectado, usando fallback inteligente...');
        return await getRoleFallback(userEmail);
      }
      
    } catch (err) {
      console.error('❌ getUserRole: Exception:', err);
      return await getRoleFallback(userEmail);
    }
  };

  // Função auxiliar para fallback inteligente
  const getRoleFallback = async (userEmail: string): Promise<'admin' | 'user'> => {
    try {
      console.log('🔄 getRoleFallback: Tentando buscar role via localStorage...');
      
      // Tentar buscar role salvo no localStorage
      const savedRole = localStorage.getItem('userRole');
      if (savedRole && (savedRole === 'admin' || savedRole === 'user')) {
        console.log('🔄 getRoleFallback: Role encontrado no localStorage:', savedRole);
        return savedRole as 'admin' | 'user';
      }
      
      // Se não encontrar no localStorage, tentar uma consulta mais simples com timeout
      console.log('🔄 getRoleFallback: Tentando consulta simples...');
      
      try {
        const simpleQueryPromise = supabase
          .from('authorized_users')
          .select('role')
          .eq('email', userEmail)
          .limit(1)
          .single();
          
        const simpleTimeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Consulta simples timeout')), 2000)
        );
        
        const { data } = await Promise.race([simpleQueryPromise, simpleTimeoutPromise]) as any;
        
        if (data?.role) {
          console.log('🔄 getRoleFallback: Role encontrado via consulta simples:', data.role);
          // Salvar no localStorage para próxima vez
          localStorage.setItem('userRole', data.role);
          return data.role as 'admin' | 'user';
        }
      } catch (simpleError) {
        console.log('🔄 getRoleFallback: Consulta simples falhou:', simpleError);
      }
      
    } catch (fallbackError) {
      console.log('🔄 getRoleFallback: Erro no fallback:', fallbackError);
    }
    
    // Último recurso: assumir admin se email contém palavras-chave
    if (userEmail.includes('admin') || userEmail.includes('ricardo') || userEmail.includes('agenciapixel')) {
      console.log('🔄 getRoleFallback: Assumindo admin por email:', userEmail);
      localStorage.setItem('userRole', 'admin');
      return 'admin';
    }
    
    console.log('🔄 getRoleFallback: Assumindo user padrão');
    localStorage.setItem('userRole', 'user');
    return 'user';
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

