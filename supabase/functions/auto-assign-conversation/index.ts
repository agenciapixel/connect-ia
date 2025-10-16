import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AutoAssignRequest {
  conversationId: string;
  orgId?: string;
  criteria?: {
    prioritizeByResponseTime?: boolean;
    prioritizeBySatisfaction?: boolean;
    requireSkills?: string[];
    maxConcurrentChats?: number;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { conversationId, orgId, criteria }: AutoAssignRequest = await req.json();

    if (!conversationId) {
      throw new Error('conversationId é obrigatório');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar informações da conversa
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .select(`
        *,
        contacts(id, full_name, email, phone_e164, tags)
      `)
      .eq('id', conversationId)
      .single();

    if (conversationError || !conversation) {
      throw new Error('Conversa não encontrada');
    }

    if (conversation.assigned_to) {
      throw new Error('Conversa já está atribuída');
    }

    const targetOrgId = orgId || conversation.org_id;

    // Buscar atendentes disponíveis
    const { data: availableAttendants, error: attendantsError } = await supabase
      .from('attendants')
      .select(`
        *,
        profile:profiles(id, avatar_url, full_name)
      `)
      .eq('org_id', targetOrgId)
      .eq('status', 'online')
      .eq('auto_accept', true);

    if (attendantsError) {
      throw new Error('Erro ao buscar atendentes disponíveis');
    }

    if (!availableAttendants || availableAttendants.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false,
          message: 'Nenhum atendente disponível para atribuição automática',
          assignedAttendantId: null
        }), 
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Buscar conversas ativas de cada atendente
    const { data: activeAssignments, error: assignmentsError } = await supabase
      .from('conversation_assignments')
      .select('attendant_id')
      .eq('org_id', targetOrgId)
      .eq('status', 'active');

    if (assignmentsError) {
      throw new Error('Erro ao buscar atribuições ativas');
    }

    // Calcular conversas ativas por atendente
    const attendantChatCounts = new Map<string, number>();
    activeAssignments?.forEach(assignment => {
      const count = attendantChatCounts.get(assignment.attendant_id) || 0;
      attendantChatCounts.set(assignment.attendant_id, count + 1);
    });

    // Filtrar atendentes que não excedem o limite de conversas
    const eligibleAttendants = availableAttendants.filter(attendant => {
      const currentChats = attendantChatCounts.get(attendant.id) || 0;
      const maxChats = criteria?.maxConcurrentChats || attendant.max_concurrent_chats;
      return currentChats < maxChats;
    });

    if (eligibleAttendants.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false,
          message: 'Todos os atendentes estão com capacidade máxima de conversas',
          assignedAttendantId: null
        }), 
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Algoritmo de seleção do melhor atendente
    let bestAttendant = eligibleAttendants[0];

    if (eligibleAttendants.length > 1) {
      // Ordenar por critérios
      eligibleAttendants.sort((a, b) => {
        // 1. Priorizar atendentes com menos conversas ativas
        const aCurrentChats = attendantChatCounts.get(a.id) || 0;
        const bCurrentChats = attendantChatCounts.get(b.id) || 0;
        
        if (aCurrentChats !== bCurrentChats) {
          return aCurrentChats - bCurrentChats;
        }

        // 2. Se empatados, priorizar por tempo de resposta
        if (criteria?.prioritizeByResponseTime !== false) {
          if (a.avg_response_time !== b.avg_response_time) {
            return a.avg_response_time - b.avg_response_time;
          }
        }

        // 3. Se ainda empatados, priorizar por satisfação
        if (criteria?.prioritizeBySatisfaction !== false) {
          if (a.satisfaction_score !== b.satisfaction_score) {
            return b.satisfaction_score - a.satisfaction_score;
          }
        }

        // 4. Se ainda empatados, priorizar por skills (se especificado)
        if (criteria?.requireSkills && criteria.requireSkills.length > 0) {
          const aSkillMatch = criteria.requireSkills.filter(skill => a.skills.includes(skill)).length;
          const bSkillMatch = criteria.requireSkills.filter(skill => b.skills.includes(skill)).length;
          
          if (aSkillMatch !== bSkillMatch) {
            return bSkillMatch - aSkillMatch;
          }
        }

        // 5. Critério final: ordem de criação (mais recente primeiro)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      bestAttendant = eligibleAttendants[0];
    }

    // Criar atribuição
    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError) {
      throw new Error('Erro ao obter usuário atual');
    }

    const { error: assignmentError } = await supabase
      .from('conversation_assignments')
      .insert({
        conversation_id: conversationId,
        attendant_id: bestAttendant.id,
        org_id: targetOrgId,
        assigned_by: user.user?.id,
        notes: 'Atribuição automática pelo sistema',
        status: 'assigned'
      });

    if (assignmentError) {
      throw new Error('Erro ao criar atribuição: ' + assignmentError.message);
    }

    // Atualizar conversa
    const { error: conversationUpdateError } = await supabase
      .from('conversations')
      .update({
        assigned_to: bestAttendant.id,
        status: 'assigned'
      })
      .eq('id', conversationId);

    if (conversationUpdateError) {
      throw new Error('Erro ao atualizar conversa: ' + conversationUpdateError.message);
    }

    // Log da atribuição automática
    console.log(`Conversa ${conversationId} atribuída automaticamente para ${bestAttendant.full_name}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Conversa atribuída com sucesso',
        assignedAttendantId: bestAttendant.id,
        attendant: {
          id: bestAttendant.id,
          name: bestAttendant.full_name,
          email: bestAttendant.email,
          department: bestAttendant.department,
          currentChats: attendantChatCounts.get(bestAttendant.id) || 0,
          maxChats: bestAttendant.max_concurrent_chats,
          avgResponseTime: bestAttendant.avg_response_time,
          satisfactionScore: bestAttendant.satisfaction_score
        }
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error in auto-assign-conversation:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Erro interno do servidor',
        assignedAttendantId: null
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

