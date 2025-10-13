import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

const Inbox = () => {
  return (
    <div className="flex-1 p-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Inbox</h2>
        <p className="text-muted-foreground">Gerencie todas as conversas em um só lugar</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Conversas</CardTitle>
            <CardDescription>Todas as conversas ativas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground text-center">
                Nenhuma conversa ainda
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Mensagens</CardTitle>
            <CardDescription>Selecione uma conversa para ver as mensagens</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-[400px] text-muted-foreground">
              Selecione uma conversa
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Inbox;