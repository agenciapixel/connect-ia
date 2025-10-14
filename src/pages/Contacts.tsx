import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Search, Mail, Phone, Plus, Filter, UserPlus, TrendingUp, Edit, Trash2, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Contacts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingContact, setEditingContact] = useState<any>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_e164: "",
    tags: "",
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Buscar contatos
  const { data: contacts = [], isLoading, refetch } = useQuery({
    queryKey: ["contacts", searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("contacts")
        .select("*")
        .order("created_at", { ascending: false });

      if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,phone_e164.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Estatísticas
  const { data: stats } = useQuery({
    queryKey: ["contacts-stats"],
    queryFn: async () => {
      const { data, error, count } = await supabase
        .from("contacts")
        .select("created_at", { count: "exact" });

      if (error) throw error;

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const newContacts = data?.filter(c => new Date(c.created_at) >= thirtyDaysAgo).length || 0;

      return {
        total: count || 0,
        newContacts,
        // Simulated for now
        engaged: Math.floor((count || 0) * 0.72),
      };
    },
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

      const { data: member } = await supabase
        .from("members")
        .select("org_id")
        .eq("user_id", user.id)
        .single();

      if (!member) {
        toast.error("Organização não encontrada");
        return;
      }

      const { error } = await supabase.from("contacts").insert({
        org_id: member.org_id,
        full_name: formData.full_name || null,
        email: formData.email || null,
        phone_e164: formData.phone_e164 || null,
        tags: formData.tags ? formData.tags.split(",").map(t => t.trim()) : [],
      });

      if (error) throw error;

      toast.success("Contato adicionado com sucesso!");
      setShowAddDialog(false);
      setFormData({ full_name: "", email: "", phone_e164: "", tags: "" });
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
          tags: formData.tags ? formData.tags.split(",").map(t => t.trim()) : [],
        })
        .eq("id", editingContact.id);

      if (error) throw error;

      toast.success("Contato atualizado com sucesso!");
      setShowEditDialog(false);
      setEditingContact(null);
      setFormData({ full_name: "", email: "", phone_e164: "", tags: "" });
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
      tags: contact.tags?.join(", ") || "",
    });
    setShowEditDialog(true);
  };

  const statsData = [
    { label: "Total de Contatos", value: stats?.total.toString() || "0", change: 8, icon: Users },
    { label: "Novos (30 dias)", value: stats?.newContacts.toString() || "0", change: 12, icon: UserPlus },
    { label: "Engajados", value: stats?.engaged.toString() || "0", change: 5, icon: TrendingUp },
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
        <Button 
          onClick={() => setShowAddDialog(true)}
          className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity shadow-lg"
        >
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Contato
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {statsData.map((stat, index) => {
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
                        {contact.tags && contact.tags.length > 0 ? (
                          contact.tags.map((tag: string) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default" className="bg-emerald-500/10 text-emerald-600">
                        Ativo
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {contact.last_seen_at
                        ? formatDistanceToNow(new Date(contact.last_seen_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })
                        : formatDistanceToNow(new Date(contact.created_at), {
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

            <div className="space-y-2">
              <Label htmlFor="add-tags">Tags (separadas por vírgula)</Label>
              <Input
                id="add-tags"
                placeholder="Cliente, Premium, VIP"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
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

            <div className="space-y-2">
              <Label htmlFor="edit-tags">Tags (separadas por vírgula)</Label>
              <Input
                id="edit-tags"
                placeholder="Cliente, Premium, VIP"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
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
    </div>
  );
}
