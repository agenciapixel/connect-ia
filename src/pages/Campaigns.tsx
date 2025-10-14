import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Send, TrendingUp, MessageSquare, ArrowUp, ArrowDown, Loader2, Edit, Trash2, Play, Pause } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Campaigns() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    channel_type: "whatsapp" as "whatsapp" | "instagram" | "messenger" | "telegram",
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Buscar campanhas
  const { data: campaigns = [], isLoading, refetch } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Estatísticas
  const { data: stats } = useQuery({
    queryKey: ["campaigns-stats"],
    queryFn: async () => {
      const { count: totalCampaigns } = await supabase
        .from("campaigns")
        .select("*", { count: "exact", head: true });

      const { count: totalMessages } = await supabase
        .from("campaign_messages")
        .select("*", { count: "exact", head: true });

      const { data: messagesData } = await supabase
        .from("campaign_messages")
        .select("status");

      const deliveredCount = messagesData?.filter(m => m.status === "delivered").length || 0;
      const totalCount = messagesData?.length || 1;
      const openRate = Math.round((deliveredCount / totalCount) * 100);

      return {
        totalCampaigns: totalCampaigns || 0,
        totalMessages: totalMessages || 0,
        openRate,
      };
    },
  });

  const handleCreateCampaign = async () => {
    if (!formData.name) {
      toast.error("Nome da campanha é obrigatório");
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Usuário não autenticado");
        return;
      }

      const { data: member } = await supabase
        .from("members")
        .select("org_id")
        .eq("user_id", user.id)
        .single();

      if (!member) {
        toast.error("Organização não encontrada");
        return;
      }

      if (editingCampaign) {
        const { error } = await supabase
          .from("campaigns")
          .update({
            name: formData.name,
            channel_type: formData.channel_type,
          })
          .eq("id", editingCampaign.id);

        if (error) throw error;
        toast.success("Campanha atualizada!");
      } else {
        const { error } = await supabase.from("campaigns").insert({
          org_id: member.org_id,
          name: formData.name,
          channel_type: formData.channel_type,
          status: "draft",
        });

        if (error) throw error;
        toast.success("Campanha criada!");
      }

      setShowCreateDialog(false);
      setFormData({ name: "", channel_type: "whatsapp" });
      setEditingCampaign(null);
      refetch();
    } catch (error: any) {
      console.error("Error:", error);
      toast.error("Erro ao salvar campanha");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar esta campanha?")) return;

    setDeleting(id);
    try {
      const { error } = await supabase.from("campaigns").delete().eq("id", id);

      if (error) throw error;
      toast.success("Campanha deletada!");
      refetch();
    } catch (error: any) {
      console.error("Error:", error);
      toast.error("Erro ao deletar campanha");
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleStatus = async (campaign: any) => {
    try {
      const newStatus = campaign.status === "active" ? "paused" : "active";
      const { error } = await supabase
        .from("campaigns")
        .update({ status: newStatus })
        .eq("id", campaign.id);

      if (error) throw error;
      toast.success(`Campanha ${newStatus === "active" ? "ativada" : "pausada"}!`);
      refetch();
    } catch (error: any) {
      console.error("Error:", error);
      toast.error("Erro ao atualizar status");
    }
  };

  const openEditDialog = (campaign: any) => {
    setEditingCampaign(campaign);
    setFormData({
      name: campaign.name,
      channel_type: campaign.channel_type,
    });
    setShowCreateDialog(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      active: { label: "Ativa", className: "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20" },
      scheduled: { label: "Agendada", className: "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20" },
      paused: { label: "Pausada", className: "bg-orange-500/10 text-orange-600 hover:bg-orange-500/20" },
      draft: { label: "Rascunho", className: "bg-gray-500/10 text-gray-600 hover:bg-gray-500/20" },
    };
    const variant = variants[status] || variants.draft;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const statsData = [
    { label: "Total de Campanhas", value: stats?.totalCampaigns.toString() || "0", icon: Send, change: 3 },
    { label: "Mensagens Enviadas", value: stats?.totalMessages.toString() || "0", icon: MessageSquare, change: 12 },
    { label: "Taxa de Abertura", value: `${stats?.openRate || 0}%`, icon: TrendingUp, change: 5 },
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
        <Button 
          onClick={() => setShowCreateDialog(true)}
          className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity shadow-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Campanha
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {statsData.map((stat, index) => {
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
        {isLoading ? (
          <Card className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          </Card>
        ) : campaigns.length === 0 ? (
          <Card className="p-12 text-center">
            <Send className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhuma campanha criada</h3>
            <p className="text-muted-foreground mb-4">Crie sua primeira campanha de marketing</p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Campanha
            </Button>
          </Card>
        ) : (
          campaigns.map((campaign) => (
            <Card key={campaign.id} className="border-2 hover:border-primary/30 transition-all shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">{campaign.name}</CardTitle>
                      {getStatusBadge(campaign.status)}
                    </div>
                    <CardDescription className="flex items-center gap-2 capitalize">
                      Canal: {campaign.channel_type}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(campaign)}
                    >
                      {campaign.status === "active" ? (
                        <><Pause className="h-3 w-3 mr-1" />Pausar</>
                      ) : (
                        <><Play className="h-3 w-3 mr-1" />Ativar</>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(campaign)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteCampaign(campaign.id)}
                      disabled={deleting === campaign.id}
                    >
                      {deleting === campaign.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>

      {/* Dialog Criar/Editar Campanha */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCampaign ? "Editar Campanha" : "Nova Campanha"}</DialogTitle>
            <DialogDescription>Preencha os dados da campanha</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Campanha</Label>
              <Input
                id="name"
                placeholder="Campanha de Lançamento"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="channel">Canal</Label>
              <Select 
                value={formData.channel_type} 
                onValueChange={(value: any) => setFormData({ ...formData, channel_type: value })}
              >
                <SelectTrigger id="channel">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="messenger">Messenger</SelectItem>
                  <SelectItem value="telegram">Telegram</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCreateDialog(false);
              setEditingCampaign(null);
              setFormData({ name: "", channel_type: "whatsapp" });
            }}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreateCampaign}
              disabled={saving}
              className="bg-gradient-to-r from-primary to-primary-glow"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              {editingCampaign ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}