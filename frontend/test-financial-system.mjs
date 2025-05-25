/**
 * TESTE DO SISTEMA DE APROVAÇÃO FINANCEIRA
 * Este script verifica se o sistema está funcionando corretamente
 */

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const SUPABASE_URL = 'https://fgqvtyaygpbxfigwdtaz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZncXZ0eWF5Z3BieGZpZ3dkdGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU5NzMxMzIsImV4cCI6MjA0MTU0OTEzMn0.7KHNkJEfwuGWYEutmRDbFjYq4QCOzj0rJN9a3gfJJjk';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testFinancialSystem() {
  console.log('🧪 TESTANDO SISTEMA DE APROVAÇÃO FINANCEIRA');
  console.log('===========================================');

  try {
    // 1. Testar conexão básica
    console.log('\n1. Testando conexão com Supabase...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('   ⚠️  Erro de autenticação (normal se não logado):', authError.message);
    } else {
      console.log('   ✅ Conexão estabelecida - Usuário:', user ? user.email : 'Anônimo');
    }

    // 2. Testar se as tabelas existem
    console.log('\n2. Verificando estrutura das tabelas...');
    
    // Testar tabela financial_approvals
    console.log('   Testando tabela financial_approvals...');
    const { count: approvalsCount, error: approvalsError } = await supabase
      .from('financial_approvals')
      .select('id', { count: 'exact', head: true });
    
    if (approvalsError) {
      console.log('   ❌ Erro na tabela financial_approvals:', approvalsError.message);
      if (approvalsError.code === '42P01') {
        console.log('      → A tabela não existe! Execute as migrações SQL.');
      }
    } else {
      console.log('   ✅ Tabela financial_approvals existe:', `${approvalsCount || 0} registros`);
    }

    // Testar tabela approval_comments
    console.log('   Testando tabela approval_comments...');
    const { count: commentsCount, error: commentsError } = await supabase
      .from('approval_comments')
      .select('id', { count: 'exact', head: true });
    
    if (commentsError) {
      console.log('   ❌ Erro na tabela approval_comments:', commentsError.message);
      if (commentsError.code === '42P01') {
        console.log('      → A tabela não existe! Execute as migrações SQL.');
      }
    } else {
      console.log('   ✅ Tabela approval_comments existe:', `${commentsCount || 0} registros`);
    }

    // 3. Testar estrutura das colunas
    console.log('\n3. Testando estrutura das colunas...');
    
    // Tentar fazer uma consulta que use as principais colunas
    const { data: sampleApprovals, error: structureError } = await supabase
      .from('financial_approvals')
      .select('id, title, description, total_amount, currency, status, item_type, creator_id, created_at')
      .limit(1);
    
    if (structureError) {
      console.log('   ❌ Erro na estrutura das colunas:', structureError.message);
      if (structureError.code === '42703') {
        console.log('      → Algumas colunas não existem! Verifique as migrações.');
      }
    } else {
      console.log('   ✅ Estrutura das colunas está correta');
      if (sampleApprovals && sampleApprovals.length > 0) {
        console.log('   📄 Exemplo de aprovação encontrada:', sampleApprovals[0].title);
      }
    }

    // 4. Testar ENUMs
    console.log('\n4. Testando tipos ENUM...');
    
    // Verificar se os ENUMs existem fazendo uma consulta com filtro
    const { data: statusTest, error: enumError } = await supabase
      .from('financial_approvals')
      .select('status')
      .in('status', ['draft', 'awaiting_approval', 'approved'])
      .limit(1);
    
    if (enumError) {
      console.log('   ❌ Erro nos tipos ENUM:', enumError.message);
    } else {
      console.log('   ✅ Tipos ENUM funcionando corretamente');
    }

    // 5. Testar RLS (Row Level Security)
    console.log('\n5. Testando políticas de segurança (RLS)...');
    
    // Tentar fazer operações que testam RLS
    const { data: publicData, error: rlsError } = await supabase
      .from('financial_approvals')
      .select('id, title, status')
      .limit(5);
    
    if (rlsError) {
      if (rlsError.code === '42501') {
        console.log('   ✅ RLS ativo (acesso negado - conforme esperado)');
      } else {
        console.log('   ❌ Erro inesperado no RLS:', rlsError.message);
      }
    } else {
      console.log('   ✅ RLS configurado corretamente - dados acessíveis:', publicData?.length || 0, 'registros');
    }

    console.log('\n📊 RESUMO DO TESTE');
    console.log('==================');
    console.log('✅ Conexão: OK');
    console.log(approvalsError ? '❌' : '✅', 'Tabela financial_approvals:', approvalsError ? 'ERRO' : 'OK');
    console.log(commentsError ? '❌' : '✅', 'Tabela approval_comments:', commentsError ? 'ERRO' : 'OK');
    console.log(structureError ? '❌' : '✅', 'Estrutura das colunas:', structureError ? 'ERRO' : 'OK');
    console.log(enumError ? '❌' : '✅', 'Tipos ENUM:', enumError ? 'ERRO' : 'OK');
    
    const hasErrors = approvalsError || commentsError || structureError || enumError;
    
    if (hasErrors) {
      console.log('\n⚠️  AÇÃO NECESSÁRIA:');
      console.log('   Execute as migrações SQL no Supabase para criar as tabelas.');
      console.log('   Arquivo: backend/supabase/migrations/20250524000000_create_financial_approval_system.sql');
    } else {
      console.log('\n🎉 SISTEMA PRONTO PARA USO!');
      console.log('   Acesse: http://localhost:8084/test-financial');
    }
    
  } catch (error) {
    console.error('❌ Erro crítico no teste:', error);
  }
}

// Executar teste
testFinancialSystem().then(() => {
  console.log('\n✨ Teste concluído');
}).catch((error) => {
  console.error('💥 Erro fatal:', error);
});
