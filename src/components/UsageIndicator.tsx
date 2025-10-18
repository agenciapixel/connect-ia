import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface UsageIndicatorProps {
  className?: string;
}

/**
 * UsageIndicator - DESABILITADO TEMPORARIAMENTE
 * Sistema de planos e limites foi removido.
 * Este componente retorna apenas uma mensagem informativa.
 */
export function UsageIndicator({ className }: UsageIndicatorProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-blue-500" />
          Sistema de Planos
        </CardTitle>
        <CardDescription>
          Sistema de limites e planos temporariamente desabilitado
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">
          O sistema de gerenciamento de planos e uso está sendo reestruturado.
          Por enquanto, você tem acesso ilimitado a todas as funcionalidades.
        </p>
      </CardContent>
    </Card>
  );
}
