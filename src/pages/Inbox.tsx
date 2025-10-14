import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Search, Clock, CheckCircle, User, Send, Bot, ArrowRight, ArrowLeft, Loader2, Plus, Mail } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";

interface AIAgent {
  id: string;
  name: string;
  type: string;
  status: string;
}

interface Conversation {
  id: string;
  contact_id: string;
  status: string;
  last_message_at: string;
  contacts: {
    full_name: string;
    email: string;
  };
  unreadCount?: number;
}

export default function Inbox() {
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>("");
  const [transferring, setTransferring] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isAIHandling, setIsAIHandling] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewMessageDialog, setShowNewMessageDialog] = useState(false);
  const [contactSearch, setContactSearch] = useState("");
  const [newContactName, setNewContactName] = useState("");
  const [newContactEmail, setNewContactEmail] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");
  const [selectedContactId, setSelectedContactId] = useState<string>("");
  const [creatingConversation, setCreatingConversation] = useState(false);

  // Buscar conversas
  const { data: conversations = [], isLoading: loadingConversations, refetch: refetchConversations } = useQuery({
    queryKey: ["inbox-conversations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select(`
          id,
          contact_id,
          status,
          last_message_at,
          contacts (
            full_name,
            email
          )
        `)
        .order("last_message_at", { ascending: false });

      if (error) throw error;
      return data as Conversation[];
    },
  });

  // Buscar mensagens da conversa selecionada
  const { data: messages = [], isLoading: loadingMessages, refetch: refetchMessages } = useQuery({
    queryKey: ["conversation-messages", selectedConversation?.id],
    queryFn: async () => {
      if (!selectedConversation?.id) return [];
      
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", selectedConversation.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!selectedConversation?.id,
  });

  // Buscar contatos para nova mensagem
  const { data: contacts = [], isLoading: loadingContacts } = useQuery({
    queryKey: ["contacts", contactSearch],
    queryFn: async () => {
      let query = supabase
        .from("contacts")
        .select("id, full_name, email, phone_e164")
        .order("full_name", { ascending: true })
        .limit(10);

      if (contactSearch) {
        query = query.or(`full_name.ilike.%${contactSearch}%,email.ilike.%${contactSearch}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: showNewMessageDialog,
  });

  useEffect(() => {
    loadAgents();
  }, []);

  useEffect(() => {
    // Selecionar primeira conversa automaticamente
    if (conversations.length > 0 && !selectedConversation) {
      setSelectedConversation(conversations[0]);
    }
  }, [conversations]);

  const loadAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_agents')
        .select('id, name, type, status')
        .eq('status', 'ativo')
        .order('name');

      if (error) throw error;
      setAgents(data || []);
    } catch (error: any) {
      console.error('Error loading agents:', error);
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setIsAIHandling(false);
  };

  const handleTransferToAI = async () => {
    if (!selectedAgent || !selectedConversation) {
      toast.error("Selecione um agente");
      return;
    }

    setTransferring(true);
    try {
      const { error } = await supabase
        .from("agent_conversations")
        .insert({
          agent_id: selectedAgent,
          contact_id: selectedConversation.contact_id,
          status: "active",
        });

      if (error) throw error;
      
      setIsAIHandling(true);
      toast.success("Conversa transferida para o agente de IA!");
      
      // Enviar mensagem de boas-vindas do agente
      const agent = agents.find(a => a.id === selectedAgent);
      if (agent) {
        await supabase.from("messages").insert({
          conversation_id: selectedConversation.id,
          org_id: selectedConversation.contact_id,
          direction: "outbound",
          body: `Olá! Sou ${agent.name}, agente de ${agent.type}. Como posso ajudá-lo?`,
        });
        
        refetchMessages();
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast.error("Erro ao transferir conversa");
    } finally {
      setTransferring(false);
    }
  };

  const handleTransferToHuman = async () => {
    if (!selectedConversation) return;
    
    try {
      const { error } = await supabase
        .from("agent_conversations")
        .update({ status: "transferred" })
        .eq("contact_id", selectedConversation.contact_id);

      if (error) throw error;

      setIsAIHandling(false);
      toast.success("Conversa transferida para atendimento humano!");
      
      await supabase.from("messages").insert({
        conversation_id: selectedConversation.id,
        org_id: selectedConversation.contact_id,
        direction: "outbound",
        body: "Conversa transferida para atendimento humano",
      });
      
      refetchMessages();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error("Erro ao transferir conversa");
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setSending(true);
    try {
      const { error } = await supabase.from("messages").insert({
        conversation_id: selectedConversation.id,
        org_id: selectedConversation.contact_id,
        direction: "outbound",
        body: newMessage,
      });

      if (error) throw error;

      setNewMessage("");
      refetchMessages();
      toast.success("Mensagem enviada!");

      // Se o agente de IA está atendendo, chamar edge function
      if (isAIHandling && selectedAgent) {
        const { data, error: aiError } = await supabase.functions.invoke('ai-agent-chat', {
          body: {
            agentId: selectedAgent,
            message: newMessage,
            conversationId: selectedConversation.id
          }
        });

        if (!aiError && data?.response) {
          await supabase.from("messages").insert({
            conversation_id: selectedConversation.id,
            org_id: selectedConversation.contact_id,
            direction: "inbound",
            body: data.response,
          });
          
          refetchMessages();
        }
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast.error("Erro ao enviar mensagem");
    } finally {
      setSending(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      open: { label: "Aberta", className: "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20" },
      pending: { label: "Pendente", className: "bg-orange-500/10 text-orange-600 hover:bg-orange-500/20" },
      closed: { label: "Fechada", className: "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20" },
    };
    const { label, className } = config[status as keyof typeof config] || config.open;
    return <Badge variant="secondary" className={className}>{label}</Badge>;
  };

  const handleCreateNewConversation = async () => {
    setCreatingConversation(true);
    try {
      // Buscar org_id do usuário
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

      let contactId = selectedContactId;

      // Se não selecionou contato existente, criar novo
      if (!contactId && (newContactName || newContactEmail || newContactPhone)) {
        const { data: newContact, error: contactError } = await supabase
          .from("contacts")
          .insert({
            org_id: member.org_id,
            full_name: newContactName || null,
            email: newContactEmail || null,
            phone_e164: newContactPhone || null,
          })
          .select()
          .single();

        if (contactError) throw contactError;
        contactId = newContact.id;
      }

      if (!contactId) {
        toast.error("Selecione ou crie um contato");
        return;
      }

      // Criar nova conversa
      const { data: newConversation, error: convError } = await supabase
        .from("conversations")
        .insert({
          org_id: member.org_id,
          contact_id: contactId,
          status: "open",
        })
        .select(`
          id,
          contact_id,
          status,
          last_message_at,
          contacts (
            full_name,
            email
          )
        `)
        .single();

      if (convError) throw convError;

      toast.success("Nova conversa criada!");
      setShowNewMessageDialog(false);
      setSelectedContactId("");
      setNewContactName("");
      setNewContactEmail("");
      setNewContactPhone("");
      setContactSearch("");
      
      // Atualizar lista e selecionar nova conversa
      refetchConversations();
      setSelectedConversation(newConversation as Conversation);
    } catch (error: any) {
      console.error("Error creating conversation:", error);
      toast.error("Erro ao criar conversa");
    } finally {
      setCreatingConversation(false);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.contacts?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.contacts?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6 bg-gradient-to-br from-background via-background to-primary/5 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Inbox
          </h1>
          <p className="text-muted-foreground mt-2">Gerencie todas as suas conversas em um só lugar</p>
        </div>
        <Button 
          onClick={() => setShowNewMessageDialog(true)}
          className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity shadow-lg"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Mensagem
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1 border-2 hover:border-primary/30 transition-all shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              Conversas {loadingConversations && <Loader2 className="inline h-4 w-4 animate-spin ml-2" />}
            </CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar conversas..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              <div className="space-y-1 p-4">
                {loadingConversations ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma conversa encontrada</p>
                  </div>
                ) : (
                  filteredConversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv)}
                      className={`flex items-start gap-3 p-4 rounded-lg border hover:bg-accent/50 cursor-pointer transition-all group ${
                        selectedConversation?.id === conv.id ? "bg-accent border-primary" : ""
                      }`}
                    >
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-white font-semibold relative">
                        {(conv.contacts?.full_name || conv.contacts?.email || "?").charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-semibold truncate">
                            {conv.contacts?.full_name || conv.contacts?.email || "Sem nome"}
                          </p>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {conv.last_message_at 
                              ? formatDistanceToNow(new Date(conv.last_message_at), { 
                                  addSuffix: true, 
                                  locale: ptBR 
                                })
                              : "Sem data"
                            }
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{conv.contacts?.email}</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {getStatusBadge(conv.status)}
                          {conv.unreadCount && conv.unreadCount > 0 && (
                            <Badge variant="destructive" className="h-5 px-2">
                              {conv.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-2 hover:border-primary/30 transition-all shadow-lg">
          <CardHeader className="border-b space-y-4">
            {selectedConversation ? (
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-white font-semibold text-lg">
                  {(selectedConversation.contacts?.full_name || selectedConversation.contacts?.email || "?").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <CardTitle>
                    {selectedConversation.contacts?.full_name || selectedConversation.contacts?.email || "Sem nome"}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    {isAIHandling ? (
                      <>
                        <Bot className="h-3 w-3 text-purple-500" />
                        <span className="text-purple-500">Atendido por IA</span>
                      </>
                    ) : (
                      <>
                        <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        {selectedConversation.contacts?.email}
                      </>
                    )}
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <User className="mr-2 h-4 w-4" />
                  Ver Perfil
                </Button>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                Selecione uma conversa
              </div>
            )}

            {/* Transfer Controls */}
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              {!isAIHandling ? (
                <>
                  <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Selecione um agente de IA" />
                    </SelectTrigger>
                    <SelectContent>
                      {agents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          <div className="flex items-center gap-2">
                            <Bot className="h-4 w-4" />
                            {agent.name} ({agent.type})
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={handleTransferToAI}
                    disabled={!selectedAgent || transferring}
                    className="bg-gradient-to-r from-purple-500 to-purple-600"
                  >
                    {transferring ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <ArrowRight className="h-4 w-4 mr-2" />
                    )}
                    Transferir para IA
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={handleTransferToHuman}
                  variant="outline"
                  className="w-full border-orange-500/50 hover:bg-orange-500/10"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Transferir para Humano
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <ScrollArea className="h-[400px] mb-4">
              <div className="space-y-4">
                {loadingMessages ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma mensagem ainda</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id}>
                      {msg.direction === 'inbound' ? (
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-white text-sm font-semibold">
                            {selectedConversation?.contacts?.full_name?.charAt(0).toUpperCase() || "?"}
                          </div>
                          <div className="flex-1 max-w-md">
                            <div className="bg-muted rounded-2xl rounded-tl-sm p-4">
                              <p className="text-sm">{msg.body}</p>
                            </div>
                            <span className="text-xs text-muted-foreground mt-1 ml-2">
                              {new Date(msg.sent_at).toLocaleTimeString('pt-BR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-3 justify-end">
                          <div className="flex-1 max-w-md">
                            <div className="bg-gradient-to-r from-primary to-primary-glow rounded-2xl rounded-tr-sm p-4 ml-auto">
                              <p className="text-sm text-white">{msg.body}</p>
                            </div>
                            <div className="flex items-center justify-end gap-1 mt-1 mr-2">
                              <span className="text-xs text-muted-foreground">
                                {new Date(msg.sent_at).toLocaleTimeString('pt-BR', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                              {msg.delivered_at && <CheckCircle className="h-3 w-3 text-emerald-500" />}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            <div className="flex items-center gap-2 pt-4 border-t">
              <Input 
                placeholder={isAIHandling ? "O agente de IA está respondendo..." : "Digite sua mensagem..."} 
                className="flex-1"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                disabled={!selectedConversation || sending}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={sending || !newMessage.trim() || !selectedConversation}
                className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog Nova Mensagem */}
      <Dialog open={showNewMessageDialog} onOpenChange={setShowNewMessageDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Nova Mensagem</DialogTitle>
            <DialogDescription>
              Selecione um contato existente ou crie um novo para iniciar uma conversa.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Buscar contato existente */}
            <div className="space-y-2">
              <Label>Buscar Contato Existente</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  className="pl-9"
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                />
              </div>

              {contactSearch && (
                <ScrollArea className="h-[150px] border rounded-md p-2">
                  {loadingContacts ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : contacts.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhum contato encontrado
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {contacts.map((contact) => (
                        <div
                          key={contact.id}
                          onClick={() => {
                            setSelectedContactId(contact.id);
                            setNewContactName("");
                            setNewContactEmail("");
                            setNewContactPhone("");
                          }}
                          className={`p-3 rounded-lg border cursor-pointer transition-all hover:bg-accent ${
                            selectedContactId === contact.id ? "bg-accent border-primary" : ""
                          }`}
                        >
                          <p className="text-sm font-semibold">
                            {contact.full_name || contact.email || "Sem nome"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {contact.email || contact.phone_e164}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              )}
            </div>

            {/* Ou criar novo contato */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Ou criar novo</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  placeholder="Nome completo"
                  value={newContactName}
                  onChange={(e) => {
                    setNewContactName(e.target.value);
                    setSelectedContactId("");
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@exemplo.com"
                    className="pl-9"
                    value={newContactEmail}
                    onChange={(e) => {
                      setNewContactEmail(e.target.value);
                      setSelectedContactId("");
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+5511999999999"
                  value={newContactPhone}
                  onChange={(e) => {
                    setNewContactPhone(e.target.value);
                    setSelectedContactId("");
                  }}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowNewMessageDialog(false);
                setSelectedContactId("");
                setNewContactName("");
                setNewContactEmail("");
                setNewContactPhone("");
                setContactSearch("");
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateNewConversation}
              disabled={creatingConversation || (!selectedContactId && !newContactName && !newContactEmail && !newContactPhone)}
              className="bg-gradient-to-r from-primary to-primary-glow"
            >
              {creatingConversation ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Criar Conversa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
