import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bot, Plus, Trash2, Edit, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type AgentType = 'vendas' | 'suporte' | 'sdr' | 'atendimento' | 'outros';
type AgentStatus = 'ativo' | 'inativo' | 'treinamento';

interface AIAgent {
  id: string;
  name: string;
  description: string | null;
  type: AgentType;
  status: AgentStatus;
  system_prompt: string;
  model: string;
  temperature: number;
  max_tokens: number;
  created_at: string;
}

const AgentsIA = () => {
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<AIAgent | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "suporte" as AgentType,
    status: "ativo" as AgentStatus,
    system_prompt: "",
    model: "google/gemini-2.5-flash",
    temperature: 0.7,
    max_tokens: 1000,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      type: "suporte",
      status: "ativo",
      system_prompt: "",
      model: "google/gemini-2.5-flash",
      temperature: 0.7,
      max_tokens: 1000,
    });
    setEditingAgent(null);
  };

  const loadAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_agents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAgents(data || []);
    } catch (error: any) {
      console.error('Error loading agents:', error);
      toast.error("Erro ao carregar agentes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgents();
  }, []);

  const handleCreateOrUpdate = async () => {
    if (!formData.name || !formData.system_prompt) {
      toast.error("Nome e prompt do sistema são obrigatórios");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Você precisa estar autenticado");
        return;
      }

      if (editingAgent) {
        const { error } = await supabase
          .from('ai_agents')
          .update(formData)
          .eq('id', editingAgent.id);

        if (error) throw error;
        toast.success("Agente atualizado com sucesso!");
      } else {
        const { error } = await supabase
          .from('ai_agents')
          .insert([{ ...formData, created_by: user.id }]);

        if (error) throw error;
        toast.success("Agente criado com sucesso!");
      }

      setCreateDialogOpen(false);
      resetForm();
      loadAgents();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || "Erro ao salvar agente");
    }
  };

  const handleEdit = (agent: AIAgent) => {
    setEditingAgent(agent);
    setFormData({
      name: agent.name,
      description: agent.description || "",
      type: agent.type,
      status: agent.status,
      system_prompt: agent.system_prompt,
      model: agent.model,
      temperature: agent.temperature,
      max_tokens: agent.max_tokens,
    });
    setCreateDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este agente?")) return;

    try {
      const { error } = await supabase
        .from('ai_agents')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success("Agente excluído com sucesso!");
      loadAgents();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || "Erro ao excluir agente");
    }
  };

  const getTypeColor = (type: AgentType) => {
    const colors = {
      vendas: "bg-green-500/10 text-green-500 border-green-500/20",
      suporte: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      sdr: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      atendimento: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      outros: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    };
    return colors[type];
  };

  const getStatusBadge = (status: AgentStatus) => {
    const variants = {
      ativo: "bg-green-500/10 text-green-500",
      inativo: "bg-red-500/10 text-red-500",
      treinamento: "bg-yellow-500/10 text-yellow-500",
    };
    return variants[status];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Agentes de IA
            </h1>
            <p className="text-muted-foreground mt-2">
              Crie e gerencie agentes especializados para atendimento
            </p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={(open) => {
            setCreateDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-purple-500">
                <Plus className="h-4 w-4 mr-2" />
                Criar Agente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingAgent ? "Editar Agente" : "Criar Novo Agente"}</DialogTitle>
                <DialogDescription>
                  Configure um agente de IA especializado para atendimento
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome do Agente</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Agente de Vendas"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descreva o propósito deste agente"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Tipo</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as AgentType })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vendas">Vendas</SelectItem>
                        <SelectItem value="suporte">Suporte</SelectItem>
                        <SelectItem value="sdr">SDR</SelectItem>
                        <SelectItem value="atendimento">Atendimento</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as AgentStatus })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="inativo">Inativo</SelectItem>
                        <SelectItem value="treinamento">Treinamento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="system_prompt">Prompt do Sistema</Label>
                  <Textarea
                    id="system_prompt"
                    value={formData.system_prompt}
                    onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
                    placeholder="Defina como o agente deve se comportar e responder"
                    rows={6}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="temperature">Temperatura</Label>
                    <Input
                      id="temperature"
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={formData.temperature}
                      onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="max_tokens">Max Tokens</Label>
                    <Input
                      id="max_tokens"
                      type="number"
                      value={formData.max_tokens}
                      onChange={(e) => setFormData({ ...formData, max_tokens: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <Button onClick={handleCreateOrUpdate} className="w-full">
                  {editingAgent ? "Atualizar Agente" : "Criar Agente"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Agentes</CardTitle>
              <Bot className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{agents.length}</div>
              <p className="text-xs text-muted-foreground">
                {agents.filter(a => a.status === 'ativo').length} ativos
              </p>
            </CardContent>
          </Card>
          <Card className="border-green-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Agentes Ativos</CardTitle>
              <Bot className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{agents.filter(a => a.status === 'ativo').length}</div>
              <p className="text-xs text-muted-foreground">Prontos para atender</p>
            </CardContent>
          </Card>
          <Card className="border-purple-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Modelo IA</CardTitle>
              <Bot className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Gemini 2.5</div>
              <p className="text-xs text-muted-foreground">Google Flash</p>
            </CardContent>
          </Card>
        </div>

        {/* Agents List */}
        {agents.length === 0 ? (
          <Card className="p-12 text-center">
            <Bot className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum agente criado</h3>
            <p className="text-muted-foreground mb-4">
              Crie seu primeiro agente de IA para começar a atender clientes
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Agente
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <Card key={agent.id} className="group hover:border-primary/50 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{agent.name}</CardTitle>
                      {agent.description && (
                        <CardDescription className="mt-1">{agent.description}</CardDescription>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(agent)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(agent.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Badge variant="outline" className={getTypeColor(agent.type)}>
                      {agent.type}
                    </Badge>
                    <Badge className={getStatusBadge(agent.status)}>
                      {agent.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Modelo: {agent.model}</p>
                    <p>Temperatura: {agent.temperature}</p>
                    <p>Max Tokens: {agent.max_tokens}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentsIA;
