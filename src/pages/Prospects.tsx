import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, MapPin, Building2, Phone, Globe, ArrowRight, Loader2, Check, Sparkles, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { GooglePlacesSearch } from "@/components/GooglePlacesSearch";
import { GooglePlacesResults } from "@/components/GooglePlacesResults";
import { BulkExportProspects } from "@/components/BulkExportProspects";
import { Checkbox } from "@/components/ui/checkbox";
import type { PlaceResult } from "@/lib/googlePlaces";
import { useOrganization } from "@/contexts/OrganizationContext";

export default function Prospects() {
  const { currentOrg } = useOrganization();
  const [searchQuery, setSearchQuery] = useState("");
  const [importing, setImporting] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<PlaceResult[]>([]);
  const [activeTab, setActiveTab] = useState("search");
  const [selectedProspects, setSelectedProspects] = useState<string[]>([]);

  // Buscar prospects
  const { data: prospects = [], isLoading, refetch } = useQuery({
    queryKey: ["prospects", searchQuery, currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return [];

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
        .eq("org_id", currentOrg.id)
        .order("created_at", { ascending: false });

      if (searchQuery) {
        query = query.or(`notes.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Adicionar campos default de pipeline para compatibilidade
      return (data || []).map(p => ({
        ...p,
        pipeline_stage: p.pipeline_stage || 'lead',
        expected_revenue: p.expected_revenue || 0,
        probability: p.probability || 0,
      }));
    },
    enabled: !!currentOrg,
  });

  // Estatísticas - usando dados mock temporariamente
  const { data: stats } = useQuery({
    queryKey: ["prospects-stats"],
    queryFn: async () => {
      // Retornar estatísticas mock temporariamente
      return {
        total: 2,
        validated: 1,
        imported: 0,
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

      if (!currentOrg) {
        toast.error("Nenhuma organização selecionada");
        return;
      }

      // Criar contato
      const { error: contactError } = await supabase.from("contacts").insert({
        org_id: currentOrg.id,
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

  const handleSearchResults = (results: PlaceResult[]) => {
    setSearchResults(results);
    setActiveTab("results");
    // Recarregar lista de prospects após nova busca
    refetch();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header com Breadcrumbs */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Gestão</span>
            <span className="text-sm text-muted-foreground">/</span>
            <span className="text-sm font-medium">Prospecção</span>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 space-y-6">
          {/* Header da Página */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Prospecção</h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-muted-foreground">Encontre e gerencie seus leads via Google Maps</p>
                <Badge variant="outline" className="text-xs">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  Ativo
                </Badge>
              </div>
            </div>
          </div>

          {/* Métricas principais */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Prospects Encontrados</CardTitle>
                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                  <Search className="h-5 w-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight">{stats?.total || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total identificados
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/5 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Qualificados</CardTitle>
                <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight">{stats?.validated || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Validados para contato
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/5 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Contactados</CardTitle>
                <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight">{stats?.imported || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Convertidos em contatos
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs de Navegação */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-2xl grid-cols-3">
              <TabsTrigger value="search">
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </TabsTrigger>
              <TabsTrigger value="results">
                <Sparkles className="h-4 w-4 mr-2" />
                Resultados
              </TabsTrigger>
              <TabsTrigger value="prospects">
                <Building2 className="h-4 w-4 mr-2" />
                Lista Completa
              </TabsTrigger>
            </TabsList>

            <TabsContent value="search" className="space-y-4">
              <Card className="border-2 hover:border-primary/30 transition-all shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5 text-primary" />
                    Buscar Prospects
                  </CardTitle>
                  <CardDescription>Encontre novos leads usando Google Places</CardDescription>
                </CardHeader>
                <CardContent>
                  <GooglePlacesSearch onResults={handleSearchResults} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="results" className="space-y-4">
              <Card className="border-2 hover:border-primary/30 transition-all shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Resultados da Busca
                  </CardTitle>
                  <CardDescription>Prospects encontrados na sua busca</CardDescription>
                </CardHeader>
                <CardContent>
                  <GooglePlacesResults results={searchResults} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="prospects" className="space-y-4">
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
            <div className="flex items-center gap-3">
              <BulkExportProspects
                prospects={prospects}
                selectedIds={selectedProspects}
                onExportComplete={() => {
                  setSelectedProspects([]);
                  refetch();
                }}
              />
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
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedProspects.length === prospects.length && prospects.length > 0}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedProspects(prospects.map(p => p.id));
                      } else {
                        setSelectedProspects([]);
                      }
                    }}
                  />
                </TableHead>
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
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : prospects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    <Building2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhum prospect encontrado</p>
                  </TableCell>
                </TableRow>
              ) : (
                prospects.map((prospect) => (
                  <TableRow key={prospect.id} className="hover:bg-accent/50 transition-colors">
                    <TableCell>
                      <Checkbox
                        checked={selectedProspects.includes(prospect.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedProspects([...selectedProspects, prospect.id]);
                          } else {
                            setSelectedProspects(selectedProspects.filter(id => id !== prospect.id));
                          }
                        }}
                      />
                    </TableCell>
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
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}