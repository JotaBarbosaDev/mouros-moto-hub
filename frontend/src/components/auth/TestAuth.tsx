import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

export default function TestAuth() {
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testApiAuth = async () => {
    try {
      setIsLoading(true);
      setResult('Testando autenticação...');
      
      // 1. Obter token do Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setResult('Erro: Usuário não está autenticado no Supabase');
        return;
      }
      
      const token = session.access_token;
      setResult(prev => prev + '\nToken obtido com sucesso.');
      
      // 2. Chamar API com o token
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${baseUrl}/members`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      setResult(prev => prev + `\n✅ Autenticação bem-sucedida!\nRecebidos ${data.length} membros.`);
    } catch (error) {
      console.error('Erro no teste de autenticação:', error);
      setResult(prev => prev + `\n❌ Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg mt-4">
      <h3 className="text-lg font-medium mb-4">Teste de Autenticação</h3>
      <Button 
        onClick={testApiAuth}
        disabled={isLoading}
        className="mb-4"
      >
        {isLoading ? 'Testando...' : 'Testar Autenticação'}
      </Button>
      
      {result && (
        <pre className="bg-muted p-3 rounded text-sm whitespace-pre-wrap">
          {result}
        </pre>
      )}
    </div>
  );
}
