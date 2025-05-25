import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://xbmzxrxfxgzqdjqsnqgg.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhibXp4cnhmeGd6cWRqcXNucWdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM5MTAzNzksImV4cCI6MjA0OTQ4NjM3OX0.zc7lTOHKjRe-XJHm2K0r7K2W_GhFFqQJv4wvU0h_rFk';

const supabase = createClient(supabaseUrl, supabaseKey);

// SQL para criar a tabela vehicles
const createVehiclesTableSQL = `
-- CRIAR TABELA VEHICLES
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

-- CONFIGURAR ROW LEVEL SECURITY
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- ÍNDICES
CREATE INDEX IF NOT EXISTS idx_vehicles_member ON public.vehicles(member_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_active ON public.vehicles(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_vehicles_license_plate ON public.vehicles(license_plate);

-- PERMISSÕES
GRANT SELECT, INSERT, UPDATE ON public.vehicles TO authenticated;
GRANT SELECT ON public.vehicles TO anon;
`;

async function createVehiclesTable() {
  console.log('🚀 Iniciando criação da tabela vehicles...');
  
  try {
    // Primeiro, verificar se a função exec_sql existe
    console.log('🔍 Verificando função exec_sql...');
    
    const { data: functions, error: functionError } = await supabase
      .rpc('exec_sql', { sql: 'SELECT 1 as test' });
      
    console.log('✅ Função exec_sql está disponível');
    
    // Executar o SQL para criar a tabela
    console.log('📊 Executando SQL para criar tabela vehicles...');
    
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: createVehiclesTableSQL
    });
    
    if (error) {
      console.error('❌ Erro ao executar SQL:', error);
      return false;
    }
    
    console.log('✅ Tabela vehicles criada com sucesso!');
    
    // Verificar se a tabela foi criada
    const { data: checkData, error: checkError } = await supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true });
      
    if (checkError) {
      console.error('❌ Erro ao verificar tabela criada:', checkError);
      return false;
    }
    
    console.log('✅ Verificação concluída - tabela vehicles está acessível');
    return true;
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
    
    // Se exec_sql não existir, tentar criar
    console.log('🔧 Tentando criar função exec_sql...');
    
    try {
      // Usar uma query SQL simples para verificar conexão
      const { data: testData, error: testError } = await supabase
        .from('club_settings')
        .select('id', { count: 'exact', head: true });
        
      if (testError) {
        console.error('❌ Erro de conexão com o banco:', testError);
        return false;
      }
      
      console.log('✅ Conexão com o banco está funcionando');
      console.log('⚠️ Mas a função exec_sql não está disponível');
      console.log('📋 Você precisa executar o seguinte SQL no Console do Supabase:');
      console.log(`
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
      
      return false;
    } catch (innerError) {
      console.error('❌ Erro ao testar conexão:', innerError);
      return false;
    }
  }
}

// Executar o script
createVehiclesTable().then((success) => {
  if (success) {
    console.log('🎉 Processo concluído com sucesso!');
  } else {
    console.log('⚠️ Processo concluído com avisos. Verifique as instruções acima.');
  }
  process.exit(success ? 0 : 1);
}).catch((error) => {
  console.error('💥 Erro fatal:', error);
  process.exit(1);
});
