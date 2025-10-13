import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Plus } from "lucide-react";

const Contacts = () => {
  return (
    <div className="flex-1 p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Contatos</h2>
          <p className="text-muted-foreground">Gerencie sua base de contatos</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Contato
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Contatos</CardTitle>
          <CardDescription>Todos os seus contatos organizados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground text-center">
              Nenhum contato cadastrado
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Contacts;