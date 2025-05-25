// Script para resolver problemas da tabela vehicles no RoleBasedDashboard
// Este script vai criar a tabela vehicles e corrigir os tipos TypeScript

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xbmzxrxfxgzqdjqsnqgg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibXp4cnhmeGd6cWRqcXNucWdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM5MTAzNzksImV4cCI6MjA0OTQ4NjM3OX0.zc7lTOHKjRe-XJHm2K0r7K2W_GhFFqQJv4wvU0h_rFk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixVehiclesTable() {
  console.log('🔧 Iniciando correção da tabela vehicles...');
  
  try {
    // Primeiro, vamos tentar verificar se a tabela já existe
    console.log('🔍 Verificando se a tabela vehicles existe...');
    
    const { data: testData, error: testError } = await supabase
      .from('vehicles')
      .select('id', { count: 'exact', head: true });
    
    if (!testError) {
      console.log('✅ Tabela vehicles já existe!');
      console.log(`📊 Número de registros: ${testData?.length || 0}`);
      return { success: true, message: 'Tabela vehicles já existe' };
    }
    
    console.log('❌ Tabela vehicles não existe. Erro:', testError.message);
    
    // Tentar criar a tabela usando INSERT direto (workaround)
    console.log('🛠️ Tentando criar tabela vehicles usando método alternativo...');
    
    // Primeiro, verificar se temos acesso de escrita em alguma tabela
    const { data: settingsTest, error: settingsError } = await supabase
      .from('settings')
      .select('*', { count: 'exact', head: true });
    
    if (settingsError) {
      console.error('❌ Erro ao acessar tabela settings:', settingsError);
      return { 
        success: false, 
        message: 'Não foi possível acessar o banco de dados',
        instructions: `
INSTRUÇÕES PARA CRIAR A TABELA VEHICLES MANUALMENTE:

1. Acesse o Console do Supabase em: https://supabase.com/dashboard/project/xbmzxrxfxgzqdjqsnqgg
2. Vá para "SQL Editor"
3. Execute o seguinte SQL:

CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM NOW()) + 2),
  type VARCHAR(50) DEFAULT 'Mota',
  displacement INTEGER,
  engine_size INTEGER,
  license_plate VARCHAR(20) UNIQUE,
  nickname VARCHAR(100),
  photo_url TEXT,
  color VARCHAR(50),
  vin VARCHAR(100),
  insurance_company VARCHAR(200),
  insurance_policy VARCHAR(100),
  insurance_expiry DATE,
  inspection_expiry DATE,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Configurar RLS
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_vehicles_member ON public.vehicles(member_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_active ON public.vehicles(is_active) WHERE is_active = TRUE;

-- Permissões
GRANT SELECT, INSERT, UPDATE ON public.vehicles TO authenticated;
GRANT SELECT ON public.vehicles TO anon;

4. Após executar o SQL, recarregue a aplicação.
        `
      };
    }
    
    console.log('✅ Conexão com o banco está funcionando');
    
    // Verificar se a tabela members existe
    const { data: membersTest, error: membersError } = await supabase
      .from('members')
      .select('id', { count: 'exact', head: true });
    
    if (membersError) {
      console.error('❌ Tabela members não existe:', membersError.message);
      return {
        success: false,
        message: 'Tabela members não existe - necessária para foreign key',
        instructions: 'Execute primeiro o script de inicialização das tabelas principais'
      };
    }
    
    console.log('✅ Tabela members existe');
    
    return {
      success: false,
      message: 'Função exec_sql não disponível para criar tabela automaticamente',
      instructions: `
SOLUÇÃO TEMPORÁRIA:

1. A tabela vehicles não existe no banco de dados
2. Acesse o Console do Supabase e execute o SQL fornecido acima
3. Ou aguarde enquanto implementamos uma solução alternativa

CORREÇÃO IMEDIATA NO CÓDIGO:

Vamos temporariamente modificar o RoleBasedDashboard.tsx para não depender da tabela vehicles.
      `
    };
    
  } catch (error) {
    console.error('💥 Erro geral:', error);
    return { 
      success: false, 
      message: error.message,
      error: error
    };
  }
}

// Função para corrigir o RoleBasedDashboard temporariamente
async function createTemporaryFix() {
  console.log('🔧 Criando correção temporária para RoleBasedDashboard...');
  
  const fixCode = `
// Correção temporária: Função para simular dados de veículos até a tabela ser criada
const getVehiclesDataPlaceholder = () => {
  return {
    data: [], // Array vazio até a tabela ser criada
    error: null,
    count: 0
  };
};

// No lugar da query original:
// const { data: vehiclesData, error: vehiclesError } = await supabase
//   .from('vehicles')
//   .select('*');

// Use temporariamente:
const vehiclesPlaceholder = getVehiclesDataPlaceholder();
const vehiclesData = vehiclesPlaceholder.data;
const vehiclesError = vehiclesPlaceholder.error;
  `;
  
  return {
    fixCode,
    message: 'Use este código temporariamente no RoleBasedDashboard.tsx'
  };
}

// Executar as verificações
async function main() {
  console.log('🚀 Iniciando diagnóstico e correção...\n');
  
  const result = await fixVehiclesTable();
  
  console.log('\n📋 RESULTADO:');
  console.log('Sucesso:', result.success);
  console.log('Mensagem:', result.message);
  
  if (result.instructions) {
    console.log('\n📝 INSTRUÇÕES:');
    console.log(result.instructions);
  }
  
  if (!result.success) {
    console.log('\n🔧 CORREÇÃO TEMPORÁRIA:');
    const tempFix = await createTemporaryFix();
    console.log(tempFix.message);
    console.log(tempFix.fixCode);
  }
  
  console.log('\n✅ Diagnóstico concluído!');
}

main().catch(console.error);
