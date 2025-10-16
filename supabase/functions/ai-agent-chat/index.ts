import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { agentId, message, conversationId, contactId } = await req.json();

    if (!agentId || !message) {
      throw new Error('agentId e message são obrigatórios');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar configuração do agente
    const { data: agent, error: agentError } = await supabase
      .from('ai_agents')
      .select('*')
      .eq('id', agentId)
      .single();

    if (agentError || !agent) {
      throw new Error('Agente não encontrado');
    }

    if (agent.status !== 'ativo') {
      throw new Error('Agente não está ativo');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    // ============================================
    // BUSCAR HISTÓRICO DA CONVERSA (últimas 10 mensagens)
    // ============================================
    let conversationHistory: any[] = [];
    let contactName = 'Cliente';

    if (conversationId) {
      // Buscar informações do contato
      const { data: conversation } = await supabase
        .from('conversations')
        .select('contact_id, contacts(full_name, external_id)')
        .eq('id', conversationId)
        .single();

      if (conversation?.contacts) {
        contactName = conversation.contacts.full_name ||
                     `Cliente ${conversation.contacts.external_id?.slice(-4)}` ||
                     'Cliente';
      }

      // Buscar últimas mensagens da conversa
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('content, direction, sender_type, created_at')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!messagesError && messages && messages.length > 0) {
        // Inverter para ordem cronológica
        conversationHistory = messages.reverse();
        console.log(`📚 Histórico carregado: ${conversationHistory.length} mensagens`);
      }
    } else if (contactId) {
      // Se não tem conversationId mas tem contactId, buscar informações do contato
      const { data: contact } = await supabase
        .from('contacts')
        .select('full_name, external_id')
        .eq('id', contactId)
        .single();

      if (contact) {
        contactName = contact.full_name ||
                     `Cliente ${contact.external_id?.slice(-4)}` ||
                     'Cliente';
      }
    }

    // ============================================
    // CONSTRUIR CONTEXTO DA CONVERSA
    // ============================================
    let contextPrompt = '';

    if (conversationHistory.length > 0) {
      contextPrompt = '\n\n📋 HISTÓRICO DA CONVERSA:\n';
      conversationHistory.forEach((msg, index) => {
        const role = msg.direction === 'inbound' ? contactName : 'Você';
        const time = new Date(msg.created_at).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        });
        contextPrompt += `[${time}] ${role}: ${msg.content}\n`;
      });
      contextPrompt += '\n---\n';
    }

    // ============================================
    // PROMPT MELHORADO COM DIRETRIZES ADICIONAIS
    // ============================================
    const enhancedSystemPrompt = `${agent.system_prompt}

${contextPrompt}

⚠️ DIRETRIZES IMPORTANTES DE RESPOSTA:

1. SEJA CONCISO:
   - Mantenha respostas entre 2-4 parágrafos CURTOS
   - Máximo de 150-200 palavras por resposta
   - Use frases curtas e diretas
   - Evite repetições desnecessárias

2. CONSIDERE O HISTÓRICO:
   - Leia TODA a conversa acima antes de responder
   - Não repita informações já ditas
   - Faça referência a mensagens anteriores quando relevante
   - Mantenha consistência com respostas anteriores

3. FORMATAÇÃO:
   - Use quebras de linha para facilitar leitura
   - Não use listas muito longas (máximo 3-5 itens)
   - Evite explicações muito técnicas ou verbosas
   - Prefira perguntas diretas a múltiplas opções

4. TOM:
   - Seja natural e conversacional (como WhatsApp)
   - Evite ser muito formal ou robótico
   - Use emojis com moderação (1-2 por mensagem)
   - Fale diretamente com o cliente pelo nome quando apropriado

5. CONTEXTO:
   - Nome do cliente: ${contactName}
   - Esta é uma conversa ${conversationHistory.length > 0 ? 'em andamento' : 'nova'}
   ${conversationHistory.length > 0 ? `- Já foram trocadas ${conversationHistory.length} mensagens` : ''}

Responda AGORA à última mensagem do cliente de forma CONCISA e DIRETA:`;

    // ============================================
    // CONSTRUIR ARRAY DE MENSAGENS PARA A IA
    // ============================================
    const messages = [
      { role: 'system', content: enhancedSystemPrompt },
      { role: 'user', content: message }
    ];

    console.log('🤖 Chamando IA com contexto:', {
      agentName: agent.name,
      agentType: agent.type,
      historyMessages: conversationHistory.length,
      contactName: contactName,
      messageLength: message.length
    });

    // ============================================
    // CHAMAR A API DA LOVABLE AI
    // ============================================
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: agent.model,
        messages: messages,
        temperature: agent.temperature,
        max_tokens: Math.min(agent.max_tokens, 500), // Limitar para respostas mais curtas
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', errorText);
      throw new Error(`Erro ao chamar Lovable AI: ${response.status}`);
    }

    const data = await response.json();
    let aiResponse = data.choices[0].message.content;

    // ============================================
    // PÓS-PROCESSAMENTO DA RESPOSTA
    // ============================================

    // Remover excesso de quebras de linha
    aiResponse = aiResponse.replace(/\n{3,}/g, '\n\n');

    // Limitar tamanho se ainda estiver muito longa (aproximadamente 250 palavras)
    const words = aiResponse.split(/\s+/);
    if (words.length > 250) {
      aiResponse = words.slice(0, 250).join(' ') + '...';
      console.log('⚠️ Resposta truncada por exceder limite de palavras');
    }

    console.log('✅ Resposta gerada:', {
      length: aiResponse.length,
      words: aiResponse.split(/\s+/).length
    });

    // ============================================
    // REGISTRAR A CONVERSA
    // ============================================
    if (conversationId) {
      await supabase.from('agent_conversations').upsert({
        id: conversationId,
        agent_id: agentId,
        status: 'active',
        updated_at: new Date().toISOString()
      });
    }

    return new Response(
      JSON.stringify({
        response: aiResponse,
        agentName: agent.name,
        agentType: agent.type,
        contextUsed: conversationHistory.length > 0,
        historyMessages: conversationHistory.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('❌ Error in ai-agent-chat:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erro ao processar mensagem' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
