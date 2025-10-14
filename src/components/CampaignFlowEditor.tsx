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
  AlertCircle
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type StepType = "message" | "delay" | "condition" | "action";

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
  const [editingStep, setEditingStep] = useState<Step | null>(null);
  const [stepType, setStepType] = useState<StepType>("message");
  const [stepConfig, setStepConfig] = useState<any>({
    message: "",
    delay: 1,
    delayUnit: "hours",
    condition: "",
    action: "",
  });

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

  const getStepIcon = (type: StepType) => {
    const icons = {
      message: MessageSquare,
      delay: Clock,
      condition: GitBranch,
      action: Play,
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
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={() => onSave(steps)} className="bg-gradient-to-r from-primary to-primary-glow">
            <Save className="h-4 w-4 mr-2" />
            Salvar Fluxo
          </Button>
        </div>
      </div>

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
              <Select value={stepType} onValueChange={(value: any) => setStepType(value)}>
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
                    onValueChange={(value: any) => setStepConfig({ ...stepConfig, delayUnit: value })}
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
    </div>
  );
}