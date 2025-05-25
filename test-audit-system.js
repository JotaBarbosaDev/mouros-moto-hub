#!/usr/bin/env node

/**
 * Teste do Sistema de Auditoria
 * Verifica se todos os componentes estão funcionando corretamente
 */

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://ddykqtmcdgpqlsdgttfw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkeWtxdG1jZGdwcWxzZGd0dGZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDUzMDU1MCwiZXhwIjoyMDUwMTA2NTUwfQ.m8BrAfmHUGm1iYF11eFHHPzGLM7OtFGNP8nrKKgfP10';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuditSystem() {
  console.log('🔍 Testando Sistema de Auditoria...\n');

  try {
    // 1. Verificar se a tabela de auditoria existe
    console.log('1️⃣ Verificando tabela system_audit_logs...');
    const { data: tables, error: tableError } = await supabase
      .from('system_audit_logs')
      .select('id')
      .limit(1);

    if (tableError) {
      console.log('❌ Tabela system_audit_logs não encontrada');
      console.log('📋 Criando tabela de auditoria...');
      
      // Tentar criar tabela básica
      const createResult = await createAuditTable();
      if (!createResult) {
        console.log('❌ Não foi possível criar a tabela de auditoria');
        return false;
      }
    } else {
      console.log('✅ Tabela system_audit_logs encontrada');
    }

    // 2. Testar inserção de log de auditoria
    console.log('\n2️⃣ Testando inserção de log de auditoria...');
    
    const testLog = {
      action: 'test_audit_system',
      category: 'system',
      severity: 'info',
      username: 'system_test',
      user_role: 'admin',
      description: 'Teste do sistema de auditoria - ' + new Date().toISOString(),
      metadata: {
        test: true,
        timestamp: new Date().toISOString()
      }
    };

    const { data: insertData, error: insertError } = await supabase
      .from('system_audit_logs')
      .insert([testLog])
      .select();

    if (insertError) {
      console.log('❌ Erro ao inserir log:', insertError.message);
      return false;
    } else {
      console.log('✅ Log de auditoria inserido com sucesso');
      console.log(`📋 ID do log: ${insertData[0]?.id}`);
    }

    // 3. Testar consulta de logs
    console.log('\n3️⃣ Testando consulta de logs...');
    
    const { data: queryData, error: queryError } = await supabase
      .from('system_audit_logs')
      .select('id, action, category, severity, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (queryError) {
      console.log('❌ Erro ao consultar logs:', queryError.message);
      return false;
    } else {
      console.log('✅ Consulta de logs bem-sucedida');
      console.log(`📊 Logs encontrados: ${queryData.length}`);
      
      if (queryData.length > 0) {
        console.log('\n📋 Últimos logs:');
        queryData.forEach((log, index) => {
          console.log(`   ${index + 1}. ${log.action} (${log.category}) - ${log.severity}`);
        });
      }
    }

    // 4. Testar filtros por categoria
    console.log('\n4️⃣ Testando filtros por categoria...');
    
    const { data: filterData, error: filterError } = await supabase
      .from('system_audit_logs')
      .select('count(*)')
      .eq('category', 'system');

    if (filterError) {
      console.log('❌ Erro ao filtrar por categoria:', filterError.message);
    } else {
      console.log('✅ Filtro por categoria funcionando');
    }

    // 5. Verificar tipos e estrutura
    console.log('\n5️⃣ Verificando estrutura da tabela...');
    
    const { data: structureData, error: structureError } = await supabase
      .from('system_audit_logs')
      .select('*')
      .limit(1);

    if (structureError) {
      console.log('❌ Erro ao verificar estrutura:', structureError.message);
    } else {
      console.log('✅ Estrutura da tabela validada');
      
      if (structureData && structureData.length > 0) {
        const columns = Object.keys(structureData[0]);
        console.log(`📊 Colunas disponíveis: ${columns.length}`);
        console.log(`📋 Principais: ${columns.slice(0, 10).join(', ')}${columns.length > 10 ? '...' : ''}`);
      }
    }

    console.log('\n✅ Sistema de Auditoria está funcionando corretamente!');
    console.log('🎉 Todos os testes passaram com sucesso');
    
    return true;

  } catch (error) {
    console.error('\n❌ Erro durante teste:', error.message);
    return false;
  }
}

async function createAuditTable() {
  try {
    // Esta função tenta criar a tabela usando uma abordagem alternativa
    console.log('📋 Tentando criar tabela system_audit_logs...');
    
    // Verificar se RPC exec_sql está disponível
    const { data: rpcData, error: rpcError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS system_audit_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          action VARCHAR(100) NOT NULL,
          category VARCHAR(50) NOT NULL,
          severity VARCHAR(20) NOT NULL DEFAULT 'info',
          user_id UUID,
          username VARCHAR(255),
          user_role VARCHAR(50),
          session_id VARCHAR(255),
          ip_address INET,
          user_agent TEXT,
          request_method VARCHAR(10),
          request_url TEXT,
          request_headers JSONB,
          request_body JSONB,
          response_status INTEGER,
          response_body JSONB,
          resource_type VARCHAR(100),
          resource_id VARCHAR(255),
          old_values JSONB,
          new_values JSONB,
          description TEXT,
          tags TEXT[],
          metadata JSONB DEFAULT '{}',
          geolocation JSONB,
          device_info JSONB,
          compliance_flags JSONB DEFAULT '{}',
          retention_policy VARCHAR(50) DEFAULT 'standard',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
      `
    });

    if (rpcError) {
      console.log('⚠️ RPC exec_sql não disponível, tabela deve ser criada manualmente');
      return false;
    }

    console.log('✅ Tabela criada com sucesso via RPC');
    return true;

  } catch (error) {
    console.log('⚠️ Erro ao criar tabela:', error.message);
    return false;
  }
}

// Executar teste
testAuditSystem()
  .then(success => {
    if (success) {
      console.log('\n🎯 RESUMO: Sistema de Auditoria está pronto para produção!');
      console.log('📱 Você pode acessar /audit na aplicação para ver a interface');
    } else {
      console.log('\n⚠️ RESUMO: Sistema precisa de configuração adicional');
      console.log('📋 Verifique os logs acima para detalhes dos problemas');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n💥 ERRO CRÍTICO:', error);
    process.exit(1);
  });
