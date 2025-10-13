import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Search, Clock, CheckCircle, User, Send } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Inbox() {
  const conversations = [
    { id: 1, name: "João Silva", message: "Olá! Gostaria de saber mais sobre o produto", time: "2 min", status: "new", unread: 3 },
    { id: 2, name: "Maria Santos", message: "Obrigada pelo retorno rápido!", time: "15 min", status: "responded", unread: 0 },
    { id: 3, name: "Carlos Oliveira", message: "Quando posso agendar uma reunião?", time: "1 h", status: "pending", unread: 1 },
    { id: 4, name: "Ana Costa", message: "Perfeito! Vou aguardar o envio", time: "2 h", status: "responded", unread: 0 },
    { id: 5, name: "Pedro Alves", message: "Preciso de ajuda urgente", time: "3 h", status: "pending", unread: 2 },
  ];

  const getStatusBadge = (status: string) => {
    const config = {
      new: { label: "Nova", className: "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20" },
      pending: { label: "Pendente", className: "bg-orange-500/10 text-orange-600 hover:bg-orange-500/20" },
      responded: { label: "Respondida", className: "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20" },
    };
    const { label, className } = config[status as keyof typeof config];
    return <Badge variant="secondary" className={className}>{label}</Badge>;
  };

  return (
    <div className="p-8 space-y-6 bg-gradient-to-br from-background via-background to-primary/5 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Inbox
          </h1>
          <p className="text-muted-foreground mt-2">Gerencie todas as suas conversas em um só lugar</p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity shadow-lg">
          <Send className="mr-2 h-4 w-4" />
          Nova Mensagem
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1 border-2 hover:border-primary/30 transition-all shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Conversas</CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar conversas..." className="pl-9" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              <div className="space-y-1 p-4">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className="flex items-start gap-3 p-4 rounded-lg border hover:bg-accent/50 cursor-pointer transition-all group"
                  >
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-white font-semibold">
                      {conv.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold truncate">{conv.name}</p>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {conv.time}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{conv.message}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {getStatusBadge(conv.status)}
                        {conv.unread > 0 && (
                          <Badge variant="destructive" className="h-5 px-2">
                            {conv.unread}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-2 hover:border-primary/30 transition-all shadow-lg">
          <CardHeader className="border-b">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-white font-semibold text-lg">
                J
              </div>
              <div className="flex-1">
                <CardTitle>João Silva</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Online
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <User className="mr-2 h-4 w-4" />
                Ver Perfil
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <ScrollArea className="h-[450px] mb-4">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-white text-sm font-semibold">
                    J
                  </div>
                  <div className="flex-1 max-w-md">
                    <div className="bg-muted rounded-2xl rounded-tl-sm p-4">
                      <p className="text-sm">Olá! Gostaria de saber mais sobre o produto</p>
                    </div>
                    <span className="text-xs text-muted-foreground mt-1 ml-2">14:23</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 justify-end">
                  <div className="flex-1 max-w-md">
                    <div className="bg-gradient-to-r from-primary to-primary-glow rounded-2xl rounded-tr-sm p-4 ml-auto">
                      <p className="text-sm text-white">Olá João! Claro, ficarei feliz em ajudar. O que você gostaria de saber especificamente?</p>
                    </div>
                    <div className="flex items-center justify-end gap-1 mt-1 mr-2">
                      <span className="text-xs text-muted-foreground">14:24</span>
                      <CheckCircle className="h-3 w-3 text-emerald-500" />
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>

            <div className="flex items-center gap-2 pt-4 border-t">
              <Input placeholder="Digite sua mensagem..." className="flex-1" />
              <Button className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
