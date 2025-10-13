import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Building2, Phone, Globe, ArrowRight, Filter } from "lucide-react";

export default function Prospects() {
  const prospects = [
    { id: 1, name: "Restaurante Central", address: "Rua Principal, 123", category: "Restaurante", status: "new", phone: "+55 11 3456-7890", website: "restaurantecentral.com" },
    { id: 2, name: "Academia Fit", address: "Av. Paulista, 456", category: "Academia", status: "validated", phone: "+55 11 3456-7891", website: "academiafit.com" },
    { id: 3, name: "Salão Beleza", address: "Rua das Flores, 789", category: "Salão", status: "imported", phone: "+55 11 3456-7892", website: "salaobeleza.com" },
    { id: 4, name: "Pizzaria Italiana", address: "Rua Roma, 321", category: "Restaurante", status: "new", phone: "+55 11 3456-7893", website: null },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      new: { label: "Novo", className: "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20" },
      validated: { label: "Validado", className: "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20" },
      imported: { label: "Importado", className: "bg-purple-500/10 text-purple-600 hover:bg-purple-500/20" },
      opted_out: { label: "Opt-out", className: "bg-red-500/10 text-red-600 hover:bg-red-500/20" },
    };
    const variant = variants[status] || variants.new;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const stats = [
    { label: "Prospects Encontrados", value: "342" },
    { label: "Validados", value: "156" },
    { label: "Importados", value: "89" },
  ];

  return (
    <div className="p-8 space-y-6 bg-gradient-to-br from-background via-background to-primary/5 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Prospecção
          </h1>
          <p className="text-muted-foreground mt-2">Busque e importe leads do Google Maps</p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity shadow-lg">
          <MapPin className="h-4 w-4 mr-2" />
          Buscar no Google Maps
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, index) => (
          <Card key={index} className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-2 hover:border-primary/30 transition-all shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Prospects Encontrados
              </CardTitle>
              <CardDescription className="mt-1">Leads importados e validados</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar prospects..." className="pl-9 w-64" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Endereço</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prospects.map((prospect) => (
                <TableRow key={prospect.id} className="hover:bg-accent/50 transition-colors">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-white font-semibold">
                        {prospect.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold">{prospect.name}</p>
                        {prospect.website && (
                          <a 
                            href={`https://${prospect.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <Globe className="h-3 w-3" />
                            {prospect.website}
                          </a>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {prospect.address}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{prospect.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      {prospect.phone}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(prospect.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="group"
                    >
                      Importar
                      <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
                    </Button>
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
