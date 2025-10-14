import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, RefreshCw, QrCode, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import QRCodeReact from "react-qr-code";

interface WhatsAppQRConnectProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function WhatsAppQRConnect({ open, onOpenChange, onSuccess }: WhatsAppQRConnectProps) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'generating' | 'scanning' | 'connected'>('generating');
  const [qrCode, setQrCode] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");
  const [connectionInfo, setConnectionInfo] = useState<any>(null);
  const [checkInterval, setCheckInterval] = useState<NodeJS.Timeout | null>(null);

  // Gerar QR Code quando o modal abrir
  useEffect(() => {
    if (open) {
      generateQRCode();
    } else {
      // Limpar interval ao fechar
      if (checkInterval) {
        clearInterval(checkInterval);
        setCheckInterval(null);
      }
    }

    return () => {
      if (checkInterval) {
        clearInterval(checkInterval);
      }
    };
  }, [open]);

  const generateQRCode = async () => {
    setLoading(true);
    setStep('generating');

    try {
      // Obter informações do usuário
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      // Gerar ID único para a sessão
      const newSessionId = `whatsapp_${user.id}_${Date.now()}`;
      setSessionId(newSessionId);

      // Chamar Edge Function para gerar QR Code
      const { data, error } = await supabase.functions.invoke("whatsapp-qr-connect", {
        body: {
          action: 'generate_qr',
          sessionId: newSessionId,
          orgId: user.id,
          name: 'WhatsApp via QR Code'
        },
      });

      if (error) throw error;

      if (data.status === 'connected') {
        // Já conectou!
        setConnectionInfo(data.connectionInfo);
        setStep('connected');
        await saveConnection(newSessionId, data.connectionInfo);
      } else if (data.qrCode) {
        // QR Code gerado, aguardando scan
        setQrCode(data.qrCode);
        setStep('scanning');
        startStatusCheck(newSessionId);
      } else {
        throw new Error('Resposta inesperada do servidor');
      }

    } catch (error: any) {
      console.error("Error generating QR:", error);
      toast.error(error.message || "Erro ao gerar QR Code");
    } finally {
      setLoading(false);
    }
  };

  const startStatusCheck = (sessionId: string) => {
    // Verificar status a cada 2 segundos
    const interval = setInterval(async () => {
      await checkConnectionStatus(sessionId);
    }, 2000);

    setCheckInterval(interval);
  };

  const checkConnectionStatus = async (sessionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("whatsapp-qr-connect", {
        body: {
          action: 'check_status',
          sessionId: sessionId
        },
      });

      if (error) throw error;

      if (data.status === 'connected') {
        // Conectado!
        if (checkInterval) {
          clearInterval(checkInterval);
          setCheckInterval(null);
        }

        setConnectionInfo(data.connectionInfo);
        setStep('connected');
        await saveConnection(sessionId, data.connectionInfo);

        toast.success("WhatsApp conectado com sucesso!");

        if (onSuccess) {
          onSuccess();
        }
      }

    } catch (error: any) {
      console.error("Error checking status:", error);
    }
  };

  const saveConnection = async (sessionId: string, info: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Salvar no banco de dados
      const { error } = await supabase
        .from('channel_accounts')
        .insert({
          org_id: user.id,
          channel_type: 'whatsapp',
          name: `WhatsApp - ${info.user?.name || info.user?.id || 'QR Code'}`,
          credentials: {
            session_id: sessionId,
            phone: info.user?.id,
            name: info.user?.name,
            connection_type: 'qr_code'
          },
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving connection:', error);
        toast.error("Conectado mas erro ao salvar no banco");
      }

    } catch (error: any) {
      console.error("Error saving connection:", error);
    }
  };

  const handleRefresh = () => {
    generateQRCode();
  };

  const handleClose = () => {
    if (checkInterval) {
      clearInterval(checkInterval);
      setCheckInterval(null);
    }
    setStep('generating');
    setQrCode("");
    setSessionId("");
    setConnectionInfo(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold">
              <QrCode className="h-6 w-6" />
            </div>
            Conectar WhatsApp via QR Code
          </DialogTitle>
          <DialogDescription>
            Escaneie o QR Code com seu WhatsApp para conectar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {step === 'generating' && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Gerando QR Code...</p>
            </div>
          )}

          {step === 'scanning' && qrCode && (
            <>
              <Alert>
                <Smartphone className="h-4 w-4" />
                <AlertDescription>
                  <strong>Como escanear:</strong><br/>
                  1. Abra o WhatsApp no seu celular<br/>
                  2. Vá em Configurações → Aparelhos conectados<br/>
                  3. Toque em "Conectar um aparelho"<br/>
                  4. Aponte a câmera para este QR Code
                </AlertDescription>
              </Alert>

              <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg">
                <QRCodeReact
                  value={qrCode}
                  size={256}
                  level="H"
                  className="max-w-full h-auto"
                />
              </div>

              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Aguardando escaneamento...
              </div>

              <Button
                variant="outline"
                onClick={handleRefresh}
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Gerar novo QR Code
              </Button>
            </>
          )}

          {step === 'connected' && connectionInfo && (
            <>
              <Alert className="bg-green-500/10 border-green-500/20">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription>
                  <strong>WhatsApp Conectado com Sucesso!</strong><br/>
                  Número: {connectionInfo.user?.id || 'Conectado'}
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
