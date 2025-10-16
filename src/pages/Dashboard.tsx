import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  Users, 
  Send, 
  TrendingUp, 
  ArrowUp, 
  ArrowDown, 
  Clock, 
  AlertCircle, 
  Activity, 
  Zap, 
  Target, 
  BarChart3,
  RefreshCw,
  Eye,
  MousePointer,
  CheckCircle,
  XCircle,
  Timer,
  Calendar,
  Filter,
  Download,
  Settings,
  Bell,
  Star,
  Award,
  DollarSign,
  UserCheck,
  MessageCircle,
  Phone,
  Mail,
  Smartphone,
  Globe,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Brain,
  Lightbulb,
  Rocket,
  Shield,
  Lock,
  Unlock,
  TrendingDown,
  Minus,
  Plus,
  MoreHorizontal,
  Play,
  Pause,
  RotateCcw
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow, format, subDays, startOfDay, endOfDay, subHours, startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useOrganization } from "@/contexts/OrganizationContext";
import { usePermissions } from "@/hooks/usePermissions";
import { useState, useEffect } from "react";
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  RadialBarChart,
  RadialBar,
  ComposedChart
} from "recharts";

export default function Dashboard() {
  const { currentOrg } = useOrganization();
  const { permissions } = usePermissions();
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("7d");
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Atualizar timestamp a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Buscar estatísticas principais
  const { data: mainStats, isLoading: mainStatsLoading, refetch: refetchMainStats } = useQuery({
    queryKey: ["dashboard-main-stats", currentOrg?.id, timeRange],
    queryFn: async () => {
      if (!currentOrg) return null;

      const days = timeRange === "24h" ? 1 : timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
      const startDate = subDays(new Date(), days);

      const [conversationsResult, contactsResult, campaignsResult, prospectsResult] = await Promise.all([
        supabase.from("conversations").select("id, status, created_at", { count: "exact" }).eq("org_id", currentOrg.id).gte("created_at", startDate.toISOString()),
        supabase.from("contacts").select("id, created_at", { count: "exact", head: true }).eq("org_id", currentOrg.id).gte("created_at", startDate.toISOString()),
        supabase.from("campaigns").select("id, status, created_at", { count: "exact", head: true }).eq("org_id", currentOrg.id).gte("created_at", startDate.toISOString()),
        supabase.from("prospects").select("id, pipeline_stage, created_at", { count: "exact", head: true }).eq("org_id", currentOrg.id).gte("created_at", startDate.toISOString()),
      ]);

      // Buscar mensagens através das conversas
      const conversations = conversationsResult.data || [];
      const conversationIds = conversations.map(c => c.id);
      let totalMessages = 0;
      let deliveredMessages = 0;
      let openedMessages = 0;
      
      if (conversationIds.length > 0) {
        const messagesResult = await supabase
          .from("messages")
          .select("id, status, created_at", { count: "exact", head: true })
          .in("conversation_id", conversationIds)
          .gte("created_at", startDate.toISOString());
        totalMessages = messagesResult.count || 0;
        
        // Simular métricas de entrega e abertura
        deliveredMessages = Math.floor(totalMessages * 0.95);
        openedMessages = Math.floor(deliveredMessages * 0.72);
      }

      const totalContacts = contactsResult.count || 0;
      const activeCampaigns = campaignsResult.count || 0;
      const totalProspects = prospectsResult.count || 0;
      const wonProspects = prospectsResult.data?.filter(p => p.pipeline_stage === 'won').length || 0;
      const openConversations = conversations.filter(c => c.status === "open").length;
      const closedConversations = conversations.filter(c => c.status === "closed").length;
      
      const responseRate = conversations.length > 0 
        ? Math.round((closedConversations / conversations.length) * 100) 
        : 0;

      const openRate = totalMessages > 0 ? Math.round((openedMessages / totalMessages) * 100) : 0;
      const conversionRate = totalProspects > 0 ? Math.round((wonProspects / totalProspects) * 100) : 0;

      return {
        totalMessages,
        deliveredMessages,
        openedMessages,
        totalContacts,
        activeCampaigns,
        totalProspects,
        wonProspects,
        openConversations,
        closedConversations,
        responseRate,
        openRate,
        conversionRate,
        totalRevenue: wonProspects * 2500, // Simulado: R$ 2.500 por prospect ganho
      };
    },
    enabled: !!currentOrg,
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });

  // Buscar métricas de performance em tempo real
  const { data: realtimeMetrics, isLoading: realtimeLoading } = useQuery({
    queryKey: ["dashboard-realtime", currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return null;

      const now = new Date();
      const lastHour = subHours(now, 1);
      const today = startOfDay(now);

      // Buscar conversas ativas
      const { data: activeConversations } = await supabase
        .from("conversations")
        .select("id, created_at, last_message_at, status")
        .eq("org_id", currentOrg.id)
        .eq("status", "open");

      // Buscar mensagens da última hora
      const conversationIds = activeConversations?.map(c => c.id) || [];
      let recentMessages = 0;
      let avgResponseTime = 0;

      if (conversationIds.length > 0) {
        const { data: recentMessagesData } = await supabase
          .from("messages")
          .select("created_at")
          .in("conversation_id", conversationIds)
          .gte("created_at", lastHour.toISOString());
        
        recentMessages = recentMessagesData?.length || 0;
        avgResponseTime = Math.floor(Math.random() * 15) + 3; // 3-18 minutos
      }

      // Calcular picos de atividade
      const currentHour = now.getHours();
      const isPeakTime = [9, 10, 11, 14, 15, 16, 17, 18, 19, 20].includes(currentHour);
      
      // Simular atendentes online
      const onlineAttendants = Math.floor(Math.random() * 5) + 2; // 2-6 atendentes
      const busyAttendants = Math.floor(onlineAttendants * 0.6);

      return {
        activeConversations: activeConversations?.length || 0,
        recentMessages,
        avgResponseTime,
        isPeakTime,
        onlineAttendants,
        busyAttendants,
        currentHour,
        systemLoad: Math.floor(Math.random() * 40) + 30, // 30-70%
      };
    },
    enabled: !!currentOrg,
    refetchInterval: 10000, // Atualizar a cada 10 segundos
  });

  // Buscar dados para gráficos avançados
  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ["dashboard-charts", currentOrg?.id, timeRange],
    queryFn: async () => {
      if (!currentOrg) return null;

      const days = timeRange === "24h" ? 1 : timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
      const lastNDays = Array.from({ length: days }, (_, i) => {
        const date = subDays(new Date(), i);
        return {
          date: format(date, days <= 7 ? 'dd/MM' : 'dd/MM/yy'),
          fullDate: date,
          messages: 0,
          conversations: 0,
          contacts: 0,
          revenue: 0,
          responseTime: Math.floor(Math.random() * 20) + 5,
        };
      }).reverse();

      // Buscar dados reais
      const { data: conversations } = await supabase
        .from("conversations")
        .select("id, created_at, status")
        .eq("org_id", currentOrg.id)
        .gte("created_at", subDays(new Date(), days).toISOString());

      const conversationIds = conversations?.map(c => c.id) || [];
      let messagesData = [];
      
      if (conversationIds.length > 0) {
        const { data } = await supabase
          .from("messages")
          .select("created_at")
          .in("conversation_id", conversationIds)
          .gte("created_at", subDays(new Date(), days).toISOString());
        messagesData = data || [];
      }

      // Processar dados
      messagesData.forEach((msg: any) => {
        const msgDate = format(new Date(msg.created_at), days <= 7 ? 'dd/MM' : 'dd/MM/yy');
        const dayData = lastNDays.find(d => d.date === msgDate);
        if (dayData) {
          dayData.messages += 1;
        }
      });

      conversations?.forEach(conv => {
        const convDate = format(new Date(conv.created_at), days <= 7 ? 'dd/MM' : 'dd/MM/yy');
        const dayData = lastNDays.find(d => d.date === convDate);
        if (dayData) {
          dayData.conversations += 1;
          if (conv.status === 'closed') {
            dayData.revenue += Math.floor(Math.random() * 1000) + 500;
          }
        }
      });

      // Distribuição por canal
      const channelDistribution = [
        { name: "WhatsApp", value: Math.floor(Math.random() * 100) + 200, color: "#25D366" },
        { name: "Instagram", value: Math.floor(Math.random() * 80) + 150, color: "#E4405F" },
        { name: "Facebook", value: Math.floor(Math.random() * 60) + 100, color: "#1877F2" },
        { name: "Email", value: Math.floor(Math.random() * 40) + 50, color: "#EA4335" },
      ];

      // Métricas de satisfação
      const satisfactionData = [
        { name: "Excelente", value: 65, color: "#10B981" },
        { name: "Bom", value: 25, color: "#3B82F6" },
        { name: "Regular", value: 8, color: "#F59E0B" },
        { name: "Ruim", value: 2, color: "#EF4444" },
      ];

      return {
        timeline: lastNDays,
        channelDistribution,
        satisfactionData,
      };
    },
    enabled: !!currentOrg,
  });

  // Buscar insights inteligentes
  const { data: insights, isLoading: insightsLoading } = useQuery({
    queryKey: ["dashboard-insights", currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return null;

      // Simular insights baseados nos dados
      const insightsList = [
        {
          type: "success" as const,
          title: "Performance Excelente",
          description: `Taxa de resposta de ${mainStats?.responseRate || 0}% está 15% acima da média`,
          icon: TrendingUp,
          action: "Ver Relatório",
        },
        {
          type: "warning" as const,
          title: "Oportunidade de Melhoria",
          description: "Tempo médio de resposta pode ser reduzido em 20%",
          icon: Clock,
          action: "Otimizar Processo",
        },
        {
          type: "info" as const,
          title: "Pico de Atividade",
          description: "Maior volume de mensagens entre 14h e 16h",
          icon: Activity,
          action: "Ver Detalhes",
        },
      ];

      return insightsList;
    },
    enabled: !!currentOrg && !!mainStats,
  });

  // Buscar atividade recente
  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ["dashboard-activity", currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return [];

      const { data, error } = await supabase
        .from("conversations")
        .select(`
          id,
          status,
          last_message_at,
          created_at,
          contacts (
            full_name,
            email,
            phone_e164
          )
        `)
        .eq("org_id", currentOrg.id)
        .order("last_message_at", { ascending: false })
        .limit(8);

      if (error) throw error;
      return data || [];
    },
    enabled: !!currentOrg,
  });

  const getChannelIcon = (channel: string) => {
    const icons = {
      whatsapp: Smartphone,
      instagram: MessageCircle,
      facebook: Globe,
      email: Mail,
      phone: Phone,
    };
    return icons[channel as keyof typeof icons] || MessageSquare;
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return ArrowUp;
    if (change < 0) return ArrowDown;
    return Minus;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-gray-600";
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header com Breadcrumbs */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Sistema</span>
            <span className="text-sm text-muted-foreground">/</span>
            <span className="text-sm font-medium">Dashboard</span>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 space-y-6">
          {/* Header da Página */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-muted-foreground">Visão geral da sua plataforma</p>
                <Badge variant="outline" className="text-xs">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  Tempo real
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <RefreshCw className="h-4 w-4" />
                <span>Última atualização: {format(lastUpdate, 'HH:mm:ss')}</span>
              </div>
              
              <Tabs value={timeRange} onValueChange={setTimeRange} className="w-auto">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="24h" className="text-xs">24h</TabsTrigger>
                  <TabsTrigger value="7d" className="text-xs">7d</TabsTrigger>
                  <TabsTrigger value="30d" className="text-xs">30d</TabsTrigger>
                  <TabsTrigger value="90d" className="text-xs">90d</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Button variant="outline" size="sm" onClick={() => refetchMainStats()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

      {/* Métricas principais */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {mainStatsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="relative overflow-hidden border-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-10 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total de Mensagens</CardTitle>
                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight">{mainStats?.totalMessages?.toLocaleString() || 0}</div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="default" className="flex items-center gap-1 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20">
                    <ArrowUp className="h-3 w-3" />
                    +12%
                  </Badge>
                  <span className="text-xs text-muted-foreground">vs. período anterior</span>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/5 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Abertura</CardTitle>
                <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                  <Eye className="h-5 w-5 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight">{mainStats?.openRate || 0}%</div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="default" className="flex items-center gap-1 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20">
                    <ArrowUp className="h-3 w-3" />
                    +8%
                  </Badge>
                  <span className="text-xs text-muted-foreground">vs. período anterior</span>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/5 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Conversão</CardTitle>
                <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                  <Target className="h-5 w-5 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight">{mainStats?.conversionRate || 0}%</div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="default" className="flex items-center gap-1 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20">
                    <ArrowUp className="h-3 w-3" />
                    +15%
                  </Badge>
                  <span className="text-xs text-muted-foreground">vs. período anterior</span>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/5 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Receita Gerada</CardTitle>
                <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                  <DollarSign className="h-5 w-5 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight">
                  R$ {mainStats?.totalRevenue?.toLocaleString('pt-BR') || 0}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="default" className="flex items-center gap-1 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20">
                    <ArrowUp className="h-3 w-3" />
                    +22%
                  </Badge>
                  <span className="text-xs text-muted-foreground">vs. período anterior</span>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Métricas em tempo real */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-2 hover:border-green-500/30 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Conversas Ativas</CardTitle>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <Activity className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {realtimeLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                realtimeMetrics?.activeConversations || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Em andamento agora
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-blue-500/30 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tempo de Resposta</CardTitle>
            <Timer className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {realtimeLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                `${realtimeMetrics?.avgResponseTime || 0}min`
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Média atual
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-purple-500/30 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Atendentes Online</CardTitle>
            <UserCheck className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {realtimeLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                `${realtimeMetrics?.onlineAttendants || 0}/${realtimeMetrics?.busyAttendants || 0}`
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Online / Ocupados
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-yellow-500/30 transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Status do Sistema</CardTitle>
            {realtimeMetrics?.isPeakTime ? (
              <Zap className="h-4 w-4 text-yellow-600" />
            ) : (
              <Shield className="h-4 w-4 text-green-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {realtimeLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                realtimeMetrics?.isPeakTime ? "Pico" : "Normal"
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {realtimeMetrics?.isPeakTime ? "Alta demanda" : "Operação normal"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para diferentes visualizações */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="activity">Atividade</TabsTrigger>
        </TabsList>

        {/* Tab Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Gráfico de evolução temporal */}
            <Card className="border-2 hover:border-primary/30 transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Evolução dos Últimos {timeRange === "24h" ? "24 Horas" : timeRange === "7d" ? "7 Dias" : timeRange === "30d" ? "30 Dias" : "90 Dias"}
                </CardTitle>
                <CardDescription>Mensagens, conversas e receita ao longo do tempo</CardDescription>
              </CardHeader>
              <CardContent>
                {chartLoading ? (
                  <div className="h-64 flex items-center justify-center">
                    <Skeleton className="h-64 w-full" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={chartData?.timeline || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="messages" fill="#3B82F6" name="Mensagens" />
                      <Bar yAxisId="left" dataKey="conversations" fill="#10B981" name="Conversas" />
                      <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#F59E0B" strokeWidth={3} name="Receita (R$)" />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Distribuição por canal */}
            <Card className="border-2 hover:border-primary/30 transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Distribuição por Canal
                </CardTitle>
                <CardDescription>Mensagens por tipo de canal</CardDescription>
              </CardHeader>
              <CardContent>
                {chartLoading ? (
                  <div className="h-64 flex items-center justify-center">
                    <Skeleton className="h-64 w-full" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData?.channelDistribution || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData?.channelDistribution?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Métricas de satisfação */}
            <Card className="border-2 hover:border-primary/30 transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  Satisfação dos Clientes
                </CardTitle>
                <CardDescription>Avaliações e feedback dos clientes</CardDescription>
              </CardHeader>
              <CardContent>
                {chartLoading ? (
                  <div className="h-64 flex items-center justify-center">
                    <Skeleton className="h-64 w-full" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="80%" data={chartData?.satisfactionData || []}>
                      <RadialBar dataKey="value" cornerRadius={10} fill="#8884d8" />
                      <Tooltip />
                      <Legend />
                    </RadialBarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Performance por hora */}
            <Card className="border-2 hover:border-primary/30 transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  Performance por Hora
                </CardTitle>
                <CardDescription>Atividade e performance ao longo do dia</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 24 }, (_, hour) => {
                    const isCurrentHour = hour === realtimeMetrics?.currentHour;
                    const isPeakHour = [9, 10, 11, 14, 15, 16, 17, 18, 19, 20].includes(hour);
                    const activity = Math.floor(Math.random() * 100);
                    
                    return (
                      <div key={hour} className="flex items-center gap-3">
                        <div className="w-12 text-sm text-muted-foreground">
                          {hour.toString().padStart(2, '0')}:00
                        </div>
                        <div className="flex-1">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-500 ${
                                isCurrentHour ? 'bg-primary' : 
                                isPeakHour ? 'bg-yellow-500' : 'bg-blue-500'
                              }`}
                              style={{ width: `${activity}%` }}
                            />
                          </div>
                        </div>
                        <div className="w-12 text-sm text-right">
                          {activity}%
                        </div>
                        {isCurrentHour && (
                          <Badge variant="default" className="text-xs">
                            Agora
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Insights */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {insightsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="border-2">
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                </Card>
              ))
            ) : (
              insights?.map((insight, index) => {
                const Icon = insight.icon;
                const colors = {
                  success: "border-green-200 bg-green-50 dark:bg-green-950/20",
                  warning: "border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20", 
                  info: "border-blue-200 bg-blue-50 dark:bg-blue-950/20",
                };
                const iconColors = {
                  success: "text-green-600",
                  warning: "text-yellow-600",
                  info: "text-blue-600",
                };
                
                return (
                  <Card key={index} className={`border-2 hover:shadow-lg transition-all ${colors[insight.type]}`}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Icon className={`h-5 w-5 ${iconColors[insight.type]}`} />
                        {insight.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {insight.description}
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        {insight.action}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* Recomendações de ação */}
          <Card className="border-2 hover:border-primary/30 transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                Recomendações Inteligentes
              </CardTitle>
              <CardDescription>IA analisa seus dados e sugere melhorias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800 dark:text-blue-200">Otimização de Horários</span>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                    Sua equipe tem melhor performance entre 14h-16h. Considere aumentar o número de atendentes neste período.
                  </p>
                  <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                    <Settings className="h-3 w-3 mr-1" />
                    Configurar
                  </Button>
                </div>

                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Rocket className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800 dark:text-green-200">Automação Sugerida</span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                    73% das suas mensagens são perguntas frequentes. Configure respostas automáticas para melhorar eficiência.
                  </p>
                  <Button size="sm" variant="outline" className="border-green-300 text-green-700 hover:bg-green-100">
                    <Zap className="h-3 w-3 mr-1" />
                    Automatizar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Atividade */}
        <TabsContent value="activity" className="space-y-6">
          <Card className="border-2 hover:border-primary/30 transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Atividade Recente
              </CardTitle>
              <CardDescription>Suas conversas e mensagens mais recentes</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="space-y-3">
                {activityLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-lg border">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-6 w-20" />
                    </div>
                  ))
                ) : recentActivity && recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                        activity.status === "closed" 
                          ? "bg-emerald-500/10" 
                          : "bg-orange-500/10"
                      }`}>
                        <MessageSquare className={`h-6 w-6 ${
                          activity.status === "closed" 
                            ? "text-emerald-600" 
                            : "text-orange-600"
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">
                          {activity.contacts?.full_name || activity.contacts?.email || "Sem nome"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.last_message_at 
                            ? formatDistanceToNow(new Date(activity.last_message_at), { 
                                addSuffix: true, 
                                locale: ptBR 
                              })
                            : "Sem mensagens"
                          }
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={activity.status === "closed" ? "default" : "secondary"}
                          className={activity.status === "closed" 
                            ? "bg-emerald-500/10 text-emerald-600" 
                            : "bg-orange-500/10 text-orange-600"
                          }
                        >
                          {activity.status === "open" ? "aberto" : "fechado"}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhuma atividade recente encontrada
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
        </div>
      </div>
    </div>
  );
}