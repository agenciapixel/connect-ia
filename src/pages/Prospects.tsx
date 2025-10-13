import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Plus } from "lucide-react";

const Prospects = () => {
  return (
    <div className="flex-1 p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Prospecção</h2>
          <p className="text-muted-foreground">Encontre novos leads via Google Maps</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Busca
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prospectar via Google Maps</CardTitle>
          <CardDescription>Busque e importe contatos baseado em localização e categoria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground text-center">
              Inicie uma busca para encontrar prospects
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Prospects;