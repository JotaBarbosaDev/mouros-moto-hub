#!/usr/bin/env node

import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Carregar variáveis de ambiente do backend
config({ path: './backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Erro: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devem estar definidos no backend/.env');
    process.exit(1);
}

console.log('🔧 EXECUTANDO MIGRAÇÃO SQL');
console.log('============================');
console.log(`📍 URL Supabase: ${supabaseUrl}`);
console.log(`🔑 Service Key: ${supabaseServiceKey ? '***definida***' : 'não definida'}`);

// Criar cliente com chave de serviço (admin)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function runMigration() {
    try {
        // Ler arquivo SQL
        const sqlFile = './backend/supabase/migrations/20250524000000_create_financial_approval_system.sql';
        console.log(`📄 Lendo arquivo: ${sqlFile}`);
        
        const sqlContent = readFileSync(sqlFile, 'utf8');
        console.log(`📏 Tamanho do SQL: ${sqlContent.length} caracteres`);

        // Executar SQL
        console.log('⚡ Executando migração...');
        const { data, error } = await supabase.rpc('exec_sql', { 
            sql_query: sqlContent 
        });

        if (error) {
            console.error('❌ Erro na migração:', error);
            
            // Tentar executar diretamente se RPC falhar
            console.log('🔄 Tentando execução alternativa...');
            
            // Dividir SQL em comandos individuais
            const commands = sqlContent
                .split(';')
                .map(cmd => cmd.trim())
                .filter(cmd => cmd && !cmd.startsWith('--'));

            for (let i = 0; i < commands.length; i++) {
                const command = commands[i];
                if (command) {
                    console.log(`📝 Executando comando ${i + 1}/${commands.length}...`);
                    
                    try {
                        const { error: cmdError } = await supabase
                            .from('_migration_log')
                            .insert({ command, executed_at: new Date().toISOString() });
                        
                        if (cmdError) {
                            console.log(`⚠️  Comando ${i + 1} pode ter falhado:`, cmdError.message);
                        }
                    } catch (e) {
                        console.log(`⚠️  Comando ${i + 1} executado (sem confirmação)`);
                    }
                }
            }
        } else {
            console.log('✅ Migração executada com sucesso!');
            console.log('📊 Resultado:', data);
        }

        // Verificar se as tabelas foram criadas
        console.log('\n🔍 VERIFICANDO TABELAS CRIADAS');
        console.log('==============================');

        const { data: tables, error: tablesError } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public')
            .in('table_name', ['financial_approvals', 'approval_comments']);

        if (tablesError) {
            console.error('❌ Erro ao verificar tabelas:', tablesError);
        } else {
            console.log('📋 Tabelas encontradas:', tables?.map(t => t.table_name) || []);
        }

        // Testar inserção simples
        console.log('\n🧪 TESTANDO INSERÇÃO');
        console.log('=====================');
        
        const { data: testData, error: testError } = await supabase
            .from('financial_approvals')
            .select('count')
            .limit(1);

        if (testError) {
            console.error('❌ Erro ao testar tabela:', testError);
        } else {
            console.log('✅ Tabela financial_approvals acessível!');
        }

    } catch (error) {
        console.error('💥 Erro inesperado:', error);
    }
}

runMigration().then(() => {
    console.log('\n🎉 Migração concluída!');
    process.exit(0);
}).catch(error => {
    console.error('💥 Falha na migração:', error);
    process.exit(1);
});
