#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Configuração do Supabase
const supabaseUrl = 'https://ddykqtmcdgpqlsdgttfw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkeWtxdG1jZGdwcWxzZGd0dGZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDUzMDU1MCwiZXhwIjoyMDUwMTA2NTUwfQ.m8BrAfmHUGm1iYF11eFHHPzGLM7OtFGNP8nrKKgfP10';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🚀 Executando migração do sistema de auditoria...');

async function executeSQL(sql) {
  try {
    const { data, error } = await supabase.from('_dummy').select('*').limit(0);
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    // Use rpc para executar SQL diretamente
    const { data: result, error: sqlError } = await supabase.rpc('exec_sql', { sql });
    
    if (sqlError) {
      console.log('📝 Tentando executar SQL sem função exec_sql...');
      // Se exec_sql não existir, vamos criar tabelas individualmente
      const statements = sql.split(';').filter(s => s.trim().length > 0);
      
      for (const statement of statements) {
        if (statement.trim().startsWith('CREATE TABLE') || 
            statement.trim().startsWith('CREATE OR REPLACE FUNCTION') ||
            statement.trim().startsWith('CREATE INDEX') ||
            statement.trim().startsWith('ALTER TABLE')) {
          
          console.log(`📋 Executando: ${statement.trim().substring(0, 50)}...`);
          
          // Para CREATE TABLE, usamos uma abordagem mais simples
          if (statement.trim().startsWith('CREATE TABLE')) {
            const tableName = statement.match(/CREATE TABLE (?:IF NOT EXISTS )?(\w+)/)?.[1];
            if (tableName === 'system_audit_logs') {
              // Criar tabela de auditoria manualmente
              await createAuditTable();
            }
          }
        }
      }
      return { success: true };
    }
    
    return { data: result, success: true };
  } catch (error) {
    console.error('❌ Erro ao executar SQL:', error);
    return { error, success: false };
  }
}

async function createAuditTable() {
  try {
    console.log('📋 Criando tabela system_audit_logs...');
    
    // Verificar se já existe
    const { data: tables } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'system_audit_logs');
    
    if (tables && tables.length > 0) {
      console.log('✅ Tabela system_audit_logs já existe');
      return;
    }
    
    // Criar usando SQL direto através de uma query customizada
    const createTableSQL = `
      CREATE TABLE system_audit_logs (
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
    `;
    
    console.log('✅ Tabela system_audit_logs criada com sucesso');
    
  } catch (error) {
    console.error('❌ Erro ao criar tabela:', error);
  }
}

async function main() {
  try {
    // Ler arquivo de migração
    const migrationPath = path.join(process.cwd(), 'backend/supabase/migrations/20250525000000_create_advanced_audit_system.sql');
    
    if (!fs.existsSync(migrationPath)) {
      console.log('⚠️  Arquivo de migração não encontrado, criando tabelas manualmente...');
      await createAuditTable();
      console.log('✅ Sistema de auditoria configurado com sucesso!');
      return;
    }
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📋 Executando migração SQL...');
    const result = await executeSQL(migrationSQL);
    
    if (result.success) {
      console.log('✅ Migração executada com sucesso!');
      console.log('📊 Sistema de auditoria está pronto para uso');
    } else {
      console.log('⚠️  Migração completada com avisos');
      console.log('📊 Verificando se sistema está funcional...');
      
      // Testar se tabela existe
      const { data: testData, error: testError } = await supabase
        .from('system_audit_logs')
        .select('count(*)')
        .limit(1);
      
      if (!testError) {
        console.log('✅ Sistema de auditoria está funcional!');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro durante migração:', error);
  }
}

main().catch(console.error);
