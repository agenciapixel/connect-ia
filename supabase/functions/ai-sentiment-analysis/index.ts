import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SentimentResult {
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number; // -1 a 1 (negativo a positivo)
  confidence: number; // 0 a 1
  emotions?: string[]; // raiva, frustração, felicidade, etc.
  keywords?: string[]; // palavras-chave detectadas
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, messageId, conversationId } = await req.json();

    if (!message) {
      throw new Error('message é obrigatório');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    console.log('🎭 Analisando sentimento da mensagem:', {
      messageLength: message.length,
      messageId,
      conversationId
    });

    // ============================================
    // PROMPT DE ANÁLISE DE SENTIMENTO
    // ============================================
    const systemPrompt = `Você é um especialista em análise de sentimento e emoções em mensagens de chat.

Analise a mensagem do cliente e retorne APENAS um objeto JSON válido com a seguinte estrutura:

{
  "sentiment": "positive" | "neutral" | "negative",
  "score": número entre -1 (muito negativo) e 1 (muito positivo),
  "confidence": número entre 0 e 1 indicando confiança na análise,
  "emotions": ["lista", "de", "emoções", "detectadas"],
  "keywords": ["palavras", "chave", "importantes"]
}

CRITÉRIOS DE ANÁLISE:

NEGATIVE (score -1 a -0.3):
- Palavras como: problema, erro, ruim, péssimo, horrível, não funciona, cancelar, reclamar
- Emojis negativos: 😠 😡 🤬 😤 😢 😞 😔
- Tom de raiva, frustração, decepção
- Ameaças de cancelamento ou reclamação

NEUTRAL (score -0.3 a 0.3):
- Perguntas simples, informações neutras
- Sem expressão emocional clara
- Tom profissional ou informativo

POSITIVE (score 0.3 a 1):
- Palavras como: obrigado, ótimo, excelente, maravilhoso, perfeito, adorei
- Emojis positivos: 😊 😃 ❤️ 👍 🎉 ✨
- Tom de satisfação, gratidão, felicidade
- Elogios e feedback positivo

EMOÇÕES POSSÍVEIS:
raiva, frustração, decepção, tristeza, preocupação, ansiedade, felicidade, gratidão, satisfação, entusiasmo, neutro, confuso, impaciente

Seja PRECISO e CONSISTENTE. Retorne APENAS o JSON, sem texto adicional.`;

    // ============================================
    // CHAMAR IA PARA ANÁLISE
    // ============================================
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analise o sentimento desta mensagem:\n\n"${message}"` }
        ],
        temperature: 0.3, // Baixa temperatura para consistência
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', errorText);
      throw new Error(`Erro ao chamar Lovable AI: ${response.status}`);
    }

    const data = await response.json();
    let aiResponse = data.choices[0].message.content;

    // Limpar resposta para extrair JSON
    aiResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let sentimentResult: SentimentResult;

    try {
      sentimentResult = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Erro ao parsear resposta da IA:', aiResponse);
      // Fallback para análise básica por palavras-chave
      sentimentResult = analyzeBasicSentiment(message);
    }

    // Validar e normalizar resultado
    sentimentResult = validateSentimentResult(sentimentResult);

    console.log('✅ Análise de sentimento concluída:', sentimentResult);

    // ============================================
    // SALVAR RESULTADO NO BANCO (se messageId fornecido)
    // ============================================
    if (messageId) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { error: updateError } = await supabase
        .from('messages')
        .update({
          sentiment: sentimentResult.sentiment,
          sentiment_score: sentimentResult.score,
          sentiment_confidence: sentimentResult.confidence,
          sentiment_emotions: sentimentResult.emotions,
          updated_at: new Date().toISOString()
        })
        .eq('id', messageId);

      if (updateError) {
        console.error('Erro ao salvar sentimento:', updateError);
      } else {
        console.log('💾 Sentimento salvo no banco de dados');
      }
    }

    return new Response(
      JSON.stringify(sentimentResult),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('❌ Error in ai-sentiment-analysis:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Erro ao analisar sentimento',
        sentiment: 'neutral',
        score: 0,
        confidence: 0
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function analyzeBasicSentiment(message: string): SentimentResult {
  const lowerMessage = message.toLowerCase();

  // Palavras negativas
  const negativeWords = [
    'problema', 'erro', 'ruim', 'péssimo', 'horrível', 'não funciona',
    'cancelar', 'reclamar', 'frustrado', 'raiva', 'chato', 'demorado',
    'nunca', 'sempre', 'pior', 'decepção', 'insatisfeito', 'terrível'
  ];

  // Palavras positivas
  const positiveWords = [
    'obrigado', 'obrigada', 'ótimo', 'excelente', 'maravilhoso', 'perfeito',
    'adorei', 'amei', 'fantástico', 'incrível', 'bom', 'legal', 'parabéns',
    'sucesso', 'feliz', 'satisfeito', 'amo', 'agradeço'
  ];

  let score = 0;
  const detectedKeywords: string[] = [];

  negativeWords.forEach(word => {
    if (lowerMessage.includes(word)) {
      score -= 0.2;
      detectedKeywords.push(word);
    }
  });

  positiveWords.forEach(word => {
    if (lowerMessage.includes(word)) {
      score += 0.2;
      detectedKeywords.push(word);
    }
  });

  // Limitar score entre -1 e 1
  score = Math.max(-1, Math.min(1, score));

  let sentiment: 'positive' | 'neutral' | 'negative';
  let emotions: string[] = [];

  if (score < -0.3) {
    sentiment = 'negative';
    emotions = ['frustração', 'insatisfação'];
  } else if (score > 0.3) {
    sentiment = 'positive';
    emotions = ['satisfação', 'gratidão'];
  } else {
    sentiment = 'neutral';
    emotions = ['neutro'];
  }

  return {
    sentiment,
    score,
    confidence: 0.6, // Confiança média para análise básica
    emotions,
    keywords: detectedKeywords.slice(0, 5)
  };
}

function validateSentimentResult(result: any): SentimentResult {
  // Garantir que o resultado tenha a estrutura correta
  const validSentiments = ['positive', 'neutral', 'negative'];

  return {
    sentiment: validSentiments.includes(result.sentiment) ? result.sentiment : 'neutral',
    score: typeof result.score === 'number' ?
           Math.max(-1, Math.min(1, result.score)) : 0,
    confidence: typeof result.confidence === 'number' ?
                Math.max(0, Math.min(1, result.confidence)) : 0.5,
    emotions: Array.isArray(result.emotions) ? result.emotions.slice(0, 5) : [],
    keywords: Array.isArray(result.keywords) ? result.keywords.slice(0, 10) : []
  };
}
