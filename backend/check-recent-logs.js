// Script para verificar os logs recentes
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Usar credenciais fixas do Supabase (extraídas do arquivo .env.local do frontend)
const supabaseUrl = 'https://jugfkacnlgdjdosstiks.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1Z2ZrYWNubGdkamRvc3N0aWtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1MDkzMzAsImV4cCI6MjA2MTA4NTMzMH0.PL8pg93wAVTl3kUoe-mfK7kGdjW6ytXapAiy-mpxk78';

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
