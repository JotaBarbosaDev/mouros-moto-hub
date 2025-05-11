import { useEffect, useState } from 'react';
import { MembersLayout } from '@/components/layouts/MembersLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, ExternalLink } from "lucide-react";

export function ApiDocs() {
  const { toast } = useToast();
  const [isServerRunning, setIsServerRunning] = useState<boolean>(false);
  const swaggerUrl = 'http://localhost:3000/api-docs';

  useEffect(() => {
    // Verificar se o servidor Swagger está rodando
    const checkServer = async () => {
      try {
        const response = await fetch(swaggerUrl, { method: 'HEAD' });
        setIsServerRunning(response.ok);
      } catch (error) {
        setIsServerRunning(false);
      }
    };

    checkServer();
    const interval = setInterval(checkServer, 5000); // Verificar a cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  const handleStartServer = () => {
    toast({
      title: "Iniciando servidor",
      description: "O servidor Swagger está sendo iniciado em segundo plano...",
    });

    // Em um ambiente de produção real, isso seria feito via API
    fetch('/api/start-swagger-server', { method: 'POST' })
      .then(response => {
        if (response.ok) {
          toast({
            title: "Servidor iniciado",
            description: "O servidor Swagger foi iniciado com sucesso!",
          });
          setIsServerRunning(true);
        } else {
          throw new Error('Falha ao iniciar o servidor');
        }
      })
      .catch(() => {
        toast({
          title: "Erro",
          description: "Não foi possível iniciar o servidor Swagger. Por favor, execute manualmente o comando 'npm run swagger'.",
          variant: "destructive"
        });
      });
  };

  return (
    <MembersLayout>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Documentação da API</h2>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Documentação Swagger</CardTitle>
            <CardDescription>
              Visualize e teste os endpoints da API do Mouros Moto Hub
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isServerRunning ? (
              <div className="space-y-4">
                <Alert>
                  <AlertTitle>Servidor Swagger ativo</AlertTitle>
                  <AlertDescription>
                    O servidor de documentação está rodando em <a 
                      href={swaggerUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="font-medium text-primary underline hover:text-primary/80"
                    >
                      http://localhost:3000/api-docs
                    </a>
                  </AlertDescription>
                </Alert>
                
                <div className="aspect-video w-full border rounded-md overflow-hidden">
                  <iframe 
                    src={swaggerUrl}
                    className="w-full h-full"
                    title="Swagger UI"
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => window.open(swaggerUrl, '_blank')}>
                    Abrir em nova aba <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-8">
                <Alert variant="destructive">
                  <AlertTitle>Servidor Swagger inativo</AlertTitle>
                  <AlertDescription>
                    O servidor de documentação não está sendo executado. Clique no botão abaixo para iniciá-lo, ou execute manualmente o comando <code className="bg-muted px-1 py-0.5 rounded">npm run swagger</code> no terminal.
                  </AlertDescription>
                </Alert>
                
                <div className="flex justify-center">
                  <Button onClick={handleStartServer} className="mx-auto">
                    Iniciar Servidor Swagger
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Utilização da API</CardTitle>
            <CardDescription>
              Como utilizar a API do Mouros Moto Hub nos seus projetos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none dark:prose-invert">
              <h3>Autenticação</h3>
              <p>
                Todos os endpoints requerem autenticação através de um token JWT, que pode ser obtido pelo endpoint <code>/auth/v1/token</code>.
              </p>
              
              <h3>Base URLs</h3>
              <ul>
                <li><strong>Produção:</strong> <code>https://jugfkacnlgdjdosstiks.supabase.co</code></li>
                <li><strong>Desenvolvimento:</strong> <code>http://localhost:8000</code></li>
              </ul>
              
              <h3>Exemplos de Uso</h3>
              <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                {`// Exemplo de requisição para listar membros
const response = await fetch('https://jugfkacnlgdjdosstiks.supabase.co/rest/v1/members', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer seu_token_aqui',
    'apikey': 'sua_chave_api_aqui',
    'Content-Type': 'application/json'
  }
});

const members = await response.json();`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </MembersLayout>
  );
}

export default ApiDocs;
