import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap, Users, Bot, MapPin, MessageSquare } from 'lucide-react';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { toast } from 'sonner';

interface PlanSelectorProps {
  onPlanSelect?: (planId: string) => void;
  className?: string;
}

export function PlanSelector({ onPlanSelect, className }: PlanSelectorProps) {
  const { planUsage, isLoading } = usePlanLimits();
  const [selectedPlan, setSelectedPlan] = useState<string>('basic');

  const plans = [
    {
      id: 'free',
      name: 'Free Trial',
      description: 'Teste grátis por 14 dias',
      price: 'Grátis',
      period: '14 dias',
      features: [
        'Dashboard básico',
        'Inbox (50 conversas)',
        '100 contatos',
        '1 integração',
        'Suporte por email'
      ],
      limits: {
        contacts: 100,
        campaigns: 0,
        integrations: 1,
        ai_agents: 0,
        google_places: 0
      },
      popular: false,
      cta: 'Testar Grátis',
      icon: Users
    },
    {
      id: 'basic',
      name: 'Basic',
      description: 'Ideal para pequenas empresas',
      price: 'R$ 197',
      period: '/mês',
      originalPrice: 'R$ 197',
      yearlyPrice: 'R$ 1.970/ano',
      features: [
        'Contatos ilimitados',
        '200 campanhas/mês',
        '2 integrações',
        '50 buscas Google Places',
        'Suporte prioritário'
      ],
      limits: {
        contacts: -1,
        campaigns: 200,
        integrations: 2,
        ai_agents: 0,
        google_places: 50
      },
      popular: true,
      cta: 'Começar Teste',
      icon: MessageSquare
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'Para agências e empresas médias',
      price: 'R$ 397',
      period: '/mês',
      originalPrice: 'R$ 397',
      yearlyPrice: 'R$ 3.970/ano',
      features: [
        'Tudo do Basic',
        '1.000 campanhas/mês',
        '3 Agentes IA',
        '200 buscas Google Places',
        'Analytics avançados',
        'API Access'
      ],
      limits: {
        contacts: -1,
        campaigns: 1000,
        integrations: -1,
        ai_agents: 3,
        google_places: 200
      },
      popular: false,
      cta: 'Começar Teste',
      icon: Bot
    },
    {
      id: 'business',
      name: 'Business',
      description: 'Para equipes grandes',
      price: 'R$ 797',
      period: '/mês',
      originalPrice: 'R$ 797',
      yearlyPrice: 'R$ 7.970/ano',
      features: [
        'Tudo do Pro',
        '5.000 campanhas/mês',
        '10 Agentes IA',
        '1.000 buscas Google Places',
        'Suporte telefônico',
        'SLA garantido'
      ],
      limits: {
        contacts: -1,
        campaigns: 5000,
        integrations: -1,
        ai_agents: 10,
        google_places: 1000
      },
      popular: false,
      cta: 'Começar Teste',
      icon: Crown
    }
  ];

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    onPlanSelect?.(planId);
  };

  const handleSubscribe = async (planId: string) => {
    try {
      // Aqui você implementaria a lógica de assinatura
      // Por exemplo, integração com Stripe, PagSeguro, etc.
      
      toast.success(`Iniciando assinatura do plano ${planId}`);
      
      // Simular processo de assinatura
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Assinatura realizada com sucesso!');
    } catch (error) {
      toast.error('Erro ao processar assinatura');
    }
  };

  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {plans.map((plan) => {
        const Icon = plan.icon;
        const isSelected = selectedPlan === plan.id;
        const isCurrentPlan = planUsage?.plan.id === plan.id;
        
        return (
          <Card 
            key={plan.id} 
            className={`relative transition-all duration-200 ${
              plan.popular 
                ? 'ring-2 ring-yellow-400 shadow-lg scale-105' 
                : isSelected 
                  ? 'ring-2 ring-blue-400 shadow-md' 
                  : 'hover:shadow-md'
            } ${isCurrentPlan ? 'bg-green-50 border-green-200' : ''}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-yellow-500 text-white px-3 py-1">
                  <Crown className="h-3 w-3 mr-1" />
                  Mais Popular
                </Badge>
              </div>
            )}
            
            {isCurrentPlan && (
              <div className="absolute -top-3 right-4">
                <Badge variant="secondary" className="bg-green-500 text-white">
                  <Check className="h-3 w-3 mr-1" />
                  Atual
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-2">
                <div className="p-3 rounded-full bg-blue-100">
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              
              <div className="mt-4">
                <div className="text-3xl font-bold">{plan.price}</div>
                <div className="text-sm text-gray-500">{plan.period}</div>
                {plan.yearlyPrice && (
                  <div className="text-sm text-green-600 mt-1">
                    {plan.yearlyPrice} (2 meses grátis)
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Features */}
              <div className="space-y-2">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {/* Limits Summary */}
              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{plan.limits.contacts === -1 ? '∞' : plan.limits.contacts} contatos</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    <span>{plan.limits.campaigns === -1 ? '∞' : plan.limits.campaigns} campanhas</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bot className="h-3 w-3" />
                    <span>{plan.limits.ai_agents === -1 ? '∞' : plan.limits.ai_agents} IA</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{plan.limits.google_places === -1 ? '∞' : plan.limits.google_places} buscas</span>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <Button 
                className="w-full" 
                variant={plan.popular ? "default" : "outline"}
                onClick={() => handleSubscribe(plan.id)}
                disabled={isCurrentPlan}
              >
                {isCurrentPlan ? 'Plano Atual' : plan.cta}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
