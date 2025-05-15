/**
 * Script para inicializar tabelas diretamente no Supabase.
 * Este script pode ser executado diretamente para garantir que as tabelas existam.
 * 
 * Para executar: node init-tables.js
 * 
 * Nota: Este arquivo usa ES Modules. Para executar com Node.js diretamente,
 * adicione "type": "module" no package.json ou use a extensão .mjs
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Credenciais do Supabase não definidas! Verifique o arquivo .env.local');
  process.exit(1);
}

// Cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

async function runInitialization() {
  try {
    console.log('Inicializando tabelas no Supabase...');
    
    // Criar extensão UUID se não existir
    console.log('Verificando e criando extensão UUID...');
    await supabase.rpc('exec_sql', {
      sql: "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"
    });
    
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
      )
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
      )
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
      )
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
      )
    `;
    
    const { error: feePaymentsError } = await supabase.rpc('exec_sql', {
      sql: createFeePaymentsSQL
    });
    
    if (feePaymentsError) {
      console.error('Erro ao criar tabela fee_payments:', feePaymentsError);
    } else {
      console.log('✓ Tabela fee_payments criada com sucesso.');
    }
    
    // Verificar e inserir configurações iniciais
    console.log('Verificando dados na tabela club_settings...');
    const { data: countData, error: countError } = await supabase.rpc('exec_sql', {
      sql: "SELECT COUNT(*) as count FROM public.club_settings"
    });

    if (countError) {
      console.error('Erro ao verificar dados:', countError);
    } else {
      const isEmpty = !countData || countData.length === 0 || parseInt(countData[0].count) === 0;

      if (isEmpty) {
        console.log('Inserindo dados iniciais em club_settings...');
        
        // Dados padrão do clube
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
        
        // Montar colunas e valores SQL
        const columns = Object.keys(defaultClubSettings).join(', ');
        const values = Object.entries(defaultClubSettings).map(([key, value]) => {
          if (typeof value === 'string') {
            return `'${value.replace(/'/g, "''")}'`;
          }
          if (typeof value === 'number') {
            return value;
          }
          if (Array.isArray(value)) {
            return `'${JSON.stringify(value)}'::jsonb`;
          }
          return 'NULL';
        }).join(', ');

        const { error } = await supabase.rpc('exec_sql', {
          sql: `
            INSERT INTO public.club_settings (${columns})
            VALUES (${values})
          `
        });
        
        if (error) {
          console.error('Erro ao inserir dados em club_settings:', error);
        } else {
          console.log('✓ Dados inseridos em club_settings com sucesso.');
        }
        
        // Inserir configurações padrão
        console.log('Inserindo dados iniciais em settings...');
        
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
          
          const { error } = await supabase.rpc('exec_sql', {
            sql: `
              INSERT INTO public.settings (key, value)
              VALUES ('${setting.key}', '${jsonValue}'::jsonb)
            `
          });
          
          if (error) {
            console.error(`Erro ao inserir configuração ${setting.key}:`, error);
          } else {
            console.log(`✓ Configuração ${setting.key} inserida com sucesso.`);
          }
        }
      } else {
        console.log('Dados já existem nas tabelas. Nenhuma ação necessária.');
      }
    }

    console.log('Inicialização concluída!');
  } catch (error) {
    console.error('Erro durante a inicialização:', error);
    process.exit(1);
  }
}

// Executar o script
runInitialization();
