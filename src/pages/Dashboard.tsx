import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Users, Send, TrendingUp, TrendingDown, ArrowUp, ArrowDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const stats = [
    { title: "Total de Mensagens", value: "12,345", icon: MessageSquare, change: 12, trend: "up" },
    { title: "Contatos Ativos", value: "1,234", icon: Users, change: 8, trend: "up" },
    { title: "Campanhas Ativas", value: "23", icon: Send, change: -3, trend: "down" },
    { title: "Taxa de Resposta", value: "67%", icon: TrendingUp, change: 5, trend: "up" },
  ];

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-background via-background to-primary/5 min-h-screen">
      <div>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">Visão geral da sua plataforma Omnichat IA</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
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
        })}
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
              {[
                { id: 1, name: "João Silva", time: 2, status: "respondido" },
                { id: 2, name: "Maria Santos", time: 5, status: "pendente" },
                { id: 3, name: "Carlos Oliveira", time: 8, status: "respondido" },
                { id: 4, name: "Ana Costa", time: 12, status: "pendente" },
              ].map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                    activity.status === "respondido" 
                      ? "bg-emerald-500/10" 
                      : "bg-orange-500/10"
                  }`}>
                    <MessageSquare className={`h-6 w-6 ${
                      activity.status === "respondido" 
                        ? "text-emerald-600" 
                        : "text-orange-600"
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{activity.name}</p>
                    <p className="text-xs text-muted-foreground">Há {activity.time} minutos</p>
                  </div>
                  <Badge 
                    variant={activity.status === "respondido" ? "default" : "secondary"}
                    className={activity.status === "respondido" 
                      ? "bg-emerald-500/10 text-emerald-600" 
                      : "bg-orange-500/10 text-orange-600"
                    }
                  >
                    {activity.status}
                  </Badge>
                </div>
              ))}
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
              {[
                { name: "WhatsApp", messages: 1234, status: "ativo", growth: 15 },
                { name: "Instagram", messages: 856, status: "ativo", growth: -5 },
                { name: "LinkedIn", messages: 423, status: "ativo", growth: 8 },
                { name: "Telegram", messages: 189, status: "inativo", growth: 0 },
              ].map((channel) => (
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
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
