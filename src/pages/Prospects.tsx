import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Building2, Phone, Globe, ArrowRight, Loader2, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Prospects() {
  const [searchQuery, setSearchQuery] = useState("");
  const [importing, setImporting] = useState<string | null>(null);

  // Buscar prospects
  const { data: prospects = [], isLoading, refetch } = useQuery({
    queryKey: ["prospects", searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("prospects")
        .select(`
          *,
          places (
            name,
            formatted_address,
            phone_number,
            website,
            types
          )
        `)
        .order("created_at", { ascending: false });

      if (searchQuery) {
        query = query.or(`notes.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Estatísticas
  const { data: stats } = useQuery({
    queryKey: ["prospects-stats"],
    queryFn: async () => {
      const { count: total } = await supabase
        .from("prospects")
        .select("*", { count: "exact", head: true });

      const { count: validated } = await supabase
        .from("prospects")
        .select("*", { count: "exact", head: true })
        .eq("status", "validated");

      const { count: imported } = await supabase
        .from("prospects")
        .select("*", { count: "exact", head: true })
        .eq("status", "imported");

      return {
        total: total || 0,
        validated: validated || 0,
        imported: imported || 0,
      };
    },
  });

  const handleImportToContacts = async (prospect: any) => {
    setImporting(prospect.id);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Usuário não autenticado");
        return;
      }

      const { data: member } = await supabase
        .from("members")
        .select("org_id")
        .eq("user_id", user.id)
        .single();

      if (!member) {
        toast.error("Organização não encontrada");
        return;
      }

      // Criar contato
      const { error: contactError } = await supabase.from("contacts").insert({
        org_id: member.org_id,
        full_name: prospect.places?.name || "Sem nome",
        phone_e164: prospect.places?.phone_number || null,
        tags: prospect.tags || [],
      });

      if (contactError) throw contactError;

      // Atualizar status do prospect
      const { error: updateError } = await supabase
        .from("prospects")
        .update({ status: "imported" })
        .eq("id", prospect.id);

      if (updateError) throw updateError;

      toast.success("Prospect importado para contatos!");
      refetch();
    } catch (error: any) {
      console.error("Error:", error);
      toast.error("Erro ao importar prospect");
    } finally {
      setImporting(null);
    }
  };

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

  const statsData = [
    { label: "Prospects Encontrados", value: stats?.total.toString() || "0" },
    { label: "Qualificados", value: stats?.validated.toString() || "0" },
    { label: "Contactados", value: stats?.imported.toString() || "0" },
  ];

  return (
    <div className="p-8 space-y-6 bg-gradient-to-br from-background via-background to-primary/5 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Prospecção
          </h1>
          <p className="text-muted-foreground mt-2">Gerencie seus leads e prospects</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {statsData.map((stat, index) => (
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
                Prospects
              </CardTitle>
              <CardDescription className="mt-1">Lista de prospects identificados</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar prospects..." 
                className="pl-9 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
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
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : prospects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    <Building2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhum prospect encontrado</p>
                  </TableCell>
                </TableRow>
              ) : (
                prospects.map((prospect) => (
                  <TableRow key={prospect.id} className="hover:bg-accent/50 transition-colors">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-white font-semibold">
                          {(prospect.places?.name || "?").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold">{prospect.places?.name || "Sem nome"}</p>
                          {prospect.places?.website && (
                            <a 
                              href={`https://${prospect.places.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                              <Globe className="h-3 w-3" />
                              {prospect.places.website}
                            </a>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {prospect.places?.formatted_address ? (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span className="max-w-xs truncate">{prospect.places.formatted_address}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {prospect.places?.types && prospect.places.types.length > 0 ? (
                        <Badge variant="secondary">{prospect.places.types[0]}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {prospect.places?.phone_number ? (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          {prospect.places.phone_number}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(prospect.status)}</TableCell>
                    <TableCell className="text-right">
                      {prospect.status === "imported" ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600">
                          <Check className="h-3 w-3 mr-1" />
                          Importado
                        </Badge>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="group"
                          onClick={() => handleImportToContacts(prospect)}
                          disabled={importing === prospect.id}
                        >
                          {importing === prospect.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <>
                              Importar
                              <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
                            </>
                          )}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}