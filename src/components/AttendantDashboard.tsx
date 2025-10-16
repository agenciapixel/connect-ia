import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  MessageSquare, 
  Clock, 
  Users, 
  TrendingUp,
  Star,
  Activity,
  Bell,
  BellOff,
  Settings,
  UserCheck,
  UserX,
  Phone,
  Mail,
  Calendar,
  BarChart3,
  Zap,
  Target,
  Award,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/contexts/OrganizationContext";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

// Interfaces
interface Attendant {
  id: string;
  user_id: string;
  org_id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  employee_id?: string;
  department?: string;
  position?: string;
  status: 'online' | 'busy' | 'away' | 'offline' | 'break' | 'training';
  working_hours?: Record<string, unknown>;
  max_concurrent_chats: number;
  auto_accept: boolean;
  skills: string[];
  languages: string[];
  specializations: string[];
  total_chats: number;
  avg_response_time: number;
  satisfaction_score: number;
  last_activity_at?: string;
  notifications?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // Dados relacionados
  current_chats?: number;
  profile?: {
    avatar_url?: string;
    full_name?: string;
  };
}

interface Conversation {
  id: string;
  contact_id: string;
  status: string;
  last_message_at: string;
  unreadCount?: number;
  channel_type?: string;
  priority?: string;
  tags?: string[];
  assigned_to?: string | null;
  contacts: {
    full_name?: string;
    email?: string;
    phone_e164?: string;
    external_id?: string;
  };
}

interface AttendantSession {
  id: string;
  attendant_id: string;
  org_id: string;
  started_at: string;
  ended_at?: string;
  duration_minutes?: number;
  chats_handled: number;
  messages_sent: number;
  avg_response_time: number;
  status: 'active' | 'ended' | 'paused';
  notes?: string;
  attendant?: {
    id: string;
    full_name: string;
    status: string;
  };
}

interface ConversationAssignment {
  id: string;
  conversation_id: string;
  attendant_id: string;
  org_id: string;
  assigned_at: string;
  unassigned_at?: string;
  assigned_by?: string;
  response_time?: number;
  resolution_time?: number;
  satisfaction_rating?: number;
  status: 'assigned' | 'active' | 'transferred' | 'resolved' | 'abandoned';
  notes?: string;
  transfer_reason?: string;
  created_at: string;
  updated_at: string;
  conversation?: Conversation;
  attendant?: Attendant;
}

export default function AttendantDashboard() {
  const { currentOrg } = useOrganization();
  const queryClient = useQueryClient();
  
  // Estados
  const [selectedAttendant, setSelectedAttendant] = useState<Attendant | null>(null);
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
  const [showSessionDialog, setShowSessionDialog] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [assignmentNotes, setAssignmentNotes] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // Buscar atendentes online
  const { data: onlineAttendants = [], isLoading: loadingAttendants } = useQuery({
    queryKey: ['online-attendants', currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg?.id) return [];
      
      const { data, error } = await supabase
        .from('attendants')
        .select(`
          *,
          profile:profiles(id, avatar_url, full_name)
        `)
        .eq('org_id', currentOrg.id)
        .in('status', ['online', 'busy', 'away'])
        .order('status', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!currentOrg?.id,
    refetchInterval: 30000 // Atualizar a cada 30 segundos
  });

  // Buscar conversas não atribuídas
  const { data: unassignedConversations = [] } = useQuery({
    queryKey: ['unassigned-conversations', currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg?.id) return [];
      
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          contacts(id, full_name, email, phone_e164, external_id)
        `)
        .eq('org_id', currentOrg.id)
        .is('assigned_to', null)
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
    enabled: !!currentOrg?.id,
    refetchInterval: 15000 // Atualizar a cada 15 segundos
  });

  // Buscar atribuições ativas
  const { data: activeAssignments = [] } = useQuery({
    queryKey: ['active-assignments', currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg?.id) return [];
      
      const { data, error } = await supabase
        .from('conversation_assignments')
        .select(`
          *,
          conversation:conversations(
            id,
            contact_id,
            status,
            last_message_at,
            channel_type,
            contacts(id, full_name, email, phone_e164)
          ),
          attendant:attendants(id, full_name, status, avatar_url)
        `)
        .eq('org_id', currentOrg.id)
        .eq('status', 'active')
        .order('assigned_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!currentOrg?.id,
    refetchInterval: 10000 // Atualizar a cada 10 segundos
  });

  // Buscar sessões ativas
  const { data: activeSessions = [] } = useQuery({
    queryKey: ['active-sessions', currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg?.id) return [];
      
      const { data, error } = await supabase
        .from('attendant_sessions')
        .select(`
          *,
          attendant:attendants(id, full_name, status, avatar_url)
        `)
        .eq('org_id', currentOrg.id)
        .eq('status', 'active')
        .order('started_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!currentOrg?.id,
    refetchInterval: 30000
  });

  // Mutation para atribuir conversa
  const assignConversationMutation = useMutation({
    mutationFn: async ({ conversationId, attendantId, notes }: { 
      conversationId: string; 
      attendantId: string; 
      notes?: string; 
    }) => {
      const { data: user, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      // Criar atribuição
      const { error: assignmentError } = await supabase
        .from('conversation_assignments')
        .insert({
          conversation_id: conversationId,
          attendant_id: attendantId,
          org_id: currentOrg?.id,
          assigned_by: user.user?.id,
          notes,
          status: 'assigned'
        });

      if (assignmentError) throw assignmentError;

      // Atualizar conversa
      const { error: conversationError } = await supabase
        .from('conversations')
        .update({
          assigned_to: attendantId,
          status: 'assigned'
        })
        .eq('id', conversationId);

      if (conversationError) throw conversationError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unassigned-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['active-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['online-attendants'] });
      setShowAssignmentDialog(false);
      setAssignmentNotes("");
      toast.success("Conversa atribuída com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atribuir conversa: " + error.message);
    }
  });

  // Mutation para iniciar sessão
  const startSessionMutation = useMutation({
    mutationFn: async (attendantId: string) => {
      const { error } = await supabase
        .from('attendant_sessions')
        .insert({
          attendant_id: attendantId,
          org_id: currentOrg?.id,
          status: 'active'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['online-attendants'] });
      toast.success("Sessão iniciada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao iniciar sessão: " + error.message);
    }
  });

  // Mutation para finalizar sessão
  const endSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from('attendant_sessions')
        .update({
          status: 'ended',
          ended_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['online-attendants'] });
      toast.success("Sessão finalizada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao finalizar sessão: " + error.message);
    }
  });

  // Funções auxiliares
  const getStatusIcon = (status: Attendant['status']) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'busy': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'away': return <Clock className="h-4 w-4 text-orange-500" />;
      case 'offline': return <UserX className="h-4 w-4 text-gray-500" />;
      case 'break': return <Zap className="h-4 w-4 text-blue-500" />;
      case 'training': return <Settings className="h-4 w-4 text-purple-500" />;
      default: return <UserX className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: Attendant['status']) => {
    const variants = {
      online: "default",
      busy: "secondary", 
      away: "outline",
      offline: "destructive",
      break: "secondary",
      training: "outline"
    } as const;

    const labels = {
      online: "Online",
      busy: "Ocupado",
      away: "Ausente", 
      offline: "Offline",
      break: "Pausa",
      training: "Treinamento"
    };

    return (
      <Badge variant={variants[status]}>
        {getStatusIcon(status)}
        <span className="ml-1">{labels[status]}</span>
      </Badge>
    );
  };

  const getChannelIcon = (channelType?: string) => {
    switch (channelType) {
      case 'whatsapp': return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'instagram': return <MessageSquare className="h-4 w-4 text-pink-500" />;
      case 'telegram': return <MessageSquare className="h-4 w-4 text-blue-500" />;
      default: return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleAssignConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setShowAssignmentDialog(true);
  };

  const handleStartSession = (attendant: Attendant) => {
    setSelectedAttendant(attendant);
    setShowSessionDialog(true);
  };

  // Estatísticas em tempo real
  const stats = {
    totalOnline: onlineAttendants.filter(a => a.status === 'online').length,
    totalBusy: onlineAttendants.filter(a => a.status === 'busy').length,
    totalAway: onlineAttendants.filter(a => a.status === 'away').length,
    unassignedConversations: unassignedConversations.length,
    activeAssignments: activeAssignments.length,
    activeSessions: activeSessions.length,
    avgResponseTime: onlineAttendants.length > 0 
      ? Math.round(onlineAttendants.reduce((acc, a) => acc + a.avg_response_time, 0) / onlineAttendants.length)
      : 0
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Atendentes</h1>
          <p className="text-muted-foreground">
            Monitore e gerencie sua equipe em tempo real
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <Activity className="h-3 w-3 text-green-500" />
            <span>Tempo Real</span>
          </Badge>
        </div>
      </div>

      {/* Estatísticas em Tempo Real */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Online</p>
                <p className="text-2xl font-bold">{stats.totalOnline}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Ocupados</p>
                <p className="text-2xl font-bold">{stats.totalBusy}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Não Atribuídas</p>
                <p className="text-2xl font-bold">{stats.unassignedConversations}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Tempo Médio</p>
                <p className="text-2xl font-bold">{stats.avgResponseTime}s</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="attendants">Atendentes Online</TabsTrigger>
          <TabsTrigger value="conversations">Conversas</TabsTrigger>
          <TabsTrigger value="sessions">Sessões Ativas</TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Atendentes Online */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UserCheck className="h-5 w-5" />
                  <span>Atendentes Online</span>
                </CardTitle>
                <CardDescription>
                  Status atual da equipe de atendimento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {loadingAttendants ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center space-x-3 animate-pulse">
                          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded mb-1"></div>
                            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                          </div>
                        </div>
                      ))
                    ) : onlineAttendants.length === 0 ? (
                      <div className="text-center py-4">
                        <UserX className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-muted-foreground">Nenhum atendente online</p>
                      </div>
                    ) : (
                      onlineAttendants.map((attendant) => (
                        <div key={attendant.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={attendant.avatar_url || attendant.profile?.avatar_url} />
                              <AvatarFallback className="text-xs">
                                {attendant.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{attendant.full_name}</p>
                              <p className="text-xs text-muted-foreground">{attendant.department}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(attendant.status)}
                            <div className="text-right">
                              <p className="text-xs font-medium">
                                {attendant.current_chats || 0}/{attendant.max_concurrent_chats}
                              </p>
                              <p className="text-xs text-muted-foreground">conversas</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Conversas Não Atribuídas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>Conversas Não Atribuídas</span>
                </CardTitle>
                <CardDescription>
                  {unassignedConversations.length} conversas aguardando atribuição
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {unassignedConversations.length === 0 ? (
                      <div className="text-center py-4">
                        <CheckCircle className="h-8 w-8 mx-auto text-green-500 mb-2" />
                        <p className="text-sm text-muted-foreground">Todas as conversas foram atribuídas!</p>
                      </div>
                    ) : (
                      unassignedConversations.map((conversation) => (
                        <div key={conversation.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-1">
                              {getChannelIcon((conversation as any).channel_type || 'whatsapp')}
                            </div>
                            <div>
                              <p className="font-medium text-sm">
                                {conversation.contacts?.full_name || 'Cliente'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(conversation.last_message_at || conversation.created_at), { 
                                  addSuffix: true, 
                                  locale: ptBR 
                                })}
                              </p>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleAssignConversation(conversation)}
                          >
                            Atribuir
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Atribuições Ativas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Atribuições Ativas</span>
              </CardTitle>
              <CardDescription>
                Conversas sendo atendidas no momento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48">
                <div className="space-y-3">
                  {activeAssignments.length === 0 ? (
                    <div className="text-center py-4">
                      <MessageSquare className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-muted-foreground">Nenhuma conversa ativa no momento</p>
                    </div>
                  ) : (
                    activeAssignments.map((assignment) => (
                      <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {assignment.attendant?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">
                              {assignment.conversation?.contacts?.full_name || 'Cliente'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Atendido por {assignment.attendant?.full_name}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            Atribuído há {formatDistanceToNow(new Date(assignment.assigned_at), { 
                              addSuffix: true, 
                              locale: ptBR 
                            })}
                          </p>
                          <Badge variant="default" className="mt-1">Ativo</Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Atendentes Online */}
        <TabsContent value="attendants" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {onlineAttendants.map((attendant) => (
              <Card key={attendant.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={attendant.avatar_url || attendant.profile?.avatar_url} />
                        <AvatarFallback>
                          {attendant.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{attendant.full_name}</h3>
                        <p className="text-sm text-muted-foreground">{attendant.department}</p>
                      </div>
                    </div>
                    {getStatusBadge(attendant.status)}
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Conversas:</span>
                      <span className="text-sm font-medium">
                        {attendant.current_chats || 0}/{attendant.max_concurrent_chats}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Tempo Resposta:</span>
                      <span className="text-sm font-medium">{attendant.avg_response_time}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Satisfação:</span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{attendant.satisfaction_score.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleStartSession(attendant)}
                    >
                      <Activity className="h-3 w-3 mr-1" />
                      Sessão
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Conversas */}
        <TabsContent value="conversations" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Não Atribuídas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  <span>Não Atribuídas ({unassignedConversations.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {unassignedConversations.map((conversation) => (
                      <div key={conversation.id} className="p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-1">
                              {getChannelIcon((conversation as any).channel_type || 'whatsapp')}
                            </div>
                            <div>
                              <p className="font-medium">{conversation.contacts?.full_name || 'Cliente'}</p>
                              <p className="text-sm text-muted-foreground">
                                {conversation.contacts?.email || conversation.contacts?.phone_e164 || 'Sem contato'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(conversation.last_message_at || conversation.created_at), { 
                                  addSuffix: true, 
                                  locale: ptBR 
                                })}
                              </p>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => handleAssignConversation(conversation)}
                          >
                            Atribuir
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Atribuídas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Atribuídas ({activeAssignments.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {activeAssignments.map((assignment) => (
                      <div key={assignment.id} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {assignment.attendant?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{assignment.conversation?.contacts?.full_name || 'Cliente'}</p>
                              <p className="text-sm text-muted-foreground">
                                Atendido por {assignment.attendant?.full_name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(assignment.assigned_at), { 
                                  addSuffix: true, 
                                  locale: ptBR 
                                })}
                              </p>
                            </div>
                          </div>
                          <Badge variant="default">Ativo</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sessões Ativas */}
        <TabsContent value="sessions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeSessions.map((session) => (
              <Card key={session.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {session.attendant?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{session.attendant?.full_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Sessão iniciada há {formatDistanceToNow(new Date(session.started_at), { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </p>
                      </div>
                    </div>
                    <Badge variant="default">Ativa</Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-lg font-bold">{session.chats_handled}</p>
                      <p className="text-xs text-muted-foreground">Conversas</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold">{session.messages_sent}</p>
                      <p className="text-xs text-muted-foreground">Mensagens</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold">{session.avg_response_time}s</p>
                      <p className="text-xs text-muted-foreground">Tempo Médio</p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      className="flex-1"
                      onClick={() => endSessionMutation.mutate(session.id)}
                    >
                      Finalizar Sessão
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog Atribuir Conversa */}
      <Dialog open={showAssignmentDialog} onOpenChange={setShowAssignmentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atribuir Conversa</DialogTitle>
            <DialogDescription>
              Selecione um atendente para atribuir esta conversa
            </DialogDescription>
          </DialogHeader>
          
          {selectedConversation && (
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">{selectedConversation.contacts?.full_name || 'Cliente'}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedConversation.contacts?.email || selectedConversation.contacts?.phone_e164 || 'Sem contato'}
                </p>
              </div>

              <div>
                <Label htmlFor="attendant-select">Atendente</Label>
                <Select onValueChange={(value) => setSelectedAttendant(onlineAttendants.find(a => a.id === value) || null)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um atendente" />
                  </SelectTrigger>
                  <SelectContent>
                    {onlineAttendants.map((attendant) => (
                      <SelectItem key={attendant.id} value={attendant.id}>
                        <div className="flex items-center space-x-2">
                          <span>{attendant.full_name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({attendant.current_chats || 0}/{attendant.max_concurrent_chats})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="assignment-notes">Observações (opcional)</Label>
                <Textarea
                  id="assignment-notes"
                  placeholder="Adicione observações sobre esta conversa..."
                  value={assignmentNotes}
                  onChange={(e) => setAssignmentNotes(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignmentDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={() => {
                if (selectedConversation && selectedAttendant) {
                  assignConversationMutation.mutate({
                    conversationId: selectedConversation.id,
                    attendantId: selectedAttendant.id,
                    notes: assignmentNotes
                  });
                }
              }}
              disabled={assignConversationMutation.isPending || !selectedAttendant}
            >
              {assignConversationMutation.isPending ? "Atribuindo..." : "Atribuir Conversa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Iniciar Sessão */}
      <Dialog open={showSessionDialog} onOpenChange={setShowSessionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Iniciar Sessão de Trabalho</DialogTitle>
            <DialogDescription>
              Confirme o início da sessão para {selectedAttendant?.full_name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedAttendant && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {selectedAttendant.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedAttendant.full_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedAttendant.department}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status atual:</span>
                  {getStatusBadge(selectedAttendant.status)}
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Conversas simultâneas:</span>
                  <span className="text-sm font-medium">
                    {selectedAttendant.current_chats || 0}/{selectedAttendant.max_concurrent_chats}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSessionDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={() => {
                if (selectedAttendant) {
                  startSessionMutation.mutate(selectedAttendant.id);
                }
              }}
              disabled={startSessionMutation.isPending}
            >
              {startSessionMutation.isPending ? "Iniciando..." : "Iniciar Sessão"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
