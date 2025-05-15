/**
 * Script para contornar a necessidade da função exec_sql
 * Este script modifica o SystemInitializer.tsx para usar métodos alternativos
 * de verificação e criação de tabelas sem depender da função exec_sql
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

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

async function verifyTables() {
  console.log('Verificando tabelas no Supabase...');

  try {
    // Verificar se temos acesso ao Supabase
    const { data: testData, error: testError } = await supabase
      .from('club_settings')
      .select('count(*)', { count: 'exact', head: true });
    
    if (testError && testError.code === '42P01') {
      console.log('Tabela club_settings não existe. Precisamos criar as tabelas.');
    } else if (testError) {
      console.error('Erro ao verificar acesso:', testError);
    } else {
      console.log(`Tabela club_settings existe e contém ${testData.count} registros.`);
    }

    // Verificando outras tabelas
    const tables = ['settings', 'member_fee_settings', 'fee_payments'];
    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .select('count(*)', { count: 'exact', head: true });
      
      if (error && error.code === '42P01') {
        console.log(`Tabela ${table} não existe.`);
      } else if (error) {
        console.error(`Erro ao verificar tabela ${table}:`, error);
      } else {
        console.log(`Tabela ${table} existe.`);
      }
    }

    // Tentar criar uma tabela de teste para verificar permissões
    const { error: createError } = await supabase.rpc('supabase_admin.create_table', { 
      name: 'test_permissions',
      columns: 'id bigint primary key, name text'
    }).catch(err => {
      return { error: err };
    });

    if (createError) {
      console.log('Não temos permissão para criar tabelas diretamente.');
      console.log('Erro:', createError);
    } else {
      console.log('Temos permissão para criar tabelas!');
    }

    console.log('\nCriando arquivo SystemInitializerBasic.tsx com abordagem alternativa...');
    createBasicInitializer();

  } catch (error) {
    console.error('Erro ao verificar tabelas:', error);
  }
}

function createBasicInitializer() {
  const content = `/* eslint-disable @typescript-eslint/no-explicit-any */
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
        
        // Verificar tabelas existentes usando API nativa do Supabase
        const { data: clubSettingsData, error: clubSettingsError } = await supabase
          .from('club_settings')
          .select('count(*)', { count: 'exact', head: true });
        
        if (clubSettingsError) {
          if (clubSettingsError.code === '42P01') {
            console.log("Tabela club_settings não existe. Vamos utilizar o painel do Supabase para criar as tabelas.");
            setError(\`As tabelas necessárias não foram encontradas no banco de dados.
            
Acesse o painel do Supabase em: ${supabase.supabaseUrl}/project/sql
            
Execute o SQL disponível no arquivo:
/Users/joaobarbosa/Desktop/projetos/mouros-moto-hub/frontend/create-all-tables.sql

Após criar as tabelas, recarregue esta página.\`);
            setIsChecking(false);
            return;
          } else {
            console.error("Erro ao verificar tabela club_settings:", clubSettingsError);
            setError(\`Erro ao verificar tabelas: ${clubSettingsError.message}\`);
            setIsChecking(false);
            return;
          }
        }
        
        // Se chegou aqui, a tabela club_settings existe
        console.log("Tabela club_settings encontrada");
        
        // Verificar se há dados na tabela club_settings
        const count = clubSettingsData?.count || 0;
        
        if (count === 0) {
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
            setError(\`Erro ao inserir dados iniciais: ${insertError.message}\`);
            setIsChecking(false);
            return;
          }
          
          console.log("Dados iniciais inseridos com sucesso!");
        } else {
          console.log("Tabela club_settings já contém dados");
        }
        
        // Verificar outras tabelas também
        const tables = ['settings', 'member_fee_settings', 'fee_payments'];
        for (const table of tables) {
          const { error } = await supabase
            .from(table)
            .select('count(*)', { count: 'exact', head: true });
          
          if (error && error.code === '42P01') {
            console.warn(\`Tabela ${table} não existe. Isso pode causar problemas no sistema.\`);
          }
        }
        
        setIsInitialized(true);
        console.log("Sistema inicializado com sucesso!");
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
}`;

  // Script SQL para criar todas as tabelas
  const sqlContent = `-- Script para criar todas as tabelas necessárias no Supabase

-- Criar extensão uuid-ossp
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar tabela club_settings
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

-- Criar tabela settings
CREATE TABLE IF NOT EXISTS public.settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(100) NOT NULL UNIQUE,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela member_fee_settings
CREATE TABLE IF NOT EXISTS public.member_fee_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id uuid NOT NULL,
  join_date TIMESTAMP WITH TIME ZONE NOT NULL,
  exempt_periods JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela fee_payments
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

-- Configurações iniciais para tabela settings
INSERT INTO public.settings (key, value)
VALUES
  ('club_info', '{"name":"Mouros Moto Hub","shortName":"Mouros MC","foundingDate":"2015-01-01","logoUrl":"/assets/logo-default.png","bannerUrl":"/assets/banner-default.jpg","colors":{"primary":"#e11d48","secondary":"#27272a","accent":"#f59e0b","text":"#27272a"},"contact":{"address":"Rua Principal, 123 - Centro, Mouros","email":"info@mourosmotohub.pt","phone":"+351 123 456 789"},"description":"Associação motociclística dedicada à paixão pelas duas rodas e ao companheirismo.","welcomeMessage":"Bem-vindo ao Mouros Moto Hub! Junte-se a nós nesta viagem."}'::jsonb),
  ('fees', '{"annualFee":60.00,"feeStartDate":"2015-01-01","inactivePeriods":[]}'::jsonb),
  ('scale', '{"rolesOrder":["bartender","helper","cleaner"],"defaultShiftHours":{"start":"18:00","end":"23:00"}}'::jsonb),
  ('defaults', '{"allowGuests":true,"membershipApproval":"admin","autoRemoveInactive":false,"inactiveMonthsLimit":6}'::jsonb)
ON CONFLICT (key) DO NOTHING;
`;

  try {
    // Criar o arquivo SystemInitializerBasic.tsx
    fs.writeFileSync(
      path.join(process.cwd(), 'src/components/system/SystemInitializerBasic.tsx'),
      content
    );
    console.log('✅ Arquivo SystemInitializerBasic.tsx criado com sucesso!');

    // Criar o arquivo SQL para criar todas as tabelas
    fs.writeFileSync(
      path.join(process.cwd(), 'create-all-tables.sql'),
      sqlContent
    );
    console.log('✅ Arquivo create-all-tables.sql criado com sucesso!');
    
  } catch (err) {
    console.error('Erro ao criar arquivos:', err);
  }
}

verifyTables();
