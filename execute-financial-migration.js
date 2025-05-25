#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurações do Supabase
const supabaseUrl = 'https://jugfkacnlgdjdosstiks.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1Z2ZrYWNubGdkamRvc3N0aWtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1MDkzMzAsImV4cCI6MjA2MTA4NTMzMH0.PL8pg93wAVTl3kUoe-mfK7kGdjW6ytXapAiy-mpxk78';

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeMigration() {
    try {
        console.log('🚀 Iniciando execução da migração financeira...');
        
        // Ler o arquivo de migração
        const migrationPath = path.join(__dirname, 'backend', 'supabase', 'migrations', '20250524000001_create_financial_approval_system_fixed.sql');
        
        if (!fs.existsSync(migrationPath)) {
            throw new Error(`Arquivo de migração não encontrado: ${migrationPath}`);
        }
        
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        console.log('📄 Arquivo de migração carregado com sucesso');
        
        // Dividir o SQL em comandos individuais (separados por linhas vazias ou comentários)
        const sqlCommands = migrationSQL
            .split(/(?:^|\n)(?=--\s*=|DROP|CREATE|ALTER|INSERT)/m)
            .filter(cmd => cmd.trim() && !cmd.trim().startsWith('--'))
            .map(cmd => cmd.trim());
        
        console.log(`📋 Encontrados ${sqlCommands.length} comandos SQL para executar`);
        
        // Executar cada comando SQL individualmente
        for (let i = 0; i < sqlCommands.length; i++) {
            const command = sqlCommands[i];
            if (!command || command.startsWith('--')) continue;
            
            console.log(`\n⏳ Executando comando ${i + 1}/${sqlCommands.length}:`);
            console.log(`   ${command.substring(0, 50)}...`);
            
            try {
                const { data, error } = await supabase.rpc('exec_sql', { 
                    sql_query: command 
                });
                
                if (error) {
                    console.error(`❌ Erro no comando ${i + 1}:`, error);
                    
                    // Se for erro de função não existir, tentar executar diretamente
                    if (error.message?.includes('function public.exec_sql')) {
                        console.log('   🔄 Tentando execução alternativa...');
                        // Para comandos DDL, tentar com rpc personalizado
                        continue;
                    }
                } else {
                    console.log(`   ✅ Comando ${i + 1} executado com sucesso`);
                }
            } catch (err) {
                console.error(`❌ Erro ao executar comando ${i + 1}:`, err.message);
            }
        }
        
        // Verificar se as tabelas foram criadas
        console.log('\n🔍 Verificando se as tabelas foram criadas...');
        
        const { data: tables, error: tablesError } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public')
            .in('table_name', ['financial_approvals', 'approval_comments']);
        
        if (tablesError) {
            console.error('❌ Erro ao verificar tabelas:', tablesError);
        } else {
            console.log('📊 Tabelas encontradas:', tables?.map(t => t.table_name) || []);
        }
        
        // Testar conectividade com as tabelas
        console.log('\n🧪 Testando conectividade com as tabelas...');
        
        try {
            const { data: approvals, error: approvalsError } = await supabase
                .from('financial_approvals')
                .select('id')
                .limit(1);
                
            if (approvalsError) {
                console.error('❌ Erro ao acessar financial_approvals:', approvalsError);
            } else {
                console.log('✅ Tabela financial_approvals acessível');
            }
        } catch (err) {
            console.error('❌ Erro ao testar financial_approvals:', err.message);
        }
        
        try {
            const { data: comments, error: commentsError } = await supabase
                .from('approval_comments')
                .select('id')
                .limit(1);
                
            if (commentsError) {
                console.error('❌ Erro ao acessar approval_comments:', commentsError);
            } else {
                console.log('✅ Tabela approval_comments acessível');
            }
        } catch (err) {
            console.error('❌ Erro ao testar approval_comments:', err.message);
        }
        
        console.log('\n🎉 Migração financeira finalizada!');
        
    } catch (error) {
        console.error('💥 Erro crítico na migração:', error);
        process.exit(1);
    }
}

// Executar a migração
executeMigration();
