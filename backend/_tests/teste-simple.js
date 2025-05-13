import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

// Configurações do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Cria o cliente do Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

async function testMemberSelection() {
  console.log('Testando seleção de membros com select *');
  
  try {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .limit(2);
      
    if (error) {
      console.error('Erro ao buscar membros:', error);
      return;
    }
    
    console.log('Dados dos membros:');
    console.log(JSON.stringify(data, null, 2));
    
    // Verificar se o campo username existe
    if (data && data.length > 0) {
      console.log('\nVerificando campo username:');
      const firstMember = data[0];
      console.log(`Username para ${firstMember.name}: ${firstMember.username || 'não definido'}`);
      console.log('Todas as chaves disponíveis:', Object.keys(firstMember).join(', '));
    }
  } catch (e) {
    console.error('Exceção ao testar:', e);
  }
}

// Executa o teste
testMemberSelection();
