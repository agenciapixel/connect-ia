import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SessionRequest {
  action: 'start' | 'end' | 'pause' | 'resume';
  attendantId: string;
  orgId?: string;
  notes?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, attendantId, orgId, notes }: SessionRequest = await req.json();

    if (!action || !attendantId) {
      throw new Error('action e attendantId são obrigatórios');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar informações do atendente
    const { data: attendant, error: attendantError } = await supabase
      .from('attendants')
      .select('*')
      .eq('id', attendantId)
      .single();

    if (attendantError || !attendant) {
      throw new Error('Atendente não encontrado');
    }

    const targetOrgId = orgId || attendant.org_id;

    // Verificar se o atendente pertence à organização
    if (attendant.org_id !== targetOrgId) {
      throw new Error('Atendente não pertence à organização especificada');
    }

    let sessionResult = null;

    switch (action) {
      case 'start':
        // Verificar se já existe uma sessão ativa
        const { data: existingSession, error: existingError } = await supabase
          .from('attendant_sessions')
          .select('id')
          .eq('attendant_id', attendantId)
          .eq('status', 'active')
          .single();

        if (existingSession) {
          throw new Error('Já existe uma sessão ativa para este atendente');
        }

        // Criar nova sessão
        const { data: newSession, error: startError } = await supabase
          .from('attendant_sessions')
          .insert({
            attendant_id: attendantId,
            org_id: targetOrgId,
            status: 'active',
            notes: notes || 'Sessão iniciada automaticamente'
          })
          .select()
          .single();

        if (startError) {
          throw new Error('Erro ao iniciar sessão: ' + startError.message);
        }

        // Atualizar status do atendente para online se não estiver
        if (attendant.status !== 'online') {
          const { error: statusError } = await supabase
            .from('attendants')
            .update({ 
              status: 'online',
              last_activity_at: new Date().toISOString()
            })
            .eq('id', attendantId);

          if (statusError) {
            console.warn('Erro ao atualizar status do atendente:', statusError.message);
          }
        }

        sessionResult = newSession;
        break;

      case 'end':
        // Buscar sessão ativa
        const { data: activeSession, error: activeError } = await supabase
          .from('attendant_sessions')
          .select('*')
          .eq('attendant_id', attendantId)
          .eq('status', 'active')
          .single();

        if (activeError || !activeSession) {
          throw new Error('Nenhuma sessão ativa encontrada para este atendente');
        }

        // Finalizar sessão
        const { data: endedSession, error: endError } = await supabase
          .from('attendant_sessions')
          .update({
            status: 'ended',
            ended_at: new Date().toISOString(),
            notes: notes || activeSession.notes
          })
          .eq('id', activeSession.id)
          .select()
          .single();

        if (endError) {
          throw new Error('Erro ao finalizar sessão: ' + endError.message);
        }

        // Verificar se há conversas ativas antes de alterar status
        const { data: activeAssignments, error: assignmentsError } = await supabase
          .from('conversation_assignments')
          .select('id')
          .eq('attendant_id', attendantId)
          .eq('status', 'active');

        if (assignmentsError) {
          console.warn('Erro ao verificar conversas ativas:', assignmentsError.message);
        }

        // Se não há conversas ativas, pode alterar status para offline
        if (!activeAssignments || activeAssignments.length === 0) {
          const { error: statusError } = await supabase
            .from('attendants')
            .update({ 
              status: 'offline',
              last_activity_at: new Date().toISOString()
            })
            .eq('id', attendantId);

          if (statusError) {
            console.warn('Erro ao atualizar status do atendente:', statusError.message);
          }
        }

        sessionResult = endedSession;
        break;

      case 'pause':
        // Buscar sessão ativa
        const { data: sessionToPause, error: pauseSessionError } = await supabase
          .from('attendant_sessions')
          .select('*')
          .eq('attendant_id', attendantId)
          .eq('status', 'active')
          .single();

        if (pauseSessionError || !sessionToPause) {
          throw new Error('Nenhuma sessão ativa encontrada para este atendente');
        }

        // Pausar sessão
        const { data: pausedSession, error: pauseError } = await supabase
          .from('attendant_sessions')
          .update({
            status: 'paused',
            notes: notes || sessionToPause.notes
          })
          .eq('id', sessionToPause.id)
          .select()
          .single();

        if (pauseError) {
          throw new Error('Erro ao pausar sessão: ' + pauseError.message);
        }

        // Atualizar status do atendente para away
        const { error: awayStatusError } = await supabase
          .from('attendants')
          .update({ 
            status: 'away',
            last_activity_at: new Date().toISOString()
          })
          .eq('id', attendantId);

        if (awayStatusError) {
          console.warn('Erro ao atualizar status do atendente:', awayStatusError.message);
        }

        sessionResult = pausedSession;
        break;

      case 'resume':
        // Buscar sessão pausada
        const { data: sessionToResume, error: resumeSessionError } = await supabase
          .from('attendant_sessions')
          .select('*')
          .eq('attendant_id', attendantId)
          .eq('status', 'paused')
          .single();

        if (resumeSessionError || !sessionToResume) {
          throw new Error('Nenhuma sessão pausada encontrada para este atendente');
        }

        // Retomar sessão
        const { data: resumedSession, error: resumeError } = await supabase
          .from('attendant_sessions')
          .update({
            status: 'active',
            notes: notes || sessionToResume.notes
          })
          .eq('id', sessionToResume.id)
          .select()
          .single();

        if (resumeError) {
          throw new Error('Erro ao retomar sessão: ' + resumeError.message);
        }

        // Atualizar status do atendente para online
        const { error: onlineStatusError } = await supabase
          .from('attendants')
          .update({ 
            status: 'online',
            last_activity_at: new Date().toISOString()
          })
          .eq('id', attendantId);

        if (onlineStatusError) {
          console.warn('Erro ao atualizar status do atendente:', onlineStatusError.message);
        }

        sessionResult = resumedSession;
        break;

      default:
        throw new Error('Ação não reconhecida: ' + action);
    }

    // Buscar informações atualizadas do atendente
    const { data: updatedAttendant, error: updatedError } = await supabase
      .from('attendants')
      .select(`
        *,
        profile:profiles(id, avatar_url, full_name)
      `)
      .eq('id', attendantId)
      .single();

    if (updatedError) {
      console.warn('Erro ao buscar informações atualizadas do atendente:', updatedError.message);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Sessão ${action === 'start' ? 'iniciada' : action === 'end' ? 'finalizada' : action === 'pause' ? 'pausada' : 'retomada'} com sucesso`,
        session: sessionResult,
        attendant: updatedAttendant
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error in manage-attendant-session:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Erro interno do servidor'
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});


