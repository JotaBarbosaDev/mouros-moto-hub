import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jugfkacnlgdjdosstiks.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1Z2ZrYWNubGdkamRvc3N0aWtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1MDkzMzAsImV4cCI6MjA2MTA4NTMzMH0.PL8pg93wAVTl3kUoe-mfK7kGdjW6ytXapAiy-mpxk78';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseConnection() {
  console.log('🔍 Testando conexão com o banco de dados...');
  
  try {
    // Testar se as tabelas foram criadas
    console.log('\n📋 Verificando tabelas criadas:');
    
    const { data: approvals, error: approvalsError } = await supabase
      .from('financial_approvals')
      .select('*')
      .limit(1);
    
    if (approvalsError) {
      console.error('❌ Erro ao acessar financial_approvals:', approvalsError.message);
    } else {
      console.log('✅ Tabela financial_approvals acessível');
    }
    
    const { data: comments, error: commentsError } = await supabase
      .from('approval_comments')
      .select('*')
      .limit(1);
    
    if (commentsError) {
      console.error('❌ Erro ao acessar approval_comments:', commentsError.message);
    } else {
      console.log('✅ Tabela approval_comments acessível');
    }
    
    // Testar funções criadas
    console.log('\n🔧 Testando funções do dashboard:');
    
    const { data: treasurerStats, error: treasurerError } = await supabase
      .rpc('get_treasurer_dashboard_stats');
    
    if (treasurerError) {
      console.error('❌ Erro na função get_treasurer_dashboard_stats:', treasurerError.message);
    } else {
      console.log('✅ Função get_treasurer_dashboard_stats funcionando:', treasurerStats);
    }
    
    const { data: creatorStats, error: creatorError } = await supabase
      .rpc('get_creator_dashboard_stats');
    
    if (creatorError) {
      console.error('❌ Erro na função get_creator_dashboard_stats:', creatorError.message);
    } else {
      console.log('✅ Função get_creator_dashboard_stats funcionando:', creatorStats);
    }
    
    console.log('\n🎉 Teste de conectividade concluído!');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testDatabaseConnection();
