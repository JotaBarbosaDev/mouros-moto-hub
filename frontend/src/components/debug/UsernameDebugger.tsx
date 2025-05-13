import { useState, useEffect } from 'react';
import { Button } from "../ui/button";
import { userAuthService } from '@/services/user-auth-service';
import { adminUserService } from '@/services/admin-user-service';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { supabase } from '@/integrations/supabase/client';
import { Input } from '../ui/input';
import { toast } from '@/hooks/use-toast';

interface UsernameDebuggerProps {
  userId: string;
  originalUsername: string;
}

// Definindo interfaces para tipar corretamente os estados
interface UserDetailsType {
  user?: {
    id: string;
    email?: string;
    user_metadata?: Record<string, unknown>;
  };
}

interface MetadataInfoType {
  username?: string;
  name?: string;
  [key: string]: unknown;
}

interface ViewResultType {
  metadata?: {
    username?: string;
    [key: string]: unknown;
  };
}

export function UsernameDebugger({ userId, originalUsername }: UsernameDebuggerProps) {
  const [userDetails, setUserDetails] = useState<UserDetailsType | null>(null);
  const [metadataInfo, setMetadataInfo] = useState<MetadataInfoType | null>(null);
  const [dbUsername, setDbUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [viewResult, setViewResult] = useState<ViewResultType | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [fixUsername, setFixUsername] = useState<string>("");
  const [isFixing, setIsFixing] = useState<boolean>(false);

  const checkUsername = async () => {
    setLoading(true);
    try {
      // 1. Buscar usuário pela API Edge
      const userResponse = await userAuthService.getUserById(userId);
      setUserDetails(userResponse.data);
      
      if (userResponse.data?.user?.user_metadata) {
        setMetadataInfo(userResponse.data.user.user_metadata);
        // Inicializa o campo de correção com o valor original
        setFixUsername(originalUsername || userResponse.data.user.user_metadata.username || '');
      }

      // 2. Buscar metadados diretamente via função Edge (userAuthService já tem esse método)
      // Isso evita problemas com permissões e tipagem
      try {
        // Usando o mesmo serviço que já buscou o usuário acima
        // Não precisamos fazer outra chamada, já temos os dados em userResponse
        if (userResponse.data?.user?.user_metadata) {
          setViewResult({ 
            metadata: userResponse.data.user.user_metadata
          });
        } else {
          console.log('Nenhum metadado encontrado para visualização');
          setViewResult(null);
        }
      } catch (viewError) {
        console.error('Exceção ao preparar visualização de metadados:', viewError);
      }

      // 3. Buscar o username pela função RPC
      const { data: rpcData } = await adminUserService.findUserByUsername(originalUsername);
      if (rpcData) {
        setDbUsername(rpcData.username);
      }
    } catch (error) {
      console.error('Erro ao buscar informações para debug:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Função para verificar detalhes do username atual
  const handleVerifyUsername = async () => {
    setIsFixing(true);
    try {
      // Verifica informações do username atual
      const { data, error } = await userAuthService.verifyUsername(userId);
      
      if (error) {
        console.error("Erro na verificação:", error);
        toast({
          title: "Aviso",
          description: `Não foi possível verificar o username: ${error.message}`,
          variant: "destructive"
        });
      } else if (data) {
        // Exibe informações detalhadas sobre o username
        toast({
          title: "Informações do Username",
          description: `Username: ${data.username}
                       Caracteres especiais: ${data.hasSpecialChars ? 'Sim' : 'Não'}
                       Maiúsculas: ${data.hasUppercase ? 'Sim' : 'Não'}
                       Números: ${data.hasNumbers ? 'Sim' : 'Não'}`,
          variant: "default"
        });
      }
    } catch (err) {
      console.error('Erro ao verificar username:', err);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao tentar verificar o username",
        variant: "destructive"
      });
    } finally {
      setIsFixing(false);
    }
  };

  // Função para corrigir o username usando a nova função
  const handleFixUsername = async () => {
    if (!fixUsername || fixUsername.trim() === '') {
      toast({
        title: "Erro",
        description: "Por favor, informe um username válido para correção",
        variant: "destructive"
      });
      return;
    }
    
    setIsFixing(true);
    try {
      const { error } = await userAuthService.fixUsername(userId, fixUsername.trim());
      
      if (error) {
        toast({
          title: "Erro",
          description: `Falha ao corrigir o username: ${error.message}`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Sucesso",
          description: "Username corrigido com sucesso!",
        });
        
        // Atualiza os dados após a correção
        await checkUsername();
      }
    } catch (err) {
      console.error('Erro ao corrigir username:', err);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao tentar corrigir o username",
        variant: "destructive"
      });
    } finally {
      setIsFixing(false);
    }
  };

  useEffect(() => {
    if (isVisible) {
      checkUsername();
    }
  }, [isVisible, userId, originalUsername, checkUsername]);

  if (!isVisible) {
    return (
      <div className="mt-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsVisible(true)}
          className="text-xs"
        >
          Debug Username
        </Button>
      </div>
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex justify-between">
          <span>Username Debug</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsVisible(false)}
            className="text-xs h-6"
          >
            Fechar
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-xs space-y-2">
        <div><strong>User ID:</strong> {userId}</div>
        <div><strong>Original Username:</strong> {originalUsername}</div>
        <div><strong>Metadata Username:</strong> {metadataInfo?.username || 'Não encontrado'}</div>
        <div><strong>RPC Result:</strong> {dbUsername || 'Não encontrado'}</div>
        
        {viewResult && (
          <div><strong>View Result:</strong> {viewResult.metadata?.username || 'Não encontrado nos metadados'}</div>
        )}
        
        <div className="mt-4">
          <div className="font-semibold mb-1">Corrigir Username</div>
          
          <div className="flex space-x-2 mb-2">
            <Button 
              onClick={handleVerifyUsername} 
              variant="outline" 
              size="sm" 
              disabled={isFixing || loading}
              className="text-xs whitespace-nowrap"
            >
              {isFixing ? 'Analisando...' : 'Verificar Detalhes do Username'}
            </Button>
          </div>
          
          <div className="flex space-x-2">
            <Input
              className="h-7 text-xs"
              placeholder="Username correto"
              value={fixUsername}
              onChange={(e) => setFixUsername(e.target.value)}
              disabled={isFixing}
            />
            <Button 
              onClick={handleFixUsername} 
              variant="destructive" 
              size="sm" 
              disabled={isFixing || loading}
              className="text-xs whitespace-nowrap"
            >
              {isFixing ? 'Corrigindo...' : 'Aplicar Correção'}
            </Button>
          </div>
          <div className="text-[10px] text-gray-500 mt-1">
            Esta operação irá modificar diretamente os metadados do usuário
          </div>
        </div>
        
        <div className="pt-2">
          <Button 
            onClick={checkUsername} 
            variant="secondary" 
            size="sm" 
            disabled={loading}
            className="text-xs"
          >
            {loading ? 'Verificando...' : 'Verificar Novamente'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
