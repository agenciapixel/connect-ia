import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

export default function Campaigns() {
  const campaigns = [
    { id: 1, name: "Campanha de Lançamento", channel: "WhatsApp", status: "active", sent: 1234, delivered: 1200 },
    { id: 2, name: "Promoção Sazonal", channel: "Instagram", status: "scheduled", sent: 0, delivered: 0 },
    { id: 3, name: "Follow-up Clientes", channel: "WhatsApp", status: "paused", sent: 567, delivered: 550 },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      active: { label: "Ativa", className: "bg-success/10 text-success" },
      scheduled: { label: "Agendada", className: "bg-info/10 text-info" },
      paused: { label: "Pausada", className: "bg-warning/10 text-warning" },
      finished: { label: "Finalizada", className: "bg-muted text-muted-foreground" },
    };
    const variant = variants[status] || variants.finished;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campanhas</h1>
          <p className="text-muted-foreground mt-2">Crie e gerencie suas campanhas de marketing</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Campanha
        </Button>
      </div>

      <div className="grid gap-4">
        {campaigns.map((campaign) => (
          <Card key={campaign.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{campaign.name}</CardTitle>
                  <CardDescription className="mt-1.5">
                    Canal: {campaign.channel}
                  </CardDescription>
                </div>
                {getStatusBadge(campaign.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Enviadas</p>
                  <p className="text-2xl font-bold">{campaign.sent}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Entregues</p>
                  <p className="text-2xl font-bold">{campaign.delivered}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Taxa de Entrega</p>
                  <p className="text-2xl font-bold">
                    {campaign.sent > 0 ? Math.round((campaign.delivered / campaign.sent) * 100) : 0}%
                  </p>
                </div>
                <div className="flex items-end justify-end">
                  <Button variant="outline" size="sm">Ver Detalhes</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}