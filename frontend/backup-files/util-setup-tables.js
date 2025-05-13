// Script para inicialização manual das tabelas de configuração
import { supabase } from './integrations/supabase/client';

async function setupConfigurationTables() {
  try {
    console.log("Iniciando configuração das tabelas do sistema...");
    
    // Verificar se a tabela club_settings existe
    const { count, error: countError } = await supabase
      .from('club_settings')
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      console.log("Tabela club_settings não encontrada, criando...");
      
      // Criar tabela de configurações do clube
      const { error: clubSettingsError } = await supabase.rpc('create_table_if_not_exists', {
        table_name: 'club_settings',
        columns: `
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
        `
      });

      if (clubSettingsError) {
        throw new Error(`Erro ao criar tabela club_settings: ${clubSettingsError.message}`);
      } else {
        console.log("Tabela club_settings criada com sucesso!");
        
        // Inserir configurações padrão
        const defaultSettings = {
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

        const { error } = await supabase
          .from('club_settings')
          .insert(defaultSettings);

        if (error) {
          console.error('Erro ao inicializar configurações padrão:', error);
        } else {
          console.log("Configurações padrão inseridas com sucesso!");
        }
      }
    } else {
      console.log("Tabela club_settings já existe.");
    }

    // Verificar se a tabela settings existe
    const { count: settingsCount, error: settingsCountError } = await supabase
      .from('settings')
      .select('*', { count: 'exact', head: true });

    if (settingsCountError) {
      console.log("Tabela settings não encontrada, criando...");
      
      // Criar tabela de configurações
      const { error: settingsError } = await supabase.rpc('create_table_if_not_exists', {
        table_name: 'settings',
        columns: `
          id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
          key VARCHAR(100) NOT NULL UNIQUE,
          value JSONB NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        `
      });

      if (settingsError) {
        throw new Error(`Erro ao criar tabela settings: ${settingsError.message}`);
      } else {
        console.log("Tabela settings criada com sucesso!");
        
        // Inserir configurações padrão
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
              membershipApproval: 'admin', // 'admin', 'vote', 'automatic'
              autoRemoveInactive: false,
              inactiveMonthsLimit: 6
            }
          }
        ];

        for (const setting of defaultSettings) {
          const { error } = await supabase
            .from('settings')
            .insert(setting);

          if (error) {
            console.error(`Erro ao inserir configuração ${setting.key}:`, error);
          } else {
            console.log(`Configuração ${setting.key} inserida com sucesso!`);
          }
        }
      }
    } else {
      console.log("Tabela settings já existe.");
    }

    // Verificar se a tabela member_fee_settings existe
    const { count: memberFeeCount, error: memberFeeCountError } = await supabase
      .from('member_fee_settings')
      .select('*', { count: 'exact', head: true });

    if (memberFeeCountError) {
      console.log("Tabela member_fee_settings não encontrada, criando...");
      
      // Criar tabela de configurações de cotas de membros
      const { error: memberFeeSettingsError } = await supabase.rpc('create_table_if_not_exists', {
        table_name: 'member_fee_settings',
        columns: `
          id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
          member_id uuid NOT NULL,
          join_date TIMESTAMP WITH TIME ZONE NOT NULL,
          exempt_periods JSONB DEFAULT '[]'::jsonb,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        `
      });

      if (memberFeeSettingsError) {
        throw new Error(`Erro ao criar tabela member_fee_settings: ${memberFeeSettingsError.message}`);
      } else {
        console.log("Tabela member_fee_settings criada com sucesso!");
      }
    } else {
      console.log("Tabela member_fee_settings já existe.");
    }

    // Verificar se a tabela fee_payments existe
    const { count: feePaymentsCount, error: feePaymentsCountError } = await supabase
      .from('fee_payments')
      .select('*', { count: 'exact', head: true });

    if (feePaymentsCountError) {
      console.log("Tabela fee_payments não encontrada, criando...");
      
      // Criar tabela de pagamentos de cotas
      const { error: feePaymentsError } = await supabase.rpc('create_table_if_not_exists', {
        table_name: 'fee_payments',
        columns: `
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
        `
      });

      if (feePaymentsError) {
        throw new Error(`Erro ao criar tabela fee_payments: ${feePaymentsError.message}`);
      } else {
        console.log("Tabela fee_payments criada com sucesso!");
      }
    } else {
      console.log("Tabela fee_payments já existe.");
    }

    console.log("Configuração das tabelas do sistema concluída com sucesso!");
  } catch (error) {
    console.error("Erro durante a configuração das tabelas:", error);
  }
}

// Executar o setup
setupConfigurationTables();
