import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { connectWhatsAppChannel } from "@/lib/whatsapp";
import { supabase } from "@/integrations/supabase/client";

interface WhatsAppSetupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function WhatsAppSetup({ open, onOpenChange, onSuccess }: WhatsAppSetupProps) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [webhookInfo, setWebhookInfo] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    phoneNumberId: "",
    businessAccountId: "",
    accessToken: "",
    verifyToken: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleConnect = async () => {
    // Validate fields
    if (!formData.name || !formData.phoneNumberId || !formData.accessToken || !formData.verifyToken) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);
    try {
      // Get current user org
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      const result = await connectWhatsAppChannel({
        name: formData.name,
        phoneNumberId: formData.phoneNumberId,
        businessAccountId: formData.businessAccountId,
        accessToken: formData.accessToken,
        verifyToken: formData.verifyToken,
        orgId: user.id,
      });

      setWebhookInfo(result);
      setStep('success');
      toast.success("Canal WhatsApp conectado com sucesso!");

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error connecting WhatsApp:', error);
      toast.error(error.message || "Erro ao conectar canal");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  const handleClose = () => {
    setStep('form');
    setFormData({
      name: "",
      phoneNumberId: "",
      businessAccountId: "",
      accessToken: "",
      verifyToken: "",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {step === 'form' ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold">
                  W
                </div>
                Conectar WhatsApp Business
              </DialogTitle>
              <DialogDescription>
                Configure sua conta do WhatsApp Business para receber e enviar mensagens
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <Alert>
                <AlertDescription className="text-sm">
                  <strong>Atenção:</strong> Use as credenciais que você obteve no Meta for Developers.
                  <a
                    href="https://developers.facebook.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-1 text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Abrir Meta for Developers <ExternalLink className="h-3 w-3" />
                  </a>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="name">Nome da Conexão *</Label>
                <Input
                  id="name"
                  placeholder="Ex: WhatsApp Principal"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Um nome para identificar esta conexão
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumberId">Phone Number ID *</Label>
                <Input
                  id="phoneNumberId"
                  placeholder="102517912345678"
                  value={formData.phoneNumberId}
                  onChange={(e) => handleInputChange('phoneNumberId', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Encontre em: WhatsApp &gt; API Setup no Meta for Developers
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessAccountId">Business Account ID (opcional)</Label>
                <Input
                  id="businessAccountId"
                  placeholder="123456789012345"
                  value={formData.businessAccountId}
                  onChange={(e) => handleInputChange('businessAccountId', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accessToken">Access Token *</Label>
                <Input
                  id="accessToken"
                  type="password"
                  placeholder="EAAG..."
                  value={formData.accessToken}
                  onChange={(e) => handleInputChange('accessToken', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  O token que você gerou no Meta for Developers
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="verifyToken">Verify Token</Label>
                <Input
                  id="verifyToken"
                  value={formData.verifyToken}
                  readOnly
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Token usado na configuração do webhook (já configurado)
                </p>
              </div>

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
                      Conectando...
                    </>
                  ) : (
                    'Conectar WhatsApp'
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-500" />
                WhatsApp Conectado!
              </DialogTitle>
              <DialogDescription>
                Canal conectado com sucesso
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <Alert className="bg-green-500/10 border-green-500/20">
                <AlertDescription>
                  <strong>✓ Canal conectado com sucesso!</strong>
                  <br />
                  O webhook já está configurado e funcionando.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <h4 className="font-semibold">Informações do Webhook:</h4>
                <div className="text-sm space-y-2">
                  <p>✅ Webhook URL já configurado no Meta for Developers</p>
                  <p>✅ Verify Token: <code className="bg-muted px-2 py-1 rounded">teste123</code></p>
                  <p>✅ Eventos subscritos: messages</p>
                </div>
              </div>

              <Alert>
                <AlertDescription className="text-xs">
                  <strong>Pronto para usar!</strong> Você já pode receber e enviar mensagens pelo WhatsApp.
                </AlertDescription>
              </Alert>

              <div className="flex justify-end pt-4 border-t">
                <Button onClick={handleClose} className="bg-gradient-to-r from-primary to-primary-glow">
                  Concluir
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
