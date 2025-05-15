import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MembersLayout } from '@/components/layouts/MembersLayout';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

/**
 * Página de inicialização e configuração do sistema de logs
 */
const LogsSetupPage = () => {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [hasTable, setHasTable] = useState(null);

  // SQL para criar a tabela de logs de atividade
  const createTableSQL = `
    -- Script para criar tabela de logs de atividade no Supabase
    CREATE TABLE IF NOT EXISTS public.activity_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID,
        username VARCHAR(255),
        action VARCHAR(50) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id UUID,
        details JSONB,
        ip_address VARCHAR(45),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    -- Adicionando comentários na tabela
    COMMENT ON TABLE public.activity_logs IS 'Registros de todas as atividades realizadas pelos usuários no sistema';
    COMMENT ON COLUMN public.activity_logs.user_id IS 'ID do usuário que realizou a ação';
    COMMENT ON COLUMN public.activity_logs.username IS 'Nome do usuário que realizou a ação';
    COMMENT ON COLUMN public.activity_logs.action IS 'Ação realizada (criar, atualizar, excluir, visualizar)';
    COMMENT ON COLUMN public.activity_logs.entity_type IS 'Tipo de entidade afetada (membro, veículo, evento, etc)';
    COMMENT ON COLUMN public.activity_logs.entity_id IS 'ID da entidade afetada';
    COMMENT ON COLUMN public.activity_logs.details IS 'Detalhes da ação em formato JSON';
    COMMENT ON COLUMN public.activity_logs.ip_address IS 'Endereço IP de onde a ação foi realizada';

    -- Garantir que RLS esteja ativado
    ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

    -- Conceder permissões para os perfis do Supabase
    GRANT SELECT, INSERT ON public.activity_logs TO authenticated;
    GRANT SELECT ON public.activity_logs TO anon;

    -- Políticas de segurança para a tabela de logs:
    -- Qualquer usuário autenticado pode inserir logs
    CREATE POLICY IF NOT EXISTS insert_logs_policy ON public.activity_logs FOR INSERT TO authenticated WITH CHECK (true);

    -- Somente administradores podem ver todos os logs
    CREATE POLICY IF NOT EXISTS select_logs_policy ON public.activity_logs FOR SELECT TO authenticated USING (
        auth.uid() IN (
            SELECT id FROM public.members WHERE is_admin = true
        )
    );

    -- Criar índices para melhorar a performance das consultas mais comuns
    CREATE INDEX IF NOT EXISTS activity_logs_user_id_idx ON public.activity_logs(user_id);
    CREATE INDEX IF NOT EXISTS activity_logs_entity_type_idx ON public.activity_logs(entity_type);
    CREATE INDEX IF NOT EXISTS activity_logs_entity_id_idx ON public.activity_logs(entity_id);
    CREATE INDEX IF NOT EXISTS activity_logs_action_idx ON public.activity_logs(action);
    CREATE INDEX IF NOT EXISTS activity_logs_created_at_idx ON public.activity_logs(created_at);
  `;

  // Verificar se a tabela já existe
  const checkTableExists = async () => {
    setIsChecking(true);
    try {
      const { data, error } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'activity_logs');

      if (error) {
        throw error;
      }

      const tableExists = data && data.length > 0;
      setHasTable(tableExists);
      return tableExists;
    } catch (error) {
      console.error("Erro ao verificar tabela:", error);
      toast({
        title: "Erro ao verificar tabela",
        description: `Não foi possível verificar se a tabela já existe: ${error.message}`,
        variant: "destructive"
      });
      return false;
    } finally {
      setIsChecking(false);
    }
  };

  // Executar o SQL para criar a tabela
  const createLogsTable = useMutation({
    mutationFn: async () => {
      setIsCreating(true);
      try {
        // Primeiro verificar se a tabela já existe
        const tableExists = await checkTableExists();
        if (tableExists) {
          toast({
            title: "Tabela já existe",
            description: "A tabela de logs de atividade já está criada no banco de dados.",
            variant: "default"
          });
          return;
        }

        // Executar o SQL
        const { error } = await supabase.rpc('exec_sql', { sql: createTableSQL });
        
        if (error) {
          throw error;
        }

        toast({
          title: "Tabela criada com sucesso!",
          description: "A tabela de logs de atividade foi criada no banco de dados.",
          variant: "default"
        });

        // Verificar novamente para atualizar o estado
        await checkTableExists();
      } catch (error) {
        console.error("Erro ao criar tabela:", error);
        toast({
          title: "Erro ao criar tabela",
          description: `Não foi possível criar a tabela de logs: ${error.message}`,
          variant: "destructive"
        });
      } finally {
        setIsCreating(false);
      }
    }
  });

  // Verificar se a tabela existe ao carregar o componente
  React.useEffect(() => {
    checkTableExists();
  }, []);

  return (
    <MembersLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-display text-mouro-black mb-8">
          <span className="text-mouro-red">Configuração</span> de Logs de Atividade
        </h1>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Configuração do Sistema de Logs</CardTitle>
            <CardDescription>
              Para habilitar o monitoramento de atividades no sistema, é necessário configurar a tabela no banco de dados.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-md">
              <h3 className="text-lg font-semibold mb-2">Status atual:</h3>
              {isChecking ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <p>Verificando configuração...</p>
                </div>
              ) : hasTable === null ? (
                <p>Verificação pendente...</p>
              ) : hasTable ? (
                <p className="text-green-600 font-medium">
                  ✓ A tabela de logs já está configurada e pronta para uso.
                </p>
              ) : (
                <p className="text-amber-600 font-medium">
                  ⚠️ A tabela de logs ainda não está configurada.
                </p>
              )}
            </div>

            <div className="p-4 border rounded-md">
              <h3 className="text-lg font-semibold mb-2">Ações disponíveis:</h3>
              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={() => checkTableExists()} 
                  variant="outline" 
                  disabled={isChecking}
                >
                  {isChecking ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                      Verificando...
                    </>
                  ) : (
                    "Verificar configuração"
                  )}
                </Button>

                <Button 
                  onClick={() => createLogsTable.mutate()} 
                  disabled={isCreating || isChecking || hasTable === true}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                      Criando tabela...
                    </>
                  ) : (
                    "Criar tabela de logs"
                  )}
                </Button>
              </div>
            </div>

            <div className="p-4 border rounded-md">
              <h3 className="text-lg font-semibold mb-2">SQL que será executado:</h3>
              <pre className="p-4 bg-gray-100 rounded-md text-xs overflow-auto max-h-[300px]">
                {createTableSQL}
              </pre>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Instruções</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Como usar:</h3>
              <ol className="list-decimal ml-6 mt-2 space-y-2">
                <li>Clique em "Verificar configuração" para checar se a tabela já existe</li>
                <li>Se a tabela não existir, clique em "Criar tabela de logs"</li>
                <li>Após a criação, o sistema de logs estará ativo automaticamente</li>
                <li>Acesse a página de <a href="/historico" className="text-blue-600 hover:underline">Histórico</a> para visualizar os logs</li>
              </ol>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold">Observações:</h3>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>A criação da tabela requer privilégios administrativos no banco de dados</li>
                <li>Os logs são armazenados automaticamente para todas as operações do sistema</li>
                <li>Apenas usuários administradores podem visualizar todos os logs</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </MembersLayout>
  );
};

export default LogsSetupPage;
