import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlanSelector } from '@/components/PlanSelector';
import { UsageIndicator } from '@/components/UsageIndicator';
import { CheckCircle, Star, Zap, Shield, Headphones } from 'lucide-react';

export default function PricingPage() {
  // Temporariamente desabilitado para debug
  // const { planUsage, isLoading } = usePlanLimits();
  const planUsage = null;
  const isLoading = false;

  const features = [
    {
      icon: CheckCircle,
      title: 'Sem Taxa de Setup',
      description: 'Comece imediatamente sem taxas ocultas'
    },
    {
      icon: Star,
      title: 'Suporte Prioritário',
      description: 'Atendimento rápido para todos os planos'
    },
    {
      icon: Zap,
      title: 'Integração Fácil',
      description: 'Conecte WhatsApp e Instagram em minutos'
    },
    {
      icon: Shield,
      title: 'Segurança Garantida',
      description: 'Seus dados protegidos com criptografia'
    },
    {
      icon: Headphones,
      title: 'Suporte 24/7',
      description: 'Equipe sempre disponível para ajudar'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
              Planos que Crescem com Você
            </h1>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Escolha o plano ideal para sua empresa. Todos incluem teste grátis de 14 dias.
            </p>
            
            {/* Current Plan Status */}
            {!isLoading && planUsage && (
              <div className="mt-8">
                <Badge variant="outline" className="text-lg px-4 py-2">
                  Plano Atual: {planUsage.plan.name}
                  {planUsage.subscriptionStatus === 'trial' && (
                    <span className="ml-2 text-blue-600">
                      (Trial válido até {planUsage.trialEndsAt && new Date(planUsage.trialEndsAt).toLocaleDateString('pt-BR')})
                    </span>
                  )}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <PlanSelector />
      </div>

      {/* Features Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Por que Escolher o Connect IA?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Ferramentas poderosas para automatizar seu atendimento
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="flex justify-center mb-4">
                      <div className="p-3 rounded-full bg-blue-100">
                        <Icon className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Perguntas Frequentes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Posso mudar de plano a qualquer momento?</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Sim! Você pode fazer upgrade ou downgrade a qualquer momento. 
                  As mudanças são aplicadas imediatamente e os valores são calculados proporcionalmente.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>O que acontece se eu exceder os limites?</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Você receberá notificações quando estiver próximo dos limites. 
                  Para continuar usando, será necessário fazer upgrade do plano.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Há taxa de cancelamento?</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Não! Você pode cancelar sua assinatura a qualquer momento sem taxas. 
                  Seu acesso continuará até o final do período pago.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Os dados ficam seguros?</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Absolutamente! Usamos criptografia de ponta a ponta e seguimos 
                  todas as normas de segurança e privacidade (LGPD).
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Current Usage - Only show if user is logged in */}
      {!isLoading && planUsage && (
        <div className="bg-white border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                Seu Uso Atual
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Acompanhe seu uso e otimize seu plano
              </p>
            </div>
            
            <div className="max-w-2xl mx-auto">
              <UsageIndicator />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
