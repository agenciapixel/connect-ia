import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PlanLimitCheck {
  canProceed: boolean;
  message?: string;
  requiresUpgrade?: boolean;
}

/**
 * Verifica se uma ação pode ser executada baseada nos limites do plano
 */
export async function checkPlanLimit(
  orgId: string,
  metricType: string,
  requestedCount: number = 1
): Promise<PlanLimitCheck> {
  try {
    const { data, error } = await supabase
      .rpc('check_plan_limit', {
        p_org_id: orgId,
        p_metric_type: metricType,
        p_requested_count: requestedCount
      });

    if (error) {
      console.error('Erro ao verificar limite:', error);
      return {
        canProceed: false,
        message: 'Erro ao verificar limites do plano'
      };
    }

    if (!data) {
      return {
        canProceed: false,
        message: 'Limite do plano atingido',
        requiresUpgrade: true
      };
    }

    return {
      canProceed: true
    };

  } catch (error) {
    console.error('Erro ao verificar limite:', error);
    return {
      canProceed: false,
      message: 'Erro interno ao verificar limites'
    };
  }
}

/**
 * Registra o uso de uma métrica específica
 */
export async function recordPlanUsage(
  orgId: string,
  metricType: string,
  count: number = 1
): Promise<void> {
  try {
    const { error } = await supabase
      .rpc('record_usage', {
        p_org_id: orgId,
        p_metric_type: metricType,
        p_count: count
      });

    if (error) {
      console.error('Erro ao registrar uso:', error);
      throw error;
    }
  } catch (error) {
    console.error('Erro ao registrar uso:', error);
    throw error;
  }
}

/**
 * Verifica se a organização está em trial válido
 */
export async function isTrialValid(orgId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .rpc('is_trial_valid', { p_org_id: orgId });

    if (error) {
      console.error('Erro ao verificar trial:', error);
      return false;
    }

    return data;
  } catch (error) {
    console.error('Erro ao verificar trial:', error);
    return false;
  }
}

/**
 * Middleware para campanhas
 */
export async function checkCampaignLimit(orgId: string, messageCount: number = 1): Promise<PlanLimitCheck> {
  const check = await checkPlanLimit(orgId, 'campaigns_per_month', messageCount);
  
  if (!check.canProceed) {
    return {
      ...check,
      message: check.message || 'Limite de campanhas atingido. Faça upgrade para enviar mais mensagens.',
      requiresUpgrade: true
    };
  }

  return check;
}

/**
 * Middleware para Google Places
 */
export async function checkGooglePlacesLimit(orgId: string, searchCount: number = 1): Promise<PlanLimitCheck> {
  const check = await checkPlanLimit(orgId, 'google_places_searches', searchCount);
  
  if (!check.canProceed) {
    return {
      ...check,
      message: check.message || 'Limite de buscas Google Places atingido. Faça upgrade para continuar prospectando.',
      requiresUpgrade: true
    };
  }

  return check;
}

/**
 * Middleware para Agentes IA
 */
export async function checkAIAgentLimit(orgId: string, agentCount: number = 1): Promise<PlanLimitCheck> {
  const check = await checkPlanLimit(orgId, 'ai_agents', agentCount);
  
  if (!check.canProceed) {
    return {
      ...check,
      message: check.message || 'Limite de Agentes IA atingido. Faça upgrade para criar mais bots.',
      requiresUpgrade: true
    };
  }

  return check;
}

/**
 * Middleware para API Calls
 */
export async function checkAPICallLimit(orgId: string, callCount: number = 1): Promise<PlanLimitCheck> {
  const check = await checkPlanLimit(orgId, 'api_calls_per_month', callCount);
  
  if (!check.canProceed) {
    return {
      ...check,
      message: check.message || 'Limite de API calls atingido. Faça upgrade para continuar usando a API.',
      requiresUpgrade: true
    };
  }

  return check;
}

/**
 * Middleware para contatos
 */
export async function checkContactLimit(orgId: string, contactCount: number = 1): Promise<PlanLimitCheck> {
  const check = await checkPlanLimit(orgId, 'contacts', contactCount);
  
  if (!check.canProceed) {
    return {
      ...check,
      message: check.message || 'Limite de contatos atingido. Faça upgrade para adicionar mais contatos.',
      requiresUpgrade: true
    };
  }

  return check;
}

/**
 * Hook para usar em componentes React
 */
export function usePlanMiddleware() {
  const showUpgradeToast = (message: string) => {
    toast.error(message, {
      action: {
        label: 'Fazer Upgrade',
        onClick: () => {
          // Navegar para página de planos
          window.location.href = '/planos';
        }
      }
    });
  };

  const handleLimitCheck = async (
    orgId: string,
    metricType: string,
    count: number = 1,
    onSuccess?: () => void,
    onError?: (message: string) => void
  ) => {
    const check = await checkPlanLimit(orgId, metricType, count);
    
    if (check.canProceed) {
      onSuccess?.();
    } else {
      const message = check.message || 'Limite atingido';
      if (check.requiresUpgrade) {
        showUpgradeToast(message);
      } else {
        toast.error(message);
      }
      onError?.(message);
    }
  };

  return {
    checkPlanLimit,
    recordPlanUsage,
    isTrialValid,
    checkCampaignLimit,
    checkGooglePlacesLimit,
    checkAIAgentLimit,
    checkAPICallLimit,
    checkContactLimit,
    handleLimitCheck,
    showUpgradeToast
  };
}

/**
 * Utilitários para formatação de limites
 */
export function formatLimit(value: number): string {
  if (value === -1) return 'Ilimitado';
  if (value === 0) return 'Não disponível';
  return value.toLocaleString('pt-BR');
}

export function formatUsage(current: number, limit: number): string {
  if (limit === -1) return `${current.toLocaleString('pt-BR')} / ∞`;
  if (limit === 0) return `${current.toLocaleString('pt-BR')} / 0`;
  return `${current.toLocaleString('pt-BR')} / ${limit.toLocaleString('pt-BR')}`;
}

export function getUsagePercentage(current: number, limit: number): number {
  if (limit === -1) return 0;
  if (limit === 0) return 100;
  return Math.min((current / limit) * 100, 100);
}

export function isNearLimit(current: number, limit: number, threshold: number = 80): boolean {
  const percentage = getUsagePercentage(current, limit);
  return percentage > threshold;
}
