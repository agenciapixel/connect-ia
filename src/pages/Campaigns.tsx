import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Send, TrendingUp, Users, MessageSquare, ArrowUp, ArrowDown } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function Campaigns() {
  const campaigns = [
    { id: 1, name: "Campanha de Lançamento", channel: "WhatsApp", status: "active", sent: 1234, delivered: 1200, opened: 980, change: 15 },
    { id: 2, name: "Promoção Sazonal", channel: "Instagram", status: "scheduled", sent: 0, delivered: 0, opened: 0, change: 0 },
    { id: 3, name: "Follow-up Clientes", channel: "WhatsApp", status: "paused", sent: 567, delivered: 550, opened: 420, change: -3 },
    { id: 4, name: "Nutrição de Leads", channel: "LinkedIn", status: "active", sent: 892, delivered: 875, opened: 650, change: 8 },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      active: { label: "Ativa", className: "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20" },
      scheduled: { label: "Agendada", className: "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20" },
      paused: { label: "Pausada", className: "bg-orange-500/10 text-orange-600 hover:bg-orange-500/20" },
      finished: { label: "Finalizada", className: "bg-gray-500/10 text-gray-600 hover:bg-gray-500/20" },
    };
    const variant = variants[status] || variants.finished;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const stats = [
    { label: "Total de Campanhas", value: "23", icon: Send, change: 3 },
    { label: "Mensagens Enviadas", value: "12.5k", icon: MessageSquare, change: 12 },
    { label: "Taxa de Abertura", value: "67%", icon: TrendingUp, change: 5 },
  ];

  return (
    <div className="p-8 space-y-6 bg-gradient-to-br from-background via-background to-primary/5 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Campanhas
          </h1>
          <p className="text-muted-foreground mt-2">Crie e gerencie suas campanhas de marketing</p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity shadow-lg">
          <Plus className="h-4 w-4 mr-2" />
          Nova Campanha
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = stat.change > 0;
          const TrendIcon = isPositive ? ArrowUp : ArrowDown;
          
          return (
            <Card key={index} className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
                <Badge 
                  variant={isPositive ? "default" : "destructive"}
                  className={`mt-2 ${
                    isPositive 
                      ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20" 
                      : "bg-red-500/10 text-red-600 hover:bg-red-500/20"
                  }`}
                >
                  <TrendIcon className="h-3 w-3 mr-1" />
                  {isPositive ? "+" : ""}{stat.change}%
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4">
        {campaigns.map((campaign) => {
          const deliveryRate = campaign.sent > 0 ? (campaign.delivered / campaign.sent) * 100 : 0;
          const openRate = campaign.sent > 0 ? (campaign.opened / campaign.sent) * 100 : 0;
          
          return (
            <Card key={campaign.id} className="border-2 hover:border-primary/30 transition-all shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">{campaign.name}</CardTitle>
                      {getStatusBadge(campaign.status)}
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Canal: {campaign.channel}
                    </CardDescription>
                  </div>
                  {campaign.change !== 0 && (
                    <Badge 
                      variant="outline"
                      className={`${
                        campaign.change > 0 
                          ? "border-emerald-500/50 text-emerald-600" 
                          : "border-red-500/50 text-red-600"
                      }`}
                    >
                      {campaign.change > 0 ? "+" : ""}{campaign.change}% performance
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Enviadas</p>
                    <p className="text-2xl font-bold">{campaign.sent.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Entregues</p>
                    <p className="text-2xl font-bold">{campaign.delivered.toLocaleString()}</p>
                    <div className="mt-2">
                      <Progress value={deliveryRate} className="h-1" />
                      <p className="text-xs text-muted-foreground mt-1">{deliveryRate.toFixed(0)}%</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Abertas</p>
                    <p className="text-2xl font-bold">{campaign.opened.toLocaleString()}</p>
                    <div className="mt-2">
                      <Progress value={openRate} className="h-1" />
                      <p className="text-xs text-muted-foreground mt-1">{openRate.toFixed(0)}%</p>
                    </div>
                  </div>
                  <div className="flex items-end justify-end">
                    <Button variant="outline" size="sm">
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
