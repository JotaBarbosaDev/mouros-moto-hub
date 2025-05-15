/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Este componente é responsável por verificar se as tabelas do sistema
 * já foram criadas e, caso contrário, inicializá-las com valores padrão.
 */
export function SystemInitializer() {
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function setupSystem() {
      try {
        console.log("Verificando tabelas do sistema...");
        
        // Primeiro, verificar se a função exec_sql existe no banco de dados
        try {
          const { error: execSqlError } = await supabase.rpc('exec_sql', {
            sql: "SELECT 1 as teste"
          });
          
          if (execSqlError) {
            console.error("Erro na função exec_sql:", execSqlError);
            setError(`Erro ao verificar tabelas: ${execSqlError.message}

A função exec_sql não foi encontrada no banco de dados do Supabase.
Para resolver este problema:

1. Execute o script create-exec-sql.sh na pasta raiz do frontend, ou 
2. Acesse o painel do Supabase > SQL Editor e execute o seguinte SQL:

CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
RETURNS SETOF json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY EXECUTE sql;
END;
$$;

GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO anon, authenticated;
`);
            setIsChecking(false);
            return;
          }
        } catch (error) {
          console.error("Erro ao verificar função exec_sql:", error);
          setError(`Erro ao verificar tabelas: Could not find the function public.exec_sql(sql) in the schema cache

Execute o script create-exec-sql.sh na pasta raiz do frontend para resolver este problema.`);
          setIsChecking(false);
          return;
        }
        
        // Primeiro verificar se a função exec_sql existe
        try {
          const { error } = await supabase.rpc('exec_sql', {
            sql: "SELECT 1"
          });
          
          if (error) {
            setError(`A função exec_sql não foi encontrada no banco de dados. ${error.message}. 
              Por favor, execute o script create-exec-sql.sh para criar esta função.`);
            setIsChecking(false);
            return;
          }
        } catch (execSqlError) {
          console.error("Erro ao verificar função exec_sql:", execSqlError);
          setError(`A função exec_sql não foi encontrada no banco de dados. 
            Por favor, execute o script create-exec-sql.sh para criar esta função.`);
          setIsChecking(false);
          return;
        }
        
        // Primeiro, verificamos se a função uuid_generate_v4 existe no banco de dados
        const checkUuidFunction = `
          SELECT EXISTS (
            SELECT FROM pg_proc 
            WHERE proname = 'uuid_generate_v4'
          ) as has_uuid_function
        `;
        
        console.log("Verificando existência da função uuid_generate_v4...");
        const { data: uuidFuncCheck, error: uuidFuncError } = await supabase.rpc('exec_sql', {
          sql: checkUuidFunction
        });
        
        if (uuidFuncError) {
          console.warn('Não foi possível verificar função uuid_generate_v4:', uuidFuncError);
          // Continuamos mesmo com erro, e tentaremos criar a função se necessário
        }
        
        // Se a função não existir, tentamos criá-la
        if (!uuidFuncCheck || (uuidFuncCheck.length > 0 && !uuidFuncCheck[0]?.has_uuid_function)) {
          console.log("Função uuid_generate_v4 não encontrada. Tentando criar extensão uuid-ossp...");
          await supabase.rpc('exec_sql', {
            sql: "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"
          });
        }
        
        // Verificar se as tabelas existem através de uma consulta SQL direta
        const checkTablesSQL = `
          SELECT 
            EXISTS (
              SELECT FROM information_schema.tables 
              WHERE table_schema = 'public'
              AND table_name = 'club_settings'
            ) as club_settings_exists,
            EXISTS (
              SELECT FROM information_schema.tables 
              WHERE table_schema = 'public'
              AND table_name = 'settings'
            ) as settings_exists,
            EXISTS (
              SELECT FROM information_schema.tables 
              WHERE table_schema = 'public'
              AND table_name = 'member_fee_settings'
            ) as member_fee_settings_exists,
            EXISTS (
              SELECT FROM information_schema.tables 
              WHERE table_schema = 'public'
              AND table_name = 'fee_payments'
            ) as fee_payments_exists
        `;

        console.log("Executando verificação de tabelas...");
        const { data: tablesCheck, error: tablesCheckError } = await supabase.rpc('exec_sql', {
          sql: checkTablesSQL
        });

        console.log("Resultado da verificação de tabelas:", tablesCheck);
        
        if (tablesCheckError) {
          console.error('Erro ao verificar tabelas:', tablesCheckError);
          setError(`Erro ao verificar tabelas: ${tablesCheckError.message}`);
          return;
        }
        
        // Verifica se todas as tabelas existem
        const allTablesExist = tablesCheck && 
                            Array.isArray(tablesCheck) &&
                            tablesCheck.length > 0 &&
                            tablesCheck[0].club_settings_exists &&
                            tablesCheck[0].settings_exists &&
                            tablesCheck[0].member_fee_settings_exists &&
                            tablesCheck[0].fee_payments_exists;
                            
        if (!allTablesExist) {
          console.log("Algumas tabelas não existem. Criando tabelas...");
          await createTables();
          
          // Após criar as tabelas, verificamos se há dados
          const { data: countResult, error: countError } = await supabase.rpc('exec_sql', {
            sql: "SELECT COUNT(*) as count FROM public.club_settings"
          });
          
          if (countError) {
            console.error('Erro ao verificar dados após criar tabelas:', countError);
            setError(`Erro ao verificar dados: ${countError.message}`);
            return;
          }
          
          const isEmpty = !countResult || countResult.length === 0 || parseInt(countResult[0].count) === 0;
          
          if (isEmpty) {
            console.log("Tabelas vazias. Inicializando configurações...");
            await initializeSettings();
          }
          
          setIsInitialized(true);
          return;
        }
        
        // Se todas as tabelas existem, verificamos se há dados
        console.log("Todas as tabelas existem. Verificando dados...");
        const { data: countResult, error: countError } = await supabase.rpc('exec_sql', {
          sql: "SELECT COUNT(*) as count FROM public.club_settings"
        });
        
        if (countError) {
          console.error('Erro ao verificar dados:', countError);
          setError(`Erro ao verificar dados: ${countError.message}`);
          return;
        }
        
        const isEmpty = !countResult || 
                       !Array.isArray(countResult) || 
                       countResult.length === 0 || 
                       parseInt(countResult[0].count) === 0;
        
        if (isEmpty) {
          console.log("Tabela club_settings está vazia. Inicializando configurações...");
          await initializeSettings();
        } else {
          console.log("Sistema já inicializado com dados.");
        }
        
        setIsInitialized(true);
      } catch (err: any) {
        console.error('Erro durante inicialização:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setIsChecking(false);
      }
    }
    
    setupSystem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createTables() {
    console.log("Criando tabelas do sistema...");
    
    try {
      // Criar tabela club_settings
      const createClubSettingsSQL = `
        CREATE TABLE IF NOT EXISTS public.club_settings (
          id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(255) NOT NULL,
          short_name VARCHAR(100) NOT NULL,
          founding_date TIMESTAMP WITH TIME ZONE NOT NULL,
          logo_url TEXT,
          banner_url TEXT,
          primary_color VARCHAR(50) NOT NULL,
          secondary_color VARCHAR(50) NOT NULL,
          accent_color VARCHAR(50) NOT NULL,
          text_color VARCHAR(50) NOT NULL,
          annual_fee DECIMAL(10, 2) NOT NULL,
          fee_start_date TIMESTAMP WITH TIME ZONE NOT NULL,
          inactive_periods JSONB DEFAULT '[]'::jsonb,
          address TEXT,
          email TEXT,
          phone TEXT,
          social_media JSONB DEFAULT '{}'::jsonb,
          description TEXT,
          welcome_message TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        )
      `;
      
      console.log("Criando tabela club_settings...");
      const { error: clubSettingsError } = await supabase.rpc('exec_sql', {
        sql: createClubSettingsSQL
      });
      
      if (clubSettingsError) {
        console.error("Erro ao criar tabela club_settings:", clubSettingsError);
        throw new Error(`Erro ao criar tabela club_settings: ${clubSettingsError.message}`);
      }
      
      // Criar tabela settings
      const createSettingsSQL = `
        CREATE TABLE IF NOT EXISTS public.settings (
          id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
          key VARCHAR(100) NOT NULL UNIQUE,
          value JSONB NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        )
      `;
      
      console.log("Criando tabela settings...");
      const { error: settingsError } = await supabase.rpc('exec_sql', {
        sql: createSettingsSQL
      });
      
      if (settingsError) {
        console.error("Erro ao criar tabela settings:", settingsError);
        throw new Error(`Erro ao criar tabela settings: ${settingsError.message}`);
      }
      
      // Criar tabela member_fee_settings
      const createMemberFeeSettingsSQL = `
        CREATE TABLE IF NOT EXISTS public.member_fee_settings (
          id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
          member_id uuid NOT NULL,
          join_date TIMESTAMP WITH TIME ZONE NOT NULL,
          exempt_periods JSONB DEFAULT '[]'::jsonb,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        )
      `;
      
      console.log("Criando tabela member_fee_settings...");
      const { error: memberFeeSettingsError } = await supabase.rpc('exec_sql', {
        sql: createMemberFeeSettingsSQL
      });
      
      if (memberFeeSettingsError) {
        console.error("Erro ao criar tabela member_fee_settings:", memberFeeSettingsError);
        throw new Error(`Erro ao criar tabela member_fee_settings: ${memberFeeSettingsError.message}`);
      }
      
      // Criar tabela fee_payments
      const createFeePaymentsSQL = `
        CREATE TABLE IF NOT EXISTS public.fee_payments (
          id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
          member_id uuid NOT NULL,
          year INT NOT NULL,
          payment_date TIMESTAMP WITH TIME ZONE NOT NULL,
          amount DECIMAL(10, 2) NOT NULL,
          payment_method VARCHAR(50) NOT NULL,
          notes TEXT,
          receipt_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          UNIQUE(member_id, year)
        )
      `;
      
      console.log("Criando tabela fee_payments...");
      const { error: feePaymentsError } = await supabase.rpc('exec_sql', {
        sql: createFeePaymentsSQL
      });
      
      if (feePaymentsError) {
        console.error("Erro ao criar tabela fee_payments:", feePaymentsError);
        throw new Error(`Erro ao criar tabela fee_payments: ${feePaymentsError.message}`);
      }
      
      console.log("Todas as tabelas foram criadas com sucesso!");
    } catch (error) {
      console.error("Erro no processo de criação de tabelas:", error);
      throw error;
    }
  }

  async function initializeSettings() {
    console.log("Inicializando configurações do sistema...");
    
    // Inserir configurações na tabela club_settings
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

    try {
      // Montar colunas dinamicamente com base nas chaves do objeto
      const columns = Object.keys(defaultClubSettings).join(', ');
      
      // Montar valores com tratamento de tipos
      const values = Object.entries(defaultClubSettings).map(([_key, value]) => {
        if (typeof value === 'string') {
          // Escapar aspas simples em strings para SQL
          return `'${value.replace(/'/g, "''")}'`;
        } 
        if (typeof value === 'number') {
          return value;
        }
        if (Array.isArray(value)) {
          // Converter arrays para formato JSONB do PostgreSQL
          return `'${JSON.stringify(value)}'::jsonb`;
        }
        return 'NULL';
      }).join(', ');

      const insertClubSettingsSQL = `
        INSERT INTO public.club_settings (
          ${columns}
        ) VALUES (
          ${values}
        )
      `;

      console.log("Inserindo configurações do clube...");
      
      const { error: clubSettingsError } = await supabase.rpc('exec_sql', {
        sql: insertClubSettingsSQL
      });
      
      if (clubSettingsError) {
        console.error("Erro ao inserir configurações do clube:", clubSettingsError);
        throw clubSettingsError;
      }
      
      // Inserir configurações na tabela settings
      const defaultSettings = [
        {
          key: 'club_info',
          value: {
            name: 'Mouros Moto Hub',
            shortName: 'Mouros MC',
            foundingDate: '2015-01-01',
            logoUrl: '/assets/logo-default.png',
            bannerUrl: '/assets/banner-default.jpg',
            colors: {
              primary: '#e11d48',
              secondary: '#27272a',
              accent: '#f59e0b',
              text: '#27272a'
            },
            contact: {
              address: 'Rua Principal, 123 - Centro, Mouros',
              email: 'info@mourosmotohub.pt',
              phone: '+351 123 456 789'
            },
            description: 'Associação motociclística dedicada à paixão pelas duas rodas e ao companheirismo.',
            welcomeMessage: 'Bem-vindo ao Mouros Moto Hub! Junte-se a nós nesta viagem.'
          }
        },
        {
          key: 'fees',
          value: {
            annualFee: 60.00,
            feeStartDate: '2015-01-01',
            inactivePeriods: []
          }
        },
        {
          key: 'scale',
          value: {
            rolesOrder: ['bartender', 'helper', 'cleaner'],
            defaultShiftHours: {
              start: '18:00',
              end: '23:00'
            }
          }
        },
        {
          key: 'defaults',
          value: {
            allowGuests: true,
            membershipApproval: 'admin',
            autoRemoveInactive: false,
            inactiveMonthsLimit: 6
          }
        }
      ];

      for (const setting of defaultSettings) {
        const jsonValue = JSON.stringify(setting.value).replace(/'/g, "''");
        
        const insertSettingSQL = `
          INSERT INTO public.settings (key, value)
          VALUES ('${setting.key}', '${jsonValue}'::jsonb)
        `;
        
        console.log(`Inserindo configuração ${setting.key}...`);
        
        const { error: settingError } = await supabase.rpc('exec_sql', {
          sql: insertSettingSQL
        });
        
        if (settingError) {
          console.error(`Erro ao inserir configuração ${setting.key}:`, settingError);
          throw settingError;
        }
      }
      
      console.log("Todas as configurações foram inicializadas com sucesso!");
    } catch (err) {
      console.error("Erro ao inicializar configurações:", err);
      throw err;
    }
  }

  // Este componente não renderiza nada visualmente
  if (error) {
    return (
      <div className="text-red-500 p-4 bg-red-50 rounded-md">
        <h3 className="font-bold">Erro de inicialização do sistema</h3>
        <p style={{ whiteSpace: 'pre-line' }}>{error}</p>
        <p>Tente recarregar a página ou contate o administrador do sistema.</p>
      </div>
    );
  }
  
  return null;
}
