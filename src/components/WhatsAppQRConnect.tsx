import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, Phone, AlertCircle, QrCode, RefreshCw, Copy, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/contexts/OrganizationContext";

interface WhatsAppQRConnectProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function WhatsAppQRConnect({ open, onOpenChange, onSuccess }: WhatsAppQRConnectProps) {
  const { currentOrg } = useOrganization();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'qr' | 'success'>('qr');
  const [phoneNumber, setPhoneNumber] = useState("");
  const [instanceName, setInstanceName] = useState("");
  const [qrCodeData, setQrCodeData] = useState<string>("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");
  const [connectionStatus, setConnectionStatus] = useState<'waiting' | 'connected' | 'failed'>('waiting');
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // Gerar QR Code automaticamente quando abrir o modal
  useEffect(() => {
    console.log('WhatsApp QR Effect:', { open, hasQrCodeData: !!qrCodeData, currentOrg: currentOrg?.name });

    if (open && !qrCodeData && currentOrg) {
      console.log('Gerando QR Code automaticamente...');
      generateQRCodeNow();
    } else if (open && !currentOrg) {
      console.warn('Modal aberto mas currentOrg não está definida ainda');
    }
  }, [open, currentOrg]);


  const generateQRCodeNow = async () => {
    console.log('generateQRCodeNow chamada! currentOrg:', currentOrg);
    setLoading(true);

    try {
      if (!currentOrg) {
        console.error('Erro: currentOrg não definida');
        toast({
          title: "Organização não encontrada",
          description: "Por favor, selecione uma organização antes de conectar o WhatsApp",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
  
      const newSessionId = `wa_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      setSessionId(newSessionId);
  
      // Chamar Edge Function que usa Evolution API
      const { data, error } = await supabase.functions.invoke("whatsapp-qr-connect", {
        body: {
          action: 'save_qr_connection',
          orgId: currentOrg.id,
          sessionId: newSessionId,
          name: instanceName || `WhatsApp`,
          credentials: {
            phone_number: phoneNumber || 'pending',
          }
        },
      });
  
      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Erro ao gerar QR Code');
  
      // QR Code REAL da Evolution API!
      setQrCodeData(data.qrCodeText);
      setQrCodeUrl(`data:image/png;base64,${data.qrCode}`);
      setConnectionStatus('waiting');
  
      toast({
        title: "QR Code Gerado!",
        description: "Escaneie com seu WhatsApp"
      });
  
      // Verificar status REAL
      startPollingStatusReal(newSessionId);
  
    } catch (error: any) {
      console.error("Error generating QR Code:", error);

      // Se o erro é da Evolution API, mostrar mensagem específica
      if (error.message?.includes('fetch') || error.message?.includes('Evolution') || error.message?.includes('EVOLUTION')) {
        toast({
          title: "Evolution API não configurada",
          description: "Para usar QR Code real, configure a Evolution API. Por enquanto, use conexão manual.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro ao gerar QR Code",
          description: error.message || "Erro desconhecido. Verifique se a Evolution API está rodando.",
          variant: "destructive"
        });
      }

      setConnectionStatus('failed');
    } finally {
      setLoading(false);
    }
  };

const startPollingStatusReal = (sessionId: string) => {
  const EVOLUTION_API_URL = 'http://localhost:8080'; // TEMPORÁRIO - depois mover para env
  const EVOLUTION_API_KEY = 'minha-chave-123';       // TEMPORÁRIO - depois mover para env

  const interval = setInterval(async () => {
    try {
      const response = await fetch(
        `${EVOLUTION_API_URL}/instance/connectionState/${sessionId}`,
        { headers: { 'apikey': EVOLUTION_API_KEY } }
      );

      const data = await response.json();

      if (data.state === 'open') {
        // CONECTADO DE VERDADE!
        clearInterval(interval);
        setConnectionStatus('connected');

        // Atualizar status no banco
        await supabase
          .from('channel_accounts')
          .update({ status: 'active' })
          .eq('credentials->>session_id', sessionId);

        setStep('success');
        toast({
          title: "Conectado!",
          description: "WhatsApp conectado com sucesso"
        });

        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }, 3000); // Verifica a cada 3 segundos

  setPollingInterval(interval);

  // Timeout após 5 minutos
  setTimeout(() => {
    clearInterval(interval);
    if (connectionStatus === 'waiting') {
      setConnectionStatus('failed');
      toast({
        title: "Timeout",
        description: "Tempo limite excedido"
      });
    }
  }, 300000);
};


  const handleClose = () => {
    // Limpar polling se ativo
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    
    // Resetar estados
    setStep('qr');
    setPhoneNumber("");
    setInstanceName("");
    setQrCodeData("");
    setQrCodeUrl("");
    setSessionId("");
    setConnectionStatus('waiting');
    onOpenChange(false);
  };

  const handleRetry = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    setConnectionStatus('waiting');
    generateQRCodeNow();
  };

  const handleCopyQR = async () => {
    try {
      await navigator.clipboard.writeText(qrCodeData);
      toast({
        title: "Copiado!",
        description: "Dados do QR Code copiados para a área de transferência"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar os dados"
      });
    }
  };

  const handleDownloadQR = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.download = `whatsapp-qr-${sessionId}.png`;
      link.href = qrCodeUrl;
      link.click();
    }
  };

  // Cleanup ao desmontar componente
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold">
              {step === 'qr' ? <QrCode className="h-6 w-6" /> : <Phone className="h-6 w-6" />}
            </div>
            {step === 'qr' && 'Conectar WhatsApp via QR Code'}
            {step === 'success' && 'WhatsApp Conectado!'}
          </DialogTitle>
          <DialogDescription>
            {step === 'qr' && 'Escaneie o QR Code com seu WhatsApp para conectar'}
            {step === 'success' && 'Sua conta foi conectada com sucesso'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {step === 'qr' && (
            <>
              <div className="text-center space-y-4">
                <div className="relative inline-block">
                  {qrCodeUrl ? (
                    <img
                      src={qrCodeUrl}
                      alt="QR Code WhatsApp"
                      className="border-2 border-gray-200 rounded-lg shadow-lg w-64 h-64"
                    />
                  ) : (
                    <div className="w-64 h-64 border-2 border-gray-200 rounded-lg flex items-center justify-center">
                      <p className="text-sm text-gray-400">QR Code aparecerá aqui</p>
                    </div>
                  )}
                  
                  {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/90 rounded-lg">
                      <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-green-600" />
                        <p className="text-sm font-medium">Gerando QR Code...</p>
                      </div>
                    </div>
                  )}
                  
                  {connectionStatus === 'waiting' && !loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/90 rounded-lg">
                      <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-green-600" />
                        <p className="text-sm font-medium">Aguardando conexão...</p>
                      </div>
                    </div>
                  )}
                  
                  {connectionStatus === 'connected' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-green-50 rounded-lg">
                      <div className="text-center">
                        <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                        <p className="text-sm font-medium text-green-600">Conectado!</p>
                      </div>
                    </div>
                  )}
                  
                  {connectionStatus === 'failed' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-red-50 rounded-lg">
                      <div className="text-center">
                        <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-600" />
                        <p className="text-sm font-medium text-red-600">Falha na conexão</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Instruções:</p>
                  <ol className="text-sm text-muted-foreground space-y-1 text-left">
                    <li>1. Abra o WhatsApp no seu celular</li>
                    <li>2. Toque em "Menu" → "Dispositivos conectados"</li>
                    <li>3. Toque em "Conectar um dispositivo"</li>
                    <li>4. Escaneie o QR Code acima</li>
                  </ol>
                </div>

                <div className="flex gap-2 justify-center">
                  <Button variant="outline" size="sm" onClick={handleCopyQR} disabled={!qrCodeData}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar Dados
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownloadQR} disabled={!qrCodeData}>
                    <Download className="h-4 w-4 mr-2" />
                    Baixar QR
                  </Button>
                  {connectionStatus === 'failed' && (
                    <Button variant="outline" size="sm" onClick={handleRetry}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Tentar Novamente
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <Button variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <div className="text-xs text-muted-foreground">
                  {loading ? "Gerando QR Code..." : qrCodeData ? "QR Code ativo" : "Aguardando..."}
                </div>
              </div>
            </>
          )}

          {step === 'success' && (
            <>
              <Alert className="bg-green-500/10 border-green-500/20">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription>
                  <strong>WhatsApp Conectado!</strong><br/>
                  Sua conta {phoneNumber} foi conectada com sucesso e está pronta para uso.
                </AlertDescription>
              </Alert>

              <Alert>
                <AlertDescription className="text-sm">
                  <strong>O que você pode fazer agora:</strong><br/>
                  • Enviar e receber mensagens<br/>
                  • Gerenciar conversas no Inbox<br/>
                  • Configurar respostas automáticas<br/>
                  • Acessar estatísticas de uso
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
