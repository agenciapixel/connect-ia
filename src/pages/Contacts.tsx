import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Search, Mail, Phone, Plus, Edit, Trash2, Loader2, Building2, TrendingUp, Filter, Download } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useOrganization } from "@/contexts/OrganizationContext";
import { BulkExportProspects } from "@/components/BulkExportProspects";
import { OpportunityModal } from "@/components/OpportunityModal";

interface Prospect {
  id: string;
  pipeline_stage: string;
  places: {
    name: string;
    formatted_address: string;
    phone_number?: string;
    website?: string;
    types?: string[];
  };
  expected_revenue?: number;
  probability?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export default function Contacts() {
  const { currentOrg } = useOrganization();
  const [activeTab, setActiveTab] = useState("contacts");
  const [searchQuery, setSearchQuery] = useState("");
  const [prospectSearchQuery, setProspectSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [selectedProspects, setSelectedProspects] = useState<string[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showProspectModal, setShowProspectModal] = useState(false);
  const [editingContact, setEditingContact] = useState<any>(null);
  const [editingProspect, setEditingProspect] = useState<Prospect | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_e164: "",
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Buscar contatos
  const { data: contacts = [], isLoading, refetch } = useQuery({
    queryKey: ["contacts", searchQuery, currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return [];

      let query = supabase
        .from("contacts")
        .select("*")
        .eq("org_id", currentOrg.id)
        .order("created_at", { ascending: false });

      if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,phone_e164.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!currentOrg,
  });

  // Buscar prospects
  const { data: prospects = [], isLoading: prospectsLoading, refetch: refetchProspects } = useQuery({
    queryKey: ["prospects", prospectSearchQuery, currentOrg?.id],
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

      if (prospectSearchQuery) {
        query = query.or(`notes.ilike.%${prospectSearchQuery}%,places.name.ilike.%${prospectSearchQuery}%`);
      }

      const { data, error } = await query;
      if (error) {
        console.error("Error fetching prospects:", error);
        return [];
      }
      return data || [];
    },
    enabled: !!currentOrg?.id,
  });


  const handleAddContact = async () => {
    if (!formData.full_name && !formData.email) {
      toast.error("Preencha pelo menos nome ou email");
      return;
    }

    setSaving(true);
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

      // Verificar se a organização existe
      const { data: orgCheck, error: orgError } = await supabase
        .from("orgs")
        .select("id")
        .eq("id", currentOrg.id)
        .single();

      if (orgError || !orgCheck) {
        console.error("Organização não encontrada:", orgError);
        toast.error("Organização não encontrada. Tente fazer logout e login novamente.");
        return;
      }

      const { error } = await supabase.from("contacts").insert({
        org_id: currentOrg.id,
        full_name: formData.full_name || null,
        email: formData.email || null,
        phone_e164: formData.phone_e164 || null,
      });

      if (error) throw error;

      toast.success("Contato adicionado com sucesso!");
      setShowAddDialog(false);
      setFormData({ full_name: "", email: "", phone_e164: "" });
      refetch();
    } catch (error: any) {
      console.error("Error adding contact:", error);
      toast.error("Erro ao adicionar contato");
    } finally {
      setSaving(false);
    }
  };

  const handleEditContact = async () => {
    if (!editingContact) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("contacts")
        .update({
          full_name: formData.full_name || null,
          email: formData.email || null,
          phone_e164: formData.phone_e164 || null,
        })
        .eq("id", editingContact.id);

      if (error) throw error;

      toast.success("Contato atualizado com sucesso!");
      setShowEditDialog(false);
      setEditingContact(null);
      setFormData({ full_name: "", email: "", phone_e164: "" });
      refetch();
    } catch (error: any) {
      console.error("Error updating contact:", error);
      toast.error("Erro ao atualizar contato");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar este contato?")) return;

    setDeleting(id);
    try {
      const { error } = await supabase.from("contacts").delete().eq("id", id);

      if (error) throw error;

      toast.success("Contato deletado com sucesso!");
      refetch();
    } catch (error: any) {
      console.error("Error deleting contact:", error);
      toast.error("Erro ao deletar contato");
    } finally {
      setDeleting(null);
    }
  };

  const openEditDialog = (contact: any) => {
    setEditingContact(contact);
    setFormData({
      full_name: contact.full_name || "",
      email: contact.email || "",
      phone_e164: contact.phone_e164 || "",
    });
    setShowEditDialog(true);
  };

  // Funções para prospects
  const filteredProspects = prospects.filter(prospect => {
    const matchesSearch = !prospectSearchQuery || 
      prospect.places?.name?.toLowerCase().includes(prospectSearchQuery.toLowerCase()) ||
      prospect.notes?.toLowerCase().includes(prospectSearchQuery.toLowerCase());
    
    const matchesStage = stageFilter === "all" || prospect.pipeline_stage === stageFilter;
    
    return matchesSearch && matchesStage;
  });

  const handleSelectAllProspects = (checked: boolean) => {
    if (checked) {
      setSelectedProspects(filteredProspects.map(p => p.id));
    } else {
      setSelectedProspects([]);
    }
  };

  const handleSelectProspect = (prospectId: string, checked: boolean) => {
    if (checked) {
      setSelectedProspects(prev => [...prev, prospectId]);
    } else {
      setSelectedProspects(prev => prev.filter(id => id !== prospectId));
    }
  };

  const handleCreateOpportunity = () => {
    setEditingProspect(null);
    setShowProspectModal(true);
  };

  const handleEditOpportunity = (prospect: Prospect) => {
    setEditingProspect(prospect);
    setShowProspectModal(true);
  };

  const handleProspectModalSuccess = () => {
    refetchProspects();
  };


  return (
    <div className="flex flex-col h-full">
      {/* Header com Breadcrumbs */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Gestão</span>
            <span className="text-sm text-muted-foreground">/</span>
            <span className="text-sm font-medium">Contatos</span>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 space-y-6">
          {/* Header da Página */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Contatos</h1>
              <p className="text-muted-foreground mt-1">
                Gerencie sua base de contatos e prospects
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {activeTab === "prospects" && (
                <Button variant="outline" onClick={() => setShowProspectModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Oportunidade
                </Button>
              )}
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Contato
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="contacts" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Contatos</span>
              </TabsTrigger>
              <TabsTrigger value="prospects" className="flex items-center space-x-2">
                <Building2 className="h-4 w-4" />
                <span>Prospects</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab Contatos */}
            <TabsContent value="contacts" className="space-y-4">
              {/* Lista de Contatos */}
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
                    <Input 
                      placeholder="Buscar contatos..." 
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
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                      </TableCell>
                    </TableRow>
                  ) : contacts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Nenhum contato encontrado</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    contacts.map((contact) => (
                      <TableRow key={contact.id} className="hover:bg-accent/50 transition-colors">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-white font-semibold">
                              {(contact.full_name || contact.email || "?").charAt(0).toUpperCase()}
                            </div>
                            {contact.full_name || "Sem nome"}
                          </div>
                        </TableCell>
                        <TableCell>
                          {contact.email ? (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Mail className="h-4 w-4" />
                              {contact.email}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {contact.phone_e164 ? (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Phone className="h-4 w-4" />
                              {contact.phone_e164}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            <span className="text-muted-foreground text-sm">-</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="default" className="bg-emerald-500/10 text-emerald-600">
                            Ativo
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDistanceToNow(new Date(contact.created_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(contact)}
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteContact(contact.id)}
                              disabled={deleting === contact.id}
                            >
                              {deleting === contact.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Trash2 className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
            </TabsContent>

            {/* Tab Prospects */}
            <TabsContent value="prospects" className="space-y-4">
              {/* Filtros */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Filtros e Busca</CardTitle>
                  <CardDescription>
                    Encontre prospects específicos no pipeline
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          placeholder="Buscar por nome ou notas..."
                          value={prospectSearchQuery}
                          onChange={(e) => setProspectSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <select 
                        value={stageFilter}
                        onChange={(e) => setStageFilter(e.target.value)}
                        className="px-3 py-2 border rounded-md"
                      >
                        <option value="all">Todos os Estágios</option>
                        <option value="lead">Leads</option>
                        <option value="contacted">Contactados</option>
                        <option value="qualified">Qualificados</option>
                        <option value="proposal">Proposta</option>
                        <option value="negotiation">Negociação</option>
                        <option value="won">Ganhos</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lista de Prospects */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        Prospects no Pipeline
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {filteredProspects.length} {filteredProspects.length === 1 ? 'prospect encontrado' : 'prospects encontrados'}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={selectedProspects.length === filteredProspects.length && filteredProspects.length > 0}
                          onCheckedChange={handleSelectAllProspects}
                        />
                        <span className="text-sm text-muted-foreground">
                          Selecionar todos
                        </span>
                      </div>
                      <BulkExportProspects
                        prospects={prospects}
                        selectedIds={selectedProspects}
                        onExportComplete={() => {
                          setSelectedProspects([]);
                        }}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {prospectsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        <span>Carregando prospects...</span>
                      </div>
                    </div>
                  ) : filteredProspects.length === 0 ? (
                    <div className="text-center py-12">
                      <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Nenhum prospect encontrado</h3>
                      <p className="text-muted-foreground mb-4">
                        {prospectSearchQuery || stageFilter !== "all"
                          ? "Tente ajustar os filtros de busca"
                          : "Comece adicionando prospects ao seu pipeline"
                        }
                      </p>
                      <Button onClick={handleCreateOpportunity}>
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Prospect
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredProspects.map((prospect) => (
                        <Card key={prospect.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleEditOpportunity(prospect)}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <Checkbox
                                  checked={selectedProspects.includes(prospect.id)}
                                  onCheckedChange={(checked) => handleSelectProspect(prospect.id, checked as boolean)}
                                />
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <h3 className="font-medium">{prospect.places?.name || 'Nome não disponível'}</h3>
                                    <Badge variant="outline">
                                      {prospect.pipeline_stage}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-1">
                                    {prospect.places?.formatted_address}
                                  </p>
                                  {prospect.places?.phone_number && (
                                    <p className="text-sm text-muted-foreground">
                                      📞 {prospect.places.phone_number}
                                    </p>
                                  )}
                                  {prospect.expected_revenue && (
                                    <p className="text-sm font-medium text-green-600">
                                      💰 R$ {prospect.expected_revenue.toLocaleString('pt-BR')}
                                    </p>
                                  )}
                                  {prospect.probability && (
                                    <p className="text-sm text-blue-600">
                                      📊 {prospect.probability}% de probabilidade
                                    </p>
                                  )}
                                  {prospect.notes && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                      📝 {prospect.notes}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditOpportunity(prospect)}
                                >
                                  Editar
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Dialog Adicionar Contato */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Adicionar Contato</DialogTitle>
            <DialogDescription>Preencha os dados do novo contato</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="add-name">Nome Completo</Label>
              <Input
                id="add-name"
                placeholder="João Silva"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-email">Email</Label>
              <Input
                id="add-email"
                type="email"
                placeholder="joao@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-phone">Telefone</Label>
              <Input
                id="add-phone"
                type="tel"
                placeholder="+5511999999999"
                value={formData.phone_e164}
                onChange={(e) => setFormData({ ...formData, phone_e164: e.target.value })}
              />
            </div>

          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleAddContact}
              disabled={saving}
              className="bg-gradient-to-r from-primary to-primary-glow"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Editar Contato */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Contato</DialogTitle>
            <DialogDescription>Atualize os dados do contato</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome Completo</Label>
              <Input
                id="edit-name"
                placeholder="João Silva"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="joao@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-phone">Telefone</Label>
              <Input
                id="edit-phone"
                type="tel"
                placeholder="+5511999999999"
                value={formData.phone_e164}
                onChange={(e) => setFormData({ ...formData, phone_e164: e.target.value })}
              />
            </div>

          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleEditContact}
              disabled={saving}
              className="bg-gradient-to-r from-primary to-primary-glow"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Prospects */}
      <OpportunityModal
        open={showProspectModal}
        onOpenChange={setShowProspectModal}
        prospect={editingProspect}
        onSuccess={handleProspectModalSuccess}
      />
    </div>
  );
}
