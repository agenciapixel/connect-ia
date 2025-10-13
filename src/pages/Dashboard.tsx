import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Users, Send, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const stats = [
    { title: "Total de Mensagens", value: "12,345", icon: MessageSquare, change: "+12%" },
    { title: "Contatos Ativos", value: "1,234", icon: Users, change: "+8%" },
    { title: "Campanhas Ativas", value: "23", icon: Send, change: "+3%" },
    { title: "Taxa de Resposta", value: "67%", icon: TrendingUp, change: "+5%" },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Visão geral da sua plataforma Omnichat IA</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-success mt-1">
                {stat.change} desde o último mês
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>Suas conversas e mensagens mais recentes</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-lg border">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Nova mensagem de cliente #{i}</p>
                    <p className="text-xs text-muted-foreground">Há {i} minutos</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Canais Ativos</CardTitle>
            <CardDescription>Status dos seus canais de comunicação</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {["WhatsApp", "Instagram", "LinkedIn", "Telegram"].map((channel) => (
                <div key={channel} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{channel}</span>
                  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-success/10 text-success">
                    Ativo
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}