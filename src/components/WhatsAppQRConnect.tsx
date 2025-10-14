import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, Phone, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface WhatsAppQRConnectProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function WhatsAppQRConnect({ open, onOpenChange, onSuccess }: WhatsAppQRConnectProps) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [phoneNumber, setPhoneNumber] = useState("");
  const [instanceName, setInstanceName] = useState("");

  const handleConnect = async () => {
    if (!phoneNumber.trim()) {
      toast.error("Por favor, insira o número do WhatsApp");
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      // Salvar conexão via Edge Function
      const { data, error } = await supabase.functions.invoke("whatsapp-qr-connect", {
        body: {
          action: 'save_manual',
          orgId: user.id,
          name: instanceName || `WhatsApp - ${phoneNumber}`,
          credentials: {
            phone_number: phoneNumber,
            instance_id: `wa_${Date.now()}`,
            connected_at: new Date().toISOString()
          }
        },
      });

      if (error) throw error;

      if (data.success) {
        setStep('success');
        toast.success("WhatsApp conectado com sucesso!");

        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error(data.error || 'Erro desconhecido');
      }

    } catch (error: any) {
      console.error("Error connecting WhatsApp:", error);
      toast.error(error.message || "Erro ao conectar WhatsApp");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('form');
    setPhoneNumber("");
    setInstanceName("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold">
              <Phone className="h-6 w-6" />
            </div>
            Conectar WhatsApp
          </DialogTitle>
          <DialogDescription>
            Conecte seu WhatsApp de forma simples
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {step === 'form' && (
            <>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Conexão Simplificada</strong><br/>
                  Para QR Code real com Baileys, é necessário um backend Node.js separado.
                  <br/><br/>
                  <strong>Alternativas recomendadas:</strong><br/>
                  • <a href="https://waha.devlike.pro" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">WAHA</a> - WhatsApp HTTP API<br/>
                  • <a href="https://wppconnect.io" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">WPPConnect</a> - WhatsApp Web Protocol<br/>
                  • <a href="https://evolution-api.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Evolution API</a> - WhatsApp Multi-device
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="instanceName">Nome da Instância (opcional)</Label>
                  <Input
                    id="instanceName"
                    placeholder="Ex: Atendimento Principal"
                    value={instanceName}
                    onChange={(e) => setInstanceName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Número do WhatsApp *</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="Ex: 5511999999999"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Formato: código do país + DDD + número (sem espaços ou caracteres especiais)
                  </p>
                </div>
              </div>

              <Alert className="bg-blue-500/10 border-blue-500/20">
                <AlertDescription className="text-sm">
                  <strong>Para usar QR Code real:</strong><br/>
                  1. Configure um servidor Node.js com Baileys<br/>
                  2. Ou use serviços como WAHA, WPPConnect ou Evolution API<br/>
                  3. Conecte via API desses serviços<br/>
                  <br/>
                  Esta versão salva apenas as informações para uso futuro.
                </AlertDescription>
              </Alert>

              <div className="flex items-center justify-between pt-4 border-t">
                <Button variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleConnect}
                  disabled={loading}
                  className="bg-gradient-to-r from-green-500 to-green-600"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar Conexão'
                  )}
                </Button>
              </div>
            </>
          )}

          {step === 'success' && (
            <>
              <Alert className="bg-green-500/10 border-green-500/20">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription>
                  <strong>Informações Salvas!</strong><br/>
                  WhatsApp {phoneNumber} foi adicionado com sucesso.
                </AlertDescription>
              </Alert>

              <Alert>
                <AlertDescription className="text-sm">
                  <strong>Próximos passos:</strong><br/>
                  1. Configure um serviço de WhatsApp (WAHA, WPPConnect, etc.)<br/>
                  2. Conecte via API usando as credenciais salvas<br/>
                  3. O canal estará pronto para enviar/receber mensagens
                </AlertDescription>
              </Alert>

              <div className="flex justify-end pt-4 border-t">
                <Button onClick={handleClose} className="bg-gradient-to-r from-green-500 to-green-600">
                  Concluir
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
