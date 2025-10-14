import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Settings, Trash2, RefreshCw } from "lucide-react";

interface ChannelSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channel: any;
  onDisconnect: (channelId: string) => void;
}

export function ChannelSettingsModal({ 
  open, 
  onOpenChange, 
  channel, 
  onDisconnect 
}: ChannelSettingsModalProps) {
  if (!channel) return null;

  const handleDisconnect = () => {
    onDisconnect(channel.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações do Canal
          </DialogTitle>
          <DialogDescription>
            Gerencie as configurações e credenciais do canal conectado
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Nome do Canal</Label>
              <Input 
                value={channel.name} 
                disabled 
                className="mt-1"
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium">Tipo</Label>
              <div className="mt-1">
                <Badge variant="secondary" className="capitalize">
                  {channel.channel_type}
                </Badge>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Status</Label>
              <div className="mt-1">
                <Badge 
                  variant={channel.status === 'active' ? 'default' : 'secondary'}
                  className="capitalize"
                >
                  {channel.status}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Credenciais (apenas visualização) */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Credenciais</Label>
            <div className="space-y-2">
              {channel.credentials_json && Object.entries(channel.credentials_json).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground capitalize">
                    {key.replace(/_/g, ' ')}:
                  </span>
                  <span className="text-sm font-mono bg-muted px-2 py-1 rounded text-xs">
                    {typeof value === 'string' && value.length > 20 
                      ? `${value.substring(0, 20)}...` 
                      : String(value)
                    }
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Ações */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium">Ações do Canal</h4>
                <p className="text-sm text-muted-foreground">
                  Gerencie a conexão do canal
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="flex-1"
                onClick={() => {
                  // TODO: Implementar refresh de token
                  console.log('Refresh token for channel:', channel.id);
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Renovar Token
              </Button>
              
              <Button 
                variant="destructive" 
                size="sm"
                className="flex-1"
                onClick={handleDisconnect}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Desconectar
              </Button>
            </div>
          </div>

          {/* Informações de Data */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Conectado em: {new Date(channel.created_at).toLocaleString('pt-BR')}</p>
            <p>Última atualização: {new Date(channel.updated_at).toLocaleString('pt-BR')}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
