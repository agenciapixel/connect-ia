import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Política de Privacidade</CardTitle>
          <CardDescription>
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Informações Gerais</h2>
            <p className="text-muted-foreground leading-relaxed">
              Esta Política de Privacidade descreve como o Omnichat IA ("nós", "nosso" ou "a empresa") 
              coleta, usa, armazena e protege suas informações pessoais quando você utiliza nossos serviços.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Informações que Coletamos</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">2.1 Informações Pessoais</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Nome completo</li>
                  <li>Endereço de e-mail</li>
                  <li>Informações de perfil (quando fornecidas)</li>
                  <li>Credenciais de integração com plataformas sociais</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">2.2 Informações Técnicas</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Endereço IP</li>
                  <li>Tipo de navegador e versão</li>
                  <li>Sistema operacional</li>
                  <li>Data e hora de acesso</li>
                  <li>Páginas visitadas</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">2.3 Dados de Integração</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Tokens de acesso das plataformas sociais (Instagram, WhatsApp, Facebook)</li>
                  <li>IDs de páginas e perfis conectados</li>
                  <li>Configurações de canais de comunicação</li>
                </ul>
              </div>
            </div>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Como Utilizamos Suas Informações</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Fornecer e melhorar nossos serviços de comunicação omnichannel</li>
              <li>Gerenciar suas integrações com plataformas sociais</li>
              <li>Processar e enviar mensagens através dos canais conectados</li>
              <li>Autenticar sua identidade e manter a segurança da conta</li>
              <li>Comunicar atualizações importantes sobre nossos serviços</li>
              <li>Fornecer suporte técnico quando necessário</li>
              <li>Analisar o uso da plataforma para melhorias</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Compartilhamento de Informações</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, 
              exceto nas seguintes circunstâncias:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Prestadores de serviços:</strong> Empresas que nos ajudam a operar nossa plataforma (ex: Supabase, Vercel)</li>
              <li><strong>Plataformas sociais:</strong> Quando você conecta suas contas (Instagram, WhatsApp, Facebook)</li>
              <li><strong>Obrigação legal:</strong> Quando exigido por lei ou processo legal</li>
              <li><strong>Proteção de direitos:</strong> Para proteger nossos direitos, propriedade ou segurança</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Segurança dos Dados</h2>
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Criptografia de dados em trânsito e em repouso</li>
                <li>Autenticação segura e controle de acesso</li>
                <li>Monitoramento regular de segurança</li>
                <li>Backup seguro e recuperação de dados</li>
                <li>Treinamento de equipe em práticas de segurança</li>
              </ul>
            </div>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Seus Direitos</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Você tem os seguintes direitos em relação às suas informações pessoais:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li><strong>Acesso:</strong> Solicitar uma cópia dos dados que temos sobre você</li>
              <li><strong>Retificação:</strong> Corrigir informações incorretas ou incompletas</li>
              <li><strong>Exclusão:</strong> Solicitar a remoção de seus dados pessoais</li>
              <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
              <li><strong>Oposição:</strong> Opor-se ao processamento de seus dados</li>
              <li><strong>Restrição:</strong> Limitar como processamos suas informações</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Retenção de Dados</h2>
            <p className="text-muted-foreground leading-relaxed">
              Mantemos suas informações pessoais apenas pelo tempo necessário para cumprir os 
              propósitos descritos nesta política, a menos que um período de retenção mais longo 
              seja exigido por lei. Dados de integração são mantidos enquanto sua conta estiver 
              ativa e você mantiver as conexões com as plataformas sociais.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Cookies e Tecnologias Similares</h2>
            <p className="text-muted-foreground leading-relaxed">
              Utilizamos cookies e tecnologias similares para melhorar sua experiência, 
              analisar o uso da plataforma e personalizar conteúdo. Você pode controlar 
              o uso de cookies através das configurações do seu navegador.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Alterações nesta Política</h2>
            <p className="text-muted-foreground leading-relaxed">
              Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos 
              sobre mudanças significativas através de e-mail ou aviso em nossa plataforma. 
              A data da última atualização está indicada no início deste documento.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Contato</h2>
            <p className="text-muted-foreground leading-relaxed">
              Se você tiver dúvidas sobre esta Política de Privacidade ou sobre como 
              tratamos suas informações pessoais, entre em contato conosco:
            </p>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="font-medium">Omnichat IA</p>
              <p>E-mail: privacidade@omnichat-ia.com</p>
              <p>Suporte: suporte@omnichat-ia.com</p>
            </div>
          </section>

        </CardContent>
      </Card>
    </div>
  );
}
