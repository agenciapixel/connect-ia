// Supabase Edge Function para enviar email de boas-vindas com senha
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

interface EmailRequest {
  email: string;
  fullName: string;
  companyName: string;
  password: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, fullName, companyName, password }: EmailRequest = await req.json();

    console.log("📧 Enviando email de boas-vindas para:", email);

    // Validar dados
    if (!email || !fullName || !companyName || !password) {
      throw new Error("Dados incompletos");
    }

    // Enviar email usando Resend
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Connect IA <noreply@connectia.agenciapixel.digital>",
        to: [email],
        subject: "🎉 Bem-vindo ao Connect IA - Suas credenciais de acesso",
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bem-vindo ao Connect IA</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">🎉 Bem-vindo ao Connect IA!</h1>
  </div>

  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px;">Olá <strong>${fullName}</strong>,</p>

    <p>Sua conta foi criada com sucesso! Você está pronto para começar a usar o Connect IA e transformar seu atendimento ao cliente.</p>

    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
      <h3 style="margin-top: 0; color: #667eea;">📋 Detalhes da sua conta</h3>
      <p style="margin: 10px 0;"><strong>Nome:</strong> ${fullName}</p>
      <p style="margin: 10px 0;"><strong>Empresa:</strong> ${companyName}</p>
      <p style="margin: 10px 0;"><strong>Email:</strong> ${email}</p>
    </div>

    <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
      <h3 style="margin-top: 0; color: #856404;">🔐 Sua senha temporária</h3>
      <p style="font-size: 24px; font-family: 'Courier New', monospace; background: white; padding: 15px; border-radius: 5px; text-align: center; letter-spacing: 2px; margin: 15px 0;">
        <strong>${password}</strong>
      </p>
      <p style="color: #856404; font-size: 14px; margin: 10px 0;">
        ⚠️ Por segurança, recomendamos que você altere sua senha no primeiro acesso.
      </p>
    </div>

    <div style="background: #d1ecf1; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #17a2b8;">
      <h3 style="margin-top: 0; color: #0c5460;">🎁 Seu teste grátis de 14 dias</h3>
      <p style="margin: 10px 0;">Você tem acesso completo a todas as funcionalidades:</p>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li>✅ 1.000 contatos</li>
        <li>✅ 1.000 conversas por mês</li>
        <li>✅ 10 campanhas ativas</li>
        <li>✅ 5 agentes de IA</li>
        <li>✅ 5 atendentes simultâneos</li>
        <li>✅ Integrações ilimitadas</li>
        <li>✅ Analytics avançado</li>
        <li>✅ API completa</li>
      </ul>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="https://connectia.agenciapixel.digital/autenticacao"
         style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
        Acessar o Sistema
      </a>
    </div>

    <div style="background: #e7f3ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px; color: #004085;">
        💡 <strong>Dica:</strong> Após fazer login, visite a seção "Integrações" para conectar seus canais de atendimento (WhatsApp, Instagram, Messenger).
      </p>
    </div>

    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

    <p style="font-size: 14px; color: #666;">
      Precisa de ajuda? Entre em contato conosco através do email
      <a href="mailto:suporte@connectia.agenciapixel.digital" style="color: #667eea;">suporte@connectia.agenciapixel.digital</a>
    </p>

    <p style="font-size: 12px; color: #999; margin-top: 20px;">
      Connect IA - Transformando atendimento com inteligência artificial<br>
      © 2024 Agência Pixel. Todos os direitos reservados.
    </p>
  </div>
</body>
</html>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      console.error("❌ Erro ao enviar email:", errorData);
      throw new Error(`Erro ao enviar email: ${errorData.message || "Desconhecido"}`);
    }

    const emailData = await emailResponse.json();
    console.log("✅ Email enviado com sucesso:", emailData);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email enviado com sucesso",
        emailId: emailData.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("❌ Erro:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
