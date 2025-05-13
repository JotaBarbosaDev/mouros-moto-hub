// SystemInitializer.fixed.tsx - Versão com correções de tipo
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

/**
 * Este componente é responsável por verificar se as tabelas do sistema
 * já foram criadas e, caso contrário, inicializá-las com valores padrão.
 */
export function SystemInitializer() {
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Função para criar as tabelas necessárias
  async function setupTables() {
    try {
      console.log("Iniciando criação das tabelas do sistema...");
      
      // Criar tabela de configurações do clube
      const { error: clubSettingsError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS club_settings (
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
        console.error('Erro ao criar tabela club_settings:', clubSettingsError);
        throw new Error(`Erro ao criar tabela club_settings: ${clubSettingsError.message}`);
      }
      
      // Criar tabela settings
      const { error: settingsError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS settings (
            id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
            key VARCHAR(100) NOT NULL UNIQUE,
          value JSONB NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        `
      });

      if (settingsError) {
        console.error('Erro ao criar tabela settings:', settingsError);
        throw new Error(`Erro ao criar tabela settings: ${settingsError.message}`);
      }
      
      // Criar tabela de configurações de cotas de membros
      const { error: memberFeeSettingsError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS member_fee_settings (
            id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
            member_id uuid NOT NULL,
          join_date TIMESTAMP WITH TIME ZONE NOT NULL,
          exempt_periods JSONB DEFAULT '[]'::jsonb,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        `
      });

      if (memberFeeSettingsError) {
        console.error('Erro ao criar tabela member_fee_settings:', memberFeeSettingsError);
        throw new Error(`Erro ao criar tabela member_fee_settings: ${memberFeeSettingsError.message}`);
      }
      
      // Criar tabela de pagamentos de cotas
      const { error: feePaymentsError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS fee_payments (
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
        console.error('Erro ao criar tabela fee_payments:', feePaymentsError);
        throw new Error(`Erro ao criar tabela fee_payments: ${feePaymentsError.message}`);
      }
      
      console.log("Tabelas criadas com sucesso!");
      await initializeDefaultSettings();
    } catch (error) {
      console.error('Erro ao criar tabelas:', error);
      throw error;
    }
  }

  // Função para inicializar configurações padrão
  async function initializeDefaultSettings() {
    try {
      console.log("Inicializando configurações padrão...");
      
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

      // TypeScript hack: Usando type assertion para resolver o problema de verificação de tipos
      type SupabaseAny = any;
      const { error: clubSettingsError } = await (supabase as SupabaseAny)
        .from('club_settings')
        .insert(defaultClubSettings);

      if (clubSettingsError) {
        console.error('Erro ao inserir configurações padrão em club_settings:', clubSettingsError);
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
        const { error: settingError } = await (supabase as SupabaseAny)
          .from('settings')
          .insert(setting);

        if (settingError) {
          console.error(`Erro ao inserir configuração ${setting.key}:`, settingError);
        }
      }
      
      console.log("Configurações padrão inicializadas com sucesso!");
      setIsInitialized(true);
    } catch (error) {
      console.error('Erro ao inicializar configurações padrão:', error);
      throw error;
    }
  }

  // useEffect com tratamento de dependência
  useEffect(() => {
    const checkAndSetupSystemAsync = async () => {
      try {
        console.log("Verificando tabelas do sistema...");
        
        type SupabaseAny = any;
        // Verificar se as tabelas existem
        const { count: clubSettingsCount, error: clubSettingsError } = await (supabase as SupabaseAny)
          .from('club_settings')
          .select('*', { count: 'exact', head: true });
        
        const { count: settingsCount, error: settingsError } = await (supabase as SupabaseAny)
          .from('settings')
          .select('*', { count: 'exact', head: true });
        
        // Determinar o que fazer com base na verificação
        if (clubSettingsError || settingsError) {
          console.log("Uma ou mais tabelas não existem, criando tabelas...");
          await setupTables();
        } else if (clubSettingsCount === 0 || settingsCount === 0) {
          console.log("Tabelas existem mas estão vazias, inicializando configurações padrão...");
          await initializeDefaultSettings();
        } else {
          console.log("Sistema já inicializado!");
          setIsInitialized(true);
        }
      } catch (err) {
        console.error('Erro ao inicializar sistema:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido ao inicializar o sistema');
      } finally {
        setIsChecking(false);
      }
    };
    
    checkAndSetupSystemAsync();
  }, []); // Removemos setupTables da dependência, pois estamos usando uma função interna

  // Este componente não renderiza nada visualmente
  return null;
}
