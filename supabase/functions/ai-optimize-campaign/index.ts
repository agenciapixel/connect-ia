import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { campaignData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log('Optimizing campaign:', campaignData);

    const systemPrompt = `Você é um especialista em otimização de campanhas de marketing digital.
Analise os dados fornecidos e forneça recomendações práticas e acionáveis para melhorar o desempenho.
Considere:
- Taxa de entrega e abertura
- Melhor horário de envio
- Segmentação de audiência
- Otimização de mensagens
- A/B testing
Forneça insights específicos e mensuráveis.`;

    const userPrompt = `Analise esta campanha e forneça recomendações de otimização:

Nome: ${campaignData.name}
Canal: ${campaignData.channel}
Status: ${campaignData.status}
Mensagens enviadas: ${campaignData.sent || 0}
Taxa de entrega: ${campaignData.deliveryRate || 0}%
Taxa de abertura: ${campaignData.openRate || 0}%

Forneça pelo menos 5 recomendações práticas para melhorar esta campanha.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit excedido. Tente novamente em alguns instantes." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Adicione créditos no workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Erro ao otimizar campanha");
    }

    const data = await response.json();
    const recommendations = data.choices?.[0]?.message?.content;

    console.log('Campaign optimization completed');

    return new Response(JSON.stringify({ recommendations }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in ai-optimize-campaign function:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
