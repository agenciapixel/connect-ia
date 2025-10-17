import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Server, Activity, AlertTriangle, CheckCircle } from 'lucide-react';

interface HealthData {
  status: string;
  uptime: number;
  timestamp: string;
  requestCount: number;
  errorCount: number;
  version: string;
}

interface StatusData {
  server: string;
  status: string;
  uptime: number;
  requests: number;
  errors: number;
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
    arrayBuffers: number;
  };
  timestamp: string;
}

export function MonitoringDashboard() {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [statusData, setStatusData] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMonitoringData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [healthResponse, statusResponse] = await Promise.all([
        fetch('/health'),
        fetch('/status')
      ]);

      if (!healthResponse.ok || !statusResponse.ok) {
        throw new Error('Falha ao obter dados de monitoramento');
      }

      const health = await healthResponse.json();
      const status = await statusResponse.json();

      setHealthData(health);
      setStatusData(status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitoringData();
    const interval = setInterval(fetchMonitoringData, 30000); // Atualiza a cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (uptime: number) => {
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const formatMemory = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ok':
      case 'running':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Monitoramento do Sistema</h2>
          <p className="text-muted-foreground">
            Acompanhe o status e performance da aplicação Connect IA
          </p>
        </div>
        <Button 
          onClick={fetchMonitoringData} 
          disabled={loading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Status Geral */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status do Servidor</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(statusData?.status || 'unknown')}`} />
              <span className="text-2xl font-bold">
                {statusData?.status === 'running' ? 'Online' : 'Offline'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {statusData?.server || 'Connect IA'}
            </p>
          </CardContent>
        </Card>

        {/* Uptime */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Online</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statusData ? formatUptime(statusData.uptime * 1000) : '--'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Desde {statusData ? new Date(statusData.timestamp).toLocaleString() : '--'}
            </p>
          </CardContent>
        </Card>

        {/* Requests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Requisições</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statusData?.requests?.toLocaleString() || '--'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {statusData?.errors || 0} erros
            </p>
          </CardContent>
        </Card>

        {/* Health Check */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Health Check</CardTitle>
            <CardDescription>Status de saúde da aplicação</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Status:</span>
              <Badge variant={healthData?.status === 'OK' ? 'default' : 'destructive'}>
                {healthData?.status || 'Unknown'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Versão:</span>
              <span className="text-sm font-mono">{healthData?.version || '--'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Última verificação:</span>
              <span className="text-sm">
                {healthData ? new Date(healthData.timestamp).toLocaleTimeString() : '--'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Memória */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Uso de Memória</CardTitle>
            <CardDescription>Consumo de memória do servidor</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {statusData?.memory && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm">RSS:</span>
                  <span className="text-sm font-mono">{formatMemory(statusData.memory.rss)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Heap Total:</span>
                  <span className="text-sm font-mono">{formatMemory(statusData.memory.heapTotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Heap Usado:</span>
                  <span className="text-sm font-mono">{formatMemory(statusData.memory.heapUsed)}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Estatísticas</CardTitle>
            <CardDescription>Métricas de performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Taxa de erro:</span>
              <span className="text-sm">
                {statusData?.requests && statusData?.errors 
                  ? `${((statusData.errors / statusData.requests) * 100).toFixed(2)}%`
                  : '0%'
                }
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Requisições/min:</span>
              <span className="text-sm">
                {statusData?.uptime && statusData?.requests
                  ? Math.round((statusData.requests / (statusData.uptime / 60)))
                  : '--'
                }
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logs em Tempo Real */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Informações do Sistema</CardTitle>
          <CardDescription>Dados detalhados de monitoramento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
            <pre className="whitespace-pre-wrap">
              {JSON.stringify({ healthData, statusData }, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
