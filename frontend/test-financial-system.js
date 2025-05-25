// Teste básico de conectividade do Sistema de Aprovação Financeira
import { supabase } from './src/integrations/supabase/client.js';

async function testFinancialSystem() {
  console.log('🧪 TESTANDO SISTEMA DE APROVAÇÃO FINANCEIRA');
  console.log('===========================================');

  try {
    // 1. Testar conexão
    console.log('\n1. Testando conexão com Supabase...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('   Usuário logado:', user ? `${user.email}` : 'Nenhum usuário');

    // 2. Testar se as tabelas existem
    console.log('\n2. Verificando existência das tabelas...');
    
    // Testar tabela financial_approvals
    const { count: approvalsCount, error: approvalsError } = await supabase
      .from('financial_approvals')
      .select('*', { count: 'exact', head: true });
    
    if (approvalsError) {
      console.log('   ❌ Tabela financial_approvals:', approvalsError.message);
    } else {
      console.log('   ✅ Tabela financial_approvals:', `${approvalsCount} registros`);
    }

    // Testar tabela approval_comments
    const { count: commentsCount, error: commentsError } = await supabase
      .from('approval_comments')
      .select('*', { count: 'exact', head: true });
    
    if (commentsError) {
      console.log('   ❌ Tabela approval_comments:', commentsError.message);
    } else {
      console.log('   ✅ Tabela approval_comments:', `${commentsCount} registros`);
    }

    // 3. Testar criação de uma aprovação (se usuário estiver logado)
    if (user) {
      console.log('\n3. Testando criação de aprovação...');
      
      const { data: newApproval, error: createError } = await supabase
        .from('financial_approvals')
        .insert({
          title: 'Teste Sistema - ' + new Date().toISOString(),
          description: 'Aprovação criada automaticamente para teste do sistema',
          total_amount: 100.50,
          currency: 'EUR',
          item_type: 'test',
          creator_id: user.id,
          status: 'draft'
        })
        .select()
        .single();

      if (createError) {
        console.log('   ❌ Erro ao criar aprovação:', createError.message);
      } else {
        console.log('   ✅ Aprovação criada com sucesso:', newApproval.id);
        
        // Testar busca da aprovação criada
        const { data: fetchedApproval, error: fetchError } = await supabase
          .from('financial_approvals')
          .select('*')
          .eq('id', newApproval.id)
          .single();
        
        if (fetchError) {
          console.log('   ❌ Erro ao buscar aprovação:', fetchError.message);
        } else {
          console.log('   ✅ Aprovação recuperada:', fetchedApproval.title);
        }
      }
    } else {
      console.log('\n3. ⚠️  Usuário não logado - não foi possível testar criação');
    }

    console.log('\n🎉 TESTE CONCLUÍDO');
    
  } catch (error) {
    console.error('❌ Erro geral no teste:', error);
  }
}

// Executar teste
testFinancialSystem();
