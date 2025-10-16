import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Crown, 
  Shield, 
  UserCheck, 
  Eye, 
  Settings, 
  Save,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Info
} from "lucide-react";
import { Permissions } from "@/hooks/usePermissions";

interface PermissionMatrixProps {
  onSave?: (permissions: Partial<Permissions>) => void;
  readOnly?: boolean;
}

const ROLE_PERMISSIONS: Record<string, { label: string; description: string; category: string }[]> = {
  admin: [
    { label: "Gestão de Atendentes", description: "Criar, editar e excluir atendentes", category: "Gestão" },
    { label: "Gestão de Campanhas", description: "Criar, editar e excluir campanhas", category: "Marketing" },
    { label: "Gestão de CRM", description: "Gerenciar pipeline e prospects", category: "Vendas" },
    { label: "Gestão de Contatos", description: "Gerenciar base de contatos", category: "Contatos" },
    { label: "Gestão de Integrações", description: "Conectar canais e webhooks", category: "Integrações" },
    { label: "Configurações do Sistema", description: "Acessar configurações críticas", category: "Sistema" },
    { label: "Gestão de Usuários", description: "Gerenciar usuários e permissões", category: "Sistema" },
    { label: "Gestão de Faturamento", description: "Acessar informações de cobrança", category: "Sistema" },
    { label: "Relatórios Avançados", description: "Visualizar e exportar relatórios", category: "Analytics" },
    { label: "Agentes IA", description: "Configurar e gerenciar IA", category: "IA" },
  ],
  manager: [
    { label: "Gestão de Atendentes", description: "Criar e editar atendentes", category: "Gestão" },
    { label: "Gestão de Campanhas", description: "Criar, editar e excluir campanhas", category: "Marketing" },
    { label: "Gestão de CRM", description: "Gerenciar pipeline e prospects", category: "Vendas" },
    { label: "Gestão de Contatos", description: "Gerenciar base de contatos", category: "Contatos" },
    { label: "Conectar Canais", description: "Conectar novos canais", category: "Integrações" },
    { label: "Relatórios Avançados", description: "Visualizar e exportar relatórios", category: "Analytics" },
    { label: "Agentes IA", description: "Configurar e gerenciar IA", category: "IA" },
  ],
  agent: [
    { label: "Criar Contatos", description: "Adicionar novos contatos", category: "Contatos" },
    { label: "Editar Contatos", description: "Modificar informações de contatos", category: "Contatos" },
    { label: "Criar Prospects", description: "Adicionar novos prospects", category: "Vendas" },
    { label: "Editar Prospects", description: "Modificar informações de prospects", category: "Vendas" },
    { label: "Relatórios Básicos", description: "Visualizar relatórios pessoais", category: "Analytics" },
  ],
  viewer: [
    { label: "Visualizar Relatórios", description: "Apenas visualização de dados", category: "Analytics" },
    { label: "Visualizar Métricas", description: "Ver métricas de atendentes", category: "Gestão" },
    { label: "Visualizar Campanhas", description: "Ver campanhas existentes", category: "Marketing" },
    { label: "Visualizar CRM", description: "Ver pipeline e prospects", category: "Vendas" },
  ]
};

const CATEGORIES = [
  { id: "Gestão", label: "Gestão", color: "bg-blue-100 text-blue-800" },
  { id: "Marketing", label: "Marketing", color: "bg-purple-100 text-purple-800" },
  { id: "Vendas", label: "Vendas", color: "bg-green-100 text-green-800" },
  { id: "Contatos", label: "Contatos", color: "bg-orange-100 text-orange-800" },
  { id: "Integrações", label: "Integrações", color: "bg-cyan-100 text-cyan-800" },
  { id: "Sistema", label: "Sistema", color: "bg-red-100 text-red-800" },
  { id: "Analytics", label: "Analytics", color: "bg-indigo-100 text-indigo-800" },
  { id: "IA", label: "IA", color: "bg-pink-100 text-pink-800" },
];

export function PermissionMatrix({ onSave, readOnly = false }: PermissionMatrixProps) {
  const [selectedRole, setSelectedRole] = useState<string>("admin");
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [hasChanges, setHasChanges] = useState(false);

  const roleConfig = {
    admin: { icon: Crown, color: "text-red-600", label: "Administrador" },
    manager: { icon: Shield, color: "text-blue-600", label: "Gerente" },
    agent: { icon: UserCheck, color: "text-green-600", label: "Atendente" },
    viewer: { icon: Eye, color: "text-gray-600", label: "Visualizador" },
  };

  const handlePermissionChange = (permission: string, enabled: boolean) => {
    if (readOnly) return;
    
    setPermissions(prev => ({
      ...prev,
      [permission]: enabled
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(permissions);
      setHasChanges(false);
    }
  };

  const handleReset = () => {
    setPermissions({});
    setHasChanges(false);
  };

  const getPermissionsByCategory = (role: string) => {
    const rolePerms = ROLE_PERMISSIONS[role] || [];
    const grouped = rolePerms.reduce((acc, perm) => {
      if (!acc[perm.category]) {
        acc[perm.category] = [];
      }
      acc[perm.category].push(perm);
      return acc;
    }, {} as Record<string, typeof rolePerms>);

    return CATEGORIES.map(cat => ({
      ...cat,
      permissions: grouped[cat.id] || []
    })).filter(cat => cat.permissions.length > 0);
  };

  return (
    <div className="space-y-6">
      {/* Seleção de Role */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuração de Permissões
          </CardTitle>
          <CardDescription>
            Configure as permissões específicas para cada nível de usuário
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(roleConfig).map(([role, config]) => {
              const Icon = config.icon;
              return (
                <Button
                  key={role}
                  variant={selectedRole === role ? "default" : "outline"}
                  onClick={() => setSelectedRole(role)}
                  className="flex flex-col items-center gap-2 h-auto p-4"
                >
                  <Icon className={`h-5 w-5 ${config.color}`} />
                  <span className="text-sm">{config.label}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Matriz de Permissões */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {React.createElement(roleConfig[selectedRole].icon, { 
                  className: `h-5 w-5 ${roleConfig[selectedRole].color}` 
                })}
                Permissões - {roleConfig[selectedRole].label}
              </CardTitle>
              <CardDescription>
                Configure as permissões específicas para este nível de usuário
              </CardDescription>
            </div>
            
            {!readOnly && hasChanges && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Desfazer
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-6">
              {getPermissionsByCategory(selectedRole).map((category) => (
                <div key={category.id} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className={category.color}>
                      {category.label}
                    </Badge>
                    <Separator className="flex-1" />
                  </div>
                  
                  <div className="grid gap-3">
                    {category.permissions.map((permission, index) => (
                      <div
                        key={`${category.id}-${index}`}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Label className="font-medium">{permission.label}</Label>
                            {permissions[`${selectedRole}-${permission.label}`] && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {permission.description}
                          </p>
                        </div>
                        
                        <Switch
                          checked={permissions[`${selectedRole}-${permission.label}`] || false}
                          onCheckedChange={(checked) => 
                            handlePermissionChange(`${selectedRole}-${permission.label}`, checked)
                          }
                          disabled={readOnly}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {getPermissionsByCategory(selectedRole).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma permissão configurada para este role</p>
                  <p className="text-sm mt-1">
                    Use as permissões padrão ou configure permissões personalizadas
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Informações Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Informações Importantes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
              <div>
                <p className="font-medium">Alterações em Tempo Real</p>
                <p className="text-muted-foreground">
                  As alterações de permissões são aplicadas imediatamente aos usuários.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Permissões Hierárquicas</p>
                <p className="text-muted-foreground">
                  Administradores sempre mantêm acesso total, independente das configurações.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <Settings className="h-4 w-4 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium">Configuração Personalizada</p>
                <p className="text-muted-foreground">
                  Você pode criar configurações específicas para cada organização.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


