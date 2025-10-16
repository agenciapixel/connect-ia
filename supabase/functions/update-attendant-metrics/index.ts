import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MetricsUpdateRequest {
  attendantId: string;
  orgId?: string;
  metrics: {
    totalChats?: number;
    resolvedChats?: number;
    transferredChats?: number;
    abandonedChats?: number;
    avgResponseTime?: number;
    avgResolutionTime?: number;
    totalWorkTime?: number;
    satisfactionAvg?: number;
    satisfactionCount?: number;
    messagesSent?: number;
    firstContactResolution?: number;
  };
  periodType?: 'daily' | 'weekly' | 'monthly';
  periodStart?: string;
  periodEnd?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      attendantId, 
      orgId, 
      metrics, 
      periodType = 'daily',
      periodStart,
      periodEnd 
    }: MetricsUpdateRequest = await req.json();

    if (!attendantId || !metrics) {
      throw new Error('attendantId e metrics são obrigatórios');
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

    // Determinar período se não fornecido
    const now = new Date();
    let startDate: string;
    let endDate: string;

    if (periodStart && periodEnd) {
      startDate = periodStart;
      endDate = periodEnd;
    } else {
      switch (periodType) {
        case 'daily':
          startDate = now.toISOString().split('T')[0];
          endDate = startDate;
          break;
        case 'weekly':
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          startDate = startOfWeek.toISOString().split('T')[0];
          endDate = now.toISOString().split('T')[0];
          break;
        case 'monthly':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
          endDate = now.toISOString().split('T')[0];
          break;
        default:
          throw new Error('Tipo de período inválido');
      }
    }

    // Verificar se já existe métrica para este período
    const { data: existingMetrics, error: existingError } = await supabase
      .from('attendant_metrics')
      .select('*')
      .eq('attendant_id', attendantId)
      .eq('org_id', targetOrgId)
      .eq('period_start', startDate)
      .eq('period_end', endDate)
      .eq('period_type', periodType)
      .single();

    if (existingError && existingError.code !== 'PGRST116') {
      throw new Error('Erro ao verificar métricas existentes: ' + existingError.message);
    }

    let result;

    if (existingMetrics) {
      // Atualizar métricas existentes
      const updateData: any = {};
      
      if (metrics.totalChats !== undefined) updateData.total_chats = existingMetrics.total_chats + metrics.totalChats;
      if (metrics.resolvedChats !== undefined) updateData.resolved_chats = existingMetrics.resolved_chats + metrics.resolvedChats;
      if (metrics.transferredChats !== undefined) updateData.transferred_chats = existingMetrics.transferred_chats + metrics.transferredChats;
      if (metrics.abandonedChats !== undefined) updateData.abandoned_chats = existingMetrics.abandoned_chats + metrics.abandonedChats;
      if (metrics.totalWorkTime !== undefined) updateData.total_work_time = existingMetrics.total_work_time + metrics.totalWorkTime;
      if (metrics.messagesSent !== undefined) updateData.messages_sent = existingMetrics.messages_sent + metrics.messagesSent;

      // Recalcular médias
      if (metrics.avgResponseTime !== undefined) {
        const currentTotal = existingMetrics.avg_response_time * existingMetrics.total_chats;
        const newTotal = currentTotal + (metrics.avgResponseTime * (metrics.totalChats || 0));
        const newCount = existingMetrics.total_chats + (metrics.totalChats || 0);
        updateData.avg_response_time = newCount > 0 ? Math.round(newTotal / newCount) : existingMetrics.avg_response_time;
      }

      if (metrics.avgResolutionTime !== undefined) {
        const currentTotal = existingMetrics.avg_resolution_time * existingMetrics.resolved_chats;
        const newTotal = currentTotal + (metrics.avgResolutionTime * (metrics.resolvedChats || 0));
        const newCount = existingMetrics.resolved_chats + (metrics.resolvedChats || 0);
        updateData.avg_resolution_time = newCount > 0 ? Math.round(newTotal / newCount) : existingMetrics.avg_resolution_time;
      }

      if (metrics.satisfactionAvg !== undefined && metrics.satisfactionCount !== undefined) {
        const currentTotal = existingMetrics.satisfaction_avg * existingMetrics.satisfaction_count;
        const newTotal = currentTotal + (metrics.satisfactionAvg * metrics.satisfactionCount);
        const newCount = existingMetrics.satisfaction_count + metrics.satisfactionCount;
        updateData.satisfaction_avg = newCount > 0 ? Number((newTotal / newCount).toFixed(2)) : existingMetrics.satisfaction_avg;
        updateData.satisfaction_count = newCount;
      }

      if (metrics.firstContactResolution !== undefined) {
        const currentTotal = existingMetrics.first_contact_resolution * existingMetrics.resolved_chats;
        const newTotal = currentTotal + metrics.firstContactResolution;
        const newCount = existingMetrics.resolved_chats + (metrics.resolvedChats || 0);
        updateData.first_contact_resolution = newCount > 0 ? Number((newTotal / newCount).toFixed(2)) : existingMetrics.first_contact_resolution;
      }

      const { data: updatedMetrics, error: updateError } = await supabase
        .from('attendant_metrics')
        .update(updateData)
        .eq('id', existingMetrics.id)
        .select()
        .single();

      if (updateError) {
        throw new Error('Erro ao atualizar métricas: ' + updateError.message);
      }

      result = updatedMetrics;
    } else {
      // Criar novas métricas
      const { data: newMetrics, error: createError } = await supabase
        .from('attendant_metrics')
        .insert({
          attendant_id: attendantId,
          org_id: targetOrgId,
          period_start: startDate,
          period_end: endDate,
          period_type: periodType,
          total_chats: metrics.totalChats || 0,
          resolved_chats: metrics.resolvedChats || 0,
          transferred_chats: metrics.transferredChats || 0,
          abandoned_chats: metrics.abandonedChats || 0,
          avg_response_time: metrics.avgResponseTime || 0,
          avg_resolution_time: metrics.avgResolutionTime || 0,
          total_work_time: metrics.totalWorkTime || 0,
          satisfaction_avg: metrics.satisfactionAvg || 0,
          satisfaction_count: metrics.satisfactionCount || 0,
          messages_sent: metrics.messagesSent || 0,
          first_contact_resolution: metrics.firstContactResolution || 0
        })
        .select()
        .single();

      if (createError) {
        throw new Error('Erro ao criar métricas: ' + createError.message);
      }

      result = newMetrics;
    }

    // Atualizar métricas consolidadas do atendente
    const updateAttendantData: any = {};
    
    if (metrics.totalChats !== undefined) {
      updateAttendantData.total_chats = attendant.total_chats + metrics.totalChats;
    }
    
    if (metrics.avgResponseTime !== undefined) {
      const currentTotal = attendant.avg_response_time * attendant.total_chats;
      const newTotal = currentTotal + (metrics.avgResponseTime * (metrics.totalChats || 0));
      const newCount = attendant.total_chats + (metrics.totalChats || 0);
      updateAttendantData.avg_response_time = newCount > 0 ? Math.round(newTotal / newCount) : attendant.avg_response_time;
    }

    if (metrics.satisfactionAvg !== undefined && metrics.satisfactionCount !== undefined) {
      const currentTotal = attendant.satisfaction_score * 100; // Assumindo que satisfaction_count está em 100
      const newTotal = currentTotal + (metrics.satisfactionAvg * metrics.satisfactionCount);
      const newCount = 100 + metrics.satisfactionCount;
      updateAttendantData.satisfaction_score = newCount > 0 ? Number((newTotal / newCount).toFixed(2)) : attendant.satisfaction_score;
    }

    if (Object.keys(updateAttendantData).length > 0) {
      updateAttendantData.last_activity_at = new Date().toISOString();

      const { error: attendantUpdateError } = await supabase
        .from('attendants')
        .update(updateAttendantData)
        .eq('id', attendantId);

      if (attendantUpdateError) {
        console.warn('Erro ao atualizar métricas do atendente:', attendantUpdateError.message);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Métricas atualizadas com sucesso',
        metrics: result,
        period: {
          start: startDate,
          end: endDate,
          type: periodType
        }
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error in update-attendant-metrics:', error);
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


