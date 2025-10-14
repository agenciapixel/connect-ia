import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Users, Send, TrendingUp, ArrowUp, ArrowDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Dashboard() {
  // Buscar estatísticas
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [messagesResult, contactsResult, campaignsResult, conversationsResult] = await Promise.all([
        supabase.from("messages").select("id", { count: "exact", head: true }),
        supabase.from("contacts").select("id", { count: "exact", head: true }),
        supabase.from("campaigns").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("conversations").select("id, status", { count: "exact" }),
      ]);

      const totalMessages = messagesResult.count || 0;
      const totalContacts = contactsResult.count || 0;
      const activeCampaigns = campaignsResult.count || 0;
      const conversations = conversationsResult.data || [];
      const openConversations = conversations.filter(c => c.status === "open").length;
      const responseRate = conversations.length > 0 
        ? Math.round((openConversations / conversations.length) * 100) 
        : 0;

      return [
        { title: "Total de Mensagens", value: totalMessages.toLocaleString(), icon: MessageSquare, change: 12, trend: "up" },
        { title: "Contatos Ativos", value: totalContacts.toLocaleString(), icon: Users, change: 8, trend: "up" },
        { title: "Campanhas Ativas", value: activeCampaigns.toString(), icon: Send, change: -3, trend: "down" },
        { title: "Taxa de Resposta", value: `${responseRate}%`, icon: TrendingUp, change: 5, trend: "up" },
      ];
    },
  });

  // Buscar atividade recente
  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ["dashboard-activity"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select(`
          id,
          status,
          last_message_at,
          contact_id,
          contacts (
            full_name,
            email
          )
        `)
        .order("last_message_at", { ascending: false })
        .limit(4);

      if (error) throw error;
      return data;
    },
  });

  // Buscar canais ativos
  const { data: channels, isLoading: channelsLoading } = useQuery({
    queryKey: ["dashboard-channels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("channel_accounts")
        .select("id, name, channel_type, status")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Contar mensagens por canal
      const channelsWithStats = await Promise.all(
        (data || []).map(async (channel) => {
          const { count } = await supabase
            .from("messages")
            .select("id", { count: "exact", head: true })
            .eq("org_id", channel.id);

          return {
            name: channel.name,
            messages: count || 0,
            status: channel.status,
            growth: Math.floor(Math.random() * 20) - 5, // Simulado por enquanto
          };
        })
      );

      return channelsWithStats;
    },
  });

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-background via-background to-primary/5 min-h-screen">
      <div>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">Visão geral da sua plataforma Omnichat IA</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
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
          stats?.map((stat) => {
          const isPositive = stat.change > 0;
          const TrendIcon = isPositive ? ArrowUp : ArrowDown;
          
          return (
            <Card key={stat.title} className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full -mr-16 -mt-16" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge 
                    variant={isPositive ? "default" : "destructive"}
                    className={`flex items-center gap-1 ${
                      isPositive 
                        ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20" 
                        : "bg-red-500/10 text-red-600 hover:bg-red-500/20"
                    }`}
                  >
                    <TrendIcon className="h-3 w-3" />
                    {Math.abs(stat.change)}%
                  </Badge>
                  <span className="text-xs text-muted-foreground">vs. mês anterior</span>
                </div>
              </CardContent>
            </Card>
          );
        })
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-2 hover:border-primary/30 transition-all">
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
                Array.from({ length: 4 }).map((_, i) => (
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
                  <Badge 
                    variant={activity.status === "closed" ? "default" : "secondary"}
                    className={activity.status === "closed" 
                      ? "bg-emerald-500/10 text-emerald-600" 
                      : "bg-orange-500/10 text-orange-600"
                    }
                  >
                    {activity.status === "open" ? "aberto" : "fechado"}
                  </Badge>
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

        <Card className="col-span-3 border-2 hover:border-primary/30 transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Canais Ativos
            </CardTitle>
            <CardDescription>Status dos seus canais de comunicação</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {channelsLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex-1">
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))
              ) : channels && channels.length > 0 ? (
                channels.map((channel) => (
                <div key={channel.name} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold">{channel.name}</span>
                      <Badge 
                        variant={channel.status === "ativo" ? "default" : "secondary"}
                        className={channel.status === "ativo" 
                          ? "bg-emerald-500/10 text-emerald-600" 
                          : "bg-gray-500/10 text-gray-600"
                        }
                      >
                        {channel.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{channel.messages} mensagens</span>
                      {channel.growth !== 0 && (
                        <Badge 
                          variant="outline"
                          className={`text-xs ${
                            channel.growth > 0 
                              ? "border-emerald-500/50 text-emerald-600" 
                              : "border-red-500/50 text-red-600"
                          }`}
                        >
                          {channel.growth > 0 ? "+" : ""}{channel.growth}%
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhum canal configurado
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
