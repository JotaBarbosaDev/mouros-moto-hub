import { createClient } from '@supabase/supabase-js';

// Configurar Supabase
const supabaseUrl = 'https://jugfkacnlgdjdosstiks.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1Z2ZrYWNubGdkamRvc3N0aWtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1MDkzMzAsImV4cCI6MjA2MTA4NTMzMH0.PL8pg93wAVTl3kUoe-mfK7kGdjW6ytXapAiy-mpxk78';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkVehiclesTable() {
  console.log('🔍 Verificando se a tabela vehicles existe...');
  
  try {
    // Tentar fazer uma consulta simples na tabela
    const { data, error } = await supabase
      .from('vehicles')
      .select('count')
      .limit(1);
    
    if (error && error.code === '42P01') {
      console.log('❌ Tabela vehicles NÃO existe');
      console.log('Erro:', error.message);
      return false;
    } else if (error) {
      console.log('⚠️ Tabela vehicles existe mas houve outro erro:', error.message);
      return true;
    } else {
      console.log('✅ Tabela vehicles existe e está acessível!');
      
      // Verificar se há dados
      const { count } = await supabase
        .from('vehicles')
        .select('*', { count: 'exact', head: true });
      
      console.log(`📊 A tabela contém ${count || 0} registros`);
      return true;
    }
  } catch (err) {
    console.error('❌ Erro inesperado:', err.message);
    return false;
  }
}

// Executar verificação
checkVehiclesTable()
  .then(exists => {
    if (exists) {
      console.log('\n🎉 A tabela vehicles está pronta para uso!');
    } else {
      console.log('\n⚠️ A tabela vehicles precisa ser criada manualmente no Console do Supabase');
      console.log('📝 Use o arquivo: execute-vehicles-sql.sql');
    }
  })
  .catch(console.error);
