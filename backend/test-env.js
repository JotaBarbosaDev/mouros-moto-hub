// Arquivo para teste de carregamento das variáveis de ambiente
require('dotenv').config();
console.log('Verificando variáveis de ambiente do Supabase:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Definido ✓' : 'Não definido ✗');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Definido ✓' : 'Não definido ✗');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'Definido ✓' : 'Não definido ✗');
console.log('SUPABASE_KEY:', process.env.SUPABASE_KEY ? 'Definido ✓' : 'Não definido ✗');

// Verificar se o SUPABASE_KEY está vazio
if (process.env.SUPABASE_KEY === '') {
  console.log('⚠️ SUPABASE_KEY está definido, mas está vazio');
}

// Verificar se o SERVICE_ROLE_KEY está vazio
if (process.env.SUPABASE_SERVICE_ROLE_KEY === '') {
  console.log('⚠️ SUPABASE_SERVICE_ROLE_KEY está definido, mas está vazio');
}
