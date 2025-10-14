import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { connectInstagramChannel } from "@/lib/instagram";
import { supabase } from "@/integrations/supabase/client";

interface InstagramSetupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function InstagramSetup({ open, onOpenChange, onSuccess }: InstagramSetupProps) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [webhookInfo, setWebhookInfo] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    pageId: "",
    instagramBusinessAccountId: "",
    accessToken: "",
    verifyToken: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleConnect = async () => {
    // Validate fields
    if (!formData.name || !formData.pageId || !formData.accessToken || !formData.verifyToken) {
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

      const result = await connectInstagramChannel({
        name: formData.name,
        pageId: formData.pageId,
        instagramBusinessAccountId: formData.instagramBusinessAccountId,
        accessToken: formData.accessToken,
        verifyToken: formData.verifyToken,
        orgId: user.id,
      });

      setWebhookInfo(result);
      setStep('success');
      toast.success("Canal Instagram conectado com sucesso!");

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error connecting Instagram:', error);
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
      pageId: "",
      instagramBusinessAccountId: "",
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
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center text-white font-bold">
                  IG
                </div>
                Conectar Instagram
              </DialogTitle>
              <DialogDescription>
                Configure sua conta comercial do Instagram para receber e enviar mensagens diretas
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <Alert>
                <AlertDescription className="text-sm">
                  <strong>Requisitos:</strong> Você precisa ter uma Página do Facebook conectada a uma conta comercial do Instagram.
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
                  placeholder="Ex: Instagram Principal"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Um nome para identificar esta conexão
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pageId">Page ID do Facebook *</Label>
                <Input
                  id="pageId"
                  placeholder="123456789012345"
                  value={formData.pageId}
                  onChange={(e) => handleInputChange('pageId', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  ID da Página do Facebook conectada ao Instagram
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagramBusinessAccountId">Instagram Business Account ID (opcional)</Label>
                <Input
                  id="instagramBusinessAccountId"
                  placeholder="17841405309211844"
                  value={formData.instagramBusinessAccountId}
                  onChange={(e) => handleInputChange('instagramBusinessAccountId', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  ID da conta comercial do Instagram
                </p>
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
                  Token gerado no Meta for Developers (pode ser o mesmo do WhatsApp)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="verifyToken">Verify Token *</Label>
                <Input
                  id="verifyToken"
                  placeholder="Digite um token personalizado"
                  value={formData.verifyToken}
                  onChange={(e) => handleInputChange('verifyToken', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Token que será usado para verificar o webhook no Meta for Developers
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <Button variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleConnect}
                  disabled={loading}
                  className="bg-gradient-to-r from-pink-500 to-pink-600"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Conectando...
                    </>
                  ) : (
                    'Conectar Instagram'
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-pink-500" />
                Instagram Conectado!
              </DialogTitle>
              <DialogDescription>
                Canal conectado com sucesso
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <Alert className="bg-pink-500/10 border-pink-500/20">
                <AlertDescription>
                  <strong>✓ Canal conectado com sucesso!</strong>
                  <br />
                  O webhook já está configurado e funcionando.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <h4 className="font-semibold">Próximos Passos:</h4>
                <div className="text-sm space-y-2">
                  <p>✅ Canal criado com sucesso</p>
                  <p>📝 Configure o webhook no Meta for Developers com o Verify Token que você definiu</p>
                  <p>📌 Eventos necessários: messages, messaging_postbacks</p>
                </div>
              </div>

              <Alert>
                <AlertDescription className="text-xs">
                  <strong>Pronto para usar!</strong> Você já pode receber e enviar mensagens diretas pelo Instagram.
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
