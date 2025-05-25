import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Configurar Supabase
const supabaseUrl = 'https://jugfkacnlgdjdosstiks.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1Z2ZrYWNubGdkamRvc3N0aWtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1MDkzMzAsImV4cCI6MjA2MTA4NTMzMH0.PL8pg93wAVTl3kUoe-mfK7kGdjW6ytXapAiy-mpxk78';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createVehiclesTable() {
  console.log('🚀 Iniciando criação da tabela vehicles...');

  // Ler o arquivo SQL
  const sqlContent = fs.readFileSync('/Users/joaobarbosa/Desktop/projetos/mouros-moto-hub/execute-vehicles-sql.sql', 'utf8');
  
  // Dividir em comandos individuais (separados por ;)
  const sqlCommands = sqlContent
    .split(';')
    .map(cmd => cmd.trim())
    .filter(cmd => cmd && !cmd.startsWith('--') && cmd !== '');

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < sqlCommands.length; i++) {
    const command = sqlCommands[i];
    if (!command) continue;
    
    try {
      console.log(`📝 Executando comando ${i + 1}/${sqlCommands.length}...`);
      
      // Executar comando SQL
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: command
      });
      
      if (error) {
        console.error(`❌ Erro no comando ${i + 1}:`, error.message);
        errorCount++;
      } else {
        console.log(`✅ Comando ${i + 1} executado com sucesso`);
        successCount++;
      }
    } catch (err) {
      console.error(`❌ Erro inesperado no comando ${i + 1}:`, err.message);
      errorCount++;
    }
  }
  
  console.log(`\n📊 Resumo da execução:`);
  console.log(`✅ Comandos bem-sucedidos: ${successCount}`);
  console.log(`❌ Comandos com erro: ${errorCount}`);
  
  // Verificar se a tabela foi criada
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Tabela vehicles não foi criada:', error.message);
    } else {
      console.log('🎉 Tabela vehicles criada com sucesso!');
      
      // Verificar estrutura da tabela
      const { data: columns } = await supabase.rpc('exec_sql', {
        sql: `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_schema = 'public' AND table_name = 'vehicles'
          ORDER BY ordinal_position
        `
      });
      
      if (columns && columns.length > 0) {
        console.log('\n📋 Estrutura da tabela vehicles:');
        columns.forEach(col => {
          console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
        });
      }
    }
  } catch (err) {
    console.error('❌ Erro ao verificar tabela:', err.message);
  }
}

// Executar
createVehiclesTable().catch(console.error);
