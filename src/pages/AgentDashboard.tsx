import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  TrendingUp, 
  Users, 
  Bell,
  BellOff,
  Settings,
  User,
  Calendar,
  BarChart3,
  Activity,
  Star,
  AlertCircle,
  Phone,
  Mail,
  RefreshCw
} from "lucide-react";
import { useOrganization } from "@/contexts/OrganizationContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AgentDashboard() {
  const { currentOrg } = useOrganization();
  const [isOnline, setIsOnline] = useState(true);

  // Buscar dados do atendente atual
  const { data: attendantData, isLoading: isLoadingAttendant } = useQuery({
    queryKey: ["agent-profile", currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return null;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: attendant } = await supabase
        .from("attendants")
        .select("*")
        .eq("user_id", user.id)
        .eq("org_id", currentOrg.id)
        .single();

      return attendant;
    },
    enabled: !!currentOrg?.id,
  });

  // Buscar conversas atribuídas ao atendente
  const { data: assignedConversations, isLoading: isLoadingConversations } = useQuery({
    queryKey: ["agent-conversations", currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg || !attendantData) return [];

      const { data: conversations } = await supabase
        .from("conversations")
        .select(`
          *,
          contacts (
            full_name,
            phone_e164,
            email,
            avatar_url
          )
        `)
        .eq("org_id", currentOrg.id)
        .eq("assigned_to", attendantData.id)
        .eq("status", "open")
        .order("created_at", { ascending: false });

      return conversations || [];
    },
    enabled: !!currentOrg?.id && !!attendantData?.id,
  });

  // Buscar métricas pessoais (últimas 24h)
  const { data: personalMetrics, isLoading: isLoadingMetrics } = useQuery({
    queryKey: ["agent-metrics", currentOrg?.id, attendantData?.id],
    queryFn: async () => {
      if (!currentOrg || !attendantData) return null;

      const now = new Date();
      const last24h = subDays(now, 1);

      // Buscar conversas das últimas 24h
      const { data: conversations } = await supabase
        .from("conversations")
        .select("id, status, created_at, assigned_to")
        .eq("org_id", currentOrg.id)
        .eq("assigned_to", attendantData.id)
        .gte("created_at", last24h.toISOString());

      // Buscar mensagens das últimas 24h
      const { data: messages } = await supabase
        .from("messages")
        .select("id, created_at, conversation_id")
        .gte("created_at", last24h.toISOString());

      const attendantMessages = messages?.filter(m => 
        conversations?.some(c => c.id === m.conversation_id)
      ) || [];

      const resolved = conversations?.filter(c => c.status === 'resolved').length || 0;
      const total = conversations?.length || 0;

      return {
        totalConversations: total,
        resolvedConversations: resolved,
        resolutionRate: total > 0 ? (resolved / total) * 100 : 0,
        totalMessages: attendantMessages.length,
        avgResponseTime: attendantData.avg_response_time || 0,
        satisfactionScore: attendantData.satisfaction_score || 0
      };
    },
    enabled: !!currentOrg?.id && !!attendantData?.id,
    refetchInterval: 30000 // Atualizar a cada 30 segundos
  });

  const handleToggleStatus = async () => {
    if (!attendantData) return;

    const newStatus = isOnline ? 'away' : 'online';
    
    try {
      const { error } = await supabase
        .from("attendants")
        .update({ status: newStatus })
        .eq("id", attendantData.id);

      if (error) throw error;
      
      setIsOnline(!isOnline);
    } catch (error) {
      console.error("Erro ao alterar status:", error);
    }
  };

  if (isLoadingAttendant) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Carregando seu painel...</span>
        </div>
      </div>
    );
  }

  if (!attendantData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-orange-500 mb-4" />
            <CardTitle>Perfil de Atendente Não Encontrado</CardTitle>
            <CardDescription>
              Você não está configurado como atendente nesta organização.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Entre em contato com um administrador para configurar seu perfil de atendente.
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
            <User className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Meu Painel</span>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-6 p-6">
        {/* Status e Informações Pessoais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Meu Perfil
              </CardTitle>
              <CardDescription>Suas informações e status atual</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={attendantData.avatar_url} />
                  <AvatarFallback>
                    {attendantData.full_name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{attendantData.full_name}</h3>
                  <p className="text-muted-foreground">{attendantData.department} • {attendantData.position}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge 
                      variant={isOnline ? "default" : "secondary"}
                      className={isOnline ? "bg-green-500" : ""}
                    >
                      {isOnline ? "Online" : "Ausente"}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleToggleStatus}
                      className="ml-2"
                    >
                      {isOnline ? <BellOff className="h-4 w-4 mr-2" /> : <Bell className="h-4 w-4 mr-2" />}
                      {isOnline ? "Ficar Ausente" : "Voltar Online"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Status Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Conversas Ativas</span>
                  <span className="font-semibold">{assignedConversations?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Máx. Simultâneas</span>
                  <span className="font-semibold">{attendantData.max_concurrent_chats}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Auto Aceitar</span>
                  <Badge variant={attendantData.auto_accept ? "default" : "secondary"}>
                    {attendantData.auto_accept ? "Sim" : "Não"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Idiomas</span>
                  <span className="font-semibold text-sm">
                    {attendantData.languages?.join(", ") || "PT"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Métricas Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Minhas Métricas (24h)
            </CardTitle>
            <CardDescription>Seu desempenho nas últimas 24 horas</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingMetrics ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                <span>Carregando métricas...</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-white rounded-lg border">
                  <div className="text-2xl font-bold text-blue-600">
                    {personalMetrics?.totalConversations || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Conversas</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-white rounded-lg border">
                  <div className="text-2xl font-bold text-green-600">
                    {personalMetrics?.resolvedConversations || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Resolvidas</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-white rounded-lg border">
                  <div className="text-2xl font-bold text-purple-600">
                    {personalMetrics?.resolutionRate.toFixed(1) || 0}%
                  </div>
                  <div className="text-sm text-muted-foreground">Taxa Resolução</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-white rounded-lg border">
                  <div className="text-2xl font-bold text-orange-600">
                    {personalMetrics?.totalMessages || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Mensagens</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-white rounded-lg border">
                  <div className="text-2xl font-bold text-yellow-600">
                    {personalMetrics?.satisfactionScore.toFixed(1) || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Satisfação</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Conversas Atribuídas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Minhas Conversas Ativas
            </CardTitle>
            <CardDescription>Conversas atribuídas a você</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingConversations ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                <span>Carregando conversas...</span>
              </div>
            ) : assignedConversations && assignedConversations.length > 0 ? (
              <div className="space-y-3">
                {assignedConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={conversation.contacts.avatar_url} />
                      <AvatarFallback>
                        {conversation.contacts.full_name?.split(' ').map(n => n[0]).join('') || 'C'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">
                        {conversation.contacts.full_name || 'Contato sem nome'}
                      </h4>
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.contacts.phone_e164 || conversation.contacts.email}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        {format(new Date(conversation.created_at), 'dd/MM HH:mm')}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Atender
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma conversa atribuída no momento</p>
                <p className="text-sm mt-1">Você será notificado quando novas conversas chegarem</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


