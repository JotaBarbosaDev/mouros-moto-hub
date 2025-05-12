import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

// Obter o diretório atual do módulo
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Verificar se o arquivo .env existe
const envPath = resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('Arquivo .env encontrado:', envPath);
} else {
  console.log('Arquivo .env não encontrado! Procurando em:', envPath);
}

// Configurações do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

console.log('Supabase URL:', supabaseUrl ? 'Configurada' : 'Não configurada');
console.log('Supabase Key:', supabaseKey ? 'Configurada' : 'Não configurada');

if (!supabaseUrl || !supabaseKey) {
  console.error('Erro: Variáveis de ambiente do Supabase não configuradas!');
  process.exit(1);
}

// Cria o cliente do Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

async function testMemberSelection() {
  console.log('\nTestando seleção de membros com select *');
  
  try {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .limit(2);
      
    if (error) {
      console.error('Erro ao buscar membros:', error);
      return;
    }
    
    console.log(`\nEncontrados ${data?.length || 0} membros`);
    
    // Verificar se o campo username existe
    if (data && data.length > 0) {
      console.log('\nVerificando campo username:');
      const firstMember = data[0];
      console.log(`Username para ${firstMember.name}: ${firstMember.username || 'não definido'}`);
      console.log('Todas as chaves disponíveis:', Object.keys(firstMember).join(', '));
      
      console.log('\nPrimeiro membro (dados parciais):');
      const { created_at, updated_at, ...partialData } = firstMember;
      console.log(JSON.stringify(partialData, null, 2));
    }
  } catch (e) {
    console.error('Exceção ao testar:', e);
  }
}

// Executa o teste
await testMemberSelection();
