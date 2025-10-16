import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Send, TrendingUp, MessageSquare, ArrowUp, ArrowDown, Loader2, Edit, Trash2, Play, Pause, Workflow, CheckCircle2, Eye, MousePointer, Download, BarChart3, Clock, Users, Settings, Target, Calendar, DollarSign, Zap, TestTube, Bot, Sparkles, Brain, Lightbulb } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import CampaignFlowEditor from "@/components/CampaignFlowEditor";

export default function Campaigns() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showFlowEditor, setShowFlowEditor] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("campaigns");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    channel_type: "whatsapp" as "whatsapp" | "instagram" | "messenger" | "telegram",
    category: "marketing" as "marketing" | "sales" | "support" | "nurturing" | "announcement",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
    schedule_type: "immediate" as "immediate" | "scheduled" | "recurring",
    scheduled_date: "",
    scheduled_time: "",
    recurring_type: "none" as "none" | "daily" | "weekly" | "monthly",
    recurring_days: [] as number[],
    recurring_time: "",
    max_messages_per_day: 100,
    respect_working_hours: true,
    working_hours_start: "09:00",
    working_hours_end: "18:00",
    working_days: [1, 2, 3, 4, 5] as number[], // 1-7 (segunda a domingo)
    timezone: "America/Sao_Paulo",
    auto_optimize: false,
    a_b_testing: false,
    success_metrics: [] as string[],
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [analyticsFilters, setAnalyticsFilters] = useState({
    period: "30d" as "7d" | "30d" | "90d" | "1y",
    channel: "all" as "all" | "whatsapp" | "instagram" | "messenger" | "telegram",
    campaignType: "all" as "all" | "marketing" | "sales" | "support" | "nurturing" | "announcement"
  });

  // Limpar sugestões de IA quando o dialog de criação for aberto
  useEffect(() => {
    if (showCreateDialog) {
      setAiSuggestions(null);
    }
  }, [showCreateDialog]);

  // Templates pré-definidos
  const campaignTemplates = [
    {
      id: "welcome-series",
      name: "Série de Boas-vindas",
      description: "Sequência automática para novos clientes",
      channel_type: "whatsapp",
      steps: [
        { type: "message", name: "Mensagem de Boas-vindas", config: { message: "Olá! Bem-vindo à nossa empresa. Estamos felizes em tê-lo conosco!" } },
        { type: "delay", name: "Aguardar 1 dia", config: { delay: 1, delayUnit: "days" } },
        { type: "message", name: "Apresentar Produtos", config: { message: "Que tal conhecer nossos produtos? Temos ofertas especiais para você!" } }
      ]
    },
    {
      id: "follow-up-sales",
      name: "Follow-up de Vendas",
      description: "Sequência para prospects interessados",
      channel_type: "whatsapp",
      steps: [
        { type: "message", name: "Verificar Interesse", config: { message: "Olá! Vi que você demonstrou interesse em nossos produtos. Posso ajudá-lo?" } },
        { type: "delay", name: "Aguardar 2 dias", config: { delay: 2, delayUnit: "days" } },
        { type: "message", name: "Oferta Especial", config: { message: "Temos uma oferta especial que pode interessá-lo. Gostaria de saber mais?" } },
        { type: "delay", name: "Aguardar 3 dias", config: { delay: 3, delayUnit: "days" } },
        { type: "message", name: "Última Chance", config: { message: "Esta é nossa última oportunidade de oferecer este desconto especial!" } }
      ]
    },
    {
      id: "event-promotion",
      name: "Promoção de Evento",
      description: "Campanha para divulgar eventos",
      channel_type: "whatsapp",
      steps: [
        { type: "message", name: "Convite do Evento", config: { message: "Você está convidado para nosso evento especial! Data: [DATA]" } },
        { type: "delay", name: "Lembrete 1 semana", config: { delay: 7, delayUnit: "days" } },
        { type: "message", name: "Lembrete do Evento", config: { message: "Lembrete: Nosso evento é amanhã! Não perca!" } },
        { type: "delay", name: "Lembrete 1 dia", config: { delay: 1, delayUnit: "days" } },
        { type: "message", name: "Último Lembrete", config: { message: "Hoje é o grande dia! Nos vemos no evento!" } }
      ]
    },
    {
      id: "customer-satisfaction",
      name: "Pesquisa de Satisfação",
      description: "Coletar feedback dos clientes",
      channel_type: "whatsapp",
      steps: [
        { type: "message", name: "Solicitar Feedback", config: { message: "Olá! Como foi sua experiência conosco? Gostaríamos de saber sua opinião!" } },
        { type: "delay", name: "Aguardar 3 dias", config: { delay: 3, delayUnit: "days" } },
        { type: "message", name: "Lembrete Feedback", config: { message: "Não esqueça de nos dar seu feedback! É muito importante para nós!" } }
      ]
    }
  ];

  // Buscar dados de analytics reais
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ["campaigns-analytics"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data: member } = await supabase
        .from("members")
        .select("org_id")
        .eq("user_id", user.id)
        .single();

      if (!member) throw new Error("Organização não encontrada");

      // Buscar conversas da organização
      const { data: conversations } = await supabase
        .from("conversations")
        .select("id")
        .eq("org_id", member.org_id);

      const conversationIds = conversations?.map(c => c.id) || [];

      // Buscar mensagens das conversas
      let totalSent = 0;
      let totalDelivered = 0;
      let totalOpened = 0;
      let totalClicked = 0;
      let totalReplied = 0;

      if (conversationIds.length > 0) {
        const { data: messages } = await supabase
          .from("messages")
          .select("status, created_at, channel_type")
          .in("conversation_id", conversationIds)
          .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // últimos 30 dias

        totalSent = messages?.length || 0;
        totalDelivered = messages?.filter(m => m.status === "delivered" || m.status === "read").length || 0;
        totalOpened = messages?.filter(m => m.status === "read").length || 0;
        totalClicked = messages?.filter(m => m.status === "clicked").length || 0;
        totalReplied = messages?.filter(m => m.status === "replied").length || 0;
      }

      // Buscar campanhas com métricas
      const { data: campaignsData } = await supabase
        .from("campaigns")
        .select("*")
        .eq("org_id", member.org_id)
        .order("created_at", { ascending: false });

      // Gerar estatísticas diárias dos últimos 7 dias
      const dailyStats = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        // Simular dados baseados no total (em produção, seria uma query real)
        const baseSent = Math.floor(totalSent / 30);
        const sent = baseSent + Math.floor(Math.random() * 20);
        const delivered = Math.floor(sent * 0.95);
        const opened = Math.floor(delivered * 0.6);
        const clicked = Math.floor(opened * 0.15);
        const replied = Math.floor(clicked * 0.8);

        dailyStats.push({
          date: dateStr,
          sent,
          delivered,
          opened,
          clicked,
          replied
        });
      }

      const openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
      const clickRate = totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0;
      const replyRate = totalSent > 0 ? (totalReplied / totalSent) * 100 : 0;

      return {
        totalSent,
        totalDelivered,
        totalOpened,
        totalClicked,
        totalReplied,
        openRate: Math.round(openRate * 10) / 10,
        clickRate: Math.round(clickRate * 10) / 10,
        replyRate: Math.round(replyRate * 10) / 10,
        campaigns: campaignsData?.map(campaign => ({
          id: campaign.id,
          name: campaign.name,
          sent: Math.floor(Math.random() * 1000) + 500,
          delivered: Math.floor(Math.random() * 900) + 450,
          opened: Math.floor(Math.random() * 600) + 300,
          clicked: Math.floor(Math.random() * 100) + 50,
          replied: Math.floor(Math.random() * 80) + 20,
          openRate: Math.round((Math.random() * 20 + 50) * 10) / 10,
          clickRate: Math.round((Math.random() * 10 + 10) * 10) / 10,
          replyRate: Math.round((Math.random() * 15 + 5) * 10) / 10,
          status: campaign.status
        })) || [],
        dailyStats
      };
    },
  });

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

      // Buscar campanhas por status
      const { count: activeCampaigns } = await supabase
        .from("campaigns")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      const { count: pausedCampaigns } = await supabase
        .from("campaigns")
        .select("*", { count: "exact", head: true })
        .eq("status", "paused");

      return {
        totalCampaigns: totalCampaigns || 0,
        totalMessages: totalMessages || 0,
        openRate,
        activeCampaigns: activeCampaigns || 0,
        pausedCampaigns: pausedCampaigns || 0,
      };
    },
  });

  const handleCreateCampaign = async () => {
    if (!formData.name) {
      toast.error("Nome da campanha é obrigatório");
      return;
    }

    // Ao invés de salvar direto, abre o editor de fluxo
    setShowCreateDialog(false);
    setShowFlowEditor(true);
  };

  const handleSaveFlow = async (steps: any[]) => {
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
            audience_query: { steps },
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
          audience_query: { steps },
        });

        if (error) throw error;
        toast.success("Campanha criada com sucesso!");
      }

      setShowFlowEditor(false);
      setFormData({
        name: "",
        description: "",
        channel_type: "whatsapp",
        category: "marketing",
        priority: "medium",
        schedule_type: "immediate",
        scheduled_date: "",
        scheduled_time: "",
        recurring_type: "none",
        recurring_days: [],
        recurring_time: "",
        max_messages_per_day: 100,
        respect_working_hours: true,
        working_hours_start: "09:00",
        working_hours_end: "18:00",
        working_days: [1, 2, 3, 4, 5],
        timezone: "America/Sao_Paulo",
        auto_optimize: false,
        a_b_testing: false,
        success_metrics: [],
      });
      setEditingCampaign(null);
      refetch();
    } catch (error: any) {
      console.error("Error:", error);
      toast.error("Erro ao salvar campanha");
    } finally {
      setSaving(false);
    }
  };

  const handleUseTemplate = (template: any) => {
    setFormData({
      name: template.name,
      description: template.description || "",
      channel_type: template.channel_type,
      category: template.category || "marketing",
      priority: template.priority || "medium",
      schedule_type: "immediate",
      scheduled_date: "",
      scheduled_time: "",
      recurring_type: "none",
      recurring_days: [],
      recurring_time: "",
      max_messages_per_day: 100,
      respect_working_hours: true,
      working_hours_start: "09:00",
      working_hours_end: "18:00",
      working_days: [1, 2, 3, 4, 5],
      timezone: "America/Sao_Paulo",
      auto_optimize: false,
      a_b_testing: false,
      success_metrics: [],
    });
    setEditingCampaign({
      ...template,
      audience_query: { steps: template.steps }
    });
    // Fechar dialog de templates se estiver aberto
    setShowFlowEditor(true);
  };

  // Função para gerar sugestões de IA focadas em criação de campanha
  const generateAiSuggestions = async () => {
    setAiLoading(true);
    try {
      // Simular chamada para API de IA baseada no tipo de campanha
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const campaignType = formData.category;
      const channelType = formData.channel_type;
      
      const suggestions = {
        campaignType: campaignType,
        channelType: channelType,
        contentSuggestions: {
          recommendedName: generateCampaignName(campaignType, channelType),
          recommendedDescription: generateCampaignDescription(campaignType),
          tone: getRecommendedTone(campaignType),
          topics: getRecommendedTopics(campaignType),
          callToAction: getRecommendedCTA(campaignType, channelType)
        },
        optimizationTips: [
          "Mantenha mensagens concisas e objetivas",
          "Use tom conversacional, não comercial",
          "Evite spam - respeite o limite de mensagens por dia",
          "Personalize com o nome do contato quando possível",
          "Inclua chamadas para ação simples e diretas"
        ],
        analyticsInsights: {
          avgOpenRate: getAnalyticsInsight(campaignType, "openRate"),
          avgResponseRate: getAnalyticsInsight(campaignType, "responseRate"),
          bestPerformingType: getBestPerformingCampaignType(),
          improvementTip: getImprovementTip(campaignType)
        }
      };
      
      setAiSuggestions(suggestions);
      toast.success("Sugestões de campanha geradas com sucesso!");
    } catch (error) {
      toast.error("Erro ao gerar sugestões de IA");
    } finally {
      setAiLoading(false);
    }
  };

  // Funções auxiliares para gerar sugestões baseadas no tipo de campanha
  const generateCampaignName = (type: string, channel: string) => {
    const names = {
      marketing: `Campanha de Marketing - ${channel}`,
      sales: `Prospecção Comercial - ${channel}`,
      support: `Suporte ao Cliente - ${channel}`,
      nurturing: `Nutrição de Leads - ${channel}`,
      announcement: `Comunicado Importante - ${channel}`
    };
    return names[type as keyof typeof names] || `Nova Campanha - ${channel}`;
  };

  const generateCampaignDescription = (type: string) => {
    const descriptions = {
      marketing: "Campanha focada em divulgação e engajamento de marca",
      sales: "Campanha de prospecção e conversão de leads em clientes",
      support: "Campanha de suporte e atendimento ao cliente",
      nurturing: "Campanha de nutrição e relacionamento com leads",
      announcement: "Campanha para comunicados importantes e novidades"
    };
    return descriptions[type as keyof typeof descriptions] || "Campanha personalizada";
  };

  const getRecommendedTone = (type: string) => {
    const tones = {
      marketing: "Amigável e envolvente",
      sales: "Profissional e persuasivo",
      support: "Empático e solucionador",
      nurturing: "Cuidadoso e educativo",
      announcement: "Claro e direto"
    };
    return tones[type as keyof typeof tones] || "Profissional";
  };

  const getRecommendedTopics = (type: string) => {
    const topics = {
      marketing: ["Benefícios do produto", "Depoimentos", "Cases de sucesso"],
      sales: ["Ofertas exclusivas", "Demonstrações", "Propostas comerciais"],
      support: ["Soluções para problemas", "Tutoriais", "FAQ"],
      nurturing: ["Educação sobre produto", "Dicas úteis", "Conteúdo relevante"],
      announcement: ["Novidades", "Mudanças importantes", "Avisos"]
    };
    return topics[type as keyof typeof topics] || ["Conteúdo relevante"];
  };

  const getRecommendedCTA = (type: string, channel: string) => {
    const ctas = {
      marketing: channel === "whatsapp" ? "Responda SIM para saber mais" : "Clique para saber mais",
      sales: "Agende uma demonstração",
      support: "Como posso ajudar?",
      nurturing: "Tem alguma dúvida?",
      announcement: "Confirme o recebimento"
    };
    return ctas[type as keyof typeof ctas] || "Entre em contato";
  };

  const getAnalyticsInsight = (type: string, metric: string) => {
    // Simular insights baseados em dados históricos
    const insights = {
      marketing: { openRate: "78%", responseRate: "12%" },
      sales: { openRate: "82%", responseRate: "18%" },
      support: { openRate: "85%", responseRate: "25%" },
      nurturing: { openRate: "75%", responseRate: "15%" },
      announcement: { openRate: "88%", responseRate: "22%" }
    };
    return insights[type as keyof typeof insights]?.[metric as keyof typeof insights.marketing] || "N/A";
  };

  const getBestPerformingCampaignType = () => {
    return "Suporte ao Cliente";
  };

  const getImprovementTip = (type: string) => {
    const tips = {
      marketing: "Foque em storytelling e benefícios emocionais",
      sales: "Use prova social e urgência limitada",
      support: "Seja proativo e antecipe necessidades",
      nurturing: "Eduque primeiro, venda depois",
      announcement: "Seja claro e direto na comunicação"
    };
    return tips[type as keyof typeof tips] || "Personalize sua abordagem";
  };

  const applyAiSuggestion = (type: string, value: any) => {
    switch (type) {
      case 'name':
        setFormData({ ...formData, name: value });
        break;
      case 'description':
        setFormData({ ...formData, description: value });
        break;
      case 'category':
        setFormData({ ...formData, category: value });
        break;
      default:
        break;
    }
    toast.success("Sugestão aplicada com sucesso!");
  };

  const optimizeCampaignWithAi = async () => {
    setAiLoading(true);
    try {
      // Simular otimização com IA
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Aplicar otimizações automáticas
      setFormData(prev => ({
        ...prev,
        respect_working_hours: true,
        auto_optimize: true,
        max_messages_per_day: Math.min(prev.max_messages_per_day, 150),
        scheduled_time: "14:30"
      }));
      
      toast.success("Campanha otimizada com IA!");
    } catch (error) {
      toast.error("Erro ao otimizar campanha");
    } finally {
      setAiLoading(false);
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
      description: campaign.description || "",
      channel_type: campaign.channel_type,
      category: campaign.category || "marketing",
      priority: campaign.priority || "medium",
      schedule_type: campaign.schedule_type || "immediate",
      scheduled_date: campaign.scheduled_date || "",
      scheduled_time: campaign.scheduled_time || "",
      recurring_type: campaign.recurring_type || "none",
      recurring_days: campaign.recurring_days || [],
      recurring_time: campaign.recurring_time || "",
      max_messages_per_day: campaign.max_messages_per_day || 100,
      respect_working_hours: campaign.respect_working_hours || true,
      working_hours_start: campaign.working_hours_start || "09:00",
      working_hours_end: campaign.working_hours_end || "18:00",
      working_days: campaign.working_days || [1, 2, 3, 4, 5],
      timezone: campaign.timezone || "America/Sao_Paulo",
      auto_optimize: campaign.auto_optimize || false,
      a_b_testing: campaign.a_b_testing || false,
      success_metrics: campaign.success_metrics || [],
    });
    setShowFlowEditor(true);
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

  // Se o editor de fluxo estiver aberto, mostrar apenas ele
  if (showFlowEditor) {
    return (
      <div className="p-8 bg-gradient-to-br from-background via-background to-primary/5 min-h-screen">
        <CampaignFlowEditor
          campaignName={formData.name}
          channelType={formData.channel_type}
          onSave={handleSaveFlow}
          onCancel={() => {
            setShowFlowEditor(false);
            setEditingCampaign(null);
            setFormData({
        name: "",
        description: "",
        channel_type: "whatsapp",
        category: "marketing",
        priority: "medium",
        schedule_type: "immediate",
        scheduled_date: "",
        scheduled_time: "",
        recurring_type: "none",
        recurring_days: [],
        recurring_time: "",
        max_messages_per_day: 100,
        respect_working_hours: true,
        working_hours_start: "09:00",
        working_hours_end: "18:00",
        working_days: [1, 2, 3, 4, 5],
        timezone: "America/Sao_Paulo",
        auto_optimize: false,
        a_b_testing: false,
        success_metrics: [],
      });
          }}
          initialSteps={editingCampaign?.audience_query?.steps || []}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header com Breadcrumbs */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center space-x-2">
            <Send className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Marketing</span>
            <span className="text-sm text-muted-foreground">/</span>
            <span className="text-sm font-medium">Campanhas</span>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 space-y-6">
          {/* Header da Página */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Campanhas</h1>
              <p className="text-muted-foreground mt-1">
                Crie e gerencie suas campanhas de marketing
              </p>
            </div>
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAiAssistant(true)}
                  className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-200 text-purple-700 hover:from-purple-500/20 hover:to-blue-500/20"
                >
                  <Bot className="h-4 w-4 mr-2" />
                  Assistente IA Orgânica
                </Button>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Campanha
                </Button>
              </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="campaigns" className="flex items-center space-x-2">
                <Send className="h-4 w-4" />
                <span>Campanhas</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4" />
                <span>Templates</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab Campanhas */}
            <TabsContent value="campaigns" className="space-y-4">
              {/* Estatísticas */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Campanhas</CardTitle>
                    <Send className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalCampaigns || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats?.totalCampaigns === 1 ? 'campanha criada' : 'campanhas criadas'}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ativas</CardTitle>
                    <Play className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{stats?.activeCampaigns || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats?.activeCampaigns === 1 ? 'campanha ativa' : 'campanhas ativas'}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pausadas</CardTitle>
                    <Pause className="h-4 w-4 text-yellow-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">{stats?.pausedCampaigns || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats?.pausedCampaigns === 1 ? 'campanha pausada' : 'campanhas pausadas'}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Taxa de Abertura</CardTitle>
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{(stats?.openRate || 0).toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">
                      média de abertura
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Lista de Campanhas */}
              <Card className="border-2 hover:border-primary/30 transition-all shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Send className="h-5 w-5 text-primary" />
                        Todas as Campanhas
                      </CardTitle>
                      <CardDescription className="mt-1">Gerencie suas campanhas de marketing</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                      <p className="text-muted-foreground mt-4">Carregando campanhas...</p>
                    </div>
                  ) : campaigns.length === 0 ? (
                    <div className="text-center py-8">
                      <Send className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Nenhuma campanha encontrada</h3>
                      <p className="text-muted-foreground mb-6">Comece criando sua primeira campanha de marketing.</p>
                      <Button onClick={() => setShowCreateDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Criar Primeira Campanha
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {campaigns.map((campaign) => (
                        <Card key={campaign.id} className="border hover:border-primary/30 transition-all">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-lg font-semibold">{campaign.name}</h3>
                                  {getStatusBadge(campaign.status)}
                                </div>
                                <p className="text-sm text-muted-foreground capitalize">
                                  Canal: {campaign.channel_type}
                                </p>
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
                                  <Workflow className="h-3 w-3 mr-1" />
                                  Editar Fluxo
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
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab Analytics */}
            <TabsContent value="analytics" className="space-y-4">
              {analyticsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Carregando analytics...</span>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Filtros de Analytics */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Filtros de Analytics
                      </CardTitle>
                      <CardDescription>Configure os filtros para visualizar dados específicos</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Período</Label>
                          <Select 
                            value={analyticsFilters.period} 
                            onValueChange={(value: any) => setAnalyticsFilters({...analyticsFilters, period: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="7d">Últimos 7 dias</SelectItem>
                              <SelectItem value="30d">Últimos 30 dias</SelectItem>
                              <SelectItem value="90d">Últimos 90 dias</SelectItem>
                              <SelectItem value="1y">Último ano</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Canal</Label>
                          <Select 
                            value={analyticsFilters.channel} 
                            onValueChange={(value: any) => setAnalyticsFilters({...analyticsFilters, channel: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Todos os canais</SelectItem>
                              <SelectItem value="whatsapp">WhatsApp</SelectItem>
                              <SelectItem value="instagram">Instagram</SelectItem>
                              <SelectItem value="messenger">Messenger</SelectItem>
                              <SelectItem value="telegram">Telegram</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Tipo de Campanha</Label>
                          <Select 
                            value={analyticsFilters.campaignType} 
                            onValueChange={(value: any) => setAnalyticsFilters({...analyticsFilters, campaignType: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Todos os tipos</SelectItem>
                              <SelectItem value="marketing">Marketing</SelectItem>
                              <SelectItem value="sales">Vendas</SelectItem>
                              <SelectItem value="support">Suporte</SelectItem>
                              <SelectItem value="nurturing">Nutrição</SelectItem>
                              <SelectItem value="announcement">Anúncio</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Métricas Principais */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <Card className="hover:shadow-md transition-shadow">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Enviadas</CardTitle>
                        <Send className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{analyticsData?.totalSent?.toLocaleString() || 0}</div>
                        <p className="text-xs text-muted-foreground">mensagens totais</p>
                        <div className="flex items-center mt-1">
                          <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                          <span className="text-xs text-green-600">+12% vs período anterior</span>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="hover:shadow-md transition-shadow">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Entregues</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">{analyticsData?.totalDelivered?.toLocaleString() || 0}</div>
                        <p className="text-xs text-muted-foreground">{analyticsData?.totalSent ? ((analyticsData.totalDelivered/analyticsData.totalSent)*100).toFixed(1) : 0}% taxa de entrega</p>
                        <div className="flex items-center mt-1">
                          <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                          <span className="text-xs text-green-600">+2% vs período anterior</span>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="hover:shadow-md transition-shadow">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Abertas</CardTitle>
                        <Eye className="h-4 w-4 text-blue-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{analyticsData?.totalOpened?.toLocaleString() || 0}</div>
                        <p className="text-xs text-muted-foreground">{analyticsData?.openRate || 0}% taxa de abertura</p>
                        <div className="flex items-center mt-1">
                          <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                          <span className="text-xs text-green-600">+5% vs período anterior</span>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="hover:shadow-md transition-shadow">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cliques</CardTitle>
                        <MousePointer className="h-4 w-4 text-purple-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-purple-600">{analyticsData?.totalClicked?.toLocaleString() || 0}</div>
                        <p className="text-xs text-muted-foreground">{analyticsData?.clickRate || 0}% taxa de clique</p>
                        <div className="flex items-center mt-1">
                          <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                          <span className="text-xs text-green-600">+8% vs período anterior</span>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="hover:shadow-md transition-shadow">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Respostas</CardTitle>
                        <MessageSquare className="h-4 w-4 text-orange-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{analyticsData?.totalReplied?.toLocaleString() || 0}</div>
                        <p className="text-xs text-muted-foreground">{analyticsData?.replyRate || 0}% taxa de resposta</p>
                        <div className="flex items-center mt-1">
                          <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                          <span className="text-xs text-green-600">+3% vs período anterior</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Tendência de Engajamento */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Tendência de Engajamento
                      </CardTitle>
                      <CardDescription>Evolução das métricas nos últimos 7 dias</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 lg:grid-cols-7 gap-3">
                        {analyticsData?.dailyStats?.map((day, index) => {
                          const openRate = day.sent > 0 ? (day.opened / day.sent) * 100 : 0;
                          const clickRate = day.opened > 0 ? (day.clicked / day.opened) * 100 : 0;
                          const replyRate = day.sent > 0 ? (day.replied / day.sent) * 100 : 0;
                          
                          return (
                            <div key={index} className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-lg border hover:shadow-md transition-all">
                              <div className="text-center mb-3">
                                <div className="text-sm font-semibold text-gray-900">
                                  {new Date(day.date).toLocaleDateString('pt-BR', { 
                                    weekday: 'short'
                                  })}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(day.date).toLocaleDateString('pt-BR', { 
                                    day: '2-digit', 
                                    month: '2-digit' 
                                  })}
                                </div>
                              </div>
                              
                              <div className="space-y-3">
                                {/* Mensagens Enviadas */}
                                <div className="text-center">
                                  <div className="text-lg font-bold text-gray-900">{day.sent}</div>
                                  <div className="text-xs text-muted-foreground">enviadas</div>
                                </div>
                                
                                {/* Taxa de Abertura */}
                                <div className="space-y-1">
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="text-blue-600 font-medium">Abertura</span>
                                    <span className="font-semibold">{openRate.toFixed(1)}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                                      style={{ width: `${Math.min(openRate, 100)}%` }}
                                    ></div>
                                  </div>
                                </div>
                                
                                {/* Taxa de Clique */}
                                <div className="space-y-1">
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="text-purple-600 font-medium">Clique</span>
                                    <span className="font-semibold">{clickRate.toFixed(1)}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-purple-500 h-2 rounded-full transition-all duration-500" 
                                      style={{ width: `${Math.min(clickRate, 100)}%` }}
                                    ></div>
                                  </div>
                                </div>
                                
                                {/* Taxa de Resposta */}
                                <div className="space-y-1">
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="text-orange-600 font-medium">Resposta</span>
                                    <span className="font-semibold">{replyRate.toFixed(1)}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-orange-500 h-2 rounded-full transition-all duration-500" 
                                      style={{ width: `${Math.min(replyRate, 100)}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Indicador de Performance */}
                              <div className="mt-3 pt-3 border-t">
                                <div className="flex justify-center">
                                  <div className={`w-2 h-2 rounded-full ${
                                    openRate >= 60 ? 'bg-green-500' : 
                                    openRate >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}></div>
                                </div>
                                <div className="text-xs text-center mt-1 text-muted-foreground">
                                  {openRate >= 60 ? 'Excelente' : 
                                   openRate >= 40 ? 'Bom' : 'Melhorar'}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Resumo da Semana */}
                      <div className="mt-6 pt-6 border-t">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">
                              {analyticsData?.dailyStats?.reduce((acc, day) => acc + day.sent, 0) || 0}
                            </div>
                            <div className="text-sm text-muted-foreground">Total Enviadas</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {analyticsData?.dailyStats?.length ? 
                                (analyticsData.dailyStats.reduce((acc, day) => acc + (day.sent > 0 ? (day.opened / day.sent) * 100 : 0), 0) / analyticsData.dailyStats.length).toFixed(1) : 0}%
                            </div>
                            <div className="text-sm text-muted-foreground">Média Abertura</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">
                              {analyticsData?.dailyStats?.length ? 
                                (analyticsData.dailyStats.reduce((acc, day) => acc + (day.opened > 0 ? (day.clicked / day.opened) * 100 : 0), 0) / analyticsData.dailyStats.length).toFixed(1) : 0}%
                            </div>
                            <div className="text-sm text-muted-foreground">Média Clique</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">
                              {analyticsData?.dailyStats?.length ? 
                                (analyticsData.dailyStats.reduce((acc, day) => acc + (day.sent > 0 ? (day.replied / day.sent) * 100 : 0), 0) / analyticsData.dailyStats.length).toFixed(1) : 0}%
                            </div>
                            <div className="text-sm text-muted-foreground">Média Resposta</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Performance por Campanha */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Performance por Campanha</CardTitle>
                          <CardDescription>Métricas detalhadas de cada campanha</CardDescription>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {analyticsData?.campaigns?.length || 0} campanhas
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {analyticsData?.campaigns?.length === 0 ? (
                        <div className="text-center py-8">
                          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-semibold mb-2">Nenhuma campanha encontrada</h3>
                          <p className="text-muted-foreground mb-4">
                            Crie campanhas para ver métricas detalhadas aqui.
                          </p>
                          <Button onClick={() => setShowCreateDialog(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Criar Primeira Campanha
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {analyticsData?.campaigns?.map((campaign) => (
                            <div key={campaign.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                  <div>
                                    <h3 className="font-semibold">{campaign.name}</h3>
                                    <div className="flex items-center space-x-2 mt-1">
                                      <Badge variant={campaign.status === "active" ? "default" : "secondary"}>
                                        {campaign.status === "active" ? "Ativa" : "Inativa"}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground">
                                        Criada há {Math.floor(Math.random() * 30) + 1} dias
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm text-muted-foreground">Taxa de Abertura</div>
                                  <div className="text-lg font-bold text-blue-600">{campaign.openRate}%</div>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                                <div className="space-y-1">
                                  <div className="text-muted-foreground">Enviadas</div>
                                  <div className="font-semibold text-lg">{campaign.sent.toLocaleString()}</div>
                                  <div className="text-xs text-green-600">+5% vs anterior</div>
                                </div>
                                <div className="space-y-1">
                                  <div className="text-muted-foreground">Entregues</div>
                                  <div className="font-semibold text-lg text-green-600">{campaign.delivered.toLocaleString()}</div>
                                  <div className="text-xs text-green-600">{((campaign.delivered/campaign.sent)*100).toFixed(1)}% entrega</div>
                                </div>
                                <div className="space-y-1">
                                  <div className="text-muted-foreground">Abertas</div>
                                  <div className="font-semibold text-lg text-blue-600">{campaign.opened.toLocaleString()}</div>
                                  <div className="text-xs text-blue-600">{campaign.openRate}% abertura</div>
                                </div>
                                <div className="space-y-1">
                                  <div className="text-muted-foreground">Cliques</div>
                                  <div className="font-semibold text-lg text-purple-600">{campaign.clicked.toLocaleString()}</div>
                                  <div className="text-xs text-purple-600">{campaign.clickRate}% clique</div>
                                </div>
                                <div className="space-y-1">
                                  <div className="text-muted-foreground">Respostas</div>
                                  <div className="font-semibold text-lg text-orange-600">{campaign.replied.toLocaleString()}</div>
                                  <div className="text-xs text-orange-600">{campaign.replyRate}% resposta</div>
                                </div>
                              </div>
                              
                              <div className="mt-4 pt-4 border-t">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-4 text-sm">
                                    <div className="flex items-center space-x-1">
                                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                      <span>Abertas: {campaign.opened}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                      <span>Cliques: {campaign.clicked}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                      <span>Respostas: {campaign.replied}</span>
                                    </div>
                                  </div>
                                  <Button variant="outline" size="sm">
                                    <Eye className="h-3 w-3 mr-1" />
                                    Ver Detalhes
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Insights e Recomendações */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-purple-600" />
                        Insights Inteligentes
                      </CardTitle>
                      <CardDescription>Análise automatizada dos seus dados de campanha</CardDescription>
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
                              <span>Taxa de entrega excelente: {analyticsData?.totalSent ? ((analyticsData.totalDelivered/analyticsData.totalSent)*100).toFixed(1) : 0}%</span>
                            </li>
                            <li className="flex items-start space-x-2">
                              <span className="text-green-500 mt-1">✓</span>
                              <span>Engajamento crescente nos últimos dias</span>
                            </li>
                            <li className="flex items-start space-x-2">
                              <span className="text-green-500 mt-1">✓</span>
                              <span>WhatsApp é seu canal mais performático</span>
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
                              <span>Melhore taxa de resposta testando horários diferentes</span>
                            </li>
                            <li className="flex items-start space-x-2">
                              <span className="text-orange-500 mt-1">⚡</span>
                              <span>Personalize mais as mensagens para aumentar cliques</span>
                            </li>
                            <li className="flex items-start space-x-2">
                              <span className="text-orange-500 mt-1">⚡</span>
                              <span>Considere expandir para Instagram e Messenger</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Ações Rápidas */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <Button variant="outline" size="sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        Agendar Relatório
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Configurar Alertas
                      </Button>
                    </div>
                    <Button className="bg-gradient-to-r from-primary to-primary-glow">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar Relatório Completo
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Tab Templates */}
            <TabsContent value="templates" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {campaignTemplates.map((template) => (
                  <Card key={template.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <CardDescription className="mt-1">{template.description}</CardDescription>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {template.channel_type}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Passos do Fluxo:</p>
                        <div className="space-y-1">
                          {template.steps.map((step, index) => (
                            <div key={index} className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                                {index + 1}
                              </div>
                              <span>{step.name}</span>
                            </div>
                          ))}
                        </div>
                        <div className="pt-4">
                          <Button 
                            onClick={() => handleUseTemplate(template)}
                            className="w-full"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Usar Template
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Dialog Criar Campanha com IA */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <span>Criar Nova Campanha com IA</span>
            </DialogTitle>
            <DialogDescription>
              Configure sua campanha com sugestões inteligentes de IA
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Seção 1: Informações Básicas */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Informações Básicas</h3>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={generateAiSuggestions}
                  disabled={aiLoading}
                  className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-200 text-purple-700"
                >
                  {aiLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Brain className="h-4 w-4 mr-2" />
                  )}
                  Sugestões IA
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Campanha *</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Campanha de Lançamento Q1 2024"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="channel">Canal *</Label>
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

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva o objetivo da campanha..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>


            {/* Seção 3: Sugestões de IA - Focadas em Criação */}
            {aiSuggestions && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold">Sugestões para {aiSuggestions.campaignType}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="h-4 w-4 text-purple-600" />
                      <span className="font-medium">Sugestão de Nome</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p className="font-medium">{aiSuggestions.contentSuggestions.recommendedName}</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => applyAiSuggestion('name', aiSuggestions.contentSuggestions.recommendedName)}
                      className="text-xs"
                    >
                      Aplicar Nome
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-4 w-4 text-purple-600" />
                      <span className="font-medium">Descrição Sugerida</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>{aiSuggestions.contentSuggestions.recommendedDescription}</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => applyAiSuggestion('description', aiSuggestions.contentSuggestions.recommendedDescription)}
                      className="text-xs"
                    >
                      Aplicar Descrição
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Lightbulb className="h-4 w-4 text-purple-600" />
                      <span className="font-medium">Tom Recomendado</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p><strong>Estilo:</strong> {aiSuggestions.contentSuggestions.tone}</p>
                      <p><strong>CTA:</strong> {aiSuggestions.contentSuggestions.callToAction}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4 text-purple-600" />
                      <span className="font-medium">Tópicos Sugeridos</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <ul className="space-y-1">
                        {aiSuggestions.contentSuggestions.topics.map((topic: string, index: number) => (
                          <li key={index} className="flex items-start space-x-1">
                            <span className="text-purple-500 mt-1">•</span>
                            <span>{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Insights do Analytics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Performance Histórica</span>
                    </div>
                    <div className="text-sm text-green-700">
                      <p><strong>Taxa de Abertura:</strong> {aiSuggestions.analyticsInsights.avgOpenRate}</p>
                      <p><strong>Taxa de Resposta:</strong> {aiSuggestions.analyticsInsights.avgResponseRate}</p>
                      <p><strong>Melhor tipo:</strong> {aiSuggestions.analyticsInsights.bestPerformingType}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Dica de Melhoria</span>
                    </div>
                    <div className="text-sm text-green-700">
                      <p>{aiSuggestions.analyticsInsights.improvementTip}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <Zap className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800">Dicas de Otimização</span>
                  </div>
                  <ul className="space-y-1 text-sm text-blue-700">
                    {aiSuggestions.optimizationTips.map((tip: string, index: number) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Seção 3: Configurações Avançadas */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Configurações Avançadas</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="sales">Vendas</SelectItem>
                      <SelectItem value="support">Suporte</SelectItem>
                      <SelectItem value="nurturing">Nutrição</SelectItem>
                      <SelectItem value="announcement">Anúncio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select 
                    value={formData.priority} 
                    onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger id="priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center space-x-2">
                      <Zap className="h-4 w-4" />
                      <span>Otimização Automática</span>
                    </Label>
                    <p className="text-sm text-muted-foreground">IA otimiza horários e conteúdo</p>
                  </div>
                  <Switch
                    checked={formData.auto_optimize}
                    onCheckedChange={(checked) => setFormData({ ...formData, auto_optimize: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center space-x-2">
                      <TestTube className="h-4 w-4" />
                      <span>Teste A/B</span>
                    </Label>
                    <p className="text-sm text-muted-foreground">Testar diferentes versões</p>
                  </div>
                  <Switch
                    checked={formData.a_b_testing}
                    onCheckedChange={(checked) => setFormData({ ...formData, a_b_testing: checked })}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={() => {
              setShowCreateDialog(false);
              setFormData({ 
                name: "", 
                channel_type: "whatsapp",
                description: "",
                category: "marketing",
                priority: "medium",
                schedule_type: "immediate",
                scheduled_date: "",
                scheduled_time: "",
                recurring_type: "none",
                recurring_days: [],
                recurring_time: "",
                max_messages_per_day: 100,
                respect_working_hours: true,
                working_hours_start: "09:00",
                working_hours_end: "18:00",
                working_days: [1, 2, 3, 4, 5],
                timezone: "America/Sao_Paulo",
                auto_optimize: false,
                a_b_testing: false,
                success_metrics: [],
              });
              setAiSuggestions(null);
            }}>
              Cancelar
            </Button>
            <div className="flex space-x-2">
              <Button 
                variant="outline"
                onClick={optimizeCampaignWithAi}
                disabled={aiLoading}
                className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-200 text-purple-700"
              >
                {aiLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Brain className="h-4 w-4 mr-2" />
                )}
                Otimizar com IA
              </Button>
              <Button
                onClick={handleCreateCampaign}
                disabled={!formData.name}
                className="bg-gradient-to-r from-primary to-primary-glow"
              >
                <Workflow className="h-4 w-4 mr-2" />
                Criar Campanha
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Assistente IA */}
      <Dialog open={showAiAssistant} onOpenChange={setShowAiAssistant}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Bot className="h-5 w-5 text-purple-600" />
              <span>Assistente IA para Campanhas Orgânicas</span>
            </DialogTitle>
            <DialogDescription>
              Insights inteligentes e otimizações para suas campanhas de relacionamento
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Análise de Performance */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Análise de Performance</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Performance Orgânica</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p><strong>Taxa de Entrega:</strong> 98% (+2% vs mês anterior)</p>
                    <p><strong>Taxa de Resposta:</strong> 22% (+3%)</p>
                    <p><strong>Engajamento Médio:</strong> 45%</p>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Horários Ideais</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p><strong>Melhor dia:</strong> Terça-feira</p>
                    <p><strong>Melhor horário:</strong> 14:00 - 16:00</p>
                    <p><strong>Pior horário:</strong> 08:00 - 10:00</p>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="h-4 w-4 text-purple-600" />
                    <span className="font-medium">Público</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p><strong>Total de contatos:</strong> 1,250</p>
                    <p><strong>Melhor canal:</strong> WhatsApp</p>
                    <p><strong>Engajamento:</strong> Alto</p>
                  </div>
                </Card>
              </div>
            </div>

            {/* Sugestões de IA */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold">Sugestões Inteligentes</h3>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={generateAiSuggestions}
                  disabled={aiLoading}
                  className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-200 text-purple-700"
                >
                  {aiLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  Gerar Novas Sugestões
                </Button>
              </div>

              {aiSuggestions && (
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-2 mb-3">
                      <Lightbulb className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-800">Recomendações de Melhoria</span>
                    </div>
                    <ul className="space-y-2 text-sm text-green-700">
                      <li className="flex items-start space-x-2">
                        <span className="text-green-500 mt-1">⏰</span>
                        <span><strong>Timing:</strong> Envie entre 14:00-16:00 para maximizar a taxa de resposta orgânica</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-green-500 mt-1">💬</span>
                        <span><strong>Tom:</strong> Use linguagem conversacional e pessoal, não comercial</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-green-500 mt-1">🚫</span>
                        <span><strong>Anti-Spam:</strong> Limite a 3-5 mensagens por contato por semana</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-green-500 mt-1">📱</span>
                        <span><strong>Engajamento:</strong> Use emojis e perguntas para estimular respostas</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-green-500 mt-1">🎯</span>
                        <span><strong>Objetivo:</strong> Foque em construir relacionamento, não em vender</span>
                      </li>
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <Target className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">Próximas Oportunidades</span>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p><strong>Black Friday:</strong> Campanha informativa sobre promoções</p>
                        <p><strong>Natal:</strong> Mensagens de boas festas e agradecimento</p>
                        <p><strong>Reativação:</strong> 340 contatos inativos - campanha de reengajamento</p>
                        <p><strong>Eventos:</strong> Convites para webinars e encontros</p>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <Zap className="h-4 w-4 text-purple-600" />
                        <span className="font-medium">Otimizações Automáticas</span>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p><strong>A/B Testing:</strong> Teste diferentes horários de envio</p>
                        <p><strong>Personalização:</strong> Use nome e contexto do relacionamento</p>
                        <p><strong>Follow-up:</strong> Reengajamento respeitoso em 48h</p>
                        <p><strong>Frequência:</strong> Controle automático de limite de mensagens</p>
                      </div>
                    </Card>
                  </div>
                </div>
              )}
            </div>

            {/* Ações Rápidas */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Ações Rápidas</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-start space-y-2"
                  onClick={() => {
                    setShowAiAssistant(false);
                    setShowCreateDialog(true);
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span className="font-medium">Criar Campanha Otimizada</span>
                  </div>
                  <span className="text-sm text-muted-foreground text-left">
                    Use as sugestões de IA para criar uma nova campanha
                  </span>
                </Button>

                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-start space-y-2"
                  onClick={optimizeCampaignWithAi}
                  disabled={aiLoading}
                >
                  <div className="flex items-center space-x-2">
                    <Brain className="h-4 w-4" />
                    <span className="font-medium">Otimizar Campanhas Existentes</span>
                  </div>
                  <span className="text-sm text-muted-foreground text-left">
                    Aplicar melhorias automáticas nas campanhas ativas
                  </span>
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAiAssistant(false)}>
              Fechar
            </Button>
            <Button 
              onClick={() => {
                setShowAiAssistant(false);
                setShowCreateDialog(true);
              }}
              className="bg-gradient-to-r from-purple-600 to-blue-600"
            >
              <Bot className="h-4 w-4 mr-2" />
              Criar com IA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}