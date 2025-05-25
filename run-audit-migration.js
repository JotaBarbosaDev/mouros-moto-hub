import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config();

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas!');
  console.log('Necessário: VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runAuditMigration() {
  try {
    console.log('🚀 Iniciando migração do sistema de auditoria...');
    
    // Ler o arquivo de migração
    const migrationPath = path.join(__dirname, 'backend/supabase/migrations/20250525000000_create_advanced_audit_system.sql');
    
    if (!fs.existsSync(migrationPath)) {
      console.error(`❌ Arquivo de migração não encontrado: ${migrationPath}`);
      process.exit(1);
    }
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Executar a migração
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });
    
    if (error) {
      console.error('❌ Erro ao executar migração:', error.message);
      console.error('Detalhes:', error);
      process.exit(1);
    }
    
    console.log('✅ Migração do sistema de auditoria executada com sucesso!');
    console.log('📊 Tabelas criadas:');
    console.log('   - system_audit_logs');
    console.log('   - audit_log_access_rules');
    console.log('   - audit_alert_rules');
    console.log('🔒 Políticas RLS aplicadas');
    console.log('🔧 Funções GDPR criadas');
    
  } catch (error) {
    console.error('❌ Erro geral na migração:', error.message);
    process.exit(1);
  }
}

// Executar migração
runAuditMigration();
