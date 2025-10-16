import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Bot, Loader2, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AIAgent {
  id: string;
  name: string;
  type: string;
  status: string;
}

export function AIAgentTester() {
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>("");
  const [userMessage, setUserMessage] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingAgents, setLoadingAgents] = useState(false);

  const loadAgents = async () => {
    setLoadingAgents(true);
    try {
      const { data, error } = await supabase
        .from('ai_agents')
        .select('id, name, type, status')
        .eq('status', 'ativo')
        .order('name');

      if (error) throw error;
      setAgents(data || []);

      if (data && data.length > 0 && !selectedAgent) {
        setSelectedAgent(data[0].id);
      }
    } catch (error: unknown) {
      console.error('Error loading agents:', error);
      toast.error("Erro ao carregar agentes");
    } finally {
      setLoadingAgents(false);
    }
  };

  const testAgent = async () => {
    if (!selectedAgent || !userMessage.trim()) {
      toast.error("Selecione um agente e digite uma mensagem");
      return;
    }

    setLoading(true);
    setAiResponse("");

    try {
      const { data, error } = await supabase.functions.invoke('ai-agent-chat', {
        body: {
          agentId: selectedAgent,
          message: userMessage.trim(),
          // Pode adicionar conversationId aqui para teste com histórico
          // conversationId: 'test-conversation-id',
          // contactId: 'test-contact-id'
        }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setAiResponse(data.response);

      // Mostrar informações adicionais se disponíveis
      const infoMessage = data.contextUsed
        ? `Resposta gerada com contexto de ${data.historyMessages} mensagens anteriores!`
        : "Resposta gerada com sucesso!";

      toast.success(infoMessage);
    } catch (error: unknown) {
      console.error('Error testing agent:', error);
      const errorMessage = error instanceof Error ? error.message : "Erro ao testar agente";
      toast.error(errorMessage);
      setAiResponse("❌ Erro ao gerar resposta. Verifique os logs.");
    } finally {
      setLoading(false);
    }
  };

  const clearTest = () => {
    setUserMessage("");
    setAiResponse("");
  };

  const exampleMessages = {
    atendimento: [
      "Olá! Qual é o horário de funcionamento?",
      "Como faço para entrar em contato com vocês?",
      "Preciso de ajuda com meu pedido"
    ],
    vendas: [
      "Gostaria de saber mais sobre seus produtos",
      "Quanto custa o plano empresarial?",
      "Vocês oferecem período de teste gratuito?"
    ],
    suporte: [
      "Não consigo fazer login na minha conta",
      "A mensagem não está sendo enviada, o que fazer?",
      "Como faço para conectar meu WhatsApp?"
    ]
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              Testar Agentes de IA
            </CardTitle>
            <CardDescription>
              Teste as respostas dos seus agentes de IA em tempo real
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadAgents}
            disabled={loadingAgents}
          >
            {loadingAgents ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Carregando...
              </>
            ) : (
              "Carregar Agentes"
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Seleção de Agente */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Selecionar Agente</label>
          <Select value={selectedAgent} onValueChange={setSelectedAgent}>
            <SelectTrigger>
              <SelectValue placeholder="Escolha um agente para testar" />
            </SelectTrigger>
            <SelectContent>
              {agents.map((agent) => (
                <SelectItem key={agent.id} value={agent.id}>
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    {agent.name}
                    <Badge variant="secondary" className="ml-2 capitalize">
                      {agent.type}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {agents.length === 0 && !loadingAgents && (
            <p className="text-sm text-muted-foreground">
              Nenhum agente ativo encontrado. Clique em "Carregar Agentes" ou crie um novo agente.
            </p>
          )}
        </div>

        {/* Mensagens de Exemplo */}
        {selectedAgent && agents.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Exemplos de Mensagens</label>
            <div className="flex flex-wrap gap-2">
              {(() => {
                const agent = agents.find(a => a.id === selectedAgent);
                const examples = agent ? exampleMessages[agent.type as keyof typeof exampleMessages] || [] : [];
                return examples.map((example, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setUserMessage(example)}
                    className="text-xs"
                  >
                    {example}
                  </Button>
                ));
              })()}
            </div>
          </div>
        )}

        {/* Mensagem do Usuário */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Mensagem do Usuário</label>
          <Textarea
            placeholder="Digite a mensagem do cliente aqui..."
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            rows={4}
            className="resize-none"
          />
        </div>

        {/* Botões de Ação */}
        <div className="flex gap-2">
          <Button
            onClick={testAgent}
            disabled={loading || !selectedAgent || !userMessage.trim()}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Gerando resposta...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Testar Agente
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={clearTest}
            disabled={loading}
          >
            Limpar
          </Button>
        </div>

        {/* Resposta da IA */}
        {aiResponse && (
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Resposta do Agente
            </label>
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-sm whitespace-pre-wrap">{aiResponse}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
