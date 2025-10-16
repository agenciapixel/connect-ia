import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Shield, 
  Users, 
  Crown, 
  UserCheck, 
  Eye,
  AlertTriangle,
  CheckCircle,
  Info,
  Save,
  RotateCcw,
  Activity,
  TrendingUp,
  BarChart3
} from "lucide-react";
import { useOrganization } from "@/contexts/OrganizationContext";
import { usePermissions } from "@/hooks/usePermissions";
import { PermissionMatrix } from "@/components/PermissionMatrix";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export default function PermissionSettings() {
  const { currentOrg } = useOrganization();
  const { userRole, permissions } = usePermissions();
  const [activeTab, setActiveTab] = useState("matrix");

  // Buscar configurações de permissões da organização
  const { data: orgPermissions, isLoading } = useQuery({
    queryKey: ["organization-permissions", currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return null;

      // Simular configurações de permissões (em produção, seria uma tabela real)
      return {
        customPermissions: {
          "manager-can-delete-attendants": false,
          "agent-can-export-data": false,
          "viewer-can-see-billing": false,
        },
        auditLog: [
          {
            id: "1",
            action: "Alterou permissão de Manager",
            details: "Permissão 'canDeleteAttendants' alterada para false",
            user: "admin@empresa.com",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: "2",
            action: "Criou role personalizado",
            details: "Novo role 'supervisor' criado com permissões específicas",
            user: "admin@empresa.com",
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          }
        ]
      };
    },
    enabled: !!currentOrg?.id,
  });

  const handleSavePermissions = async (newPermissions: any) => {
    try {
      // Simular salvamento (em produção, seria uma chamada real)
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Permissões salvas com sucesso!");
      console.log("Permissões salvas:", newPermissions);
    } catch (error) {
      toast.error("Erro ao salvar permissões");
    }
  };

  if (!permissions.canManageUsers) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 mx-auto text-orange-500 mb-4" />
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>
              Você não tem permissão para configurar permissões.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Apenas administradores podem configurar permissões do sistema.
            </p>
            <Button variant="outline" onClick={() => window.history.back()}>
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Configurações de Permissões</span>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-6 p-6">
        {/* Resumo de Permissões */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Administradores</CardTitle>
              <Crown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">Acesso Total</div>
              <p className="text-xs text-muted-foreground">Todas as funcionalidades</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gerentes</CardTitle>
              <Shield className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">Gestão</div>
              <p className="text-xs text-muted-foreground">Operacional + Analytics</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Atendentes</CardTitle>
              <UserCheck className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Operacional</div>
              <p className="text-xs text-muted-foreground">Atendimento + Básico</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Visualizadores</CardTitle>
              <Eye className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">Somente Leitura</div>
              <p className="text-xs text-muted-foreground">Relatórios + Visualização</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="matrix">Matriz de Permissões</TabsTrigger>
            <TabsTrigger value="custom">Permissões Personalizadas</TabsTrigger>
            <TabsTrigger value="audit">Log de Auditoria</TabsTrigger>
          </TabsList>

          {/* Matriz de Permissões */}
          <TabsContent value="matrix" className="space-y-4">
            <PermissionMatrix onSave={handleSavePermissions} />
          </TabsContent>

          {/* Permissões Personalizadas */}
          <TabsContent value="custom" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Permissões Personalizadas
                </CardTitle>
                <CardDescription>
                  Configure permissões específicas além das configurações padrão
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium">Gerentes podem excluir atendentes</h4>
                          <p className="text-sm text-muted-foreground">
                            Permitir que gerentes excluam atendentes da organização
                          </p>
                        </div>
                        <Badge variant="secondary">Desabilitado</Badge>
                      </div>
                      <Button size="sm" variant="outline">
                        Alterar
                      </Button>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium">Atendentes podem exportar dados</h4>
                          <p className="text-sm text-muted-foreground">
                            Permitir que atendentes exportem relatórios e dados
                          </p>
                        </div>
                        <Badge variant="secondary">Desabilitado</Badge>
                      </div>
                      <Button size="sm" variant="outline">
                        Alterar
                      </Button>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium">Visualizadores podem ver faturamento</h4>
                          <p className="text-sm text-muted-foreground">
                            Permitir que visualizadores vejam informações de cobrança
                          </p>
                        </div>
                        <Badge variant="secondary">Desabilitado</Badge>
                      </div>
                      <Button size="sm" variant="outline">
                        Alterar
                      </Button>
                    </div>

                    <div className="flex items-center justify-center py-8 border-2 border-dashed rounded-lg">
                      <div className="text-center">
                        <Settings className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Nenhuma permissão personalizada ativa</p>
                        <Button variant="outline" size="sm" className="mt-2">
                          Adicionar Permissão
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Log de Auditoria */}
          <TabsContent value="audit" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Log de Auditoria
                </CardTitle>
                <CardDescription>
                  Histórico de alterações nas configurações de permissões
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : orgPermissions?.auditLog && orgPermissions.auditLog.length > 0 ? (
                  <div className="space-y-3">
                    {orgPermissions.auditLog.map((log) => (
                      <div key={log.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <Activity className="h-4 w-4 text-blue-500 mt-1" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{log.user}</span>
                            <span className="text-sm text-muted-foreground">•</span>
                            <span className="text-sm text-muted-foreground">
                              {new Date(log.timestamp).toLocaleString('pt-BR')}
                            </span>
                          </div>
                          <p className="text-sm font-medium">{log.action}</p>
                          <p className="text-sm text-muted-foreground">{log.details}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum log de auditoria encontrado</p>
                    <p className="text-sm mt-1">
                      Os logs aparecerão conforme as configurações forem alteradas
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Informações Importantes */}
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Informações Importantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-orange-700">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 mt-0.5" />
                <div>
                  <p className="font-medium">Alterações Imediatas</p>
                  <p>As alterações de permissões são aplicadas imediatamente a todos os usuários.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5" />
                <div>
                  <p className="font-medium">Backup Automático</p>
                  <p>O sistema mantém backup das configurações anteriores para rollback.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 mt-0.5" />
                <div>
                  <p className="font-medium">Segurança</p>
                  <p>Todas as alterações são registradas no log de auditoria para compliance.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}





