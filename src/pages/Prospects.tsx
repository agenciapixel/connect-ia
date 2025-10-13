import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin } from "lucide-react";

export default function Prospects() {
  const prospects = [
    { id: 1, name: "Restaurante Central", address: "Rua Principal, 123", category: "Restaurante", status: "new" },
    { id: 2, name: "Academia Fit", address: "Av. Paulista, 456", category: "Academia", status: "validated" },
    { id: 3, name: "Salão Beleza", address: "Rua das Flores, 789", category: "Salão", status: "imported" },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      new: { label: "Novo", className: "bg-info/10 text-info" },
      validated: { label: "Validado", className: "bg-success/10 text-success" },
      imported: { label: "Importado", className: "bg-primary/10 text-primary" },
      opted_out: { label: "Opt-out", className: "bg-destructive/10 text-destructive" },
    };
    const variant = variants[status] || variants.new;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prospecção</h1>
          <p className="text-muted-foreground mt-2">Busque e importe leads do Google Maps</p>
        </div>
        <Button>
          <MapPin className="h-4 w-4 mr-2" />
          Buscar no Google Maps
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prospects Encontrados</CardTitle>
          <CardDescription>Leads importados e validados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar prospects..." className="pl-10" />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Endereço</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prospects.map((prospect) => (
                <TableRow key={prospect.id}>
                  <TableCell className="font-medium">{prospect.name}</TableCell>
                  <TableCell>{prospect.address}</TableCell>
                  <TableCell>{prospect.category}</TableCell>
                  <TableCell>{getStatusBadge(prospect.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Importar</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}