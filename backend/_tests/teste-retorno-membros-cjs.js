// Testando retorno de membros para verificar se todos os campos estão vindo corretamente
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://kldatqgolqdzbqjhslnz.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'SUA_CHAVE_ANONIMA_SUPABASE';

// Inicializa o cliente Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testMemberRetrieval() {
  console.log("Iniciando teste de busca de membros...");
  
  try {
    // Usando select * para obter todas as colunas disponíveis
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('name');
      
    if (error) {
      console.error("Erro ao consultar membros:", error);
      return;
    }
    
    if (!data || data.length === 0) {
      console.log("Nenhum membro encontrado");
      return;
    }
    
    console.log(`Encontrados ${data.length} membros`);
    
    // Verificando os campos retornados para cada membro
    data.forEach(member => {
      console.log("--------------------------------------");
      console.log("ID:", member.id);
      console.log("Nome:", member.name);
      console.log("Username:", member.username || 'não definido');
      console.log("Email:", member.email);
      console.log("Campos disponíveis:", Object.keys(member).join(', '));
      console.log("--------------------------------------");
    });
  } catch (e) {
    console.error("Erro ao executar teste:", e);
  }
}

// Executar o teste
testMemberRetrieval();
