/* Script de criação de tabelas do sistema
 * Este script cria as tabelas necessárias no Supabase
 */

const { createClient } = require('@supabase/supabase-js');

// Credenciais do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Credenciais do Supabase não estão configuradas. Por favor, verifique as variáveis de ambiente.');
  process.exit(1);
}

// Cria o cliente do Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

async function createTables() {
  console.log('Iniciando criação das tabelas do sistema...');
  
  try {
    // Criar tabela club_settings
    console.log('Criando tabela club_settings...');
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
      );
    `;
    
    const { error: clubSettingsError } = await supabase.rpc('exec_sql', {
      sql: createClubSettingsSQL
    });
    
    if (clubSettingsError) {
      console.error('Erro ao criar tabela club_settings:', clubSettingsError);
    } else {
      console.log('✓ Tabela club_settings criada com sucesso.');
    }
    
    // Criar tabela settings
    console.log('Criando tabela settings...');
    const createSettingsSQL = `
      CREATE TABLE IF NOT EXISTS public.settings (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        key VARCHAR(100) NOT NULL UNIQUE,
        value JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `;
    
    const { error: settingsError } = await supabase.rpc('exec_sql', {
      sql: createSettingsSQL
    });
    
    if (settingsError) {
      console.error('Erro ao criar tabela settings:', settingsError);
    } else {
      console.log('✓ Tabela settings criada com sucesso.');
    }
    
    // Criar tabela member_fee_settings
    console.log('Criando tabela member_fee_settings...');
    const createMemberFeeSettingsSQL = `
      CREATE TABLE IF NOT EXISTS public.member_fee_settings (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        member_id uuid NOT NULL,
        join_date TIMESTAMP WITH TIME ZONE NOT NULL,
        exempt_periods JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `;
    
    const { error: memberFeeSettingsError } = await supabase.rpc('exec_sql', {
      sql: createMemberFeeSettingsSQL
    });
    
    if (memberFeeSettingsError) {
      console.error('Erro ao criar tabela member_fee_settings:', memberFeeSettingsError);
    } else {
      console.log('✓ Tabela member_fee_settings criada com sucesso.');
    }
    
    // Criar tabela fee_payments
    console.log('Criando tabela fee_payments...');
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
      );
    `;
    
    const { error: feePaymentsError } = await supabase.rpc('exec_sql', {
      sql: createFeePaymentsSQL
    });
    
    if (feePaymentsError) {
      console.error('Erro ao criar tabela fee_payments:', feePaymentsError);
    } else {
      console.log('✓ Tabela fee_payments criada com sucesso.');
    }
    
    console.log('Criação das tabelas concluída.');
    
  } catch (error) {
    console.error('Erro durante a criação das tabelas:', error);
    process.exit(1);
  }
}

async function initializeDefaultSettings() {
  console.log('Inicializando configurações padrão...');
  
  try {
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

    const { error: clubSettingsError } = await supabase
      .from('club_settings')
      .insert(defaultClubSettings);

    if (clubSettingsError) {
      console.error('Erro ao inserir configurações padrão em club_settings:', clubSettingsError);
    } else {
      console.log('✓ Configurações padrão inseridas em club_settings.');
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
      const { error: settingError } = await supabase
        .from('settings')
        .insert(setting);

      if (settingError) {
        console.error(`Erro ao inserir configuração ${setting.key}:`, settingError);
      } else {
        console.log(`✓ Configuração ${setting.key} inserida com sucesso.`);
      }
    }

    console.log('Inicialização das configurações padrão concluída.');

  } catch (error) {
    console.error('Erro durante a inicialização das configurações padrão:', error);
    process.exit(1);
  }
}

// Verificar se tabelas já existem
async function checkTables() {
  console.log('Verificando se as tabelas já existem...');
  
  try {
    // Verificar tabelas através do information_schema
    const checkTablesSQL = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'club_settings'
      ) as club_settings_exists,
      EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'settings'
      ) as settings_exists
    `;

    const { data, error } = await supabase.rpc('exec_sql', {
      sql: checkTablesSQL
    });

    if (error) {
      console.error('Erro ao verificar tabelas:', error);
      return { exists: false, error };
    }

    const exists = data && data.length > 0 && data[0].club_settings_exists && data[0].settings_exists;
    
    return { exists, error: null };
  } catch (error) {
    console.error('Erro ao verificar tabelas:', error);
    return { exists: false, error };
  }
}

// Verificar se tabelas têm dados
async function checkData() {
  console.log('Verificando se as tabelas têm dados...');
  
  try {
    // Verificar tabelas através de contagem
    const { data: clubSettingsCount, error: clubCountError } = await supabase
      .from('club_settings')
      .select('*', { count: 'exact', head: true });
    
    const { data: settingsCount, error: settingsCountError } = await supabase
      .from('settings')
      .select('*', { count: 'exact', head: true });

    if (clubCountError || settingsCountError) {
      console.error('Erro ao verificar dados:', clubCountError || settingsCountError);
      return { hasData: false, error: clubCountError || settingsCountError };
    }

    const hasData = clubSettingsCount > 0 && settingsCount > 0;
    
    return { hasData, error: null };
  } catch (error) {
    console.error('Erro ao verificar dados:', error);
    return { hasData: false, error };
  }
}

// Função principal
async function main() {
  // Verificar tabelas
  const { exists, error: existsError } = await checkTables();
  
  if (existsError) {
    console.error('Erro ao verificar existência das tabelas:', existsError);
    process.exit(1);
  }
  
  if (!exists) {
    // Criar tabelas
    await createTables();
    // Inicializar configurações padrão
    await initializeDefaultSettings();
  } else {
    // Verificar se há dados
    const { hasData, error: dataError } = await checkData();
    
    if (dataError) {
      console.error('Erro ao verificar dados:', dataError);
      process.exit(1);
    }
    
    if (!hasData) {
      // Inicializar configurações padrão
      await initializeDefaultSettings();
    } else {
      console.log('O sistema já está inicializado com dados.');
    }
  }
  
  console.log('Processo concluído com sucesso!');
}

// Verificar se foi chamado diretamente (não como módulo)
if (require.main === module) {
  main().catch(error => {
    console.error('Erro durante a execução:', error);
    process.exit(1);
  });
}

module.exports = {
  createTables,
  initializeDefaultSettings,
  checkTables,
  checkData
};
