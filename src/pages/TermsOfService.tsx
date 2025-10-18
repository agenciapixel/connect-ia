import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function TermsOfService() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Termos de Serviço</CardTitle>
          <CardDescription>
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">

          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Aceitação dos Termos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Ao acessar e usar o Connect IA, você concorda em cumprir e estar vinculado a estes
              Termos de Serviço. Se você não concordar com qualquer parte destes termos, não deve
              usar nossos serviços.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Descrição do Serviço</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              O Connect IA é uma plataforma de CRM (Customer Relationship Management) que oferece:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Gestão unificada de conversas de WhatsApp, Instagram e Messenger</li>
              <li>Automação de mensagens com inteligência artificial</li>
              <li>Gerenciamento de contatos e campanhas</li>
              <li>Pipeline de vendas e prospecção</li>
              <li>Dashboard com métricas em tempo real</li>
              <li>Integrações com plataformas Meta (Facebook, WhatsApp, Instagram)</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Cadastro e Conta</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">3.1 Criação de Conta</h3>
                <p className="text-muted-foreground">
                  Para usar o Connect IA, você deve criar uma conta fornecendo informações
                  precisas e completas. Você é responsável por manter a confidencialidade
                  de suas credenciais de acesso.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">3.2 Elegibilidade</h3>
                <p className="text-muted-foreground">
                  Você deve ter pelo menos 18 anos de idade e capacidade legal para
                  celebrar contratos para usar nossos serviços.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">3.3 Segurança da Conta</h3>
                <p className="text-muted-foreground">
                  Você é responsável por todas as atividades que ocorrem em sua conta.
                  Notifique-nos imediatamente sobre qualquer uso não autorizado.
                </p>
              </div>
            </div>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Uso Aceitável</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Você concorda em NÃO usar o Connect IA para:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Enviar spam ou mensagens não solicitadas em massa</li>
              <li>Violar direitos de propriedade intelectual de terceiros</li>
              <li>Transmitir conteúdo ilegal, ofensivo, ameaçador ou fraudulento</li>
              <li>Interferir ou interromper a operação da plataforma</li>
              <li>Coletar dados de outros usuários sem consentimento</li>
              <li>Violar leis aplicáveis ou regulamentos</li>
              <li>Usar para fins que violem as políticas das plataformas Meta</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Integrações com Terceiros</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">5.1 WhatsApp Business API</h3>
                <p className="text-muted-foreground">
                  Ao conectar sua conta WhatsApp Business, você concorda em cumprir os
                  <a href="https://www.whatsapp.com/legal/business-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline mx-1">
                    Termos de Serviço do WhatsApp Business
                  </a>
                  e as políticas da Meta.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">5.2 Instagram e Messenger</h3>
                <p className="text-muted-foreground">
                  O uso de Instagram e Messenger está sujeito aos
                  <a href="https://www.facebook.com/terms.php" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline mx-1">
                    Termos de Serviço do Meta
                  </a>
                  e suas políticas de plataforma.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">5.3 Responsabilidade</h3>
                <p className="text-muted-foreground">
                  Não somos responsáveis por interrupções, mudanças ou descontinuação
                  de serviços de terceiros. Você é responsável por manter tokens de
                  acesso e credenciais válidas.
                </p>
              </div>
            </div>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Propriedade Intelectual</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Todo o conteúdo, recursos, código-fonte, design e funcionalidades do Connect IA
              são de propriedade da Agência Pixel e protegidos por leis de propriedade intelectual.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Você mantém a propriedade de todos os dados e conteúdos que enviar através da plataforma.
              Ao usar nossos serviços, você nos concede uma licença para processar e exibir esse
              conteúdo conforme necessário para fornecer os serviços.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Privacidade e Dados</h2>
            <p className="text-muted-foreground leading-relaxed">
              O tratamento de dados pessoais está descrito em nossa
              <a href="/politica-privacidade" className="text-primary hover:underline mx-1">
                Política de Privacidade
              </a>
              e segue as diretrizes da Lei Geral de Proteção de Dados (LGPD).
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Limitações de Responsabilidade</h2>
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                O Connect IA é fornecido "como está" e "conforme disponível". Não garantimos que:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>O serviço estará disponível ininterruptamente ou livre de erros</li>
                <li>Defeitos serão corrigidos imediatamente</li>
                <li>O serviço atenderá suas expectativas específicas</li>
                <li>Resultados específicos serão alcançados</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Em nenhuma circunstância seremos responsáveis por danos indiretos,
                incidentais, especiais ou consequenciais resultantes do uso ou
                incapacidade de usar nossos serviços.
              </p>
            </div>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Cancelamento e Suspensão</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">9.1 Cancelamento pelo Usuário</h3>
                <p className="text-muted-foreground">
                  Você pode cancelar sua conta a qualquer momento através das configurações
                  ou entrando em contato conosco. O cancelamento entrará em vigor ao final
                  do período de cobrança atual.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">9.2 Suspensão por Violação</h3>
                <p className="text-muted-foreground">
                  Reservamos o direito de suspender ou encerrar sua conta se você violar
                  estes termos, sem aviso prévio e sem reembolso.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">9.3 Efeitos do Cancelamento</h3>
                <p className="text-muted-foreground">
                  Após o cancelamento, seus dados serão mantidos por 30 dias para possível
                  recuperação. Depois desse período, todos os dados serão permanentemente excluídos,
                  conforme nossa
                  <a href="/exclusao-dados" className="text-primary hover:underline mx-1">
                    Política de Exclusão de Dados
                  </a>.
                </p>
              </div>
            </div>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Modificações dos Termos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Podemos modificar estes termos a qualquer momento. Notificaremos sobre mudanças
              significativas por e-mail ou através da plataforma. O uso continuado após as
              alterações constitui aceitação dos novos termos.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Lei Aplicável e Jurisdição</h2>
            <p className="text-muted-foreground leading-relaxed">
              Estes termos são regidos pelas leis do Brasil. Quaisquer disputas serão resolvidas
              nos tribunais do Brasil, renunciando a qualquer outro foro, por mais privilegiado
              que seja.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Contato</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Para questões sobre estes Termos de Serviço:
            </p>
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-medium">Connect IA - Agência Pixel</p>
              <p>E-mail: ricardo@agenciapixel.digital</p>
              <p>Suporte: ricardo@agenciapixel.digital</p>
            </div>
          </section>

        </CardContent>
      </Card>
    </div>
  );
}
