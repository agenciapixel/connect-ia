import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Trash2, Mail, AlertTriangle, CheckCircle } from "lucide-react";

export default function DataDeletion() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold flex items-center gap-2">
            <Trash2 className="h-8 w-8 text-red-600" />
            Exclusão de Dados
          </CardTitle>
          <CardDescription>
            Como solicitar a exclusão completa de seus dados do Connect IA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">

          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Seus Direitos sob a LGPD</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem o direito de
              solicitar a exclusão de todos os seus dados pessoais de nossos sistemas a qualquer
              momento.
            </p>
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Importante:</strong> A exclusão de dados é permanente e irreversível.
                Certifique-se de fazer backup de qualquer informação importante antes de solicitar.
              </p>
            </div>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Como Solicitar a Exclusão</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Passo 1: Entre em Contato
                </h3>
                <p className="text-muted-foreground mb-3">
                  Envie um e-mail para nosso Encarregado de Dados (DPO):
                </p>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="font-mono">Para: ricardo@agenciapixel.digital</p>
                  <p className="font-mono">Assunto: Solicitação de Exclusão de Dados - Connect IA</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Passo 2: Informações Necessárias
                </h3>
                <p className="text-muted-foreground mb-3">
                  Inclua as seguintes informações no e-mail:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>E-mail cadastrado na plataforma</li>
                  <li>Nome completo</li>
                  <li>Nome da empresa/organização (se aplicável)</li>
                  <li>Confirmação de que deseja excluir TODOS os dados</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Passo 3: Aguarde Confirmação</h3>
                <p className="text-muted-foreground">
                  Nossa equipe responderá sua solicitação em até <strong>48 horas úteis</strong> para
                  confirmar o recebimento e validar sua identidade.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Passo 4: Processamento</h3>
                <p className="text-muted-foreground">
                  Após a confirmação, seus dados serão permanentemente excluídos em até
                  <strong> 30 dias corridos</strong>. Você receberá um e-mail de confirmação
                  quando o processo for concluído.
                </p>
              </div>
            </div>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. O Que Será Excluído</h2>
            <p className="text-muted-foreground mb-4">
              Os seguintes dados serão permanentemente removidos:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-red-900 dark:text-red-100">Dados da Conta</h4>
                <ul className="text-sm text-red-800 dark:text-red-200 space-y-1">
                  <li>• Nome e e-mail</li>
                  <li>• Credenciais de acesso</li>
                  <li>• Informações de perfil</li>
                  <li>• Configurações pessoais</li>
                </ul>
              </div>

              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-red-900 dark:text-red-100">Dados de CRM</h4>
                <ul className="text-sm text-red-800 dark:text-red-200 space-y-1">
                  <li>• Todos os contatos cadastrados</li>
                  <li>• Histórico de conversas</li>
                  <li>• Mensagens enviadas e recebidas</li>
                  <li>• Campanhas criadas</li>
                </ul>
              </div>

              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-red-900 dark:text-red-100">Dados de Vendas</h4>
                <ul className="text-sm text-red-800 dark:text-red-200 space-y-1">
                  <li>• Pipeline de vendas</li>
                  <li>• Prospects e leads</li>
                  <li>• Métricas e relatórios</li>
                  <li>• Histórico de atividades</li>
                </ul>
              </div>

              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <h4 className="font-semibold mb-2 text-red-900 dark:text-red-100">Integrações</h4>
                <ul className="text-sm text-red-800 dark:text-red-200 space-y-1">
                  <li>• Tokens de acesso</li>
                  <li>• Configurações de canais</li>
                  <li>• Conexões WhatsApp/Instagram</li>
                  <li>• Webhooks configurados</li>
                </ul>
              </div>
            </div>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Dados que Podem Ser Mantidos</h2>
            <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-1" />
                <div>
                  <h4 className="font-semibold mb-2 text-yellow-900 dark:text-yellow-100">
                    Retenção Legal Obrigatória
                  </h4>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                    Por obrigações legais, fiscais e regulatórias, podemos ser obrigados a
                    manter algumas informações por períodos específicos:
                  </p>
                  <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
                    <li>• <strong>Logs de auditoria:</strong> até 5 anos (segurança e compliance)</li>
                    <li>• <strong>Dados fiscais:</strong> conforme legislação tributária brasileira</li>
                    <li>• <strong>Registros de transações:</strong> conforme Código Civil</li>
                    <li>• <strong>Informações para processos legais:</strong> até resolução do processo</li>
                  </ul>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-3">
                    Estes dados são armazenados de forma segura e acessados apenas quando
                    estritamente necessário para cumprir obrigações legais.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Dados em Plataformas Terceiras</h2>
            <p className="text-muted-foreground mb-4">
              Importante: A exclusão de dados do Connect IA NÃO afeta automaticamente:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>
                <strong>Mensagens no WhatsApp:</strong> Mensagens enviadas permanecem nos servidores
                do WhatsApp conforme suas políticas
              </li>
              <li>
                <strong>Conversas no Instagram/Messenger:</strong> Histórico mantido pela Meta
                conforme seus termos
              </li>
              <li>
                <strong>Dados de terceiros:</strong> Informações em sistemas de parceiros devem ser
                solicitadas diretamente a eles
              </li>
            </ul>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Alternativas à Exclusão Total</h2>
            <p className="text-muted-foreground mb-4">
              Antes de solicitar a exclusão completa, considere estas alternativas:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Desativar Conta</h4>
                <p className="text-sm text-muted-foreground">
                  Mantenha seus dados mas desative temporariamente o acesso. Você pode reativar
                  quando quiser.
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Exportar Dados</h4>
                <p className="text-sm text-muted-foreground">
                  Solicite uma cópia de todos os seus dados antes da exclusão. Enviamos em formato
                  JSON ou CSV.
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Excluir Dados Específicos</h4>
                <p className="text-sm text-muted-foreground">
                  Exclua apenas contatos, campanhas ou conversas específicas, mantendo a conta ativa.
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Cancelar Assinatura</h4>
                <p className="text-sm text-muted-foreground">
                  Cancele o plano pago mas mantenha acesso gratuito limitado aos seus dados.
                </p>
              </div>
            </div>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Prazo de Processamento</h2>
            <div className="bg-muted p-6 rounded-lg">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                    48h
                  </div>
                  <div>
                    <p className="font-semibold">Resposta Inicial</p>
                    <p className="text-sm text-muted-foreground">
                      Confirmação do recebimento e validação de identidade
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                    30d
                  </div>
                  <div>
                    <p className="font-semibold">Exclusão Completa</p>
                    <p className="text-sm text-muted-foreground">
                      Remoção permanente de todos os dados elegíveis
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Contato</h2>
            <p className="text-muted-foreground mb-4">
              Para solicitar a exclusão de dados ou esclarecer dúvidas:
            </p>
            <div className="bg-primary/10 p-6 rounded-lg">
              <div className="space-y-2">
                <p className="font-semibold text-lg">Encarregado de Dados (DPO)</p>
                <p><strong>Nome:</strong> Ricardo da Silva</p>
                <p><strong>E-mail:</strong> <a href="mailto:ricardo@agenciapixel.digital" className="text-primary hover:underline">ricardo@agenciapixel.digital</a></p>
                <p><strong>Empresa:</strong> Connect IA - Agência Pixel</p>
              </div>

              <Button className="mt-4" asChild>
                <a href="mailto:ricardo@agenciapixel.digital?subject=Solicitação de Exclusão de Dados - Connect IA">
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar Solicitação por E-mail
                </a>
              </Button>
            </div>
          </section>

        </CardContent>
      </Card>
    </div>
  );
}
