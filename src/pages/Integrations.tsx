import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  Zap, 
  Users, 
  CheckCircle2, 
  XCircle,
  Settings,
  ExternalLink,
  Plug2
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Integrations() {
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(true);

  const handleConnect = (integration: string) => {
    toast.success(`Conectando ${integration}...`);
  };

  const handleDisconnect = (integration: string) => {
    toast.info(`${integration} desconectado`);
  };

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-background via-background to-primary/5 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Integrações
        </h1>
        <p className="text-muted-foreground mt-2">
          Conecte suas ferramentas favoritas e automatize seus processos
        </p>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="connected">Conectadas</TabsTrigger>
          <TabsTrigger value="available">Disponíveis</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {/* Messaging Integrations */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-primary" />
              Mensagens
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {/* WhatsApp */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-xl font-bold">
                        W
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          WhatsApp Business
                          <Badge variant="secondary" className="bg-green-500/10 text-green-700">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Conectado
                          </Badge>
                        </CardTitle>
                        <CardDescription>API oficial do WhatsApp Business</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Envie e receba mensagens do WhatsApp diretamente na plataforma
                  </p>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="whatsapp-status">Status</Label>
                      <Switch
                        id="whatsapp-status"
                        checked={whatsappEnabled}
                        onCheckedChange={setWhatsappEnabled}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="whatsapp-phone">Número do telefone</Label>
                      <Input id="whatsapp-phone" placeholder="+55 11 99999-9999" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Settings className="h-4 w-4 mr-2" />
                      Configurar
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDisconnect("WhatsApp")}
                    >
                      Desconectar
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* SMS */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                        <Phone className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          SMS
                          <Badge variant="outline">Disponível</Badge>
                        </CardTitle>
                        <CardDescription>Twilio, MessageBird e outros</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Integre com provedores de SMS para campanhas globais
                  </p>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Provedores suportados</Label>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Twilio</li>
                      <li>• MessageBird</li>
                      <li>• Amazon SNS</li>
                    </ul>
                  </div>
                  <Button 
                    className="w-full" 
                    variant="default"
                    onClick={() => handleConnect("SMS")}
                  >
                    Conectar
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Email & CRM */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Mail className="h-6 w-6 text-primary" />
              Email & CRM
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {/* Email */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl">
                        @
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          Email (SMTP)
                          <Badge variant="secondary" className="bg-green-500/10 text-green-700">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Conectado
                          </Badge>
                        </CardTitle>
                        <CardDescription>Gmail, Outlook, SMTP customizado</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Configure seu servidor SMTP para envio de emails
                  </p>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-status">Status</Label>
                      <Switch
                        id="email-status"
                        checked={emailEnabled}
                        onCheckedChange={setEmailEnabled}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Servidor SMTP</Label>
                      <p className="text-sm text-muted-foreground">smtp.gmail.com:587</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Settings className="h-4 w-4 mr-2" />
                      Configurar
                    </Button>
                    <Button variant="destructive" size="sm">
                      Desconectar
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* CRM */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          CRM
                          <Badge variant="outline">Disponível</Badge>
                        </CardTitle>
                        <CardDescription>HubSpot, Salesforce, Pipedrive</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Sincronize contatos e leads com seu CRM
                  </p>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Plataformas suportadas</Label>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• HubSpot</li>
                      <li>• Salesforce</li>
                      <li>• Pipedrive</li>
                      <li>• RD Station</li>
                    </ul>
                  </div>
                  <Button 
                    className="w-full"
                    onClick={() => handleConnect("CRM")}
                  >
                    Conectar
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Automation */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              Automação
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {/* Zapier */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-xl">
                        Z
                      </div>
                      <div>
                        <CardTitle>Zapier</CardTitle>
                        <CardDescription>Conecte com 5.000+ aplicativos</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Automatize workflows conectando com milhares de apps
                  </p>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Recursos</Label>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Triggers automáticos</li>
                      <li>• Multi-step workflows</li>
                      <li>• Webhooks personalizados</li>
                    </ul>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1"
                      onClick={() => handleConnect("Zapier")}
                    >
                      Conectar
                    </Button>
                    <Button variant="outline" size="icon">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Make (Integromat) */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center">
                        <Plug2 className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle>Make (Integromat)</CardTitle>
                        <CardDescription>Automação visual avançada</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Crie automações complexas com interface visual
                  </p>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Recursos</Label>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Editor visual drag & drop</li>
                      <li>• Cenários complexos</li>
                      <li>• Webhooks e APIs</li>
                    </ul>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1"
                      onClick={() => handleConnect("Make")}
                    >
                      Conectar
                    </Button>
                    <Button variant="outline" size="icon">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="connected" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integrações Conectadas</CardTitle>
              <CardDescription>Gerenciar suas integrações ativas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold">
                      W
                    </div>
                    <div>
                      <h4 className="font-medium">WhatsApp Business</h4>
                      <p className="text-sm text-muted-foreground">Conectado há 5 dias</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Gerenciar</Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl">
                      @
                    </div>
                    <div>
                      <h4 className="font-medium">Email (SMTP)</h4>
                      <p className="text-sm text-muted-foreground">Conectado há 12 dias</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Gerenciar</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="available" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {["SMS", "CRM", "Zapier", "Make", "Slack", "Discord"].map((integration) => (
              <Card key={integration} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{integration}</CardTitle>
                  <CardDescription>Disponível para conectar</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full"
                    onClick={() => handleConnect(integration)}
                  >
                    Conectar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
