import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Plus, Sparkles, Activity, Clock, Zap } from "lucide-react";
import { toast } from "sonner";

interface Agent {
  id: string;
  name: string;
  description: string;
  type: "message" | "summary" | "campaign";
  status: "active" | "inactive";
  tasksCompleted: number;
  lastUsed: string;
}

const AgentsIA = () => {
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: "1",
      name: "Gerador de Mensagens",
      description: "Cria mensagens personalizadas e persuasivas para seus contatos",
      type: "message",
      status: "active",
      tasksCompleted: 1234,
      lastUsed: "2 horas atrás"
    },
    {
      id: "2",
      name: "Resumidor Inteligente",
      description: "Analisa e resume conversas longas em pontos principais",
      type: "summary",
      status: "active",
      tasksCompleted: 856,
      lastUsed: "5 horas atrás"
    },
    {
      id: "3",
      name: "Otimizador de Campanhas",
      description: "Sugere melhorias e estratégias para suas campanhas",
      type: "campaign",
      status: "active",
      tasksCompleted: 423,
      lastUsed: "1 dia atrás"
    }
  ]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newAgent, setNewAgent] = useState({ name: "", description: "", type: "message" });

  const handleCreateAgent = () => {
    if (!newAgent.name || !newAgent.description) {
      toast.error("Preencha todos os campos");
      return;
    }

    const agent: Agent = {
      id: Date.now().toString(),
      name: newAgent.name,
      description: newAgent.description,
      type: newAgent.type as Agent["type"],
      status: "active",
      tasksCompleted: 0,
      lastUsed: "Nunca"
    };

    setAgents([...agents, agent]);
    setIsCreateOpen(false);
    setNewAgent({ name: "", description: "", type: "message" });
    toast.success("Agente criado com sucesso!");
  };

  const getTypeColor = (type: Agent["type"]) => {
    switch (type) {
      case "message": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "summary": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "campaign": return "bg-orange-500/10 text-orange-500 border-orange-500/20";
    }
  };

  const getTypeIcon = (type: Agent["type"]) => {
    switch (type) {
      case "message": return <Sparkles className="h-4 w-4" />;
      case "summary": return <Activity className="h-4 w-4" />;
      case "campaign": return <Zap className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Agentes de IA
            </h1>
            <p className="text-muted-foreground mt-2">
              Gerencie seus assistentes inteligentes
            </p>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90">
                <Plus className="h-4 w-4" />
                Novo Agente
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Agente</DialogTitle>
                <DialogDescription>
                  Configure um novo agente de IA para automatizar suas tarefas
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome do Agente</Label>
                  <Input
                    id="name"
                    value={newAgent.name}
                    onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                    placeholder="Ex: Assistente de Vendas"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={newAgent.description}
                    onChange={(e) => setNewAgent({ ...newAgent, description: e.target.value })}
                    placeholder="Descreva o que este agente fará..."
                  />
                </div>
                <div>
                  <Label htmlFor="type">Tipo</Label>
                  <select
                    id="type"
                    value={newAgent.type}
                    onChange={(e) => setNewAgent({ ...newAgent, type: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                  >
                    <option value="message">Gerador de Mensagens</option>
                    <option value="summary">Resumidor</option>
                    <option value="campaign">Otimizador de Campanhas</option>
                  </select>
                </div>
                <Button onClick={handleCreateAgent} className="w-full">
                  Criar Agente
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Agentes</CardTitle>
              <Bot className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{agents.length}</div>
              <p className="text-xs text-muted-foreground">Agentes ativos no sistema</p>
            </CardContent>
          </Card>

          <Card className="border-purple-500/20 bg-gradient-to-br from-card to-purple-500/5 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tarefas Completadas</CardTitle>
              <Activity className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {agents.reduce((acc, agent) => acc + agent.tasksCompleted, 0)}
              </div>
              <p className="text-xs text-muted-foreground">Total de tarefas realizadas</p>
            </CardContent>
          </Card>

          <Card className="border-pink-500/20 bg-gradient-to-br from-card to-pink-500/5 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
              <Zap className="h-4 w-4 text-pink-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98.5%</div>
              <p className="text-xs text-muted-foreground">Precisão média dos agentes</p>
            </CardContent>
          </Card>
        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <Card 
              key={agent.id}
              className="group border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{agent.name}</CardTitle>
                      <CardDescription className="mt-1">{agent.description}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getTypeColor(agent.type)}>
                    {getTypeIcon(agent.type)}
                    <span className="ml-1 capitalize">{agent.type}</span>
                  </Badge>
                  <Badge variant="outline" className="border-green-500/20 bg-green-500/10 text-green-500">
                    {agent.status}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Tarefas completadas</span>
                    <span className="font-semibold">{agent.tasksCompleted}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Último uso
                    </span>
                    <span className="font-medium">{agent.lastUsed}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Configurar
                  </Button>
                  <Button size="sm" className="flex-1 bg-gradient-to-r from-primary to-purple-600">
                    Ativar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AgentsIA;
