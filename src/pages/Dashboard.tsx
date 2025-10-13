import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MessageSquare, TrendingUp, Activity } from "lucide-react";

const Dashboard = () => {
  const stats = [
    { title: "Total Contatos", value: "0", icon: Users, change: "+0%" },
    { title: "Conversas Abertas", value: "0", icon: MessageSquare, change: "+0%" },
    { title: "Taxa de Resposta", value: "0%", icon: TrendingUp, change: "+0%" },
    { title: "Campanhas Ativas", value: "0", icon: Activity, change: "+0%" },
  ];

  return (
    <div className="flex-1 space-y-6 p-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Visão geral da sua plataforma Omnichat</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.change} em relação ao mês anterior
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Conversas Recentes</CardTitle>
            <CardDescription>Últimas interações com contatos</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Nenhuma conversa ainda</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Campanhas em Andamento</CardTitle>
            <CardDescription>Status das campanhas ativas</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Nenhuma campanha ativa</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;