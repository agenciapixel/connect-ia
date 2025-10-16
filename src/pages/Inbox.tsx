import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  MessageSquare, 
  Search, 
  Clock, 
  CheckCircle, 
  User, 
  Send, 
  Bot, 
  ArrowRight, 
  ArrowLeft, 
  Loader2, 
  Plus, 
  Mail,
  Star,
  StarOff,
  Tag,
  Pin,
  PinOff,
  Trash2,
  Reply,
  Forward,
  Copy,
  Download,
  Eye,
  EyeOff,
  Calendar,
  Users,
  Zap,
  Bell,
  BellOff,
  Settings,
  RefreshCw,
  Filter,
  MoreVertical,
  Phone,
  Video,
  Archive,
  Play,
  Pause,
  Volume2,
  SkipBack,
  SkipForward
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { useOrganization } from "@/contexts/OrganizationContext";

interface AIAgent {
  id: string;
  name: string;
  type: string;
  status: string;
}

interface Agent {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: 'online' | 'busy' | 'away' | 'offline';
  workload: number;
  maxWorkload: number;
  skills: string[];
  lastActive: string;
}

interface Conversation {
  id: string;
  contact_id: string;
  status: string;
  last_message_at: string;
  unreadCount?: number;
  channel_type?: string;
  priority?: string;
  tags?: string[];
  assigned_agent?: string | null;
  contacts: {
    full_name?: string;
    email?: string;
    phone_e164?: string;
    external_id?: string;
  };
}

export default function Inbox() {
  const { currentOrg } = useOrganization();
  const [aiAgents, setAiAgents] = useState<AIAgent[]>([
    {
      id: "ai-1",
      name: "Assistente de Vendas",
      type: "vendas",
      status: "ativo"
    },
    {
      id: "ai-2", 
      name: "Suporte Técnico",
      type: "suporte",
      status: "ativo"
    },
    {
      id: "ai-3",
      name: "Atendimento Geral",
      type: "atendimento", 
      status: "ativo"
    }
  ]);
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
  
  // Novos estados para funcionalidades avançadas
  const [conversationFilter, setConversationFilter] = useState<string>("all");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");
  const [starredConversations, setStarredConversations] = useState<Set<string>>(new Set());
  const [pinnedConversations, setPinnedConversations] = useState<Set<string>>(new Set());
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
  const [showMessageActions, setShowMessageActions] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  // Estados para upload de arquivos
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  
  // Estados para IA
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  
  // Estados para perfil do contato
  const [showContactProfile, setShowContactProfile] = useState(false);
  const [contactProfile, setContactProfile] = useState<any>(null);
  
  // Estados para preview de imagens
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>("");
  
  // Estados para player de áudio
  const [audioUrls, setAudioUrls] = useState<{[key: string]: string}>({});
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState<{[key: string]: number}>({});
  
  // Estados para download de arquivos
  const [downloadingFiles, setDownloadingFiles] = useState<Set<string>>(new Set());
  
  // Estados para sistema de múltiplos atendentes
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: "agent-1",
      name: "Ana Silva",
      email: "ana@empresa.com",
      avatar: "https://ui-avatars.com/api/?name=Ana+Silva&background=random",
      status: "online",
      workload: 3,
      maxWorkload: 10,
      skills: ["vendas", "suporte"],
      lastActive: new Date().toISOString()
    },
    {
      id: "agent-2", 
      name: "Carlos Santos",
      email: "carlos@empresa.com",
      avatar: "https://ui-avatars.com/api/?name=Carlos+Santos&background=random",
      status: "busy",
      workload: 7,
      maxWorkload: 10,
      skills: ["tecnico", "suporte"],
      lastActive: new Date(Date.now() - 300000).toISOString()
    },
    {
      id: "agent-3",
      name: "Maria Oliveira", 
      email: "maria@empresa.com",
      avatar: "https://ui-avatars.com/api/?name=Maria+Oliveira&background=random",
      status: "away",
      workload: 2,
      maxWorkload: 10,
      skills: ["vendas", "marketing"],
      lastActive: new Date(Date.now() - 900000).toISOString()
    },
    {
      id: "agent-4",
      name: "João Costa",
      email: "joao@empresa.com", 
      avatar: "https://ui-avatars.com/api/?name=Joao+Costa&background=random",
      status: "offline",
      workload: 0,
      maxWorkload: 10,
      skills: ["tecnico", "vendas"],
      lastActive: new Date(Date.now() - 3600000).toISOString()
    }
  ]);
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  const [showAgentManagement, setShowAgentManagement] = useState(false);
  const [conversationAssignments, setConversationAssignments] = useState<{[key: string]: string}>({
    "mock-conv-1": "agent-1",
    "mock-conv-2": "agent-2", 
    "mock-conv-3": "agent-1"
  });

  // Buscar conversas - usando dados mock temporariamente
  const { data: conversations = [], isLoading: loadingConversations, refetch: refetchConversations } = useQuery({
    queryKey: ["inbox-conversations", currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return [];
      // Retornar dados mock temporariamente até o app do Meta estar publicado
      const mockConversations = [
        {
          id: "mock-conv-1",
          contact_id: "mock-contact-1",
          status: "open",
          last_message_at: new Date().toISOString(),
          unreadCount: 2,
          channel_type: "instagram",
          priority: "high",
          tags: ["vip", "marketing"],
          assigned_agent: "agent-1",
          contacts: {
            full_name: "João Silva",
            email: "joao@exemplo.com",
            phone_e164: "+5511999999999",
            external_id: "instagram_123456"
          }
        },
        {
          id: "mock-conv-2",
          contact_id: "mock-contact-2", 
          status: "open",
          last_message_at: new Date(Date.now() - 3600000).toISOString(),
          unreadCount: 1,
          channel_type: "whatsapp",
          priority: "medium",
          tags: ["suporte"],
          assigned_agent: "agent-2",
          contacts: {
            full_name: "Maria Santos",
            email: "maria@exemplo.com",
            phone_e164: "+5511888888888",
            external_id: "whatsapp_789012"
          }
        },
        {
          id: "mock-conv-3",
          contact_id: "mock-contact-3",
          status: "resolved",
          last_message_at: new Date(Date.now() - 7200000).toISOString(),
          unreadCount: 0,
          channel_type: "instagram",
          priority: "low",
          tags: ["finalizado"],
          assigned_agent: "agent-1",
          contacts: {
            full_name: "Pedro Costa",
            email: "pedro@exemplo.com", 
            phone_e164: "+5511777777777",
            external_id: "instagram_345678"
          }
        },
        {
          id: "mock-conv-4",
          contact_id: "mock-contact-4",
          status: "open",
          last_message_at: new Date(Date.now() - 1800000).toISOString(),
          unreadCount: 0,
          channel_type: "whatsapp",
          priority: "high",
          tags: ["urgente", "venda"],
          assigned_agent: null,
          contacts: {
            full_name: "Ana Oliveira",
            email: "ana@exemplo.com",
            phone_e164: "+5511666666666",
            external_id: "whatsapp_456789"
          }
        },
        {
          id: "mock-conv-5",
          contact_id: "mock-contact-5",
          status: "assigned",
          last_message_at: new Date(Date.now() - 900000).toISOString(),
          unreadCount: 3,
          channel_type: "instagram",
          priority: "medium",
          tags: ["dúvida"],
          contacts: {
            full_name: "Carlos Mendes",
            email: "carlos@exemplo.com",
            phone_e164: "+5511555555555",
            external_id: "instagram_567890"
          }
        }
      ];

      return mockConversations as Conversation[];
    },
    enabled: !!currentOrg,
  });

  // Buscar mensagens da conversa selecionada - usando dados mock temporariamente
  const { data: messages = [], isLoading: loadingMessages, refetch: refetchMessages } = useQuery({
    queryKey: ["conversation-messages", selectedConversation?.id],
    queryFn: async () => {
      if (!selectedConversation?.id) return [];
      
      // Retornar mensagens mock baseadas na conversa selecionada
      const mockMessages = {
        "mock-conv-1": [
          {
            id: "msg-1",
            conversation_id: "mock-conv-1",
            direction: "inbound",
            content: "Olá! Gostaria de saber mais sobre os serviços de vocês.",
            channel_type: "instagram",
            status: "delivered",
            created_at: new Date(Date.now() - 300000).toISOString(),
            metadata: { message_type: "text" }
          },
          {
            id: "msg-2", 
            conversation_id: "mock-conv-1",
            direction: "outbound",
            content: "Olá João! Claro, ficarei feliz em ajudar. Que tipo de serviço você está procurando?",
            channel_type: "instagram",
            status: "delivered",
            created_at: new Date(Date.now() - 240000).toISOString(),
            metadata: { message_type: "text" }
          },
          {
            id: "msg-3",
            conversation_id: "mock-conv-1", 
            direction: "inbound",
            content: "Preciso de ajuda com marketing digital para minha empresa.",
            channel_type: "instagram",
            status: "delivered",
            created_at: new Date(Date.now() - 180000).toISOString(),
            metadata: { message_type: "text" }
          }
        ],
        "mock-conv-2": [
          {
            id: "msg-4",
            conversation_id: "mock-conv-2",
            direction: "inbound", 
            content: "Bom dia! Vocês atendem por WhatsApp também?",
            channel_type: "whatsapp",
            status: "delivered",
            created_at: new Date(Date.now() - 3600000).toISOString(),
            metadata: { message_type: "text" }
          },
          {
            id: "msg-5",
            conversation_id: "mock-conv-2",
            direction: "outbound",
            content: "Sim Maria! Atendemos por WhatsApp, Instagram e outros canais. Como posso ajudar?",
            channel_type: "whatsapp", 
            status: "delivered",
            created_at: new Date(Date.now() - 3540000).toISOString(),
            metadata: { message_type: "text" }
          },
          {
            id: "msg-6",
            conversation_id: "mock-conv-2",
            direction: "inbound",
            content: "Perfeito! Enviei um documento com minha dúvida.",
            channel_type: "whatsapp",
            status: "delivered", 
            created_at: new Date(Date.now() - 3480000).toISOString(),
            metadata: { message_type: "document" }
          }
        ],
        "mock-conv-3": [
          {
            id: "msg-7",
            conversation_id: "mock-conv-3",
            direction: "inbound",
            content: "Obrigado pelo atendimento! Foi muito útil.",
            channel_type: "instagram",
            status: "delivered",
            created_at: new Date(Date.now() - 7200000).toISOString(),
            metadata: { message_type: "text" }
          },
          {
            id: "msg-8",
            conversation_id: "mock-conv-3", 
            direction: "outbound",
            content: "De nada Pedro! Foi um prazer ajudar. Qualquer dúvida, estamos aqui! 😊",
            channel_type: "instagram",
            status: "delivered",
            created_at: new Date(Date.now() - 7140000).toISOString(),
            metadata: { message_type: "text" }
          },
          {
            id: "msg-audio-1",
            conversation_id: "mock-conv-3",
            direction: "outbound",
            content: "",
            channel_type: "whatsapp",
            status: "delivered",
            created_at: new Date(Date.now() - 1800000).toISOString(),
            metadata: { message_type: "audio" }
          },
          {
            id: "msg-video-1",
            conversation_id: "mock-conv-3",
            direction: "inbound",
            content: "",
            channel_type: "instagram",
            status: "delivered",
            created_at: new Date(Date.now() - 900000).toISOString(),
            metadata: { message_type: "video" }
          }
        ]
      };

      return mockMessages[selectedConversation.id as keyof typeof mockMessages] || [];
    },
    enabled: !!selectedConversation?.id,
  });

  // Buscar contatos para nova mensagem
  const { data: contacts = [], isLoading: loadingContacts } = useQuery({
    queryKey: ["contacts", contactSearch, currentOrg?.id],
    queryFn: async () => {
      if (!currentOrg) return [];

      let query = supabase
        .from("contacts")
        .select("id, full_name, email, phone_e164")
        .eq("org_id", currentOrg.id)
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

  // Novas funções para funcionalidades avançadas
  const toggleStarConversation = (conversationId: string) => {
    setStarredConversations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(conversationId)) {
        newSet.delete(conversationId);
      } else {
        newSet.add(conversationId);
      }
      return newSet;
    });
  };

  const togglePinConversation = (conversationId: string) => {
    setPinnedConversations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(conversationId)) {
        newSet.delete(conversationId);
      } else {
        newSet.add(conversationId);
      }
      return newSet;
    });
  };

  const archiveConversation = (conversationId: string) => {
    toast.success("Conversa arquivada!");
    // Aqui você implementaria a lógica real de arquivamento
  };

  const deleteConversation = (conversationId: string) => {
    toast.success("Conversa excluída!");
    // Aqui você implementaria a lógica real de exclusão
  };

  const copyMessage = (messageContent: string) => {
    navigator.clipboard.writeText(messageContent);
    toast.success("Mensagem copiada!");
  };

  const replyToMessage = (messageId: string) => {
    // Implementar funcionalidade de resposta
    toast.success("Funcionalidade de resposta em desenvolvimento!");
  };

  const forwardMessage = (messageId: string) => {
    // Implementar funcionalidade de encaminhamento
    toast.success("Funcionalidade de encaminhamento em desenvolvimento!");
  };

  const getChannelIcon = (channelType: string) => {
    switch (channelType) {
      case 'instagram':
        return '📷';
      case 'whatsapp':
        return '📱';
      case 'facebook':
        return '📘';
      default:
        return '💬';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'assigned':
        return 'bg-purple-100 text-purple-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Funções para upload de arquivos
  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast.error(`Arquivo ${file.name} é muito grande (máximo 10MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setUploadingFiles(prev => [...prev, ...validFiles]);
      setShowFileUpload(true);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setUploadingFiles(prev => prev.filter((_, i) => i !== index));
    if (uploadingFiles.length === 1) {
      setShowFileUpload(false);
    }
  };

  const getFileType = (file: File) => {
    const type = file.type.split('/')[0];
    switch (type) {
      case 'image':
        return 'image';
      case 'audio':
        return 'audio';
      case 'video':
        return 'video';
      default:
        if (file.type.includes('pdf') || file.type.includes('document') || file.type.includes('text')) {
          return 'document';
        }
        return 'file';
    }
  };

  const getFileIconForUpload = (file: File) => {
    const type = getFileType(file);
    switch (type) {
      case 'image':
        return '🖼️';
      case 'audio':
        return '🎵';
      case 'video':
        return '🎬';
      case 'document':
        return '📄';
      default:
        return '📎';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const simulateFileUpload = async (file: File) => {
    const fileId = Math.random().toString(36).substr(2, 9);
    
    // Simular progresso de upload
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
    }

    // Simular URL do arquivo (em produção, seria a URL real do storage)
    const mockFileUrl = URL.createObjectURL(file);
    
    // Remover da lista de uploads
    setUploadingFiles(prev => prev.filter(f => f !== file));
    delete uploadProgress[fileId];

    return {
      url: mockFileUrl,
      type: getFileType(file),
      name: file.name,
      size: file.size
    };
  };

  const handleSendFiles = async () => {
    if (!selectedConversation || uploadingFiles.length === 0) return;

    setSending(true);
    try {
      // Simular upload de todos os arquivos
      const uploadPromises = uploadingFiles.map(file => simulateFileUpload(file));
      const uploadedFiles = await Promise.all(uploadPromises);

      // Enviar mensagem com arquivos
      const fileMessage = uploadedFiles.map(f => `${getFileIconForUpload({name: f.name, type: f.type} as File)} ${f.name}`).join('\n');
      
      const { error } = await supabase.from("messages").insert({
        conversation_id: selectedConversation.id,
        org_id: selectedConversation.contact_id,
        direction: "outbound",
        body: fileMessage,
        metadata: {
          message_type: 'files',
          files: uploadedFiles
        }
      });

      if (error) throw error;

      setUploadingFiles([]);
      setShowFileUpload(false);
      refetchMessages();
      toast.success(`${uploadedFiles.length} arquivo(s) enviado(s) com sucesso!`);

    } catch (error: any) {
      console.error('Error:', error);
      toast.error("Erro ao enviar arquivos");
    } finally {
      setSending(false);
    }
  };

  // Função para gerar sugestões de IA
  const generateAISuggestions = async () => {
    if (!selectedConversation || messages.length === 0) {
      toast.error("Selecione uma conversa com mensagens para gerar sugestões");
      return;
    }

    setAiLoading(true);
    try {
      // Pegar as últimas mensagens da conversa para contexto
      const recentMessages = messages.slice(-3); // Últimas 3 mensagens
      const lastMessage = recentMessages[recentMessages.length - 1];
      
      // Simular geração de sugestões baseadas no contexto
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simular delay da IA
      
      // Sugestões baseadas no tipo de mensagem ou contexto
      let suggestions: string[] = [];
      
      if (lastMessage?.direction === 'inbound') {
        const messageContent = lastMessage.content.toLowerCase();
        
        if (messageContent.includes('preço') || messageContent.includes('valor') || messageContent.includes('custo')) {
          suggestions = [
            "Olá! Posso ajudá-lo com informações sobre nossos preços. Qual produto ou serviço você tem interesse?",
            "Temos diferentes planos disponíveis. Gostaria de conhecer nossas opções?",
            "Posso enviar nossa tabela de preços atualizada. Qual seu e-mail?"
          ];
        } else if (messageContent.includes('horário') || messageContent.includes('funcionamento') || messageContent.includes('aberto')) {
          suggestions = [
            "Nosso horário de funcionamento é de segunda a sexta, das 8h às 18h.",
            "Estamos abertos de segunda a sexta das 8h às 18h. Como posso ajudá-lo?",
            "Funcionamos de segunda a sexta, das 8h às 18h. Precisa de algo específico?"
          ];
        } else if (messageContent.includes('contato') || messageContent.includes('telefone') || messageContent.includes('endereço')) {
          suggestions = [
            "Posso passar nossos contatos. Telefone: (11) 99999-9999 e e-mail: contato@empresa.com",
            "Nosso telefone é (11) 99999-9999. Prefere falar agora?",
            "Nosso endereço é Rua Exemplo, 123. Posso enviar no WhatsApp!"
          ];
        } else if (messageContent.includes('produto') || messageContent.includes('serviço')) {
          suggestions = [
            "Temos uma variedade de produtos/serviços. Qual área você tem interesse?",
            "Posso apresentar nossos principais produtos. O que você busca?",
            "Temos soluções personalizadas. Me conte mais sobre sua necessidade!"
          ];
        } else {
          suggestions = [
            "Olá! Como posso ajudá-lo hoje?",
            "Obrigado pelo contato! Em que posso ser útil?",
            "Olá! Temos soluções que podem te interessar. Vamos conversar?"
          ];
        }
      } else {
        // Se a última mensagem foi outbound, sugerir follow-ups
        suggestions = [
          "Posso ajudar com mais alguma coisa?",
          "Tem alguma outra dúvida?",
          "Fico à disposição para mais informações!"
        ];
      }
      
      setAiSuggestions(suggestions);
      setShowAiSuggestions(true);
      
    } catch (error: any) {
      console.error('Error generating AI suggestions:', error);
      toast.error("Erro ao gerar sugestões da IA");
    } finally {
      setAiLoading(false);
    }
  };

  const useAISuggestion = (suggestion: string) => {
    setNewMessage(suggestion);
    setShowAiSuggestions(false);
  };

  // Funções para preview de imagens
  const openImagePreview = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
    setShowImagePreview(true);
  };

  const closeImagePreview = () => {
    setShowImagePreview(false);
    setSelectedImageUrl("");
  };

  // Função para gerar URL de imagem mock
  const generateMockImageUrl = (messageId: string, messageType: string) => {
    if (messageType === 'image') {
      // URLs de imagens de exemplo usando Unsplash
      const imageUrls = [
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=200&fit=crop',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop',
        'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=200&fit=crop',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=200&fit=crop',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=200&fit=crop'
      ];
      return imageUrls[Math.abs(messageId.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % imageUrls.length];
    }
    return null;
  };

  // Função para gerar URL de áudio mock
  const generateMockAudioUrl = (messageId: string, messageType: string) => {
    if (messageType === 'audio') {
      // URLs de áudios de exemplo (usando arquivos de demonstração)
      const audioUrls = [
        'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
        'https://www.soundjay.com/misc/sounds/bell-ringing-01.wav',
        'https://www.soundjay.com/misc/sounds/bell-ringing-02.wav',
        'https://www.soundjay.com/misc/sounds/bell-ringing-03.wav',
        'https://www.soundjay.com/misc/sounds/bell-ringing-04.wav'
      ];
      // Para demonstração, vamos usar um arquivo de áudio público
      return 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav';
    }
    return null;
  };

  // Funções para controlar o player de áudio
  const playAudio = async (messageId: string) => {
    if (!audioUrls[messageId]) {
      const audioUrl = generateMockAudioUrl(messageId, 'audio');
      if (audioUrl) {
        setAudioUrls(prev => ({ ...prev, [messageId]: audioUrl }));
      }
    }

    // Parar áudio atual se estiver tocando
    if (playingAudio && playingAudio !== messageId) {
      const currentAudio = document.getElementById(`audio-${playingAudio}`) as HTMLAudioElement;
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
    }

    setPlayingAudio(messageId);
    
    // Tocar o áudio
    setTimeout(() => {
      const audio = document.getElementById(`audio-${messageId}`) as HTMLAudioElement;
      if (audio) {
        audio.play().catch(error => {
          console.error('Erro ao reproduzir áudio:', error);
          toast.error("Erro ao reproduzir áudio");
        });
      }
    }, 100);
  };

  const pauseAudio = (messageId: string) => {
    const audio = document.getElementById(`audio-${messageId}`) as HTMLAudioElement;
    if (audio) {
      audio.pause();
    }
    setPlayingAudio(null);
  };

  const handleAudioEnded = (messageId: string) => {
    setPlayingAudio(null);
    setAudioProgress(prev => ({ ...prev, [messageId]: 0 }));
  };

  const handleAudioTimeUpdate = (messageId: string, currentTime: number, duration: number) => {
    const progress = (currentTime / duration) * 100;
    setAudioProgress(prev => ({ ...prev, [messageId]: progress }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Funções para download de arquivos
  const downloadFile = async (fileUrl: string, fileName: string, messageId: string) => {
    setDownloadingFiles(prev => new Set(prev).add(messageId));
    
    try {
      // Simular delay de download
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Criar link temporário para download
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      link.target = '_blank';
      
      // Adicionar ao DOM, clicar e remover
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Download iniciado: ${fileName}`);
      
    } catch (error) {
      console.error('Erro ao baixar arquivo:', error);
      toast.error("Erro ao baixar arquivo");
    } finally {
      setDownloadingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(messageId);
        return newSet;
      });
    }
  };

  const generateFileDownloadUrl = (messageId: string, fileType: string, fileName?: string) => {
    // URLs mock para diferentes tipos de arquivo
    const mockUrls: {[key: string]: string} = {
      'document': 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      'video': 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      'audio': 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      'image': generateMockImageUrl(messageId, 'image') || '/placeholder.svg'
    };
    
    return mockUrls[fileType] || '/placeholder.svg';
  };

  const getFileExtension = (fileName: string) => {
    return fileName.split('.').pop()?.toLowerCase() || '';
  };

  const getFileIcon = (fileType: string, fileName?: string) => {
    if (fileType === 'image') return '🖼️';
    if (fileType === 'audio') return '🎵';
    if (fileType === 'video') return '🎥';
    if (fileType === 'document') return '📄';
    
    // Baseado na extensão do arquivo
    if (fileName) {
      const ext = getFileExtension(fileName);
      if (['pdf'].includes(ext)) return '📄';
      if (['doc', 'docx'].includes(ext)) return '📝';
      if (['xls', 'xlsx'].includes(ext)) return '📊';
      if (['ppt', 'pptx'].includes(ext)) return '📽️';
      if (['zip', 'rar', '7z'].includes(ext)) return '📦';
      if (['txt'].includes(ext)) return '📃';
    }
    
    return '📎';
  };

  // Funções para sistema de múltiplos atendentes
  const assignConversation = (conversationId: string, agentId: string) => {
    setConversationAssignments(prev => ({
      ...prev,
      [conversationId]: agentId
    }));
    
    // Atualizar workload do agente
    setAgents(prev => prev.map(agent => {
      if (agent.id === agentId) {
        return { ...agent, workload: Math.min(agent.workload + 1, agent.maxWorkload) };
      }
      return agent;
    }));
    
    toast.success(`Conversa atribuída para ${agents.find(a => a.id === agentId)?.name}`);
  };

  const unassignConversation = (conversationId: string) => {
    const agentId = conversationAssignments[conversationId];
    if (agentId) {
      setConversationAssignments(prev => {
        const newAssignments = { ...prev };
        delete newAssignments[conversationId];
        return newAssignments;
      });
      
      // Atualizar workload do agente
      setAgents(prev => prev.map(agent => {
        if (agent.id === agentId) {
          return { ...agent, workload: Math.max(agent.workload - 1, 0) };
        }
        return agent;
      }));
      
      toast.success("Conversa desatribuída");
    }
  };

  const getAvailableAgents = () => {
    return agents.filter(agent => 
      agent.status === 'online' && 
      agent.workload < agent.maxWorkload
    );
  };

  const getAgentById = (agentId: string) => {
    return agents.find(agent => agent.id === agentId);
  };

  const getAgentStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'away': return 'bg-orange-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getAgentStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'busy': return 'Ocupado';
      case 'away': return 'Ausente';
      case 'offline': return 'Offline';
      default: return 'Desconhecido';
    }
  };

  const autoAssignConversation = (conversationId: string) => {
    const availableAgents = getAvailableAgents();
    if (availableAgents.length > 0) {
      // Atribuir para o agente com menor workload
      const bestAgent = availableAgents.reduce((prev, current) => 
        prev.workload < current.workload ? prev : current
      );
      assignConversation(conversationId, bestAgent.id);
    } else {
      toast.error("Nenhum atendente disponível no momento");
    }
  };

  // Função para carregar perfil do contato
  const loadContactProfile = async () => {
    if (!selectedConversation) return;

    setShowContactProfile(true);
    try {
      // Simular carregamento do perfil do contato
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Dados mock do perfil do contato baseado na conversa selecionada
      const mockProfile = {
        id: selectedConversation.contact_id,
        full_name: selectedConversation.contacts?.full_name || "Contato",
        email: selectedConversation.contacts?.email || "email@exemplo.com",
        phone: (selectedConversation.contacts as any)?.phone_e164 || "+5511999999999",
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedConversation.contacts?.full_name || "Contato")}&background=random`,
        external_id: (selectedConversation.contacts as any)?.external_id || "instagram_123456",
        tags: selectedConversation.tags || [],
        status: selectedConversation.status,
        priority: selectedConversation.priority,
        channel_type: selectedConversation.channel_type,
        first_contact: "2024-01-15T10:30:00Z",
        last_activity: selectedConversation.last_message_at,
        total_messages: Math.floor(Math.random() * 100) + 10,
        response_rate: Math.floor(Math.random() * 40) + 60,
        avg_response_time: Math.floor(Math.random() * 60) + 5,
        notes: [
          "Cliente interessado em produtos premium",
          "Prefere ser contatado no período da tarde",
          "Possível lead qualificado para vendas"
        ],
        activities: [
          { type: "message", description: "Enviou mensagem sobre preços", date: "2024-01-20T14:30:00Z" },
          { type: "call", description: "Ligação telefônica realizada", date: "2024-01-18T16:45:00Z" },
          { type: "email", description: "E-mail enviado com catálogo", date: "2024-01-16T09:15:00Z" }
        ]
      };
      
      setContactProfile(mockProfile);
      
    } catch (error: any) {
      console.error('Error loading contact profile:', error);
      toast.error("Erro ao carregar perfil do contato");
    }
  };

  // Filtrar conversas baseado nos filtros aplicados
  const filteredConversations = conversations.filter(conv => {
    // Filtro por status
    if (conversationFilter !== 'all' && conv.status !== conversationFilter) {
      return false;
    }
    
    // Filtro por canal
    if (channelFilter !== 'all' && conv.channel_type !== channelFilter) {
      return false;
    }
    
    // Filtro por arquivadas - agora integrado no conversationFilter
    if (conversationFilter === 'archived' && conv.status !== 'archived') {
      return false;
    }
    if (conversationFilter !== 'archived' && conversationFilter !== 'all' && conv.status === 'archived') {
      return false;
    }

    // Filtro por busca de texto
    if (searchQuery && !(
      conv.contacts?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.contacts?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )) {
      return false;
    }
    
    return true;
  }).sort((a, b) => {
    // Ordenação
    switch (sortBy) {
      case 'recent':
        return new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime();
      case 'unread':
        return (b.unreadCount || 0) - (a.unreadCount || 0);
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
               (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
      default:
        return 0;
    }
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
      setAiAgents(data || []);
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
          body: `Olá! Sou ${agent.name}, agente de IA. Como posso ajudá-lo?`,
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

      let contactId = selectedContactId;

      // Verificar organização
      if (!currentOrg) {
        toast.error("Nenhuma organização selecionada");
        return;
      }

      // Se não selecionou contato existente, criar novo
      if (!contactId && (newContactName || newContactEmail || newContactPhone)) {
        const { data: newContact, error: contactError} = await supabase
          .from("contacts")
          .insert({
            org_id: currentOrg.id,
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
          org_id: currentOrg.id,
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

  // Busca por texto já incluída na função filteredConversations acima

  return (
    <div className="flex flex-col h-full">
      {/* Header com Breadcrumbs */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Sistema</span>
            <span className="text-sm text-muted-foreground">/</span>
            <span className="text-sm font-medium">Inbox</span>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 space-y-6">
          {/* Header da Página */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Inbox</h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-muted-foreground">Gerencie suas conversas e mensagens</p>
                <Badge variant="outline" className="text-xs">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  Tempo real
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAgentManagement(true)}
              >
                <Users className="h-4 w-4 mr-2" />
                Atendentes
              </Button>
              <Button variant="outline" size="sm" onClick={() => refetchConversations()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              <Button onClick={() => setShowNewMessageDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Mensagem
              </Button>
            </div>
          </div>

          {/* Métricas principais */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total de Conversas</CardTitle>
                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight">{conversations.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Conversas ativas
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/5 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Não Lidas</CardTitle>
                <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                  <Bell className="h-5 w-5 text-red-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight">
                  {conversations.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Mensagens pendentes
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/5 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Atendentes Online</CardTitle>
                <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight">
                  {agents.filter(agent => agent.status === 'online').length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Disponíveis agora
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/5 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Resposta</CardTitle>
                <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight">85%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Conversas respondidas
                </p>
              </CardContent>
            </Card>
          </div>


          {/* Layout lado a lado */}
          <div className="grid gap-6 lg:grid-cols-3 h-[calc(100vh-200px)]">
            {/* Lista de Conversas - 1/3 da largura */}
            <div className="lg:col-span-1">
              <Card className="border-2 hover:border-primary/30 transition-all shadow-lg h-full flex flex-col">
                <CardHeader className="flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        Conversas {loadingConversations && <Loader2 className="inline h-4 w-4 animate-spin ml-2" />}
                      </CardTitle>
                      <CardDescription className="mt-1">Gerencie suas conversas ativas</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="Buscar..." 
                          className="pl-9 w-48"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Filtros */}
                  <div className="flex gap-2 mt-4">
                    <Select value={conversationFilter} onValueChange={setConversationFilter}>
                      <SelectTrigger className="w-28">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="open">Abertas</SelectItem>
                        <SelectItem value="resolved">Resolvidas</SelectItem>
                        <SelectItem value="closed">Fechadas</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={channelFilter} onValueChange={setChannelFilter}>
                      <SelectTrigger className="w-28">
                        <SelectValue placeholder="Canal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-28">
                        <SelectValue placeholder="Ordenar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recent">Recentes</SelectItem>
                        <SelectItem value="unread">Não lidas</SelectItem>
                        <SelectItem value="priority">Prioridade</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                
                <CardContent className="p-0 flex-1 overflow-hidden">
                  <ScrollArea className="h-full">
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
                            className={`relative flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer transition-all group ${
                              selectedConversation?.id === conv.id ? "bg-accent border-primary shadow-md" : ""
                            }`}
                          >
                            {/* Indicador de prioridade */}
                            {conv.priority === 'high' && (
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 rounded-l-lg"></div>
                            )}
                            
                            {/* Avatar simplificado */}
                            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm">
                              {(conv.contacts?.full_name || conv.contacts?.email || "?").charAt(0).toUpperCase()}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-semibold truncate">
                                    {conv.contacts?.full_name || conv.contacts?.email || "Sem nome"}
                                  </p>
                                  {/* Atendente atribuído - apenas se houver */}
                                  {conv.assigned_agent && (
                                    <div className="flex items-center gap-1">
                                      <div className={`w-1.5 h-1.5 rounded-full ${getAgentStatusColor(getAgentById(conv.assigned_agent)?.status || 'offline')}`}></div>
                                      <span className="text-xs text-muted-foreground">
                                        {getAgentById(conv.assigned_agent)?.name}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  {conv.unreadCount && conv.unreadCount > 0 && (
                                    <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                                      {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                                    </Badge>
                                  )}
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100">
                                        <MoreVertical className="h-3 w-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={(e) => {
                                        e.stopPropagation();
                                        toggleStarConversation(conv.id);
                                      }}>
                                        {starredConversations.has(conv.id) ? (
                                          <>
                                            <StarOff className="h-4 w-4 mr-2" />
                                            Remover dos favoritos
                                          </>
                                        ) : (
                                          <>
                                            <Star className="h-4 w-4 mr-2" />
                                            Adicionar aos favoritos
                                          </>
                                        )}
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={(e) => {
                                        e.stopPropagation();
                                        togglePinConversation(conv.id);
                                      }}>
                                        {pinnedConversations.has(conv.id) ? (
                                          <>
                                            <PinOff className="h-4 w-4 mr-2" />
                                            Desafixar
                                          </>
                                        ) : (
                                          <>
                                            <Pin className="h-4 w-4 mr-2" />
                                            Fixar
                                          </>
                                        )}
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={(e) => {
                                        e.stopPropagation();
                                        archiveConversation(conv.id);
                                      }}>
                                        <Archive className="h-4 w-4 mr-2" />
                                        Arquivar
                                      </DropdownMenuItem>
                                      {!conv.assigned_agent ? (
                                        <DropdownMenuItem onClick={(e) => {
                                          e.stopPropagation();
                                          autoAssignConversation(conv.id);
                                        }}>
                                          <User className="h-4 w-4 mr-2" />
                                          Atribuir Atendente
                                        </DropdownMenuItem>
                                      ) : (
                                        <DropdownMenuItem onClick={(e) => {
                                          e.stopPropagation();
                                          unassignConversation(conv.id);
                                        }}>
                                          <User className="h-4 w-4 mr-2" />
                                          Desatribuir
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuItem onClick={(e) => {
                                        e.stopPropagation();
                                        deleteConversation(conv.id);
                                      }} className="text-red-600">
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Excluir
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground truncate">
                                  {conv.contacts?.email || conv.contacts?.phone_e164}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {conv.last_message_at 
                                    ? formatDistanceToNow(new Date(conv.last_message_at), { 
                                        addSuffix: true, 
                                        locale: ptBR 
                                      })
                                    : "Agora"
                                  }
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Área de Conversa - 2/3 da largura */}
            <div className="lg:col-span-2">
              <Card className="border-2 hover:border-primary/30 transition-all shadow-lg h-full flex flex-col">
                <CardHeader className="border-b space-y-4 flex-shrink-0">
            {selectedConversation ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-lg">
                      {(selectedConversation.contacts?.full_name || selectedConversation.contacts?.email || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1">
                      <span className="text-lg">{getChannelIcon(selectedConversation.channel_type)}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle>
                        {selectedConversation.contacts?.full_name || selectedConversation.contacts?.email || "Sem nome"}
                      </CardTitle>
                      
                      {/* Botão de Perfil - ao lado do nome */}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={loadContactProfile}
                        disabled={!selectedConversation}
                        className="h-6 w-6 p-0 ml-1"
                        title="Ver perfil do contato"
                      >
                        <User className="h-3 w-3" />
                      </Button>
                      
                      {starredConversations.has(selectedConversation.id) && (
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      )}
                      {pinnedConversations.has(selectedConversation.id) && (
                        <Pin className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
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
                      <span className="text-xs bg-muted px-2 py-1 rounded-full">
                        {selectedConversation.channel_type === 'instagram' ? 'Instagram' : 'WhatsApp'}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Controles de Transferência */}
                    <div className="flex items-center gap-2">
                      <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                        <SelectTrigger className="w-[160px] h-7 text-xs">
                          <SelectValue placeholder="Transferir para..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">🤖 IA Automática</SelectItem>
                          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-b">
                            Agentes de IA
                          </div>
                          {aiAgents.map((agent) => (
                            <SelectItem key={agent.id} value={`ai-${agent.id}`}>
                              <div className="flex items-center gap-2">
                                <Bot className="h-3 w-3 text-blue-600" />
                                {agent.name}
                              </div>
                            </SelectItem>
                          ))}
                          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-b mt-2">
                            Atendentes Humanos
                          </div>
                          {agents.filter(a => a.status === 'online').map((agent) => (
                            <SelectItem key={agent.id} value={agent.id}>
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${getAgentStatusColor(agent.status)}`}></div>
                                {agent.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button 
                        onClick={() => {
                          if (selectedAgent === "auto") {
                            autoAssignConversation(selectedConversation?.id || '');
                          } else if (selectedAgent.startsWith('ai-')) {
                            handleTransferToAI();
                          } else {
                            assignConversation(selectedConversation?.id || '', selectedAgent);
                          }
                        }}
                        disabled={transferring || !selectedAgent || !selectedConversation}
                        size="sm"
                        className="h-7 px-2 text-xs bg-gradient-to-r from-blue-600 to-blue-700 hover:opacity-90"
                      >
                        {transferring ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <ArrowRight className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                Selecione uma conversa
              </div>
            )}

                </CardHeader>
                <CardContent className="p-6 flex-1 flex flex-col overflow-hidden">
                  <ScrollArea className="flex-1 mb-4">
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
                    <div key={msg.id} className="mb-4 group relative">
                      {msg.direction === 'inbound' ? (
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold">
                            {selectedConversation?.contacts?.full_name?.charAt(0).toUpperCase() || "?"}
                          </div>
                          <div className="flex-1 max-w-md">
                            <div className="relative group/message">
                              <div className="bg-muted rounded-2xl rounded-tl-sm p-4 hover:bg-muted/80 transition-colors">
                                <p className="text-sm">{msg.content}</p>
                                {msg.metadata?.message_type && msg.metadata.message_type !== 'text' && (
                                  <div className="mt-2">
                                    {msg.metadata.message_type === 'image' ? (
                                      <div className="relative">
                                        <img
                                          src={generateMockImageUrl(msg.id, 'image') || '/placeholder.svg'}
                                          alt="Imagem enviada"
                                          className="w-32 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity border"
                                          onClick={() => openImagePreview(generateMockImageUrl(msg.id, 'image') || '')}
                                        />
                                        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 rounded-lg transition-colors flex items-center justify-center">
                                          <div className="opacity-0 hover:opacity-100 transition-opacity bg-black/50 text-white px-2 py-1 rounded text-xs">
                                            Clique para ampliar
                                          </div>
                                        </div>
                                      </div>
                                    ) : msg.metadata.message_type === 'audio' ? (
                                      <div className="mt-2">
                                        <div className="bg-white dark:bg-slate-900 rounded-lg px-4 py-2 border border-slate-300 dark:border-slate-600 shadow-sm">
                                          <div className="flex items-center gap-3">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-8 w-8 p-0 rounded-full bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800"
                                              onClick={() => playingAudio === msg.id ? pauseAudio(msg.id) : playAudio(msg.id)}
                                            >
                                              {playingAudio === msg.id ? (
                                                <Pause className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                                              ) : (
                                                <Play className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                                              )}
                                            </Button>
                                            
                                            <div className="flex-1">
                                              <div className="flex items-center gap-2 mb-1">
                                                <Volume2 className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Áudio de voz</span>
                                              </div>
                                              
                                              <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-1.5">
                                                <div
                                                  className="bg-blue-600 dark:bg-blue-400 h-1.5 rounded-full transition-all duration-300"
                                                  style={{ width: `${audioProgress[msg.id] || 0}%` }}
                                                ></div>
                                              </div>
                                              
                                              <div className="flex justify-between text-xs text-blue-500 dark:text-blue-400 mt-1">
                                                <span>0:00</span>
                                                <span>~0:15</span>
                                              </div>
                                            </div>
                                          </div>
                                          
                                          {/* Elemento de áudio oculto */}
                                          {audioUrls[msg.id] && (
                                            <audio
                                              id={`audio-${msg.id}`}
                                              src={audioUrls[msg.id]}
                                              onEnded={() => handleAudioEnded(msg.id)}
                                              onTimeUpdate={(e) => {
                                                const audio = e.target as HTMLAudioElement;
                                                handleAudioTimeUpdate(msg.id, audio.currentTime, audio.duration);
                                              }}
                                              preload="metadata"
                                            />
                                          )}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="mt-2">
                                        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                                          <div className="flex items-center gap-3">
                                            <div className="flex-shrink-0">
                                              <span className="text-2xl text-slate-600 dark:text-slate-400">{getFileIcon(msg.metadata.message_type)}</span>
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                              <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                  {msg.metadata.message_type === 'video' ? 'Vídeo' :
                                                   msg.metadata.message_type === 'document' ? 'Documento' :
                                                   msg.metadata.message_type === 'sticker' ? 'Sticker' :
                                                   msg.metadata.message_type}
                                                </span>
                                                <Badge variant="secondary" className="text-xs">
                                                  {getFileExtension(`${msg.metadata.message_type}.ext`)}
                                                </Badge>
                                              </div>
                                              
                                              <div className="flex items-center gap-2">
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  className="h-7 px-3 text-xs"
                                                  onClick={() => {
                                                    const fileName = `${msg.metadata.message_type}_${msg.id}.${getFileExtension(`${msg.metadata.message_type}.ext`)}`;
                                                    const fileUrl = generateFileDownloadUrl(msg.id, msg.metadata.message_type, fileName);
                                                    downloadFile(fileUrl, fileName, msg.id);
                                                  }}
                                                  disabled={downloadingFiles.has(msg.id)}
                                                >
                                                  {downloadingFiles.has(msg.id) ? (
                                                    <>
                                                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                                      Baixando...
                                                    </>
                                                  ) : (
                                                    <>
                                                      <Download className="h-3 w-3 mr-1" />
                                                      Baixar
                                                    </>
                                                  )}
                                                </Button>
                                                
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  className="h-7 px-2 text-xs"
                                                  onClick={() => {
                                                    const fileName = `${msg.metadata.message_type}_${msg.id}.${getFileExtension(`${msg.metadata.message_type}.ext`)}`;
                                                    const fileUrl = generateFileDownloadUrl(msg.id, msg.metadata.message_type, fileName);
                                                    navigator.clipboard.writeText(fileUrl);
                                                    toast.success("Link copiado!");
                                                  }}
                                                >
                                                  <Copy className="h-3 w-3" />
                                                </Button>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                              
                              {/* Ações da mensagem - aparecem no hover */}
                              <div className="absolute -top-8 left-0 opacity-0 group-hover/message:opacity-100 transition-opacity">
                                <div className="flex items-center gap-1 bg-background border rounded-lg p-1 shadow-lg">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => replyToMessage(msg.id)}
                                  >
                                    <Reply className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => forwardMessage(msg.id)}
                                  >
                                    <Forward className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => copyMessage(msg.content)}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-1 ml-2">
                              <div className="text-xs text-muted-foreground">
                                {new Date(msg.created_at).toLocaleTimeString('pt-BR', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </div>
                              {msg.status && (
                                <div className="flex items-center gap-1">
                                  {msg.status === 'delivered' && <CheckCircle className="h-3 w-3 text-green-500" />}
                                  {msg.status === 'sent' && <Clock className="h-3 w-3 text-blue-500" />}
                                  {msg.status === 'failed' && <Clock className="h-3 w-3 text-red-500" />}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-3 justify-end">
                          <div className="flex-1 max-w-md">
                            <div className="relative group/message">
                              <div className="bg-primary rounded-2xl rounded-tr-sm p-4 ml-auto hover:bg-primary/90 transition-colors">
                                <p className="text-sm text-white whitespace-pre-line">{msg.content}</p>
                                {msg.metadata?.message_type && msg.metadata.message_type !== 'text' && (
                                  <div className="mt-2 text-xs text-white/70">
                                    {msg.metadata.message_type === 'files' ? (
                                      <div className="space-y-1">
                                        {(msg.metadata as any).files?.map((file: any, idx: number) => (
                                          <div key={idx} className="flex items-center gap-2">
                                                   <span>{getFileIconForUpload({name: file.name, type: file.type} as File)}</span>
                                            <span>{file.name}</span>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      msg.metadata.message_type === 'image' ? (
                                        <div className="relative">
                                          <img
                                            src={generateMockImageUrl(msg.id, 'image') || '/placeholder.svg'}
                                            alt="Imagem enviada"
                                            className="w-32 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity border"
                                            onClick={() => openImagePreview(generateMockImageUrl(msg.id, 'image') || '')}
                                          />
                                          <div className="absolute inset-0 bg-black/0 hover:bg-black/10 rounded-lg transition-colors flex items-center justify-center">
                                            <div className="opacity-0 hover:opacity-100 transition-opacity bg-black/50 text-white px-2 py-1 rounded text-xs">
                                              Clique para ampliar
                                            </div>
                                          </div>
                                        </div>
                                      ) : msg.metadata.message_type === 'audio' ? (
                                        <div className="mt-2">
                                          <div className="bg-blue-50 dark:bg-blue-950 rounded-lg px-3 py-1.5 border border-blue-200 dark:border-blue-800 shadow-sm">
                                            <div className="flex items-center gap-3">
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 rounded-full bg-blue-200 dark:bg-blue-800 hover:bg-blue-300 dark:hover:bg-blue-700"
                                                onClick={() => playingAudio === msg.id ? pauseAudio(msg.id) : playAudio(msg.id)}
                                              >
                                                {playingAudio === msg.id ? (
                                                  <Pause className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                                                ) : (
                                                  <Play className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                                                )}
                                              </Button>
                                              
                                              <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                  <Volume2 className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                                  <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Áudio de voz</span>
                                                </div>
                                                
                                                <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-1.5">
                                                  <div
                                                    className="bg-blue-600 dark:bg-blue-400 h-1.5 rounded-full transition-all duration-300"
                                                    style={{ width: `${audioProgress[msg.id] || 0}%` }}
                                                  ></div>
                                                </div>
                                                
                                                <div className="flex justify-between text-xs text-blue-500 dark:text-blue-400 mt-1">
                                                  <span>0:00</span>
                                                  <span>~0:15</span>
                                                </div>
                                              </div>
                                            </div>
                                            
                                            {/* Elemento de áudio oculto */}
                                            {audioUrls[msg.id] && (
                                              <audio
                                                id={`audio-${msg.id}`}
                                                src={audioUrls[msg.id]}
                                                onEnded={() => handleAudioEnded(msg.id)}
                                                onTimeUpdate={(e) => {
                                                  const audio = e.target as HTMLAudioElement;
                                                  handleAudioTimeUpdate(msg.id, audio.currentTime, audio.duration);
                                                }}
                                                preload="metadata"
                                              />
                                            )}
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="mt-2">
                                          <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
                                            <div className="flex items-center gap-3">
                                              <div className="flex-shrink-0">
                                                <span className="text-2xl">{getFileIcon(msg.metadata.message_type)}</span>
                                              </div>
                                              
                                              <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                  <span className="text-sm font-medium text-primary">
                                                    {msg.metadata.message_type === 'video' ? 'Vídeo' :
                                                     msg.metadata.message_type === 'document' ? 'Documento' :
                                                     msg.metadata.message_type === 'sticker' ? 'Sticker' :
                                                     msg.metadata.message_type}
                                                  </span>
                                                  <Badge variant="secondary" className="text-xs">
                                                    {getFileExtension(`${msg.metadata.message_type}.ext`)}
                                                  </Badge>
                                                </div>
                                                
                                                <div className="flex items-center gap-2">
                                                  <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-7 px-3 text-xs border-primary/30 text-primary hover:bg-primary/10"
                                                    onClick={() => {
                                                      const fileName = `${msg.metadata.message_type}_${msg.id}.${getFileExtension(`${msg.metadata.message_type}.ext`)}`;
                                                      const fileUrl = generateFileDownloadUrl(msg.id, msg.metadata.message_type, fileName);
                                                      downloadFile(fileUrl, fileName, msg.id);
                                                    }}
                                                    disabled={downloadingFiles.has(msg.id)}
                                                  >
                                                    {downloadingFiles.has(msg.id) ? (
                                                      <>
                                                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                                        Baixando...
                                                      </>
                                                    ) : (
                                                      <>
                                                        <Download className="h-3 w-3 mr-1" />
                                                        Baixar
                                                      </>
                                                    )}
                                                  </Button>
                                                  
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 px-2 text-xs text-primary hover:bg-primary/10"
                                                    onClick={() => {
                                                      const fileName = `${msg.metadata.message_type}_${msg.id}.${getFileExtension(`${msg.metadata.message_type}.ext`)}`;
                                                      const fileUrl = generateFileDownloadUrl(msg.id, msg.metadata.message_type, fileName);
                                                      navigator.clipboard.writeText(fileUrl);
                                                      toast.success("Link copiado!");
                                                    }}
                                                  >
                                                    <Copy className="h-3 w-3" />
                                                  </Button>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                )}
                              </div>
                              
                              {/* Ações da mensagem - aparecem no hover */}
                              <div className="absolute -top-8 right-0 opacity-0 group-hover/message:opacity-100 transition-opacity">
                                <div className="flex items-center gap-1 bg-background border rounded-lg p-1 shadow-lg">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => replyToMessage(msg.id)}
                                  >
                                    <Reply className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => forwardMessage(msg.id)}
                                  >
                                    <Forward className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => copyMessage(msg.content)}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-1 mr-2">
                              <div className="text-xs text-muted-foreground text-right">
                                {new Date(msg.created_at).toLocaleTimeString('pt-BR', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </div>
                              {msg.status && (
                                <div className="flex items-center gap-1">
                                  {msg.status === 'delivered' && <CheckCircle className="h-3 w-3 text-green-500" />}
                                  {msg.status === 'sent' && <Clock className="h-3 w-3 text-blue-500" />}
                                  {msg.status === 'failed' && <Clock className="h-3 w-3 text-red-500" />}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold">
                            Você
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
                  </ScrollArea>

                  <div className="pt-4 border-t flex-shrink-0">
              {/* Indicador de digitação */}
              {isTyping && (
                <div className="mb-2 text-xs text-muted-foreground flex items-center gap-1">
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  {selectedConversation?.contacts?.full_name} está digitando...
                </div>
              )}

              {/* Área de envio */}
              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  {/* Área de drag & drop */}
                  <div
                    className={`relative ${dragOver ? 'bg-primary/10 border-primary' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <Textarea 
                      placeholder={isAIHandling ? "O agente de IA está respondendo..." : "Digite sua mensagem ou arraste arquivos aqui..."} 
                      className="min-h-[40px] max-h-32 resize-none"
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        // Simular indicador de digitação
                        if (e.target.value && !isTyping) {
                          setIsTyping(true);
                          setTimeout(() => setIsTyping(false), 1000);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      disabled={!selectedConversation || sending}
                    />
                    
                    {/* Overlay de drag & drop */}
                    {dragOver && (
                      <div className="absolute inset-0 bg-primary/20 border-2 border-dashed border-primary rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <span className="text-4xl mb-2 block">📎</span>
                          <p className="text-sm font-medium text-primary">Solte os arquivos aqui</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Ações rápidas */}
                  <div className="absolute bottom-2 right-2 flex items-center gap-1">
                    <input
                      type="file"
                      multiple
                      accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt"
                      onChange={(e) => handleFileSelect(e.target.files)}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => document.getElementById('file-upload')?.click()}
                      title="Anexar arquivo"
                    >
                      <span className="text-sm">📎</span>
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-end gap-2">
                  {/* Botão de IA */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 w-10 p-0"
                    onClick={generateAISuggestions}
                    disabled={aiLoading || !selectedConversation}
                    title="Sugestões de IA"
                  >
                    {aiLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </Button>
                  
                  {/* Botão de Enviar */}
                  <Button 
                    onClick={handleSendMessage}
                    disabled={sending || !newMessage.trim() || !selectedConversation}
                    className="h-10 w-10 p-0 bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity"
                    title="Enviar mensagem"
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Preview de arquivos selecionados */}
              {showFileUpload && uploadingFiles.length > 0 && (
                <div className="mt-4 p-4 border rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium">Arquivos selecionados ({uploadingFiles.length})</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setUploadingFiles([]);
                        setShowFileUpload(false);
                      }}
                    >
                      ✕
                    </Button>
                  </div>

                  <div className="space-y-2 mb-4">
                    {uploadingFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 bg-background rounded border">
                        <span className="text-lg">{getFileIconForUpload(file)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                          {uploadProgress[file.name] !== undefined && (
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                              <div
                                className="bg-primary h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress[file.name]}%` }}
                              ></div>
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="h-6 w-6 p-0"
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleSendFiles}
                      disabled={sending}
                      className="flex-1"
                    >
                      {sending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Enviar Arquivos
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Sugestões de IA */}
              {showAiSuggestions && aiSuggestions.length > 0 && (
                <div className="mt-4 p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-blue-600" />
                      <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">Sugestões da IA</h4>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAiSuggestions(false)}
                    >
                      ✕
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {aiSuggestions.map((suggestion, index) => (
                      <div key={index} className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{suggestion}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => useAISuggestion(suggestion)}
                          className="text-xs"
                        >
                          <Send className="h-3 w-3 mr-1" />
                          Usar esta sugestão
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dicas de atalhos */}
              <div className="mt-2 text-xs text-muted-foreground">
                Pressione Enter para enviar • Shift+Enter para nova linha • Arraste arquivos ou clique no ícone 📎
              </div>
            </div>
          </CardContent>
        </Card>
            </div>
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

      {/* Modal do Perfil do Contato */}
      <Dialog open={showContactProfile} onOpenChange={setShowContactProfile}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={contactProfile?.avatar} />
                <AvatarFallback>{contactProfile?.full_name?.charAt(0) || "C"}</AvatarFallback>
              </Avatar>
              Perfil do Contato
            </DialogTitle>
          </DialogHeader>

          {contactProfile && (
            <div className="overflow-y-auto max-h-[60vh]">
              <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="info">Informações</TabsTrigger>
                  <TabsTrigger value="activity">Atividades</TabsTrigger>
                  <TabsTrigger value="notes">Anotações</TabsTrigger>
                  <TabsTrigger value="stats">Estatísticas</TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    {/* Informações Básicas */}
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Nome Completo</Label>
                        <p className="text-sm text-muted-foreground">{contactProfile.full_name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">E-mail</Label>
                        <p className="text-sm text-muted-foreground">{contactProfile.email}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Telefone</Label>
                        <p className="text-sm text-muted-foreground">{contactProfile.phone}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">ID Externo</Label>
                        <p className="text-sm text-muted-foreground">{contactProfile.external_id}</p>
                      </div>
                    </div>

                    {/* Status e Tags */}
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Status</Label>
                        <div className="mt-1">
                          <Badge variant={contactProfile.status === 'open' ? 'default' : 'secondary'}>
                            {contactProfile.status === 'open' ? 'Ativo' : 'Fechado'}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Prioridade</Label>
                        <div className="mt-1">
                          <Badge variant={
                            contactProfile.priority === 'high' ? 'destructive' :
                            contactProfile.priority === 'medium' ? 'default' : 'secondary'
                          }>
                            {contactProfile.priority === 'high' ? 'Alta' :
                             contactProfile.priority === 'medium' ? 'Média' : 'Baixa'}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Canal</Label>
                        <div className="mt-1">
                          <Badge variant="outline">
                            {contactProfile.channel_type === 'instagram' ? '📸 Instagram' :
                             contactProfile.channel_type === 'whatsapp' ? '💬 WhatsApp' : contactProfile.channel_type}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Tags</Label>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {contactProfile.tags?.map((tag: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="activity" className="space-y-4">
                  <div className="space-y-3">
                    {contactProfile.activities?.map((activity: any, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className="flex-shrink-0">
                          {activity.type === 'message' && <MessageSquare className="h-4 w-4 text-blue-600" />}
                          {activity.type === 'call' && <Phone className="h-4 w-4 text-green-600" />}
                          {activity.type === 'email' && <Mail className="h-4 w-4 text-orange-600" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.date).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="notes" className="space-y-4">
                  <div className="space-y-3">
                    {contactProfile.notes?.map((note: string, index: number) => (
                      <div key={index} className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm">{note}</p>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Anotação
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="stats" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <Label className="text-sm font-medium">Total de Mensagens</Label>
                      <p className="text-2xl font-bold">{contactProfile.total_messages}</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <Label className="text-sm font-medium">Taxa de Resposta</Label>
                      <p className="text-2xl font-bold">{contactProfile.response_rate}%</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <Label className="text-sm font-medium">Tempo Médio de Resposta</Label>
                      <p className="text-2xl font-bold">{contactProfile.avg_response_time}min</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <Label className="text-sm font-medium">Primeiro Contato</Label>
                      <p className="text-sm">{new Date(contactProfile.first_contact).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Preview de Imagem */}
      <Dialog open={showImagePreview} onOpenChange={setShowImagePreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
          <div className="relative">
            <img
              src={selectedImageUrl}
              alt="Preview da imagem"
              className="w-full h-auto max-h-[80vh] object-contain"
            />
            
            {/* Botão de fechar */}
            <Button
              variant="outline"
              size="sm"
              className="absolute top-4 right-4 bg-black/50 text-white border-white/20 hover:bg-black/70"
              onClick={closeImagePreview}
            >
              ✕
            </Button>
            
            {/* Overlay de informações */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex items-center justify-between text-white">
                <div>
                  <p className="text-sm font-medium">Imagem enviada</p>
                  <p className="text-xs opacity-75">Clique fora para fechar</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                    onClick={() => {
                      // Funcionalidade de download (futura)
                      toast.success("Download iniciado!");
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Baixar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedImageUrl);
                      toast.success("Link copiado!");
                    }}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar Link
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Gerenciamento de Atendentes */}
      <Dialog open={showAgentManagement} onOpenChange={setShowAgentManagement}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Users className="h-6 w-6" />
              Gerenciamento de Atendentes
            </DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[60vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agents.map((agent) => (
                <Card key={agent.id} className="relative">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={agent.avatar} />
                          <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${getAgentStatusColor(agent.status)}`}></div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-sm truncate">{agent.name}</h3>
                          <Badge variant={
                            agent.status === 'online' ? 'default' :
                            agent.status === 'busy' ? 'secondary' :
                            agent.status === 'away' ? 'outline' : 'secondary'
                          }>
                            {getAgentStatusText(agent.status)}
                          </Badge>
                        </div>
                        
                        <p className="text-xs text-muted-foreground mb-2">{agent.email}</p>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <span>Workload:</span>
                            <span className="font-medium">{agent.workload}/{agent.maxWorkload}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>Última atividade:</span>
                            <span>{formatDistanceToNow(new Date(agent.lastActive), { addSuffix: true })}</span>
                          </div>
                        </div>
                        
                        <div className="mt-2">
                          <div className="flex flex-wrap gap-1">
                            {agent.skills.map((skill: string, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        {/* Barra de progresso do workload */}
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <span>Carga de trabalho</span>
                            <span>{Math.round((agent.workload / agent.maxWorkload) * 100)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                agent.workload / agent.maxWorkload > 0.8 ? 'bg-red-500' :
                                agent.workload / agent.maxWorkload > 0.6 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${(agent.workload / agent.maxWorkload) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Estatísticas gerais */}
            <Card className="mt-6">
              <CardContent className="p-4">
                <h3 className="font-medium mb-4">Estatísticas da Equipe</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {agents.filter(a => a.status === 'online').length}
                    </div>
                    <div className="text-xs text-muted-foreground">Online</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {agents.filter(a => a.status === 'busy').length}
                    </div>
                    <div className="text-xs text-muted-foreground">Ocupado</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-600">
                      {agents.filter(a => a.status === 'offline').length}
                    </div>
                    <div className="text-xs text-muted-foreground">Offline</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {agents.reduce((acc, agent) => acc + agent.workload, 0)}
                    </div>
                    <div className="text-xs text-muted-foreground">Conversas Ativas</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
        </div>
      </div>
    </div>
  );
}

