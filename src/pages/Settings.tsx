import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, MessageSquare, FileText, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [summarizeDialogOpen, setSummarizeDialogOpen] = useState(false);
  const [optimizeDialogOpen, setOptimizeDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  // Message generation states
  const [messageContext, setMessageContext] = useState("");
  const [messageTone, setMessageTone] = useState("profissional");
  const [messageObjective, setMessageObjective] = useState("engajamento");

  // Summarize states
  const [textToSummarize, setTextToSummarize] = useState("");
  const [summaryFormat, setSummaryFormat] = useState("bullets");

  const handleGenerateMessage = async () => {
    setLoading(true);
    setResult("");
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-generate-message', {
        body: { 
          context: messageContext,
          tone: messageTone,
          objective: messageObjective
        }
      });

      if (error) throw error;

      setResult(data.message);
      toast({
        title: "Mensagem gerada!",
        description: "A IA criou uma mensagem para você.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao gerar mensagem",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSummarize = async () => {
    setLoading(true);
    setResult("");
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-summarize', {
        body: { 
          text: textToSummarize,
          format: summaryFormat
        }
      });

      if (error) throw error;

      setResult(data.summary);
      toast({
        title: "Resumo criado!",
        description: "A IA resumiu o texto para você.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar resumo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOptimizeCampaign = async () => {
    setLoading(true);
    setResult("");
    
    try {
      // Exemplo de dados de campanha
      const campaignData = {
        name: "Campanha de Lançamento",
        channel: "WhatsApp",
        status: "active",
        sent: 1234,
        deliveryRate: 97,
        openRate: 45
      };

      const { data, error } = await supabase.functions.invoke('ai-optimize-campaign', {
        body: { campaignData }
      });

      if (error) throw error;

      setResult(data.recommendations);
      toast({
        title: "Análise concluída!",
        description: "A IA analisou sua campanha.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao otimizar campanha",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6 bg-gradient-to-br from-background via-background to-primary/5 min-h-screen">
      <div>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Recursos de IA
        </h1>
        <p className="text-muted-foreground mt-2">Utilize inteligência artificial para otimizar seu marketing</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer" onClick={() => setMessageDialogOpen(true)}>
          <CardHeader>
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mb-4">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Gerar Mensagem
            </CardTitle>
            <CardDescription>Crie mensagens persuasivas com IA</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Use inteligência artificial para gerar mensagens otimizadas para suas campanhas
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer" onClick={() => setSummarizeDialogOpen(true)}>
          <CardHeader>
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Resumir Conteúdo
            </CardTitle>
            <CardDescription>Crie resumos inteligentes</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Resuma conversas, relatórios e documentos automaticamente
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer" onClick={() => setOptimizeDialogOpen(true)}>
          <CardHeader>
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Otimizar Campanha
            </CardTitle>
            <CardDescription>Melhore seus resultados</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Receba recomendações para melhorar o desempenho das campanhas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Dialog para Gerar Mensagem */}
      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Gerar Mensagem com IA
            </DialogTitle>
            <DialogDescription>
              Descreva o contexto e deixe a IA criar uma mensagem otimizada
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="context">Contexto da mensagem</Label>
              <Textarea
                id="context"
                placeholder="Ex: Promoção de lançamento de novo produto, desconto de 30% para primeiros 100 clientes..."
                value={messageContext}
                onChange={(e) => setMessageContext(e.target.value)}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tone">Tom da mensagem</Label>
                <Select value={messageTone} onValueChange={setMessageTone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="profissional">Profissional</SelectItem>
                    <SelectItem value="amigavel">Amigável</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="objective">Objetivo</Label>
                <Select value={messageObjective} onValueChange={setMessageObjective}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="engajamento">Engajamento</SelectItem>
                    <SelectItem value="conversao">Conversão</SelectItem>
                    <SelectItem value="informativo">Informativo</SelectItem>
                    <SelectItem value="follow-up">Follow-up</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button 
              onClick={handleGenerateMessage} 
              disabled={loading || !messageContext}
              className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90"
            >
              {loading ? "Gerando..." : "Gerar Mensagem"}
            </Button>
            {result && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <Label className="text-sm font-semibold mb-2 block">Resultado:</Label>
                <p className="text-sm whitespace-pre-wrap">{result}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para Resumir */}
      <Dialog open={summarizeDialogOpen} onOpenChange={setSummarizeDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Resumir com IA
            </DialogTitle>
            <DialogDescription>
              Cole o texto que deseja resumir
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text">Texto para resumir</Label>
              <Textarea
                id="text"
                placeholder="Cole aqui o texto que deseja resumir..."
                value={textToSummarize}
                onChange={(e) => setTextToSummarize(e.target.value)}
                rows={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="format">Formato do resumo</Label>
              <Select value={summaryFormat} onValueChange={setSummaryFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bullets">Bullet Points</SelectItem>
                  <SelectItem value="paragraph">Parágrafo</SelectItem>
                  <SelectItem value="executive">Resumo Executivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleSummarize} 
              disabled={loading || !textToSummarize}
              className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90"
            >
              {loading ? "Resumindo..." : "Criar Resumo"}
            </Button>
            {result && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <Label className="text-sm font-semibold mb-2 block">Resumo:</Label>
                <p className="text-sm whitespace-pre-wrap">{result}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para Otimizar Campanha */}
      <Dialog open={optimizeDialogOpen} onOpenChange={setOptimizeDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Otimizar Campanha com IA
            </DialogTitle>
            <DialogDescription>
              Receba recomendações personalizadas para melhorar sua campanha
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <p className="text-sm"><strong>Campanha:</strong> Campanha de Lançamento</p>
              <p className="text-sm"><strong>Canal:</strong> WhatsApp</p>
              <p className="text-sm"><strong>Enviadas:</strong> 1,234</p>
              <p className="text-sm"><strong>Taxa de entrega:</strong> 97%</p>
              <p className="text-sm"><strong>Taxa de abertura:</strong> 45%</p>
            </div>
            <Button 
              onClick={handleOptimizeCampaign} 
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90"
            >
              {loading ? "Analisando..." : "Analisar e Otimizar"}
            </Button>
            {result && (
              <div className="mt-4 p-4 bg-muted rounded-lg max-h-96 overflow-y-auto">
                <Label className="text-sm font-semibold mb-2 block">Recomendações:</Label>
                <p className="text-sm whitespace-pre-wrap">{result}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
