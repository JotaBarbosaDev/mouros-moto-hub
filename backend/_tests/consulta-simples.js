// Versão mais simples para testar a consulta à tabela de membros
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente do arquivo .env
dotenv.config();

// Configurar cliente Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Credenciais do Supabase não estão configuradas. Por favor, verifique o arquivo .env');
}

console.log("✅ Supabase URL configurada:", supabaseUrl);
console.log("✅ Supabase Key configurada:", supabaseKey ? "Sim (valor ocultado)" : "Não");

const supabase = createClient(supabaseUrl, supabaseKey);

async function testarConsulta() {
  console.log("Iniciando consulta à tabela de membros...");

  try {
    // Consulta direta à tabela membros
    const { data: membersData, error } = await supabase
      .from('members')
      .select('*')
      .limit(2);

    if (error) {
      console.error("Erro ao buscar membros:", error);
      return;
    }

    console.log("\nResultado da consulta:");
    console.log("Número de registros retornados:", membersData?.length || 0);
    
    if (membersData && membersData.length > 0) {
      console.log("\nColunas disponíveis na tabela 'members':");
      const colunas = Object.keys(membersData[0]);
      colunas.sort().forEach(coluna => {
        const valor = membersData[0][coluna];
        const tipo = typeof valor;
        console.log(`- ${coluna}: ${tipo} ${valor !== null ? `= ${JSON.stringify(valor)}` : ''}`);
      });

      console.log("\nExemplo de um registro completo:");
      console.log(JSON.stringify(membersData[0], null, 2));
    } else {
      console.log("Nenhum registro encontrado na tabela 'members'");
    }
  } catch (e) {
    console.error("Erro ao executar consulta:", e);
  }
}

testarConsulta().catch(console.error);
