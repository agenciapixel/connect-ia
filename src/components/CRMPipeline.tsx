import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Building2,
  Phone,
  Mail,
  Globe,
  ArrowRight,
  Check,
  TrendingUp,
  DollarSign,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  User,
  Save,
  X
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Prospect {
  id: string;
  pipeline_stage: string;
  places: {
    name: string;
    formatted_address: string;
    phone_number?: string;
    website?: string;
    types?: string[];
  };
  expected_revenue?: number;
  probability?: number;
  notes?: string;
}

interface CRMPipelineProps {
  prospects: Prospect[];
  onRefresh: () => void;
}

const PIPELINE_STAGES = [
  { id: 'lead', label: 'Leads', color: 'bg-gray-500', icon: Building2 },
  { id: 'contacted', label: 'Contactados', color: 'bg-blue-500', icon: Phone },
  { id: 'qualified', label: 'Qualificados', color: 'bg-purple-500', icon: Check },
  { id: 'proposal', label: 'Proposta', color: 'bg-yellow-500', icon: Mail },
  { id: 'negotiation', label: 'Negociação', color: 'bg-orange-500', icon: TrendingUp },
  { id: 'won', label: 'Ganhos', color: 'bg-green-500', icon: DollarSign },
];

export function CRMPipeline({ prospects, onRefresh }: CRMPipelineProps) {
  const [movingProspect, setMovingProspect] = useState<string | null>(null);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [showProspectModal, setShowProspectModal] = useState(false);
  const [editingProspect, setEditingProspect] = useState<Prospect | null>(null);
  const [draggedProspect, setDraggedProspect] = useState<string | null>(null);

  const getProspectsByStage = (stage: string) => {
    return prospects.filter(p => p.pipeline_stage === stage);
  };

  const moveToStage = async (prospectId: string, newStage: string) => {
    setMovingProspect(prospectId);
    try {
      const { error } = await supabase
        .from('prospects')
        .update({
          pipeline_stage: newStage,
          last_activity: new Date().toISOString()
        })
        .eq('id', prospectId);

      if (error) throw error;

      toast.success(`Prospect movido para ${PIPELINE_STAGES.find(s => s.id === newStage)?.label}`);
      onRefresh();
    } catch (error: any) {
      console.error('Error moving prospect:', error);
      toast.error('Erro ao mover prospect');
    } finally {
      setMovingProspect(null);
    }
  };

  const exportToContacts = async (prospectId: string) => {
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

      const prospect = prospects.find(p => p.id === prospectId);
      if (!prospect) return;

      // Criar contato
      const { error: contactError } = await supabase.from("contacts").insert({
        org_id: member.org_id,
        full_name: prospect.places?.name || "Sem nome",
        phone_e164: prospect.places?.phone_number || null,
        tags: prospect.places?.types?.slice(0, 3) || [],
      });

      if (contactError) throw contactError;

      // Atualizar status do prospect
      const { error: updateError } = await supabase
        .from("prospects")
        .update({ status: "imported" })
        .eq("id", prospectId);

      if (updateError) throw updateError;

      toast.success("Prospect exportado para Contatos!");
      onRefresh();
    } catch (error: any) {
      console.error("Error:", error);
      toast.error("Erro ao exportar prospect");
    }
  };

  const calculateStageValue = (stage: string) => {
    const stageProspects = getProspectsByStage(stage);
    return stageProspects.reduce((sum, p) => sum + (p.expected_revenue || 0), 0);
  };

  // Funções para o modal
  const handleOpenProspectModal = (prospect: Prospect) => {
    setSelectedProspect(prospect);
    setEditingProspect({ ...prospect });
    setShowProspectModal(true);
  };

  const handleCloseProspectModal = () => {
    setShowProspectModal(false);
    setSelectedProspect(null);
    setEditingProspect(null);
  };

  const handleSaveProspect = async () => {
    if (!editingProspect) return;

    try {
      const { error } = await supabase
        .from('prospects')
        .update({
          pipeline_stage: editingProspect.pipeline_stage,
          expected_revenue: editingProspect.expected_revenue,
          probability: editingProspect.probability,
          notes: editingProspect.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingProspect.id);

      if (error) throw error;

      toast.success('Prospect atualizado com sucesso!');
      onRefresh();
      handleCloseProspectModal();
    } catch (error: any) {
      console.error('Error updating prospect:', error);
      toast.error('Erro ao atualizar prospect');
    }
  };

  const handleDeleteProspect = async () => {
    if (!editingProspect) return;

    try {
      const { error } = await supabase
        .from('prospects')
        .delete()
        .eq('id', editingProspect.id);

      if (error) throw error;

      toast.success('Prospect excluído com sucesso!');
      onRefresh();
      handleCloseProspectModal();
    } catch (error: any) {
      console.error('Error deleting prospect:', error);
      toast.error('Erro ao excluir prospect');
    }
  };

  // Funções para drag & drop
  const handleDragStart = (e: React.DragEvent, prospectId: string) => {
    setDraggedProspect(prospectId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetStage: string) => {
    e.preventDefault();
    
    if (!draggedProspect) return;

    const prospect = prospects.find(p => p.id === draggedProspect);
    if (!prospect || prospect.pipeline_stage === targetStage) {
      setDraggedProspect(null);
      return;
    }

    await moveToStage(draggedProspect, targetStage);
    setDraggedProspect(null);
  };

  const handleDragEnd = () => {
    setDraggedProspect(null);
  };

  return (
    <div className="space-y-6">
      {/* Pipeline Kanban - Cards dos Prospects */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
        {PIPELINE_STAGES.map((stage, index) => {
          const stageProspects = getProspectsByStage(stage.id);
          const Icon = stage.icon;

          return (
            <div 
              key={stage.id} 
              className={`space-y-3 relative ${
                index < PIPELINE_STAGES.length - 1 ? 'lg:border-r lg:border-gray-200 lg:pr-6' : ''
              }`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              <div className="flex flex-col items-center space-y-2 mb-4">
                <div className="flex items-center space-x-2">
                  <Icon className={`h-5 w-5 ${stage.color.replace('bg-', 'text-')}`} />
                  <h3 className="font-semibold text-sm text-center">{stage.label}</h3>
                </div>
                <Badge className={`${stage.color} text-white`}>{stageProspects.length}</Badge>
              </div>
              
              <div className="space-y-3 min-h-[200px] p-2">
                {stageProspects.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    <Icon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhum prospect</p>
                    <p className="text-xs mt-1">Arraste um prospect aqui</p>
                  </div>
                ) : (
                  stageProspects.map((prospect) => (
                    <ProspectCard
                      key={prospect.id}
                      prospect={prospect}
                      currentStage={stage.id}
                      onMove={moveToStage}
                      onExport={exportToContacts}
                      onOpenModal={handleOpenProspectModal}
                      onDragStart={(e) => handleDragStart(e, prospect.id)}
                      onDragEnd={handleDragEnd}
                      isMoving={movingProspect === prospect.id}
                      isDragging={draggedProspect === prospect.id}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Detalhes do Prospect */}
      <Dialog open={showProspectModal} onOpenChange={handleCloseProspectModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              {editingProspect?.places?.name || 'Detalhes do Prospect'}
            </DialogTitle>
            <DialogDescription>
              Visualize e edite as informações do prospect
            </DialogDescription>
          </DialogHeader>

          {editingProspect && (
            <div className="space-y-6">
              {/* Informações Básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Negócio</Label>
                  <Input
                    id="name"
                    value={editingProspect.places?.name || ''}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    value={editingProspect.places?.formatted_address || ''}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={editingProspect.places?.phone_number || ''}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={editingProspect.places?.website || ''}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </div>

              {/* Informações do Pipeline */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stage">Estágio do Pipeline</Label>
                  <Select
                    value={editingProspect.pipeline_stage}
                    onValueChange={(value) => setEditingProspect({...editingProspect, pipeline_stage: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PIPELINE_STAGES.map((stage) => (
                        <SelectItem key={stage.id} value={stage.id}>
                          {stage.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="revenue">Receita Esperada (R$)</Label>
                  <Input
                    id="revenue"
                    type="number"
                    value={editingProspect.expected_revenue || ''}
                    onChange={(e) => setEditingProspect({...editingProspect, expected_revenue: Number(e.target.value)})}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="probability">Probabilidade (%)</Label>
                  <Input
                    id="probability"
                    type="number"
                    min="0"
                    max="100"
                    value={editingProspect.probability || ''}
                    onChange={(e) => setEditingProspect({...editingProspect, probability: Number(e.target.value)})}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Notas */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  value={editingProspect.notes || ''}
                  onChange={(e) => setEditingProspect({...editingProspect, notes: e.target.value})}
                  placeholder="Adicione observações sobre este prospect..."
                  rows={4}
                />
              </div>

              {/* Ações Rápidas */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-2">
                  {editingProspect.pipeline_stage !== 'won' && (
                    <Button
                      onClick={() => {
                        const currentIndex = PIPELINE_STAGES.findIndex(s => s.id === editingProspect.pipeline_stage);
                        const nextStage = PIPELINE_STAGES[currentIndex + 1];
                        if (nextStage) {
                          setEditingProspect({...editingProspect, pipeline_stage: nextStage.id});
                        }
                      }}
                      variant="outline"
                      size="sm"
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Próximo Estágio
                    </Button>
                  )}
                  {editingProspect.pipeline_stage === 'won' && (
                    <Button
                      onClick={() => exportToContacts(editingProspect.id)}
                      variant="outline"
                      size="sm"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Exportar para Contatos
                    </Button>
                  )}
                </div>
                <Button
                  onClick={handleDeleteProspect}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseProspectModal}>
              <X className="h-4 w-4 mr-2" />
              Fechar
            </Button>
            <Button onClick={handleSaveProspect}>
              <Save className="h-4 w-4 mr-2" />
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface ProspectCardProps {
  prospect: Prospect;
  currentStage: string;
  onMove: (prospectId: string, newStage: string) => void;
  onExport: (prospectId: string) => void;
  onOpenModal: (prospect: Prospect) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  isMoving: boolean;
  isDragging?: boolean;
}

function ProspectCard({ 
  prospect, 
  currentStage, 
  onMove, 
  onExport, 
  onOpenModal,
  onDragStart,
  onDragEnd,
  isMoving, 
  isDragging = false 
}: ProspectCardProps) {
  const currentStageIndex = PIPELINE_STAGES.findIndex(s => s.id === currentStage);
  const nextStage = PIPELINE_STAGES[currentStageIndex + 1];
  const canMoveForward = nextStage && nextStage.id !== 'won';

  return (
    <Card 
      className={`p-3 hover:shadow-md transition-all cursor-pointer group select-none ${
        isDragging ? 'opacity-50 rotate-2 scale-105' : ''
      }`}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={() => onOpenModal(prospect)}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
              {prospect.places?.name || "Sem nome"}
            </h4>
            {prospect.places?.types && prospect.places.types.length > 0 && (
              <Badge variant="secondary" className="text-xs mt-1">
                {prospect.places.types[0].replace(/_/g, " ")}
              </Badge>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            <Edit className="h-3 w-3" />
          </div>
        </div>

        {prospect.places?.formatted_address && (
          <p className="text-xs text-muted-foreground line-clamp-1">
            {prospect.places.formatted_address}
          </p>
        )}

        {prospect.expected_revenue && (
          <div className="flex items-center gap-1 text-xs font-medium text-green-600">
            <DollarSign className="h-3 w-3" />
            R$ {prospect.expected_revenue.toLocaleString('pt-BR')}
          </div>
        )}

        {prospect.probability && (
          <div className="flex items-center gap-1 text-xs text-blue-600">
            <TrendingUp className="h-3 w-3" />
            {prospect.probability}% chance
          </div>
        )}

        <div className="flex gap-1 pt-2 border-t" onClick={(e) => e.stopPropagation()}>
          {canMoveForward && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-7 text-xs"
              onClick={() => onMove(prospect.id, nextStage.id)}
              disabled={isMoving}
            >
              <ArrowRight className="h-3 w-3 mr-1" />
              {nextStage.label}
            </Button>
          )}

          {currentStage === 'won' && (
            <Button
              size="sm"
              variant="default"
              className="flex-1 h-7 text-xs"
              onClick={() => onExport(prospect.id)}
              disabled={isMoving}
            >
              <Check className="h-3 w-3 mr-1" />
              Exportar
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
