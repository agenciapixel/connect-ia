import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PermissionGuard } from "@/components/PermissionGuard";
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye,
  Clock,
  MessageSquare,
  TrendingUp,
  Settings,
  UserCheck,
  UserX,
  Calendar,
  BarChart3,
  Activity,
  Star,
  AlertCircle,
  CheckCircle,
  Pause,
  Play,
  RotateCcw,
  Workflow,
  RefreshCw,
  Zap,
  Target,
  Award,
  Bell,
  BellOff,
  Phone,
  Mail,
  Brain
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDynamicMetrics, useRealtimeMetrics } from "@/hooks/useDynamicMetrics";
import { MetricCard, MetricGrid } from "@/components/MetricCard";
import { useOrganization } from "@/contexts/OrganizationContext";
import { useAttendants, useAttendantMetrics } from "@/hooks/useAttendants";
import { formatDistanceToNow, format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

// Interfaces
interface Attendant {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  status: 'online' | 'busy' | 'away' | 'offline' | 'break' | 'training';
  department?: string;
  position?: string;
  max_concurrent_chats: number;
  auto_accept: boolean;
  skills?: string[];
  specializations?: string[];
  satisfaction_score?: number;
  created_at: string;
  updated_at: string;
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
  assigned_agent?: string | null;
  contacts: {
    full_name?: string;
    email?: string;
    phone_e164?: string;
    external_id?: string;
  };
}

export default function AttendantsUnified() {
  const { currentOrg } = useOrganization();
  const queryClient = useQueryClient();
  
  // Estados principais
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  
  // Estados para CRUD de atendentes
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingAttendant, setEditingAttendant] = useState<Attendant | null>(null);
  
  // Hooks de métricas dinâmicas
  const { data: mainMetrics, isLoading: mainMetricsLoading } = useDynamicMetrics('7d');
  const { data: realtimeMetrics, isLoading: realtimeLoading } = useRealtimeMetrics();
  const [newAttendant, setNewAttendant] = useState({
    full_name: "",
    email: "",
    phone: "",
    department: "",
    position: "",
    max_concurrent_chats: 5,
    auto_accept: false,
    skills: [] as string[],
    specializations: [] as string[]
  });
  
  // Estados para dashboard
  const [autoAssignEnabled, setAutoAssignEnabled] = useState(true);
  const [selectedAttendant, setSelectedAttendant] = useState<any>(null);
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [isStartingSession, setIsStartingSession] = useState(false);

  // Hooks para dados
  const { data: attendants = [], isLoading: isLoadingAttendants, error: attendantsError } = useAttendants(currentOrg?.id);
  const { data: metrics, isLoading: isLoadingMetrics } = useAttendantMetrics(currentOrg?.id);

  // Buscar dados de analytics em tempo real
  const { data: realtimeData, isLoading: isLoadingRealtime } = useQuery({
    queryKey: ["attendants-realtime", currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return null;

      const now = new Date();
      const last24h = subDays(now, 1);

      // Buscar conversas das últimas 24h
      const { data: conversations } = await supabase
        .from("conversations")
        .select("id, status, created_at, assigned_to")
        .eq("org_id", currentOrg.id)
        .gte("created_at", last24h.toISOString());

      // Buscar mensagens das últimas 24h
      const { data: messages } = await supabase
        .from("messages")
        .select("id, created_at, conversation_id")
        .gte("created_at", last24h.toISOString());

      // Calcular métricas por atendente
      const attendantStats = attendants.map(attendant => {
        const attendantConversations = conversations?.filter(c => c.assigned_to === attendant.id) || [];
        const attendantMessages = messages?.filter(m => 
          attendantConversations.some(c => c.id === m.conversation_id)
        ) || [];

        const resolved = attendantConversations.filter(c => c.status === 'resolved').length;
        const total = attendantConversations.length;
        const responseTime = calculateAverageResponseTime(attendantMessages);

        return {
          id: attendant.id,
          name: attendant.full_name,
          conversations: total,
          resolved: resolved,
          resolutionRate: total > 0 ? (resolved / total) * 100 : 0,
          messages: attendantMessages.length,
          avgResponseTime: responseTime,
          currentStatus: attendant.status,
          satisfaction: attendant.satisfaction_score || 0
        };
      });

      // Calcular métricas gerais
      const totalConversations = conversations?.length || 0;
      const totalResolved = conversations?.filter(c => c.status === 'resolved').length || 0;
      const totalMessages = messages?.length || 0;
      const avgResolutionTime = calculateAverageResolutionTime(conversations);

      return {
        attendantStats,
        generalStats: {
          totalConversations,
          totalResolved,
          totalMessages,
          resolutionRate: totalConversations > 0 ? (totalResolved / totalConversations) * 100 : 0,
          avgResolutionTime
        }
      };
    },
    enabled: !!currentOrg?.id,
    refetchInterval: 30000 // Atualizar a cada 30 segundos
  });

  // Funções auxiliares para cálculos
  const calculateAverageResponseTime = (messages: any[]) => {
    if (messages.length < 2) return 0;
    
    let totalTime = 0;
    let count = 0;
    
    for (let i = 1; i < messages.length; i++) {
      const prev = new Date(messages[i-1].created_at);
      const curr = new Date(messages[i].created_at);
      const diff = curr.getTime() - prev.getTime();
      
      if (diff > 0 && diff < 300000) { // Menos de 5 minutos
        totalTime += diff;
        count++;
      }
    }
    
    return count > 0 ? Math.round(totalTime / count / 1000) : 0; // em segundos
  };

  const calculateAverageResolutionTime = (conversations: any[]) => {
    if (!conversations) return 0;
    
    const resolved = conversations.filter(c => c.status === 'resolved');
    if (resolved.length === 0) return 0;
    
    let totalTime = 0;
    resolved.forEach(conv => {
      const created = new Date(conv.created_at);
      const resolved = new Date(); // Simulado - em produção seria o campo resolved_at
      totalTime += resolved.getTime() - created.getTime();
    });
    
    return Math.round(totalTime / resolved.length / 1000 / 60); // em minutos
  };

  // Auto-atribuição de conversas
  const { data: unassignedConversations = [] } = useQuery({
    queryKey: ['unassigned-conversations', currentOrg?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          contacts(id, full_name, email, phone_e164)
        `)
        .eq('org_id', currentOrg?.id)
        .is('assigned_agent_id', null)
        .eq('status', 'active')
        .order('last_message_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!currentOrg?.id,
    refetchInterval: 5000, // Atualiza a cada 5 segundos
  });

  // Funções auxiliares
  const getStatusIcon = (status: string) => {
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

  const getStatusBadge = (status: string) => {
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
      <Badge variant={variants[status as keyof typeof variants]}>
        {getStatusIcon(status)}
        <span className="ml-1">{labels[status as keyof typeof labels]}</span>
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

  // Filtros para atendentes
  const filteredAttendants = attendants.filter(attendant => {
    const matchesSearch = attendant.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         attendant.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || attendant.status === statusFilter;
    const matchesDepartment = departmentFilter === "all" || attendant.department === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  // Estatísticas em tempo real
  const stats = {
    total: attendants.length,
    totalOnline: attendants.filter(a => a.status === 'online').length,
    totalBusy: attendants.filter(a => a.status === 'busy').length,
    totalAway: attendants.filter(a => a.status === 'away').length,
    totalOffline: attendants.filter(a => a.status === 'offline').length,
    unassignedConversations: unassignedConversations.length,
    avgResponseTime: realtimeData?.generalStats?.avgResolutionTime || 0,
    resolutionRate: realtimeData?.generalStats?.resolutionRate || 0,
    totalConversations24h: realtimeData?.generalStats?.totalConversations || 0,
    totalMessages24h: realtimeData?.generalStats?.totalMessages || 0
  };

  // Mutations para CRUD
  const createAttendantMutation = useMutation({
    mutationFn: async (attendantData: any) => {
      const { data, error } = await supabase
        .from('attendants')
        .insert([{
          ...attendantData,
          org_id: currentOrg?.id,
          status: 'offline'
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendants'] });
      setShowCreateDialog(false);
      setNewAttendant({
        full_name: "",
        email: "",
        phone: "",
        department: "",
        position: "",
        max_concurrent_chats: 5,
        auto_accept: false,
        skills: [],
        specializations: []
      });
      toast.success("Atendente criado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao criar atendente: ${error.message}`);
    }
  });

  const updateAttendantMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from('attendants')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendants'] });
      setShowEditDialog(false);
      setEditingAttendant(null);
      toast.success("Atendente atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar atendente: ${error.message}`);
    }
  });

  const deleteAttendantMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('attendants')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendants'] });
      toast.success("Atendente removido com sucesso!");
    },
    onError: (error: any) => {
      toast.error(`Erro ao remover atendente: ${error.message}`);
    }
  });

  // Handlers
  const handleCreateAttendant = () => {
    createAttendantMutation.mutate(newAttendant);
  };

  const handleEditAttendant = (attendant: Attendant) => {
    setEditingAttendant(attendant);
    setShowEditDialog(true);
  };

  const handleUpdateAttendant = () => {
    if (editingAttendant) {
      updateAttendantMutation.mutate({
        id: editingAttendant.id,
        updates: editingAttendant
      });
    }
  };

  const handleDeleteAttendant = (id: string) => {
    if (confirm("Tem certeza que deseja remover este atendente?")) {
      deleteAttendantMutation.mutate(id);
    }
  };

  const handleAssignConversation = (conversation: any) => {
    setSelectedConversation(conversation);
    setShowAssignmentDialog(true);
  };

  const handleStartSession = async (attendantId: string) => {
    setIsStartingSession(true);
    try {
      // Lógica para iniciar sessão
      toast.success("Sessão iniciada com sucesso!");
    } catch (error) {
      toast.error("Erro ao iniciar sessão");
    } finally {
      setIsStartingSession(false);
    }
  };

  if (isLoadingAttendants) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Carregando atendentes...</span>
        </div>
      </div>
    );
  }

  return (
    <PermissionGuard permission="canManageAttendants">
      <div className="flex flex-col h-full">
      {/* Header com Breadcrumbs */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Gestão</span>
            <span className="text-sm text-muted-foreground">/</span>
            <span className="text-sm font-medium">Atendentes</span>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 space-y-6">
          {/* Header da Página */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Gestão de Atendentes</h1>
              <p className="text-muted-foreground mt-1">
                Gerencie sua equipe de atendimento e monitore performance
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-assign"
                  checked={autoAssignEnabled}
                  onCheckedChange={setAutoAssignEnabled}
                />
                <Label htmlFor="auto-assign" className="flex items-center space-x-1">
                  <Workflow className="h-4 w-4" />
                  <span>Atribuição Automática</span>
                </Label>
              </div>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Atendente
              </Button>
            </div>
          </div>

          {/* Estatísticas em Tempo Real */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Atendentes</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.total === 1 ? 'atendente cadastrado' : 'atendentes cadastrados'}
                </p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-600">+2 esta semana</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Online</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.totalOnline}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalOnline === 1 ? 'atendente disponível' : 'atendentes disponíveis'}
                </p>
                <div className="flex items-center mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                  <span className="text-xs text-green-600">em tempo real</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversas 24h</CardTitle>
                <MessageSquare className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.totalConversations24h}</div>
                <p className="text-xs text-muted-foreground">
                  últimas 24 horas
                </p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 text-blue-500 mr-1" />
                  <span className="text-xs text-blue-600">
                    {mainMetrics?.messagesChange ? 
                      `${mainMetrics.messagesChange > 0 ? '+' : ''}${mainMetrics.messagesChange}% vs ontem` : 
                      '+0% vs ontem'
                    }
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Resolução</CardTitle>
                <Target className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.resolutionRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  conversas resolvidas
                </p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-600">
                    {mainMetrics?.responseRateChange ? 
                      `${mainMetrics.responseRateChange > 0 ? '+' : ''}${mainMetrics.responseRateChange}% vs ontem` : 
                      '+0% vs ontem'
                    }
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
                <Clock className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{stats.avgResponseTime}min</div>
                <p className="text-xs text-muted-foreground">
                  para resolver
                </p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-xs text-green-600">-2min vs ontem</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Não Atribuídas</CardTitle>
                <AlertCircle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.unassignedConversations}</div>
                <p className="text-xs text-muted-foreground">
                  aguardando atribuição
                </p>
                <div className="flex items-center mt-1">
                  {stats.unassignedConversations > 0 ? (
                    <>
                      <div className="w-2 h-2 bg-orange-500 rounded-full mr-1 animate-pulse"></div>
                      <span className="text-xs text-orange-600">precisa atenção</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                      <span className="text-xs text-green-600">todas atribuídas</span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Visão Geral</span>
              </TabsTrigger>
              <TabsTrigger value="attendants" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Atendentes</span>
              </TabsTrigger>
              <TabsTrigger value="conversations" className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4" />
                <span>Conversas</span>
              </TabsTrigger>
              <TabsTrigger value="sessions" className="flex items-center space-x-2">
                <Activity className="h-4 w-4" />
                <span>Sessões</span>
              </TabsTrigger>
              <TabsTrigger value="metrics" className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Métricas</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab Visão Geral */}
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
                      Equipe disponível para atendimento
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-3">
                        {attendants.filter(a => a.status === 'online').map((attendant) => (
                          <div key={attendant.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={attendant.avatar_url} />
                                <AvatarFallback>
                                  {attendant.full_name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{attendant.full_name}</p>
                                <p className="text-sm text-muted-foreground">{attendant.department}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getStatusBadge(attendant.status)}
                              <Button size="sm" onClick={() => handleStartSession(attendant.id)}>
                                <Play className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        {attendants.filter(a => a.status === 'online').length === 0 && (
                          <p className="text-center text-muted-foreground py-8">
                            Nenhum atendente online no momento
                          </p>
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
                      Aguardando atribuição a um atendente
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-3">
                        {unassignedConversations.slice(0, 10).map((conversation) => (
                          <div key={conversation.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              {getChannelIcon((conversation as any).channel_type || 'whatsapp')}
                              <div>
                                <p className="font-medium">
                                  {conversation.contacts.full_name || 'Contato sem nome'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {formatDistanceToNow(new Date(conversation.last_message_at), { 
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
                        ))}
                        {unassignedConversations.length === 0 && (
                          <p className="text-center text-muted-foreground py-8">
                            Todas as conversas foram atribuídas
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tab Atendentes */}
            <TabsContent value="attendants" className="space-y-4">
              {/* Filtros */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Filtros e Busca</CardTitle>
                  <CardDescription>
                    Encontre atendentes específicos usando os filtros abaixo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          placeholder="Buscar por nome ou email..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os Status</SelectItem>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="busy">Ocupado</SelectItem>
                        <SelectItem value="away">Ausente</SelectItem>
                        <SelectItem value="offline">Offline</SelectItem>
                        <SelectItem value="break">Pausa</SelectItem>
                        <SelectItem value="training">Treinamento</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Departamento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os Departamentos</SelectItem>
                        <SelectItem value="atendimento">Atendimento</SelectItem>
                        <SelectItem value="vendas">Vendas</SelectItem>
                        <SelectItem value="suporte">Suporte</SelectItem>
                        <SelectItem value="técnico">Técnico</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Lista de Atendentes */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAttendants.map((attendant) => (
                  <Card key={attendant.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={attendant.avatar_url} />
                            <AvatarFallback>
                              {attendant.full_name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{attendant.full_name}</h3>
                            <p className="text-sm text-muted-foreground">{attendant.email}</p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditAttendant(attendant)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteAttendant(attendant.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remover
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        {getStatusBadge(attendant.status)}
                      </div>
                      {attendant.department && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Departamento:</span>
                          <span className="text-sm font-medium">{attendant.department}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Chats Simultâneos:</span>
                        <span className="text-sm font-medium">{attendant.max_concurrent_chats}</span>
                      </div>
                      {attendant.skills && attendant.skills.length > 0 && (
                        <div>
                          <span className="text-sm text-muted-foreground">Habilidades:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {attendant.skills.slice(0, 3).map((skill, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {attendant.skills.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{attendant.skills.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredAttendants.length === 0 && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Nenhum atendente encontrado</h3>
                    <p className="text-muted-foreground text-center mb-4">
                      {searchQuery || statusFilter !== "all" || departmentFilter !== "all"
                        ? "Tente ajustar os filtros de busca"
                        : "Comece criando seu primeiro atendente"
                      }
                    </p>
                    <Button onClick={() => setShowCreateDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Atendente
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Tab Conversas */}
            <TabsContent value="conversations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5" />
                    <span>Conversas Não Atribuídas</span>
                  </CardTitle>
                  <CardDescription>
                    Lista completa de conversas aguardando atribuição
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {unassignedConversations.map((conversation) => (
                      <div key={conversation.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center space-x-4">
                          {getChannelIcon((conversation as any).channel_type || 'whatsapp')}
                          <div>
                            <h4 className="font-medium">
                              {conversation.contacts.full_name || conversation.contacts.email || 'Contato sem nome'}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {conversation.contacts.phone_e164 || conversation.contacts.email}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Última mensagem: {formatDistanceToNow(new Date(conversation.last_message_at), { 
                                addSuffix: true, 
                                locale: ptBR 
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">
                            {(conversation as any).channel_type || 'whatsapp'}
                          </Badge>
                          <Button 
                            size="sm"
                            onClick={() => handleAssignConversation(conversation)}
                          >
                            Atribuir
                          </Button>
                        </div>
                      </div>
                    ))}
                    {unassignedConversations.length === 0 && (
                      <div className="text-center py-12">
                        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">Todas as conversas foram atribuídas</h3>
                        <p className="text-muted-foreground">
                          Não há conversas aguardando atribuição no momento
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab Sessões */}
            <TabsContent value="sessions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span>Sessões Ativas</span>
                  </CardTitle>
                  <CardDescription>
                    Atendentes com sessões de trabalho ativas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {attendants.filter(a => a.status === 'online' || a.status === 'busy').map((attendant) => (
                      <div key={attendant.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={attendant.avatar_url} />
                            <AvatarFallback>
                              {attendant.full_name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium">{attendant.full_name}</h4>
                            <p className="text-sm text-muted-foreground">{attendant.department}</p>
                            <p className="text-xs text-muted-foreground">
                              Sessão iniciada: {formatDistanceToNow(new Date(attendant.updated_at), { 
                                addSuffix: true, 
                                locale: ptBR 
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(attendant.status)}
                          <Button size="sm" variant="outline">
                            <Pause className="h-3 w-3 mr-1" />
                            Pausar
                          </Button>
                          <Button size="sm" variant="destructive">
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Finalizar
                          </Button>
                        </div>
                      </div>
                    ))}
                    {attendants.filter(a => a.status === 'online' || a.status === 'busy').length === 0 && (
                      <div className="text-center py-12">
                        <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">Nenhuma sessão ativa</h3>
                        <p className="text-muted-foreground">
                          Não há atendentes com sessões de trabalho ativas no momento
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab Métricas */}
            <TabsContent value="metrics" className="space-y-4">
              {isLoadingRealtime ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Carregando métricas em tempo real...</span>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Métricas Gerais */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        Performance Geral (24h)
                      </CardTitle>
                      <CardDescription>Métricas consolidadas da equipe de atendimento</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-white rounded-lg border">
                          <div className="text-3xl font-bold text-blue-600">{stats.totalConversations24h}</div>
                          <div className="text-sm text-muted-foreground">Total Conversas</div>
                          <div className="text-xs text-blue-600 mt-1">+15% vs ontem</div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-white rounded-lg border">
                          <div className="text-3xl font-bold text-green-600">{stats.resolutionRate.toFixed(1)}%</div>
                          <div className="text-sm text-muted-foreground">Taxa de Resolução</div>
                          <div className="text-xs text-green-600 mt-1">+5% vs ontem</div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-white rounded-lg border">
                          <div className="text-3xl font-bold text-purple-600">{stats.avgResponseTime}min</div>
                          <div className="text-sm text-muted-foreground">Tempo Médio</div>
                          <div className="text-xs text-green-600 mt-1">-2min vs ontem</div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-white rounded-lg border">
                          <div className="text-3xl font-bold text-orange-600">{stats.totalMessages24h}</div>
                          <div className="text-sm text-muted-foreground">Total Mensagens</div>
                          <div className="text-xs text-blue-600 mt-1">+22% vs ontem</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Performance por Atendente */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Performance Individual (24h)
                      </CardTitle>
                      <CardDescription>Métricas detalhadas de cada atendente</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {realtimeData?.attendantStats?.map((attendantStat) => {
                          const attendant = attendants.find(a => a.id === attendantStat.id);
                          if (!attendant) return null;

                          return (
                            <Card key={attendantStat.id} className="p-4 hover:shadow-md transition-shadow">
                              <div className="flex items-center space-x-3 mb-4">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={attendant.avatar_url} />
                                  <AvatarFallback>
                                    {attendant.full_name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <h4 className="font-medium">{attendant.full_name}</h4>
                                  <p className="text-sm text-muted-foreground">{attendant.department}</p>
                                  <div className="mt-1">{getStatusBadge(attendant.status)}</div>
                                </div>
                              </div>
                              
                              <div className="space-y-3">
                                {/* Conversas */}
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-muted-foreground">Conversas:</span>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm font-bold">{attendantStat.conversations}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {attendantStat.resolved}/{attendantStat.conversations}
                                    </Badge>
                                  </div>
                                </div>

                                {/* Taxa de Resolução */}
                                <div className="space-y-1">
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="text-green-600 font-medium">Resolução</span>
                                    <span className="font-semibold">{attendantStat.resolutionRate.toFixed(1)}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                                      style={{ width: `${Math.min(attendantStat.resolutionRate, 100)}%` }}
                                    ></div>
                                  </div>
                                </div>

                                {/* Tempo de Resposta */}
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-muted-foreground">Tempo Médio:</span>
                                  <span className="text-sm font-medium text-purple-600">
                                    {attendantStat.avgResponseTime}s
                                  </span>
                                </div>

                                {/* Satisfação */}
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-muted-foreground">Satisfação:</span>
                                  <div className="flex items-center space-x-1">
                                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                    <span className="text-sm font-medium">{attendantStat.satisfaction.toFixed(1)}</span>
                                  </div>
                                </div>

                                {/* Mensagens */}
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-muted-foreground">Mensagens:</span>
                                  <span className="text-sm font-medium text-blue-600">
                                    {attendantStat.messages}
                                  </span>
                                </div>
                              </div>

                              {/* Indicador de Performance */}
                              <div className="mt-4 pt-3 border-t">
                                <div className="flex justify-center">
                                  <div className={`w-3 h-3 rounded-full ${
                                    attendantStat.resolutionRate >= 80 ? 'bg-green-500' : 
                                    attendantStat.resolutionRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}></div>
                                </div>
                                <div className="text-xs text-center mt-1 text-muted-foreground">
                                  {attendantStat.resolutionRate >= 80 ? 'Excelente' : 
                                   attendantStat.resolutionRate >= 60 ? 'Bom' : 'Melhorar'}
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Insights e Recomendações */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-purple-600" />
                        Insights Inteligentes
                      </CardTitle>
                      <CardDescription>Análise automatizada e recomendações para melhoria</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                          <div className="flex items-center space-x-2 mb-3">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-green-800">Pontos Fortes</span>
                          </div>
                          <ul className="space-y-2 text-sm text-green-700">
                            <li className="flex items-start space-x-2">
                              <span className="text-green-500 mt-1">✓</span>
                              <span>Taxa de resolução de {stats.resolutionRate.toFixed(1)}% está acima da média</span>
                            </li>
                            <li className="flex items-start space-x-2">
                              <span className="text-green-500 mt-1">✓</span>
                              <span>Tempo médio de {stats.avgResponseTime}min é eficiente</span>
                            </li>
                            <li className="flex items-start space-x-2">
                              <span className="text-green-500 mt-1">✓</span>
                              <span>{stats.totalOnline} atendentes online garantem boa cobertura</span>
                            </li>
                          </ul>
                        </div>

                        <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
                          <div className="flex items-center space-x-2 mb-3">
                            <Target className="h-4 w-4 text-orange-600" />
                            <span className="font-medium text-orange-800">Oportunidades</span>
                          </div>
                          <ul className="space-y-2 text-sm text-orange-700">
                            <li className="flex items-start space-x-2">
                              <span className="text-orange-500 mt-1">⚡</span>
                              <span>{stats.unassignedConversations} conversas não atribuídas precisam de atenção</span>
                            </li>
                            <li className="flex items-start space-x-2">
                              <span className="text-orange-500 mt-1">⚡</span>
                              <span>Considere aumentar o número de atendentes online</span>
                            </li>
                            <li className="flex items-start space-x-2">
                              <span className="text-orange-500 mt-1">⚡</span>
                              <span>Implementar atribuição automática para melhorar eficiência</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Dialog Criar Atendente */}
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Novo Atendente</DialogTitle>
                <DialogDescription>
                  Adicione um novo membro à sua equipe de atendimento
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nome Completo</Label>
                  <Input
                    id="full_name"
                    value={newAttendant.full_name}
                    onChange={(e) => setNewAttendant({...newAttendant, full_name: e.target.value})}
                    placeholder="João Silva"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newAttendant.email}
                    onChange={(e) => setNewAttendant({...newAttendant, email: e.target.value})}
                    placeholder="joao@empresa.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={newAttendant.phone}
                    onChange={(e) => setNewAttendant({...newAttendant, phone: e.target.value})}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Departamento</Label>
                  <Select value={newAttendant.department} onValueChange={(value) => setNewAttendant({...newAttendant, department: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="atendimento">Atendimento</SelectItem>
                      <SelectItem value="vendas">Vendas</SelectItem>
                      <SelectItem value="suporte">Suporte</SelectItem>
                      <SelectItem value="técnico">Técnico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Cargo</Label>
                  <Input
                    id="position"
                    value={newAttendant.position}
                    onChange={(e) => setNewAttendant({...newAttendant, position: e.target.value})}
                    placeholder="Atendente Sênior"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_chats">Chats Simultâneos</Label>
                  <Input
                    id="max_chats"
                    type="number"
                    min="1"
                    max="20"
                    value={newAttendant.max_concurrent_chats}
                    onChange={(e) => setNewAttendant({...newAttendant, max_concurrent_chats: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto_accept"
                  checked={newAttendant.auto_accept}
                  onCheckedChange={(checked) => setNewAttendant({...newAttendant, auto_accept: checked})}
                />
                <Label htmlFor="auto_accept">Aceitar conversas automaticamente</Label>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleCreateAttendant}
                  disabled={createAttendantMutation.isPending}
                >
                  {createAttendantMutation.isPending ? "Criando..." : "Criar Atendente"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Dialog Editar Atendente */}
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Editar Atendente</DialogTitle>
                <DialogDescription>
                  Atualize as informações do atendente
                </DialogDescription>
              </DialogHeader>
              {editingAttendant && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit_full_name">Nome Completo</Label>
                    <Input
                      id="edit_full_name"
                      value={editingAttendant.full_name}
                      onChange={(e) => setEditingAttendant({...editingAttendant, full_name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_email">Email</Label>
                    <Input
                      id="edit_email"
                      type="email"
                      value={editingAttendant.email}
                      onChange={(e) => setEditingAttendant({...editingAttendant, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_phone">Telefone</Label>
                    <Input
                      id="edit_phone"
                      value={editingAttendant.phone || ""}
                      onChange={(e) => setEditingAttendant({...editingAttendant, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_department">Departamento</Label>
                    <Select value={editingAttendant.department || ""} onValueChange={(value) => setEditingAttendant({...editingAttendant, department: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o departamento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="atendimento">Atendimento</SelectItem>
                        <SelectItem value="vendas">Vendas</SelectItem>
                        <SelectItem value="suporte">Suporte</SelectItem>
                        <SelectItem value="técnico">Técnico</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_position">Cargo</Label>
                    <Input
                      id="edit_position"
                      value={editingAttendant.position || ""}
                      onChange={(e) => setEditingAttendant({...editingAttendant, position: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_max_chats">Chats Simultâneos</Label>
                    <Input
                      id="edit_max_chats"
                      type="number"
                      min="1"
                      max="20"
                      value={editingAttendant.max_concurrent_chats}
                      onChange={(e) => setEditingAttendant({...editingAttendant, max_concurrent_chats: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit_auto_accept"
                  checked={editingAttendant?.auto_accept || false}
                  onCheckedChange={(checked) => setEditingAttendant({...editingAttendant!, auto_accept: checked})}
                />
                <Label htmlFor="edit_auto_accept">Aceitar conversas automaticamente</Label>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleUpdateAttendant}
                  disabled={updateAttendantMutation.isPending}
                >
                  {updateAttendantMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

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
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium">
                      {selectedConversation.contacts.full_name || 'Contato sem nome'}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedConversation.contacts.phone_e164 || selectedConversation.contacts.email}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Atendente Disponível</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um atendente" />
                      </SelectTrigger>
                      <SelectContent>
                        {attendants.filter(a => a.status === 'online').map((attendant) => (
                          <SelectItem key={attendant.id} value={attendant.id}>
                            {attendant.full_name} - {attendant.department}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAssignmentDialog(false)}>
                  Cancelar
                </Button>
                <Button>
                  Atribuir
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      </div>
    </PermissionGuard>
  );
}
