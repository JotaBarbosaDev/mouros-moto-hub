// Script para inicialização do banco de dados Supabase

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Configuração do cliente Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://jugfkacnlgdjdosstiks.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1Z2ZrYWNubGdkamRvc3N0aWtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODU0NjA3MzMsImV4cCI6MjAwMTAzNjczM30.ACzJbBpSlI8TEQPC0Em8FljE-fYBjgsSGSFGsfk7AY4';

// Verificar se as variáveis estão definidas
console.log('Verificando configuração:');
console.log('URL do Supabase:', supabaseUrl);
console.log('Chave do Supabase:', supabaseKey ? 'Configurada' : 'Não configurada');

// Criar cliente
const supabase = createClient(supabaseUrl, supabaseKey);

async function setupConfigurationTables() {
  try {
    console.log("Iniciando configuração das tabelas do sistema...");
    
    // Criar tabela club_settings
    console.log("Criando tabela club_settings...");
    await supabase.rpc('create_table_if_not_exists', {
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
    
    // Criar tabela settings
    console.log("Criando tabela settings...");
    await supabase.rpc('create_table_if_not_exists', {
      table_name: 'settings',
      columns: `
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        key VARCHAR(100) NOT NULL UNIQUE,
        value JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      `
    });
    
    // Criar tabela member_fee_settings
    console.log("Criando tabela member_fee_settings...");
    await supabase.rpc('create_table_if_not_exists', {
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
    
    // Criar tabela fee_payments
    console.log("Criando tabela fee_payments...");
    await supabase.rpc('create_table_if_not_exists', {
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
    
    // Inserir configurações padrão
    console.log("Inserindo configurações padrão...");
    
    // Verificar se já existem dados na tabela club_settings
    const { count: clubSettingsCount } = await supabase
      .from('club_settings')
      .select('*', { count: 'exact', head: true });
      
    if (clubSettingsCount === 0) {
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
      
      await supabase
        .from('club_settings')
        .insert(defaultClubSettings);
      
      console.log("Configurações do clube adicionadas com sucesso!");
    } else {
      console.log("Tabela club_settings já contém dados, pulando inserção.");
    }
    
    // Verificar se já existem dados na tabela settings
    const { count: settingsCount } = await supabase
      .from('settings')
      .select('*', { count: 'exact', head: true });
      
    if (settingsCount === 0) {
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
        await supabase
          .from('settings')
          .insert(setting);
      }
      
      console.log("Configurações padrão adicionadas com sucesso!");
    } else {
      console.log("Tabela settings já contém dados, pulando inserção.");
    }
    
    console.log("Setup completo!");
  } catch (error) {
    console.error("Erro durante o setup:", error);
  }
}

// Executar o setup
setupConfigurationTables().then(() => {
  console.log("Processo finalizado!");
});
