import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Download, Loader2, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BulkExportProspectsProps {
  prospects: Record<string, unknown>[];
  selectedIds: string[];
  onExportComplete: () => void;
}

export function BulkExportProspects({ prospects, selectedIds, onExportComplete }: BulkExportProspectsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const selectedProspects = prospects.filter(p => selectedIds.includes(p.id));

  const handleBulkExport = async () => {
    setIsExporting(true);
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

      let successCount = 0;
      let errorCount = 0;

      for (const prospect of selectedProspects) {
        try {
          // Verificar se já existe um contato com este telefone
          let shouldInsert = true;

          if (prospect.places?.phone_number) {
            const { data: existingContact } = await supabase
              .from("contacts")
              .select("id")
              .eq("org_id", member.org_id)
              .eq("phone_e164", prospect.places.phone_number)
              .single();

            if (existingContact) {
              shouldInsert = false;
              console.log(`Contato já existe para ${prospect.places.name}`);
            }
          }

          if (shouldInsert) {
            // Criar contato
            const { error: contactError } = await supabase.from("contacts").insert({
              org_id: member.org_id,
              full_name: prospect.places?.name || "Sem nome",
              phone_e164: prospect.places?.phone_number || null,
              tags: prospect.places?.types?.slice(0, 3) || [],
            });

            if (contactError) throw contactError;
          }

          // Atualizar status do prospect
          const { error: updateError } = await supabase
            .from("prospects")
            .update({ status: "imported" })
            .eq("id", prospect.id);

          if (updateError) throw updateError;

          successCount++;
        } catch (error) {
          console.error(`Erro ao exportar prospect ${prospect.id}:`, error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} prospects exportados para Contatos!`);
      }

      if (errorCount > 0) {
        toast.warning(`${errorCount} prospects não puderam ser exportados`);
      }

      setIsOpen(false);
      onExportComplete();
    } catch (error: unknown) {
      console.error("Error:", error);
      toast.error("Erro ao exportar prospects");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          disabled={selectedIds.length === 0}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Exportar para Contatos ({selectedIds.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Exportar Prospects para Contatos
          </DialogTitle>
          <DialogDescription>
            Você está prestes a exportar {selectedIds.length} prospect{selectedIds.length !== 1 ? 's' : ''} para a aba de Contatos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Prospects selecionados:</h4>
            <div className="max-h-[200px] overflow-y-auto space-y-2 border rounded-md p-3">
              {selectedProspects.map((prospect) => (
                <div key={prospect.id} className="flex items-center gap-2 text-sm">
                  <Checkbox checked disabled />
                  <div className="flex-1">
                    <p className="font-medium">{prospect.places?.name || "Sem nome"}</p>
                    <p className="text-xs text-muted-foreground">
                      {prospect.places?.phone_number || "Sem telefone"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-800">
              <strong>O que vai acontecer:</strong>
            </p>
            <ul className="text-sm text-blue-700 mt-2 space-y-1 ml-4 list-disc">
              <li>Cada prospect será criado como um contato</li>
              <li>Informações serão copiadas (nome, telefone, tags)</li>
              <li>Status do prospect mudará para "Importado"</li>
              <li>Prospects aparecerão na aba Contatos</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isExporting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleBulkExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Exportar {selectedIds.length} Prospects
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
