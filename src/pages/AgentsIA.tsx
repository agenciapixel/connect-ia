import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Sparkles, Activity, Zap, Play, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const AgentsIA = () => {
  // Gerador de Mensagens
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [messageContext, setMessageContext] = useState("");
  const [messageTarget, setMessageTarget] = useState("");
  const [messageLoading, setMessageLoading] = useState(false);
  const [messageResult, setMessageResult] = useState("");

  // Resumidor
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
  const [summaryText, setSummaryText] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryResult, setSummaryResult] = useState("");

  // Otimizador de Campanhas
  const [campaignDialogOpen, setCampaignDialogOpen] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [campaignDescription, setCampaignDescription] = useState("");
  const [campaignGoals, setCampaignGoals] = useState("");
  const [campaignLoading, setCampaignLoading] = useState(false);
  const [campaignResult, setCampaignResult] = useState("");

  const handleGenerateMessage = async () => {
    if (!messageContext || !messageTarget) {
      toast.error("Preencha todos os campos");
      return;
    }

    setMessageLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-generate-message', {
        body: { context: messageContext, target: messageTarget }
      });

      if (error) throw error;
      
      setMessageResult(data.message);
      toast.success("Mensagem gerada com sucesso!");
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || "Erro ao gerar mensagem");
    } finally {
      setMessageLoading(false);
    }
  };

  const handleSummarize = async () => {
    if (!summaryText) {
      toast.error("Digite o texto para resumir");
      return;
    }

    setSummaryLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-summarize', {
        body: { text: summaryText }
      });

      if (error) throw error;
      
      setSummaryResult(data.summary);
      toast.success("Resumo gerado com sucesso!");
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || "Erro ao gerar resumo");
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleOptimizeCampaign = async () => {
    if (!campaignName || !campaignDescription || !campaignGoals) {
      toast.error("Preencha todos os campos");
      return;
    }

    setCampaignLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-optimize-campaign', {
        body: {
          campaign: {
            name: campaignName,
            description: campaignDescription,
            goals: campaignGoals
          }
        }
      });

      if (error) throw error;
      
      setCampaignResult(data.suggestions);
      toast.success("Otimização gerada com sucesso!");
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || "Erro ao otimizar campanha");
    } finally {
      setCampaignLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Agentes de IA
          </h1>
          <p className="text-muted-foreground mt-2">
            Execute tarefas inteligentes com assistentes especializados
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Agentes Disponíveis</CardTitle>
              <Bot className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Especializados e prontos</p>
            </CardContent>
          </Card>

          <Card className="border-purple-500/20 bg-gradient-to-br from-card to-purple-500/5 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Modelo IA</CardTitle>
              <Sparkles className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Gemini 2.5</div>
              <p className="text-xs text-muted-foreground">Google Flash</p>
            </CardContent>
          </Card>

          <Card className="border-pink-500/20 bg-gradient-to-br from-card to-pink-500/5 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <Zap className="h-4 w-4 text-pink-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Online</div>
              <p className="text-xs text-muted-foreground">Todos os agentes ativos</p>
            </CardContent>
          </Card>
        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Gerador de Mensagens */}
          <Card className="group border-2 hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <Sparkles className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">Gerador de Mensagens</CardTitle>
                  <CardDescription className="mt-1">
                    Cria mensagens personalizadas e persuasivas
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                <Sparkles className="h-3 w-3 mr-1" />
                Mensagens
              </Badge>

              <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                    <Play className="h-4 w-4 mr-2" />
                    Executar Agente
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Gerador de Mensagens IA</DialogTitle>
                    <DialogDescription>
                      Forneça o contexto e o público-alvo para gerar uma mensagem personalizada
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="context">Contexto da Mensagem</Label>
                      <Textarea
                        id="context"
                        value={messageContext}
                        onChange={(e) => setMessageContext(e.target.value)}
                        placeholder="Ex: Promoção de fim de ano com 30% de desconto"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="target">Público-Alvo</Label>
                      <Input
                        id="target"
                        value={messageTarget}
                        onChange={(e) => setMessageTarget(e.target.value)}
                        placeholder="Ex: Clientes fiéis, novos leads, etc."
                      />
                    </div>
                    <Button 
                      onClick={handleGenerateMessage} 
                      className="w-full"
                      disabled={messageLoading}
                    >
                      {messageLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Gerando...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Gerar Mensagem
                        </>
                      )}
                    </Button>
                    {messageResult && (
                      <div className="mt-4 p-4 bg-muted rounded-lg">
                        <Label className="text-sm font-semibold mb-2 block">Mensagem Gerada:</Label>
                        <p className="text-sm whitespace-pre-wrap">{messageResult}</p>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Resumidor Inteligente */}
          <Card className="group border-2 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-purple-500/10">
                  <Activity className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">Resumidor Inteligente</CardTitle>
                  <CardDescription className="mt-1">
                    Resume textos longos em pontos principais
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                <Activity className="h-3 w-3 mr-1" />
                Resumo
              </Badge>

              <Dialog open={summaryDialogOpen} onOpenChange={setSummaryDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700">
                    <Play className="h-4 w-4 mr-2" />
                    Executar Agente
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Resumidor Inteligente IA</DialogTitle>
                    <DialogDescription>
                      Cole o texto que deseja resumir
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="text">Texto para Resumir</Label>
                      <Textarea
                        id="text"
                        value={summaryText}
                        onChange={(e) => setSummaryText(e.target.value)}
                        placeholder="Cole aqui o texto que deseja resumir..."
                        rows={8}
                      />
                    </div>
                    <Button 
                      onClick={handleSummarize} 
                      className="w-full"
                      disabled={summaryLoading}
                    >
                      {summaryLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Resumindo...
                        </>
                      ) : (
                        <>
                          <Activity className="h-4 w-4 mr-2" />
                          Gerar Resumo
                        </>
                      )}
                    </Button>
                    {summaryResult && (
                      <div className="mt-4 p-4 bg-muted rounded-lg">
                        <Label className="text-sm font-semibold mb-2 block">Resumo:</Label>
                        <p className="text-sm whitespace-pre-wrap">{summaryResult}</p>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Otimizador de Campanhas */}
          <Card className="group border-2 hover:border-orange-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-orange-500/10">
                  <Zap className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <CardTitle className="text-lg">Otimizador de Campanhas</CardTitle>
                  <CardDescription className="mt-1">
                    Analisa e melhora suas campanhas
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                <Zap className="h-3 w-3 mr-1" />
                Otimização
              </Badge>

              <Dialog open={campaignDialogOpen} onOpenChange={setCampaignDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                    <Play className="h-4 w-4 mr-2" />
                    Executar Agente
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Otimizador de Campanhas IA</DialogTitle>
                    <DialogDescription>
                      Forneça informações sobre sua campanha para receber sugestões
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="campaignName">Nome da Campanha</Label>
                      <Input
                        id="campaignName"
                        value={campaignName}
                        onChange={(e) => setCampaignName(e.target.value)}
                        placeholder="Ex: Lançamento Produto X"
                      />
                    </div>
                    <div>
                      <Label htmlFor="campaignDesc">Descrição</Label>
                      <Textarea
                        id="campaignDesc"
                        value={campaignDescription}
                        onChange={(e) => setCampaignDescription(e.target.value)}
                        placeholder="Descreva sua campanha atual..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="campaignGoals">Objetivos</Label>
                      <Textarea
                        id="campaignGoals"
                        value={campaignGoals}
                        onChange={(e) => setCampaignGoals(e.target.value)}
                        placeholder="Quais são os objetivos desta campanha?"
                        rows={3}
                      />
                    </div>
                    <Button 
                      onClick={handleOptimizeCampaign} 
                      className="w-full"
                      disabled={campaignLoading}
                    >
                      {campaignLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Otimizando...
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4 mr-2" />
                          Otimizar Campanha
                        </>
                      )}
                    </Button>
                    {campaignResult && (
                      <div className="mt-4 p-4 bg-muted rounded-lg">
                        <Label className="text-sm font-semibold mb-2 block">Sugestões:</Label>
                        <p className="text-sm whitespace-pre-wrap">{campaignResult}</p>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AgentsIA;
