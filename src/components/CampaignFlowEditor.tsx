import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Clock, 
  MessageSquare, 
  GitBranch, 
  Trash2, 
  MoveUp, 
  MoveDown, 
  Play,
  Save,
  Timer,
  CheckCircle2,
  AlertCircle,
  Tag,
  Zap,
  Users,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Star,
  Heart,
  ThumbsUp,
  Share2,
  Download,
  Upload,
  Database,
  Globe,
  Shield,
  Bell,
  Settings,
  Target,
  TrendingUp,
  BarChart3,
  Send,
  Reply,
  Eye,
  MousePointer,
  Link,
  Image,
  FileText,
  Video,
  Music
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

type StepType = "message" | "delay" | "condition" | "action" | "wait_for_response" | "tag" | "webhook" | "split" | "merge" | "survey" | "notification" | "calendar" | "location";

interface Step {
  id: string;
  type: StepType;
  name: string;
  config: {
    message?: string;
    delay?: number;
    delayUnit?: "minutes" | "hours" | "days";
    condition?: string;
    action?: string;
    waitTimeout?: number;
    tagName?: string;
    webhookUrl?: string;
    webhookMethod?: "GET" | "POST" | "PUT";
    splitType?: "random" | "percentage" | "custom";
    splitPercentage?: number;
    surveyQuestions?: string[];
    notificationMessage?: string;
    calendarEvent?: string;
    locationType?: "request" | "share";
  };
}

interface CampaignFlowEditorProps {
  campaignName: string;
  channelType: string;
  onSave: (steps: Step[]) => void;
  onCancel: () => void;
  initialSteps?: Step[];
}

export default function CampaignFlowEditor({ 
  campaignName, 
  channelType, 
  onSave, 
  onCancel,
  initialSteps = []
}: CampaignFlowEditorProps) {
  const [steps, setSteps] = useState<Step[]>(initialSteps);
  const [showStepDialog, setShowStepDialog] = useState(false);
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [editingStep, setEditingStep] = useState<Step | null>(null);
  const [stepType, setStepType] = useState<StepType>("message");
  const [stepConfig, setStepConfig] = useState<any>({
    message: "",
    delay: 1,
    delayUnit: "hours",
    condition: "",
    action: "",
    waitTimeout: 60,
    tagName: "",
    webhookUrl: "",
    webhookMethod: "POST",
    splitType: "random",
    splitPercentage: 50,
    surveyQuestions: [],
    notificationMessage: "",
    calendarEvent: "",
    locationType: "request",
  });
  
  // Estados para IA
  const [aiLoading, setAiLoading] = useState(false);
  const [campaignObjective, setCampaignObjective] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [campaignTone, setCampaignTone] = useState("");

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const addStep = () => {
    const newStep: Step = {
      id: editingStep?.id || generateId(),
      type: stepType,
      name: getStepName(stepType),
      config: { ...stepConfig },
    };

    if (editingStep) {
      setSteps(steps.map(s => s.id === editingStep.id ? newStep : s));
    } else {
      setSteps([...steps, newStep]);
    }

    resetStepDialog();
  };

  const getStepName = (type: StepType) => {
    const names = {
      message: "Enviar Mensagem",
      delay: "Aguardar",
      condition: "Condição",
      action: "Ação",
      wait_for_response: "Aguardar Resposta",
      tag: "Adicionar Tag",
      webhook: "Webhook",
      split: "Divisão de Fluxo",
      merge: "Mesclagem de Fluxo",
      survey: "Pesquisa",
      notification: "Notificação",
      calendar: "Agendamento",
      location: "Localização",
    };
    return names[type];
  };

  const resetStepDialog = () => {
    setShowStepDialog(false);
    setEditingStep(null);
    setStepType("message");
    setStepConfig({
      message: "",
      delay: 1,
      delayUnit: "hours",
      condition: "",
      action: "",
      waitTimeout: 60,
      tagName: "",
      webhookUrl: "",
      webhookMethod: "POST",
      splitType: "random",
      splitPercentage: 50,
      surveyQuestions: [],
      notificationMessage: "",
      calendarEvent: "",
      locationType: "request",
    });
  };

  const deleteStep = (id: string) => {
    setSteps(steps.filter(s => s.id !== id));
  };

  const moveStep = (index: number, direction: "up" | "down") => {
    const newSteps = [...steps];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < steps.length) {
      [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
      setSteps(newSteps);
    }
  };

  const openEditStep = (step: Step) => {
    setEditingStep(step);
    setStepType(step.type);
    setStepConfig(step.config);
    setShowStepDialog(true);
  };

  // Função para gerar fluxo com IA
  const generateFlowWithAI = async () => {
    if (!campaignObjective.trim()) {
      toast.error("Por favor, descreva o objetivo da campanha");
      return;
    }

    setAiLoading(true);
    try {
      // Simular chamada para IA (aqui você integraria com uma API real)
      await new Promise(resolve => setTimeout(resolve, 2000));

      const generatedSteps: Step[] = generateStepsBasedOnObjective(
        campaignObjective,
        targetAudience,
        campaignTone,
        channelType
      );

      setSteps(generatedSteps);
      toast.success("Fluxo gerado com IA com sucesso!");
      setShowAiAssistant(false);
    } catch (error) {
      toast.error("Erro ao gerar fluxo com IA");
    } finally {
      setAiLoading(false);
    }
  };

  // Função para gerar etapas baseadas no objetivo
  const generateStepsBasedOnObjective = (
    objective: string,
    audience: string,
    tone: string,
    channel: string
  ): Step[] => {
    const objectiveLower = objective.toLowerCase();
    const steps: Step[] = [];

    // Etapa inicial - mensagem de boas-vindas
    steps.push({
      id: generateId(),
      type: "message",
      name: "Mensagem de Boas-vindas",
      config: {
        message: generateWelcomeMessage(objective, audience, tone)
      }
    });

    // Aguardar resposta
    steps.push({
      id: generateId(),
      type: "wait_for_response",
      name: "Aguardar Resposta",
      config: {
        waitTimeout: 3600 // 1 hora
      }
    });

    // Condição baseada no objetivo
    if (objectiveLower.includes("agendamento") || objectiveLower.includes("reunião")) {
      steps.push({
        id: generateId(),
        type: "calendar",
        name: "Solicitar Agendamento",
        config: {
          calendarEvent: "Reunião de apresentação"
        }
      });
    } else if (objectiveLower.includes("pesquisa") || objectiveLower.includes("feedback")) {
      steps.push({
        id: generateId(),
        type: "survey",
        name: "Pesquisa de Satisfação",
        config: {
          surveyQuestions: ["Como você avalia nosso atendimento?", "Que nota daria de 1 a 10?"]
        }
      });
    } else if (objectiveLower.includes("localização") || objectiveLower.includes("endereço")) {
      steps.push({
        id: generateId(),
        type: "location",
        name: "Solicitar Localização",
        config: {
          locationType: "request"
        }
      });
    } else {
      // Fluxo padrão
      steps.push({
        id: generateId(),
        type: "message",
        name: "Mensagem de Follow-up",
        config: {
          message: generateFollowUpMessage(objective, tone)
        }
      });
    }

    // Aguardar novamente
    steps.push({
      id: generateId(),
        type: "delay",
        name: "Aguardar",
        config: {
          delay: 24,
          delayUnit: "hours"
        }
    });

    // Mensagem final
    steps.push({
      id: generateId(),
      type: "message",
      name: "Mensagem Final",
      config: {
        message: generateFinalMessage(objective, tone)
      }
    });

    // Adicionar tag
    steps.push({
      id: generateId(),
      type: "tag",
      name: "Marcar como Processado",
      config: {
        tagName: `campanha_${objective.toLowerCase().replace(/\s+/g, '_')}`
      }
    });

    return steps;
  };

  const generateWelcomeMessage = (objective: string, audience: string, tone: string): string => {
    const toneMessages = {
      formal: "Olá! Espero que esteja bem.",
      amigável: "Oi! Tudo bem? 😊",
      profissional: "Bom dia! Espero que esteja tudo bem.",
      casual: "E aí! Como está?"
    };

    return `${toneMessages[tone as keyof typeof toneMessages] || toneMessages.amigável}

${objective}

Como posso ajudá-lo hoje?`;
  };

  const generateFollowUpMessage = (objective: string, tone: string): string => {
    return `Olá! Vi que você demonstrou interesse em ${objective.toLowerCase()}.

Gostaria de saber mais detalhes ou tem alguma dúvida específica?

Estou aqui para ajudar! 😊`;
  };

  const generateFinalMessage = (objective: string, tone: string): string => {
    return `Olá! 

Espero que tenha conseguido todas as informações sobre ${objective.toLowerCase()}.

Se precisar de mais alguma coisa, é só me chamar!

Obrigado pelo contato! 🙏`;
  };

  const getStepIcon = (type: StepType) => {
    const icons = {
      message: MessageSquare,
      delay: Clock,
      condition: GitBranch,
      action: Play,
      wait_for_response: Reply,
      tag: Tag,
      webhook: Zap,
      split: GitBranch,
      merge: GitBranch,
      survey: BarChart3,
      notification: Bell,
      calendar: Calendar,
      location: MapPin,
    };
    const Icon = icons[type];
    return <Icon className="h-5 w-5" />;
  };

  const getStepColor = (type: StepType) => {
    const colors = {
      message: "from-blue-500 to-blue-600",
      delay: "from-orange-500 to-orange-600",
      condition: "from-purple-500 to-purple-600",
      action: "from-green-500 to-green-600",
      wait_for_response: "from-yellow-500 to-yellow-600",
      tag: "from-pink-500 to-pink-600",
      webhook: "from-indigo-500 to-indigo-600",
      split: "from-red-500 to-red-600",
      merge: "from-teal-500 to-teal-600",
      survey: "from-cyan-500 to-cyan-600",
      notification: "from-amber-500 to-amber-600",
      calendar: "from-violet-500 to-violet-600",
      location: "from-emerald-500 to-emerald-600",
    };
    return colors[type];
  };

  const renderStepPreview = (step: Step) => {
    switch (step.type) {
      case "message":
        return <p className="text-sm text-muted-foreground line-clamp-2">{step.config.message || "Sem mensagem"}</p>;
      case "delay":
        return (
          <p className="text-sm text-muted-foreground">
            Aguardar {step.config.delay} {step.config.delayUnit}
          </p>
        );
      case "condition":
        return <p className="text-sm text-muted-foreground">{step.config.condition || "Sem condição"}</p>;
      case "action":
        return <p className="text-sm text-muted-foreground">{step.config.action || "Sem ação"}</p>;
      case "wait_for_response":
        return (
          <p className="text-sm text-muted-foreground">
            Aguardar resposta por {step.config.waitTimeout ? Math.floor(step.config.waitTimeout / 60) : 60} minutos
          </p>
        );
      case "tag":
        return <p className="text-sm text-muted-foreground">Tag: {step.config.tagName || "Sem tag"}</p>;
      case "webhook":
        return <p className="text-sm text-muted-foreground">Webhook: {step.config.webhookUrl || "Sem URL"}</p>;
      case "split":
        return (
          <p className="text-sm text-muted-foreground">
            Dividir fluxo - {step.config.splitType === "percentage" ? `${step.config.splitPercentage}%` : step.config.splitType}
          </p>
        );
      case "merge":
        return <p className="text-sm text-muted-foreground">Mesclar fluxos</p>;
      case "survey":
        return (
          <p className="text-sm text-muted-foreground">
            {step.config.surveyQuestions?.length || 0} pergunta(s)
          </p>
        );
      case "notification":
        return <p className="text-sm text-muted-foreground">{step.config.notificationMessage || "Sem mensagem"}</p>;
      case "calendar":
        return <p className="text-sm text-muted-foreground">Evento: {step.config.calendarEvent || "Sem evento"}</p>;
      case "location":
        return <p className="text-sm text-muted-foreground">{step.config.locationType === "request" ? "Solicitar localização" : "Compartilhar localização"}</p>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{campaignName}</h2>
          <p className="text-muted-foreground capitalize">Canal: {channelType}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowAiAssistant(true)}
            className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-200 text-purple-700 hover:from-purple-500/20 hover:to-blue-500/20"
          >
            <Zap className="h-4 w-4 mr-2" />
            Assistente IA
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={() => onSave(steps)} className="bg-gradient-to-r from-primary to-primary-glow">
            <Save className="h-4 w-4 mr-2" />
            Salvar Fluxo
          </Button>
        </div>
      </div>

      {/* Configurações de Público */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Configuração de Público
          </CardTitle>
          <CardDescription>
            Defina o público-alvo e critérios de segmentação para esta campanha
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="audience-type">Tipo de Público</Label>
              <Select value={targetAudience} onValueChange={setTargetAudience}>
                <SelectTrigger id="audience-type">
                  <SelectValue placeholder="Selecione o público" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos-contatos">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Todos os Contatos
                    </div>
                  </SelectItem>
                  <SelectItem value="clientes-ativos">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Clientes Ativos
                    </div>
                  </SelectItem>
                  <SelectItem value="prospects">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Prospects
                    </div>
                  </SelectItem>
                  <SelectItem value="clientes-vip">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Clientes VIP
                    </div>
                  </SelectItem>
                  <SelectItem value="contatos-inativos">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Contatos Inativos
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="audience-size">Tamanho Estimado</Label>
              <div className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
                {targetAudience === "todos-contatos" && "~1,250 contatos"}
                {targetAudience === "clientes-ativos" && "~850 contatos"}
                {targetAudience === "prospects" && "~400 contatos"}
                {targetAudience === "clientes-vip" && "~150 contatos"}
                {targetAudience === "contatos-inativos" && "~200 contatos"}
                {!targetAudience && "Selecione um público para ver o tamanho"}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Critérios de Segmentação</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Última interação recente</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Engajamento alto</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Canal preferido: {channelType}</span>
                </div>
              </div>
            </div>
          </div>

          {targetAudience && (
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">Sugestões de IA para {targetAudience.replace('-', ' ')}</span>
              </div>
              <div className="text-sm text-blue-700">
                {targetAudience === "todos-contatos" && "Use tom universal e mensagens que se aplicam a todos os perfis"}
                {targetAudience === "clientes-ativos" && "Foque em valor agregado e oportunidades de upsell"}
                {targetAudience === "prospects" && "Use tom educativo e construa relacionamento antes de vender"}
                {targetAudience === "clientes-vip" && "Ofereça conteúdo exclusivo e tratamento personalizado"}
                {targetAudience === "contatos-inativos" && "Use tom reativo e ofereça incentivos para reengajamento"}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Flow Steps */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Fluxo da Campanha</CardTitle>
              <CardDescription>Configure as etapas da sua automação</CardDescription>
            </div>
            <Button onClick={() => setShowStepDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Etapa
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {steps.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma etapa adicionada</h3>
              <p className="text-muted-foreground mb-4">Comece adicionando a primeira etapa do seu fluxo</p>
              <Button onClick={() => setShowStepDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeira Etapa
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div key={step.id} className="relative">
                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className="absolute left-6 top-full h-3 w-0.5 bg-border -translate-y-1/2 z-0" />
                  )}
                  
                  <Card className="border-2 hover:border-primary/50 transition-all relative z-10">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${getStepColor(step.type)} flex items-center justify-center text-white flex-shrink-0`}>
                          {getStepIcon(step.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{step.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              Etapa {index + 1}
                            </Badge>
                          </div>
                          {renderStepPreview(step)}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveStep(index, "up")}
                            disabled={index === 0}
                          >
                            <MoveUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveStep(index, "down")}
                            disabled={index === steps.length - 1}
                          >
                            <MoveDown className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditStep(step)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteStep(step.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
              
              {/* Success Indicator */}
              <div className="flex items-center gap-3 pt-2">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold">Fim do Fluxo</h4>
                  <p className="text-sm text-muted-foreground">Campanha finalizada</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Step Dialog */}
      <Dialog open={showStepDialog} onOpenChange={setShowStepDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingStep ? "Editar Etapa" : "Adicionar Etapa"}</DialogTitle>
            <DialogDescription>Configure a etapa do fluxo de automação</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tipo de Etapa</Label>
              <Select value={stepType} onValueChange={(value: string) => setStepType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="message">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Enviar Mensagem
                    </div>
                  </SelectItem>
                  <SelectItem value="delay">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Aguardar (Timer)
                    </div>
                  </SelectItem>
                  <SelectItem value="condition">
                    <div className="flex items-center gap-2">
                      <GitBranch className="h-4 w-4" />
                      Condição
                    </div>
                  </SelectItem>
                  <SelectItem value="action">
                    <div className="flex items-center gap-2">
                      <Play className="h-4 w-4" />
                      Ação
                    </div>
                  </SelectItem>
                  <SelectItem value="wait_for_response">
                    <div className="flex items-center gap-2">
                      <Reply className="h-4 w-4" />
                      Aguardar Resposta
                    </div>
                  </SelectItem>
                  <SelectItem value="tag">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Adicionar Tag
                    </div>
                  </SelectItem>
                  <SelectItem value="webhook">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Webhook
                    </div>
                  </SelectItem>
                  <SelectItem value="split">
                    <div className="flex items-center gap-2">
                      <GitBranch className="h-4 w-4" />
                      Divisão de Fluxo
                    </div>
                  </SelectItem>
                  <SelectItem value="merge">
                    <div className="flex items-center gap-2">
                      <GitBranch className="h-4 w-4" />
                      Mesclagem de Fluxo
                    </div>
                  </SelectItem>
                  <SelectItem value="survey">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Pesquisa
                    </div>
                  </SelectItem>
                  <SelectItem value="notification">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      Notificação
                    </div>
                  </SelectItem>
                  <SelectItem value="calendar">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Agendamento
                    </div>
                  </SelectItem>
                  <SelectItem value="location">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Localização
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {stepType === "message" && (
              <div className="space-y-2">
                <Label>Mensagem</Label>
                <Textarea
                  placeholder="Digite a mensagem que será enviada..."
                  value={stepConfig.message}
                  onChange={(e) => setStepConfig({ ...stepConfig, message: e.target.value })}
                  rows={5}
                />
                <p className="text-xs text-muted-foreground">
                  Você pode usar variáveis como {"{nome}"}, {"{email}"}, etc.
                </p>
              </div>
            )}

            {stepType === "delay" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tempo de Espera</Label>
                  <Input
                    type="number"
                    min="1"
                    value={stepConfig.delay}
                    onChange={(e) => setStepConfig({ ...stepConfig, delay: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unidade</Label>
                  <Select 
                    value={stepConfig.delayUnit} 
                    onValueChange={(value: string) => setStepConfig({ ...stepConfig, delayUnit: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minutes">Minutos</SelectItem>
                      <SelectItem value="hours">Horas</SelectItem>
                      <SelectItem value="days">Dias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {stepType === "condition" && (
              <div className="space-y-2">
                <Label>Condição</Label>
                <Select 
                  value={stepConfig.condition} 
                  onValueChange={(value) => setStepConfig({ ...stepConfig, condition: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma condição" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="opened">Abriu a mensagem anterior</SelectItem>
                    <SelectItem value="clicked">Clicou no link</SelectItem>
                    <SelectItem value="replied">Respondeu a mensagem</SelectItem>
                    <SelectItem value="not_opened">Não abriu a mensagem</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {stepType === "action" && (
              <div className="space-y-2">
                <Label>Ação</Label>
                <Select 
                  value={stepConfig.action} 
                  onValueChange={(value) => setStepConfig({ ...stepConfig, action: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma ação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="add_tag">Adicionar Tag</SelectItem>
                    <SelectItem value="remove_tag">Remover Tag</SelectItem>
                    <SelectItem value="move_list">Mover para Lista</SelectItem>
                    <SelectItem value="notify_team">Notificar Equipe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {stepType === "wait_for_response" && (
              <div className="space-y-2">
                <Label>Tempo de Espera (minutos)</Label>
                <Input
                  type="number"
                  min="1"
                  max="1440"
                  value={stepConfig.waitTimeout ? Math.floor(stepConfig.waitTimeout / 60) : 60}
                  onChange={(e) => setStepConfig({ ...stepConfig, waitTimeout: parseInt(e.target.value) * 60 })}
                />
                <p className="text-xs text-muted-foreground">
                  Tempo máximo para aguardar uma resposta do contato
                </p>
              </div>
            )}

            {stepType === "tag" && (
              <div className="space-y-2">
                <Label>Nome da Tag</Label>
                <Input
                  placeholder="Ex: interessado, vip, atendido"
                  value={stepConfig.tagName}
                  onChange={(e) => setStepConfig({ ...stepConfig, tagName: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Tag que será adicionada ao contato
                </p>
              </div>
            )}

            {stepType === "webhook" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>URL do Webhook</Label>
                  <Input
                    placeholder="https://api.exemplo.com/webhook"
                    value={stepConfig.webhookUrl}
                    onChange={(e) => setStepConfig({ ...stepConfig, webhookUrl: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Método HTTP</Label>
                  <Select 
                    value={stepConfig.webhookMethod} 
                    onValueChange={(value) => setStepConfig({ ...stepConfig, webhookMethod: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {stepType === "survey" && (
              <div className="space-y-2">
                <Label>Perguntas da Pesquisa</Label>
                <Textarea
                  placeholder="Digite as perguntas, uma por linha..."
                  value={stepConfig.surveyQuestions?.join('\n') || ''}
                  onChange={(e) => setStepConfig({ ...stepConfig, surveyQuestions: e.target.value.split('\n').filter(q => q.trim()) })}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Uma pergunta por linha
                </p>
              </div>
            )}

            {stepType === "notification" && (
              <div className="space-y-2">
                <Label>Mensagem de Notificação</Label>
                <Textarea
                  placeholder="Mensagem que será enviada como notificação..."
                  value={stepConfig.notificationMessage}
                  onChange={(e) => setStepConfig({ ...stepConfig, notificationMessage: e.target.value })}
                  rows={3}
                />
              </div>
            )}

            {stepType === "calendar" && (
              <div className="space-y-2">
                <Label>Evento do Calendário</Label>
                <Input
                  placeholder="Ex: Reunião de apresentação, Call comercial"
                  value={stepConfig.calendarEvent}
                  onChange={(e) => setStepConfig({ ...stepConfig, calendarEvent: e.target.value })}
                />
              </div>
            )}

            {stepType === "location" && (
              <div className="space-y-2">
                <Label>Tipo de Localização</Label>
                <Select 
                  value={stepConfig.locationType} 
                  onValueChange={(value) => setStepConfig({ ...stepConfig, locationType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="request">Solicitar Localização</SelectItem>
                    <SelectItem value="share">Compartilhar Localização</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetStepDialog}>
              Cancelar
            </Button>
            <Button onClick={addStep}>
              {editingStep ? "Atualizar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Assistente IA */}
      <Dialog open={showAiAssistant} onOpenChange={setShowAiAssistant}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-purple-600" />
              <span>Assistente IA para Fluxo</span>
            </DialogTitle>
            <DialogDescription>
              Descreva o objetivo da campanha e deixe a IA criar o fluxo automaticamente
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="objective">Objetivo da Campanha *</Label>
              <Textarea
                id="objective"
                placeholder="Ex: Agendar reunião com clientes interessados em nosso produto..."
                value={campaignObjective}
                onChange={(e) => setCampaignObjective(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Seja específico sobre o que você quer alcançar com esta campanha
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="audience">Público-Alvo</Label>
                <Select value={targetAudience} onValueChange={setTargetAudience}>
                  <SelectTrigger id="audience">
                    <SelectValue placeholder="Selecione o público" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="novos-contatos">Novos Contatos</SelectItem>
                    <SelectItem value="clientes-existentes">Clientes Existentes</SelectItem>
                    <SelectItem value="prospects">Prospects</SelectItem>
                    <SelectItem value="clientes-vip">Clientes VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tone">Tom da Comunicação</Label>
                <Select value={campaignTone} onValueChange={setCampaignTone}>
                  <SelectTrigger id="tone">
                    <SelectValue placeholder="Selecione o tom" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="profissional">Profissional</SelectItem>
                    <SelectItem value="amigável">Amigável</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Sugestões de Objetivos */}
            <div className="space-y-2">
              <Label>Exemplos de Objetivos</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  "Agendar reunião de apresentação",
                  "Coletar feedback de clientes",
                  "Enviar informações sobre promoções",
                  "Solicitar localização para entrega",
                  "Realizar pesquisa de satisfação",
                  "Convidar para eventos"
                ].map((example) => (
                  <Button
                    key={example}
                    variant="outline"
                    size="sm"
                    onClick={() => setCampaignObjective(example)}
                    className="text-left justify-start h-auto p-2"
                  >
                    <span className="text-sm">{example}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setShowAiAssistant(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={generateFlowWithAI}
              disabled={aiLoading || !campaignObjective.trim()}
              className="bg-gradient-to-r from-purple-600 to-blue-600"
            >
              {aiLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Gerando...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Gerar Fluxo com IA
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}