// Script para verificar os logs recentes
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Obter credenciais do ambiente
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('⛔️ Credenciais do Supabase não definidas.');
  console.error('Configure as variáveis SUPABASE_URL e SUPABASE_ANON_KEY no .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRecentLogs() {
  console.log('📊 Verificando logs de atividade recentes...');
  
  try {
    // Buscar logs recentes
    const { data: logs, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) throw error;
    
    if (!logs || logs.length === 0) {
      console.log('⚠️ Nenhum log de atividade encontrado.');
      return;
    }
    
    console.log(`✅ ${logs.length} logs de atividade encontrados:`);
    
    logs.forEach((log, index) => {
      console.log(`\n--- Log #${index + 1} ---`);
      console.log(`ID: ${log.id}`);
      console.log(`Ação: ${log.action}`);
      console.log(`Entidade: ${log.entity_type}`);
      console.log(`ID da Entidade: ${log.entity_id || 'N/A'}`);
      console.log(`Usuário: ${log.username} (${log.user_id})`);
      console.log(`Data: ${new Date(log.created_at).toLocaleString()}`);
      
      if (log.details) {
        try {
          const details = typeof log.details === 'string' ? JSON.parse(log.details) : log.details;
          console.log('Detalhes:', JSON.stringify(details, null, 2));
        } catch (e) {
          console.log('Detalhes:', log.details);
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao verificar logs:', error);
  }
}

// Executar verificação
checkRecentLogs().catch(err => console.error('Erro não tratado:', err));
