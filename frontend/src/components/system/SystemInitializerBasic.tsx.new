/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Este componente é uma versão alternativa do SystemInitializer que não
 * depende da função exec_sql. Ele usa métodos da API Supabase diretamente.
 */
export function SystemInitializerBasic() {
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function setupSystem() {
      try {
        console.log("Verificando tabelas do sistema...");
        
        // Verificar se o cliente do Supabase está funcionando corretamente
        try {
          // Tentar uma operação simples
          await supabase.auth.getSession();
          console.log("Conexão com Supabase estabelecida");
        } catch (err: any) {
          console.error("Erro de conexão com Supabase:", err);
          setError(`Não foi possível conectar ao Supabase. Verifique sua conexão com a internet e as credenciais de acesso.
          
Detalhes do erro: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
          setIsChecking(false);
          return;
        }

        // Verificar uma tabela específica com tratamento de erro adequado
        try {
          const { data, error: queryError } = await supabase
            .from('club_settings')
            .select('id')
            .limit(1);
            
          if (queryError) {
            console.error("Erro ao verificar tabela club_settings:", queryError);
            
            let errorMessage = "As tabelas necessárias não foram encontradas no banco de dados ou não há permissão para acessá-las.";
            
            if (queryError.code === '42P01') {
              errorMessage += "\n\nA tabela 'club_settings' não existe.";
            }
            
            setError(`${errorMessage}
            
Para resolver este problema:

1. Acesse o painel do Supabase do seu projeto
2. Vá para o Editor SQL 
3. Execute o SQL disponível no arquivo:
   /Users/joaobarbosa/Desktop/projetos/mouros-moto-hub/frontend/create-all-tables.sql

Após criar as tabelas, recarregue esta página.

Detalhes do erro: ${queryError.message}`);
            setIsChecking(false);
            return;
          }
          
          // Verificar se retornou algum dado
          if (!data || data.length === 0) {
            console.log("Tabela club_settings está vazia. Inserindo dados iniciais...");
            
            // Dados iniciais para club_settings
            const defaultClubSettings = {
              name: 'Mouros Moto Hub',
              short_name: 'Mouros MC',
              founding_date: '2015-01-01T00:00:00Z',
              logo_url: '/assets/logo-default.png',
              banner_url: '/assets/banner-default.jpg',
              primary_color: '#e11d48',
              secondary_color: '#27272a',
              accent_color: '#f59e0b',
              text_color: '#27272a',
              annual_fee: 60.00,
              fee_start_date: '2015-01-01T00:00:00Z',
              inactive_periods: [],
              address: 'Rua Principal, 123 - Centro, Mouros',
              email: 'info@mourosmotohub.pt',
              phone: '+351 123 456 789',
              description: 'Associação motociclística dedicada à paixão pelas duas rodas e ao companheirismo.',
              welcome_message: 'Bem-vindo ao Mouros Moto Hub! Junte-se a nós nesta viagem.'
            };
            
            const { error: insertError } = await supabase
              .from('club_settings')
              .insert(defaultClubSettings);
              
            if (insertError) {
              console.error("Erro ao inserir dados iniciais:", insertError);
              setError(`Erro ao inserir dados iniciais: ${insertError.message}`);
              setIsChecking(false);
              return;
            }
            
            console.log("Dados iniciais inseridos com sucesso!");
          } else {
            console.log("Tabela club_settings já contém dados");
          }
          
          // Verificar tabelas críticas adicionais individualmente 
          // para evitar problemas de tipagem com o Supabase
          const missingTables = [];
          
          // Verificar settings
          const { error: settingsError } = await supabase
            .from('settings')
            .select('id')
            .limit(1);
            
          if (settingsError && settingsError.code === '42P01') {
            missingTables.push('settings');
          }
          
          // Verificar member_fee_settings
          const { error: memberFeeError } = await supabase
            .from('member_fee_settings')
            .select('id')
            .limit(1);
            
          if (memberFeeError && memberFeeError.code === '42P01') {
            missingTables.push('member_fee_settings');
          }
          
          // Verificar fee_payments
          const { error: feePaymentsError } = await supabase
            .from('fee_payments')
            .select('id')
            .limit(1);
            
          if (feePaymentsError && feePaymentsError.code === '42P01') {
            missingTables.push('fee_payments');
          }
          
          if (missingTables.length > 0) {
            console.warn("Tabelas ausentes:", missingTables.join(", "));
            setError(`Algumas tabelas necessárias não foram encontradas: ${missingTables.join(", ")}
            
Para resolver este problema:

1. Acesse o painel do Supabase do seu projeto
2. Vá para o Editor SQL 
3. Execute o SQL disponível no arquivo:
   /Users/joaobarbosa/Desktop/projetos/mouros-moto-hub/frontend/create-all-tables.sql

Após criar as tabelas, recarregue esta página.`);
            setIsChecking(false);
            return;
          }
          
          setIsInitialized(true);
          console.log("Sistema inicializado com sucesso!");
          
        } catch (err: any) {
          console.error("Erro inesperado ao verificar tabelas:", err);
          setError(`Erro inesperado ao verificar tabelas: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
          setIsChecking(false);
          return;
        }
      } catch (err: any) {
        console.error('Erro durante inicialização:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setIsChecking(false);
      }
    }
    
    setupSystem();
  }, []);

  // Este componente não renderiza nada visualmente se não houver erro
  if (error) {
    return (
      <div className="text-red-500 p-4 bg-red-50 rounded-md max-w-3xl mx-auto my-4 shadow-md">
        <h3 className="font-bold text-lg">Erro de inicialização do sistema</h3>
        <p style={{ whiteSpace: 'pre-line' }} className="my-3">{error}</p>
        <p className="font-semibold">Tente recarregar a página após criar as tabelas ou contate o administrador do sistema.</p>
      </div>
    );
  }
  
  return null;
}
