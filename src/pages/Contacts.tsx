import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Search, Mail, Phone, Plus, Filter, UserPlus, TrendingUp } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Contacts() {
  const contacts = [
    { id: 1, name: "João Silva", email: "joao@email.com", phone: "+55 11 98765-4321", tags: ["Cliente", "Premium"], status: "active", lastContact: "Hoje" },
    { id: 2, name: "Maria Santos", email: "maria@email.com", phone: "+55 11 98765-4322", tags: ["Lead"], status: "active", lastContact: "Ontem" },
    { id: 3, name: "Carlos Oliveira", email: "carlos@email.com", phone: "+55 11 98765-4323", tags: ["Cliente"], status: "inactive", lastContact: "3 dias" },
    { id: 4, name: "Ana Costa", email: "ana@email.com", phone: "+55 11 98765-4324", tags: ["Lead", "Qualificado"], status: "active", lastContact: "Hoje" },
  ];

  const stats = [
    { label: "Total de Contatos", value: "1,234", change: 8, icon: Users },
    { label: "Novos (30 dias)", value: "156", change: 12, icon: UserPlus },
    { label: "Engajados", value: "892", change: 5, icon: TrendingUp },
  ];

  return (
    <div className="p-8 space-y-6 bg-gradient-to-br from-background via-background to-primary/5 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Contatos
          </h1>
          <p className="text-muted-foreground mt-2">Gerencie sua base de contatos</p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity shadow-lg">
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Contato
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
                <Badge variant="default" className="mt-2 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{stat.change}%
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-2 hover:border-primary/30 transition-all shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Lista de Contatos
              </CardTitle>
              <CardDescription className="mt-1">Todos os seus contatos em um só lugar</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar contatos..." className="pl-9 w-64" />
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
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Último Contato</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((contact) => (
                <TableRow key={contact.id} className="hover:bg-accent/50 transition-colors">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-white font-semibold">
                        {contact.name.charAt(0)}
                      </div>
                      {contact.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      {contact.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      {contact.phone}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {contact.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={contact.status === "active" ? "default" : "secondary"}
                      className={
                        contact.status === "active"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-gray-500/10 text-gray-600"
                      }
                    >
                      {contact.status === "active" ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{contact.lastContact}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      Ver Detalhes
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
