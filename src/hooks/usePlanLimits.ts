import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';

export interface PlanLimits {
  contacts: number;
  campaigns_per_month: number;
  integrations: number;
  ai_agents: number;
  api_calls_per_month: number;
  google_places_searches: number;
  estimated_cost_usd: number;
  price_usd: number;
  margin_percentage: number;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  trial_days: number;
  limits: PlanLimits;
  features: string[];
  is_active: boolean;
  is_popular: boolean;
}

export interface UsageData {
  metric_type: string;
  count: number;
  period_start: string;
  period_end: string;
}

export interface PlanUsage {
  plan: Plan;
  usage: UsageData[];
  isTrialValid: boolean;
  trialEndsAt?: string;
  subscriptionStatus: string;
}

export function usePlanLimits() {
  const { currentOrg } = useOrganization();
  const [planUsage, setPlanUsage] = useState<PlanUsage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlanUsage = async () => {
    if (!currentOrg) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Buscar informações da organização
      const { data: orgData, error: orgError } = await supabase
        .from('orgs')
        .select(`
          plan_id,
          trial_ends_at,
          subscription_status
        `)
        .eq('id', currentOrg.id)
        .single();

      if (orgError) throw orgError;

      // Buscar detalhes do plano
      const { data: planData, error: planError } = await supabase
        .from('plans')
        .select('*')
        .eq('id', orgData.plan_id)
        .single();

      if (planError) throw planError;

      // Buscar uso atual do mês
      const currentMonth = new Date();
      const periodStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const periodEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      const { data: usageData, error: usageError } = await supabase
        .from('usage_tracking')
        .select('*')
        .eq('org_id', currentOrg.id)
        .gte('period_start', periodStart.toISOString().split('T')[0])
        .lte('period_end', periodEnd.toISOString().split('T')[0]);

      if (usageError) throw usageError;

      // Verificar se trial é válido
      const { data: trialData, error: trialError } = await supabase
        .rpc('is_trial_valid', { p_org_id: currentOrg.id });

      if (trialError) throw trialError;

      setPlanUsage({
        plan: planData,
        usage: usageData || [],
        isTrialValid: trialData,
        trialEndsAt: orgData.trial_ends_at,
        subscriptionStatus: orgData.subscription_status
      });

    } catch (err) {
      console.error('Erro ao buscar dados do plano:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  const checkLimit = async (metricType: string, requestedCount: number = 1): Promise<boolean> => {
    if (!currentOrg) return false;

    try {
      const { data, error } = await supabase
        .rpc('check_plan_limit', {
          p_org_id: currentOrg.id,
          p_metric_type: metricType,
          p_requested_count: requestedCount
        });

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Erro ao verificar limite:', err);
      return false;
    }
  };

  const recordUsage = async (metricType: string, count: number = 1): Promise<void> => {
    if (!currentOrg) return;

    try {
      const { error } = await supabase
        .rpc('record_usage', {
          p_org_id: currentOrg.id,
          p_metric_type: metricType,
          p_count: count
        });

      if (error) throw error;

      // Atualizar dados locais
      await fetchPlanUsage();
    } catch (err) {
      console.error('Erro ao registrar uso:', err);
      throw err;
    }
  };

  const getCurrentUsage = (metricType: string): number => {
    if (!planUsage) return 0;
    
    const usage = planUsage.usage.find(u => u.metric_type === metricType);
    return usage ? usage.count : 0;
  };

  const getLimit = (metricType: string): number => {
    if (!planUsage) return 0;
    return planUsage.plan.limits[metricType as keyof PlanLimits] || 0;
  };

  const getUsagePercentage = (metricType: string): number => {
    const current = getCurrentUsage(metricType);
    const limit = getLimit(metricType);
    
    if (limit === -1) return 0; // Ilimitado
    if (limit === 0) return 100; // Sem limite definido
    
    return Math.min((current / limit) * 100, 100);
  };

  const isNearLimit = (metricType: string, threshold: number = 80): boolean => {
    return getUsagePercentage(metricType) > threshold;
  };

  const canUseFeature = (metricType: string, requestedCount: number = 1): boolean => {
    const limit = getLimit(metricType);
    if (limit === -1) return true; // Ilimitado
    
    const current = getCurrentUsage(metricType);
    return (current + requestedCount) <= limit;
  };

  const getUpgradeMessage = (metricType: string): string => {
    const limit = getLimit(metricType);
    const current = getCurrentUsage(metricType);
    
    if (limit === -1) return '';
    
    const remaining = limit - current;
    
    if (remaining <= 0) {
      return `Limite de ${metricType} atingido. Faça upgrade para continuar usando.`;
    }
    
    if (remaining <= 10) {
      return `Restam apenas ${remaining} ${metricType}. Considere fazer upgrade.`;
    }
    
    return '';
  };

  useEffect(() => {
    fetchPlanUsage();
  }, [currentOrg?.id]);

  return {
    planUsage,
    isLoading,
    error,
    fetchPlanUsage,
    checkLimit,
    recordUsage,
    getCurrentUsage,
    getLimit,
    getUsagePercentage,
    isNearLimit,
    canUseFeature,
    getUpgradeMessage
  };
}
