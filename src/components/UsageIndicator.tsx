import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  MessageSquare, 
  Bot, 
  MapPin, 
  Zap, 
  AlertTriangle, 
  CheckCircle,
  Crown,
  TrendingUp
} from 'lucide-react';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface UsageIndicatorProps {
  className?: string;
}

const metricConfig = {
  contacts: {
    label: 'Contatos',
    icon: Users,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  campaigns_per_month: {
    label: 'Campanhas',
    icon: MessageSquare,
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  ai_agents: {
    label: 'Agentes IA',
    icon: Bot,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100'
  },
  google_places_searches: {
    label: 'Buscas Google',
    icon: MapPin,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100'
  },
  api_calls_per_month: {
    label: 'API Calls',
    icon: Zap,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100'
  }
};

export function UsageIndicator({ className }: UsageIndicatorProps) {
  const { 
    planUsage, 
    isLoading, 
    getCurrentUsage, 
    getLimit, 
    getUsagePercentage, 
    isNearLimit,
    getUpgradeMessage,
    canUseFeature
  } = usePlanLimits();

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Uso do Plano</CardTitle>
          <CardDescription>Carregando informações...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!planUsage) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Uso do Plano</CardTitle>
          <CardDescription>Nenhuma informação disponível</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const { plan, isTrialValid, trialEndsAt, subscriptionStatus } = planUsage;

  const isTrial = subscriptionStatus === 'trial';
  const isExpired = !isTrialValid;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {plan.is_popular && <Crown className="h-5 w-5 text-yellow-500" />}
              Plano {plan.name}
              {isTrial && <Badge variant="secondary">Trial</Badge>}
            </CardTitle>
            <CardDescription>
              R$ {plan.price_monthly}/mês
              {plan.price_yearly && (
                <span className="text-green-600 ml-2">
                  (R$ {plan.price_yearly}/ano - 2 meses grátis)
                </span>
              )}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Margem</div>
            <div className={`font-semibold ${
              plan.limits.margin_percentage >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {plan.limits.margin_percentage >= 0 ? '+' : ''}{plan.limits.margin_percentage}%
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Trial Status */}
        {isTrial && (
          <Alert className={isExpired ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {isExpired ? (
                <span className="text-red-800">
                  Trial expirado em {trialEndsAt && formatDistanceToNow(new Date(trialEndsAt), { addSuffix: true, locale: ptBR })}
                </span>
              ) : (
                <span className="text-blue-800">
                  Trial válido até {trialEndsAt && formatDistanceToNow(new Date(trialEndsAt), { addSuffix: true, locale: ptBR })}
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Usage Metrics */}
        <div className="space-y-4">
          <h4 className="font-semibold text-sm text-gray-700">Uso Atual</h4>
          
          {Object.entries(metricConfig).map(([metricType, config]) => {
            const current = getCurrentUsage(metricType);
            const limit = getLimit(metricType);
            const percentage = getUsagePercentage(metricType);
            const nearLimit = isNearLimit(metricType);
            const canUse = canUseFeature(metricType);
            const upgradeMessage = getUpgradeMessage(metricType);
            
            const Icon = config.icon;
            
            return (
              <div key={metricType} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-1 rounded ${config.bgColor}`}>
                      <Icon className={`h-4 w-4 ${config.color}`} />
                    </div>
                    <span className="text-sm font-medium">{config.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {current} / {limit === -1 ? '∞' : limit}
                    </span>
                    {canUse ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
                
                {limit !== -1 && (
                  <Progress 
                    value={percentage} 
                    className={`h-2 ${
                      nearLimit ? 'bg-red-100' : percentage > 50 ? 'bg-yellow-100' : 'bg-gray-100'
                    }`}
                  />
                )}
                
                {upgradeMessage && (
                  <p className="text-xs text-amber-600">{upgradeMessage}</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Cost Information */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Custo Estimado</div>
              <div className="font-semibold">${plan.limits.estimated_cost_usd}/mês</div>
            </div>
            <div>
              <div className="text-gray-500">Preço</div>
              <div className="font-semibold">${plan.limits.price_usd}/mês</div>
            </div>
          </div>
        </div>

        {/* Upgrade Button */}
        {isExpired && (
          <Button className="w-full" size="sm">
            <TrendingUp className="h-4 w-4 mr-2" />
            Fazer Upgrade
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
