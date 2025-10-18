import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().email("Email inválido").max(255),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres").max(100),
  fullName: z.string().min(2, "Nome deve ter no mínimo 2 caracteres").max(100).optional(),
});

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Carregar preferências salvas ao inicializar
  useEffect(() => {
    const savedRememberMe = localStorage.getItem('rememberMe');
    const savedEmail = localStorage.getItem('userEmail');
    
    if (savedRememberMe === 'true' && savedEmail) {
      setRememberMe(true);
      setEmail(savedEmail);
    }
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validated = authSchema.parse({ email, password, fullName });
      console.log('🔍 Tentando cadastrar usuário:', validated.email);
      console.log('📋 Dados validados:', { email: validated.email, fullName: validated.fullName });
      
      console.log('🚀 Iniciando chamada supabase.auth.signUp...');
      
      // Adicionar timeout para evitar travamento
      const signUpPromise = supabase.auth.signUp({
        email: validated.email,
        password: validated.password,
        options: {
          data: {
            full_name: validated.fullName,
          },
        },
      });
      
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout: Chamada demorou mais de 60 segundos')), 60000)
          );
      
      const { data, error } = await Promise.race([signUpPromise, timeoutPromise]);
      console.log('✅ Chamada supabase.auth.signUp concluída');

      console.log('📊 Resposta do Supabase:', { data, error });

      if (error) {
        console.error('❌ Erro no cadastro:', error);
        toast({
          title: "Erro no cadastro",
          description: `Erro: ${error.message}`,
          variant: "destructive",
        });
      } else {
        console.log('✅ Cadastro realizado com sucesso!');
        toast({
          title: "Cadastro realizado!",
          description: "Usuário criado com sucesso. Redirecionando...",
        });
        
        // Redirecionar para o dashboard após cadastro bem-sucedido
        setTimeout(() => {
          navigate("/");
        }, 1500);
      }
    } catch (error) {
      console.error('❌ Erro no processo de cadastro:', error);
      
      if (error instanceof z.ZodError) {
        toast({
          title: "Dados inválidos",
          description: error.errors[0].message,
          variant: "destructive",
        });
        } else if (error instanceof Error && error.message.includes('Timeout')) {
          // Verificar se o usuário foi criado mesmo com timeout
          console.log('⏱️ Timeout detectado, verificando se usuário foi criado...');
          
          try {
            const { data: checkData, error: checkError } = await supabase.auth.signInWithPassword({
              email: validated.email,
              password: validated.password,
            });
            
            if (checkData.user && !checkError) {
              console.log('✅ Usuário foi criado com sucesso (verificado via login)');
              toast({
                title: "Cadastro realizado!",
                description: "Usuário criado com sucesso. Redirecionando...",
              });
              setTimeout(() => {
                navigate("/");
              }, 1500);
              return;
            }
          } catch (checkErr) {
            console.log('❌ Usuário não foi criado:', checkErr);
          }
          
          toast({
            title: "Timeout",
            description: "A operação demorou muito para responder. Tente novamente.",
            variant: "destructive",
          });
        } else {
        toast({
          title: "Erro inesperado",
          description: error instanceof Error ? error.message : "Erro desconhecido",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validated = authSchema.parse({ email, password });

      const { error } = await supabase.auth.signInWithPassword({
        email: validated.email,
        password: validated.password,
      });

      if (error) {
        toast({
          title: "Erro no login",
          description: error.message,
          variant: "destructive",
        });
      } else {
        // Salvar preferência de "permanecer logado"
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
          localStorage.setItem('userEmail', validated.email);
        } else {
          localStorage.removeItem('rememberMe');
          localStorage.removeItem('userEmail');
        }

        toast({
          title: "Login realizado!",
          description: rememberMe ? "Você permanecerá logado neste dispositivo." : "Login realizado com sucesso.",
        });

        navigate("/");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Dados inválidos",
          description: error.errors[0].message,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="text-2xl">Omnichat IA</CardTitle>
          <CardDescription>
            Entre ou crie sua conta para continuar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Cadastrar</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Senha</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember-me"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label htmlFor="remember-me" className="text-sm font-normal">
                    Permanecer logado
                  </Label>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Nome completo</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Seu nome"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Senha</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Cadastrando..." : "Cadastrar"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 pt-4 border-t text-center">
            <p className="text-sm text-muted-foreground">
              Ao continuar, você concorda com nossa{" "}
              <a 
                href="/privacy-policy" 
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Política de Privacidade
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
