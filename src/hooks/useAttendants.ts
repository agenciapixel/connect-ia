import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Interfaces
interface Attendant {
  id: string;
  user_id: string;
  org_id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  employee_id?: string;
  department?: string;
  position?: string;
  status: 'online' | 'busy' | 'away' | 'offline' | 'break' | 'training';
  working_hours?: any;
  max_concurrent_chats: number;
  auto_accept: boolean;
  skills: string[];
  languages: string[];
  specializations: string[];
  total_chats: number;
  avg_response_time: number;
  satisfaction_score: number;
  last_activity_at?: string;
  notifications?: any;
  created_at: string;
  updated_at: string;
  created_by?: string;
  // Dados relacionados
  current_chats?: number;
  profile?: {
    avatar_url?: string;
    full_name?: string;
  };
}

interface ConversationAssignment {
  id: string;
  conversation_id: string;
  attendant_id: string;
  org_id: string;
  assigned_at: string;
  unassigned_at?: string;
  assigned_by?: string;
  response_time?: number;
  resolution_time?: number;
  satisfaction_rating?: number;
  status: 'assigned' | 'active' | 'transferred' | 'resolved' | 'abandoned';
  notes?: string;
  transfer_reason?: string;
  created_at: string;
  updated_at: string;
  conversation?: any;
  attendant?: Attendant;
}

interface AttendantSession {
  id: string;
  attendant_id: string;
  org_id: string;
  started_at: string;
  ended_at?: string;
  duration_minutes?: number;
  chats_handled: number;
  messages_sent: number;
  avg_response_time: number;
  status: 'active' | 'ended' | 'paused';
  notes?: string;
  attendant?: Attendant;
}

interface AttendantMetrics {
  id: string;
  attendant_id: string;
  period_start: string;
  period_end: string;
  period_type: 'daily' | 'weekly' | 'monthly';
  total_chats: number;
  resolved_chats: number;
  transferred_chats: number;
  abandoned_chats: number;
  avg_response_time: number;
  avg_resolution_time: number;
  total_work_time: number;
  satisfaction_avg: number;
  satisfaction_count: number;
  messages_sent: number;
  first_contact_resolution: number;
}

// Hook principal para gestão de atendentes
export function useAttendants(orgId?: string) {
  const queryClient = useQueryClient();

  // Buscar todos os atendentes da organização
  const attendantsQuery = useQuery({
    queryKey: ['attendants', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      
      const { data, error } = await supabase
        .from('attendants')
        .select(`
          *,
          profile:profiles(id, avatar_url, full_name)
        `)
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Attendant[];
    },
    enabled: !!orgId
  });

  // Buscar atendentes online
  const onlineAttendantsQuery = useQuery({
    queryKey: ['online-attendants', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      
      const { data, error } = await supabase
        .from('attendants')
        .select(`
          *,
          profile:profiles(id, avatar_url, full_name)
        `)
        .eq('org_id', orgId)
        .in('status', ['online', 'busy', 'away'])
        .order('status', { ascending: true });
      
      if (error) throw error;
      return data as Attendant[];
    },
    enabled: !!orgId,
    refetchInterval: 30000 // Atualizar a cada 30 segundos
  });

  // Buscar conversas não atribuídas
  const unassignedConversationsQuery = useQuery({
    queryKey: ['unassigned-conversations', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          contacts(id, full_name, email, phone_e164, external_id)
        `)
        .eq('org_id', orgId)
        .is('assigned_to', null)
        .eq('status', 'open')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!orgId,
    refetchInterval: 15000 // Atualizar a cada 15 segundos
  });

  // Buscar atribuições ativas
  const activeAssignmentsQuery = useQuery({
    queryKey: ['active-assignments', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      
      const { data, error } = await supabase
        .from('conversation_assignments')
        .select(`
          *,
          conversation:conversations(
            id,
            contact_id,
            status,
            last_message_at,
            channel_type,
            contacts(id, full_name, email, phone_e164)
          ),
          attendant:attendants(id, full_name, status, avatar_url)
        `)
        .eq('org_id', orgId)
        .eq('status', 'active')
        .order('assigned_at', { ascending: false });
      
      if (error) throw error;
      return data as ConversationAssignment[];
    },
    enabled: !!orgId,
    refetchInterval: 10000 // Atualizar a cada 10 segundos
  });

  // Buscar sessões ativas
  const activeSessionsQuery = useQuery({
    queryKey: ['active-sessions', orgId],
    queryFn: async () => {
      if (!orgId) return [];
      
      const { data, error } = await supabase
        .from('attendant_sessions')
        .select(`
          *,
          attendant:attendants(id, full_name, status, avatar_url)
        `)
        .eq('org_id', orgId)
        .eq('status', 'active')
        .order('started_at', { ascending: false });
      
      if (error) throw error;
      return data as AttendantSession[];
    },
    enabled: !!orgId,
    refetchInterval: 30000
  });

  // Mutation para criar atendente
  const createAttendantMutation = useMutation({
    mutationFn: async (data: Partial<Attendant>) => {
      const { data: user, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      const { error } = await supabase
        .from('attendants')
        .insert({
          ...data,
          user_id: user.user?.id,
          org_id: orgId,
          created_by: user.user?.id
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendants', orgId] });
      queryClient.invalidateQueries({ queryKey: ['online-attendants', orgId] });
      toast.success("Atendente criado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar atendente: " + error.message);
    }
  });

  // Mutation para atualizar atendente
  const updateAttendantMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Attendant> }) => {
      const { error } = await supabase
        .from('attendants')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendants', orgId] });
      queryClient.invalidateQueries({ queryKey: ['online-attendants', orgId] });
      toast.success("Atendente atualizado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar atendente: " + error.message);
    }
  });

  // Mutation para alterar status do atendente
  const updateAttendantStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Attendant['status'] }) => {
      const { error } = await supabase
        .from('attendants')
        .update({ 
          status,
          last_activity_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendants', orgId] });
      queryClient.invalidateQueries({ queryKey: ['online-attendants', orgId] });
      toast.success("Status atualizado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar status: " + error.message);
    }
  });

  // Mutation para atribuir conversa
  const assignConversationMutation = useMutation({
    mutationFn: async ({ 
      conversationId, 
      attendantId, 
      notes 
    }: { 
      conversationId: string; 
      attendantId: string; 
      notes?: string; 
    }) => {
      const { data: user, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      // Criar atribuição
      const { error: assignmentError } = await supabase
        .from('conversation_assignments')
        .insert({
          conversation_id: conversationId,
          attendant_id: attendantId,
          org_id: orgId,
          assigned_by: user.user?.id,
          notes,
          status: 'assigned'
        });

      if (assignmentError) throw assignmentError;

      // Atualizar conversa
      const { error: conversationError } = await supabase
        .from('conversations')
        .update({
          assigned_to: attendantId,
          status: 'assigned'
        })
        .eq('id', conversationId);

      if (conversationError) throw conversationError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unassigned-conversations', orgId] });
      queryClient.invalidateQueries({ queryKey: ['active-assignments', orgId] });
      queryClient.invalidateQueries({ queryKey: ['online-attendants', orgId] });
      toast.success("Conversa atribuída com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atribuir conversa: " + error.message);
    }
  });

  // Mutation para atribuição automática
  const autoAssignConversationMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      const { data, error } = await supabase.rpc('auto_assign_conversation', {
        p_conversation_id: conversationId
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (attendantId) => {
      queryClient.invalidateQueries({ queryKey: ['unassigned-conversations', orgId] });
      queryClient.invalidateQueries({ queryKey: ['active-assignments', orgId] });
      queryClient.invalidateQueries({ queryKey: ['online-attendants', orgId] });
      
      if (attendantId) {
        toast.success("Conversa atribuída automaticamente!");
      } else {
        toast.warning("Nenhum atendente disponível no momento");
      }
    },
    onError: (error) => {
      toast.error("Erro na atribuição automática: " + error.message);
    }
  });

  // Mutation para iniciar sessão
  const startSessionMutation = useMutation({
    mutationFn: async (attendantId: string) => {
      const { error } = await supabase
        .from('attendant_sessions')
        .insert({
          attendant_id: attendantId,
          org_id: orgId,
          status: 'active'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-sessions', orgId] });
      queryClient.invalidateQueries({ queryKey: ['online-attendants', orgId] });
      toast.success("Sessão iniciada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao iniciar sessão: " + error.message);
    }
  });

  // Mutation para finalizar sessão
  const endSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from('attendant_sessions')
        .update({
          status: 'ended',
          ended_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-sessions', orgId] });
      queryClient.invalidateQueries({ queryKey: ['online-attendants', orgId] });
      toast.success("Sessão finalizada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao finalizar sessão: " + error.message);
    }
  });

  // Função para encontrar o melhor atendente para uma conversa
  const findBestAttendant = (conversation?: any): Attendant | null => {
    const availableAttendants = onlineAttendantsQuery.data?.filter(attendant => {
      const currentChats = activeAssignmentsQuery.data?.filter(
        assignment => assignment.attendant_id === attendant.id && assignment.status === 'active'
      ).length || 0;
      
      return attendant.status === 'online' && currentChats < attendant.max_concurrent_chats;
    });

    if (!availableAttendants || availableAttendants.length === 0) {
      return null;
    }

    // Ordenar por menor número de conversas ativas e melhor tempo de resposta
    return availableAttendants.sort((a, b) => {
      const aCurrentChats = activeAssignmentsQuery.data?.filter(
        assignment => assignment.attendant_id === a.id && assignment.status === 'active'
      ).length || 0;
      
      const bCurrentChats = activeAssignmentsQuery.data?.filter(
        assignment => assignment.attendant_id === b.id && assignment.status === 'active'
      ).length || 0;

      // Priorizar atendentes com menos conversas ativas
      if (aCurrentChats !== bCurrentChats) {
        return aCurrentChats - bCurrentChats;
      }

      // Se empatados, priorizar melhor tempo de resposta
      return a.avg_response_time - b.avg_response_time;
    })[0];
  };

  return {
    // Queries
    attendants: attendantsQuery.data || [],
    onlineAttendants: onlineAttendantsQuery.data || [],
    unassignedConversations: unassignedConversationsQuery.data || [],
    activeAssignments: activeAssignmentsQuery.data || [],
    activeSessions: activeSessionsQuery.data || [],
    
    // Loading states
    isLoadingAttendants: attendantsQuery.isLoading,
    isLoadingOnline: onlineAttendantsQuery.isLoading,
    isLoadingUnassigned: unassignedConversationsQuery.isLoading,
    isLoadingAssignments: activeAssignmentsQuery.isLoading,
    isLoadingSessions: activeSessionsQuery.isLoading,
    
    // Mutations
    createAttendant: createAttendantMutation.mutate,
    updateAttendant: updateAttendantMutation.mutate,
    updateAttendantStatus: updateAttendantStatusMutation.mutate,
    assignConversation: assignConversationMutation.mutate,
    autoAssignConversation: autoAssignConversationMutation.mutate,
    startSession: startSessionMutation.mutate,
    endSession: endSessionMutation.mutate,
    
    // Loading states for mutations
    isCreatingAttendant: createAttendantMutation.isPending,
    isUpdatingAttendant: updateAttendantMutation.isPending,
    isUpdatingStatus: updateAttendantStatusMutation.isPending,
    isAssigningConversation: assignConversationMutation.isPending,
    isAutoAssigning: autoAssignConversationMutation.isPending,
    isStartingSession: startSessionMutation.isPending,
    isEndingSession: endSessionMutation.isPending,
    
    // Helper functions
    findBestAttendant,
    
    // Manual refetch functions
    refetchAttendants: () => {
      attendantsQuery.refetch();
      onlineAttendantsQuery.refetch();
    },
    refetchConversations: () => {
      unassignedConversationsQuery.refetch();
      activeAssignmentsQuery.refetch();
    },
    refetchSessions: () => {
      activeSessionsQuery.refetch();
    }
  };
}

// Hook para métricas de atendentes
export function useAttendantMetrics(orgId?: string, attendantId?: string) {
  const queryClient = useQueryClient();

  // Buscar métricas gerais
  const metricsQuery = useQuery({
    queryKey: ['attendant-metrics', orgId, attendantId],
    queryFn: async () => {
      if (!orgId) return [];
      
      let query = supabase
        .from('attendant_metrics')
        .select(`
          *,
          attendant:attendants(id, full_name)
        `)
        .eq('org_id', orgId)
        .gte('period_start', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('period_start', { ascending: false });

      if (attendantId) {
        query = query.eq('attendant_id', attendantId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AttendantMetrics[];
    },
    enabled: !!orgId
  });

  // Buscar métricas consolidadas
  const consolidatedMetricsQuery = useQuery({
    queryKey: ['consolidated-metrics', orgId],
    queryFn: async () => {
      if (!orgId) return null;
      
      const { data, error } = await supabase
        .from('attendant_metrics')
        .select('*')
        .eq('org_id', orgId)
        .gte('period_start', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

      if (error) throw error;

      if (!data || data.length === 0) return null;

      // Consolidar métricas
      const consolidated = data.reduce((acc, metric) => ({
        totalChats: acc.totalChats + metric.total_chats,
        resolvedChats: acc.resolvedChats + metric.resolved_chats,
        transferredChats: acc.transferredChats + metric.transferred_chats,
        abandonedChats: acc.abandonedChats + metric.abandoned_chats,
        totalResponseTime: acc.totalResponseTime + metric.avg_response_time,
        totalResolutionTime: acc.totalResolutionTime + metric.avg_resolution_time,
        totalWorkTime: acc.totalWorkTime + metric.total_work_time,
        totalSatisfaction: acc.totalSatisfaction + metric.satisfaction_avg,
        satisfactionCount: acc.satisfactionCount + metric.satisfaction_count,
        totalMessages: acc.totalMessages + metric.messages_sent,
        totalFCR: acc.totalFCR + metric.first_contact_resolution,
        count: acc.count + 1
      }), {
        totalChats: 0,
        resolvedChats: 0,
        transferredChats: 0,
        abandonedChats: 0,
        totalResponseTime: 0,
        totalResolutionTime: 0,
        totalWorkTime: 0,
        totalSatisfaction: 0,
        satisfactionCount: 0,
        totalMessages: 0,
        totalFCR: 0,
        count: 0
      });

      return {
        totalChats: consolidated.totalChats,
        resolvedChats: consolidated.resolvedChats,
        transferredChats: consolidated.transferredChats,
        abandonedChats: consolidated.abandonedChats,
        avgResponseTime: consolidated.count > 0 ? Math.round(consolidated.totalResponseTime / consolidated.count) : 0,
        avgResolutionTime: consolidated.count > 0 ? Math.round(consolidated.totalResolutionTime / consolidated.count) : 0,
        totalWorkTime: consolidated.totalWorkTime,
        avgSatisfaction: consolidated.satisfactionCount > 0 ? consolidated.totalSatisfaction / consolidated.satisfactionCount : 0,
        totalMessages: consolidated.totalMessages,
        avgFCR: consolidated.count > 0 ? consolidated.totalFCR / consolidated.count : 0,
        resolutionRate: consolidated.totalChats > 0 ? (consolidated.resolvedChats / consolidated.totalChats) * 100 : 0
      };
    },
    enabled: !!orgId
  });

  return {
    metrics: metricsQuery.data || [],
    consolidatedMetrics: consolidatedMetricsQuery.data,
    isLoadingMetrics: metricsQuery.isLoading,
    isLoadingConsolidated: consolidatedMetricsQuery.isLoading,
    refetchMetrics: () => {
      metricsQuery.refetch();
      consolidatedMetricsQuery.refetch();
    }
  };
}

// Hook para disponibilidade de atendentes
export function useAttendantAvailability(orgId?: string, attendantId?: string) {
  // Buscar disponibilidade
  const availabilityQuery = useQuery({
    queryKey: ['attendant-availability', orgId, attendantId],
    queryFn: async () => {
      if (!orgId) return [];
      
      let query = supabase
        .from('attendant_availability')
        .select('*')
        .eq('org_id', orgId)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (attendantId) {
        query = query.eq('attendant_id', attendantId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!orgId
  });

  return {
    availability: availabilityQuery.data || [],
    isLoadingAvailability: availabilityQuery.isLoading,
    refetchAvailability: availabilityQuery.refetch
  };
}
