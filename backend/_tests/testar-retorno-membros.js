// Teste para verificar o que é retornado da tabela de membros
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Configuração do Supabase - Usar variáveis de ambiente ou arquivo .env
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

console.log("Supabase URL:", SUPABASE_URL ? "Configurada" : "Não configurada");
console.log("Supabase Key:", SUPABASE_ANON_KEY ? "Configurada" : "Não configurada");

// Criar cliente Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testarRetornoMembros() {
  try {
    console.log("🔍 Testando retorno da tabela de membros...");
    
    // Consulta direta à tabela membros
    const { data: membersData, error } = await supabase
      .from('members')
      .select('*')
      .limit(1);

    if (error) {
      console.error("❌ Erro ao buscar membros:", error);
      return;
    }
      
    console.log("\n📊 Estrutura do registro retornado (colunas disponíveis):");
    if (membersData && membersData.length > 0) {
      const colunas = Object.keys(membersData[0]);
      colunas.sort().forEach(coluna => {
        console.log(`- ${coluna}: ${typeof membersData[0][coluna]}`);
      });
      
      // Salvar resultado completo em um arquivo JSON para análise
      const resultadoDetalhado = {
        schema: colunas.reduce((acc, col) => {
          acc[col] = typeof membersData[0][col];
          return acc;
        }, {}),
        exemplo: membersData[0],
      };
      
      fs.writeFileSync(
        path.join(process.cwd(), 'retorno-membro-estrutura.json'),
        JSON.stringify(resultadoDetalhado, null, 2)
      );
      console.log("\n✅ Detalhes completos salvos em 'retorno-membro-estrutura.json'");
    } else {
      console.log("⚠️ Nenhum membro encontrado no banco de dados");
    }

    // Agora tentar com o modo verboso para ver dados reais
    console.log("\n🔍 Buscando dados com o método getMembersFromDb da aplicação:");
    
    // Tentar importar o serviço que contém a função getMembersFromDb
    try {
      const { getMembersFromDb } = await import('./src/services/member-service-robust.js');
      const membros = await getMembersFromDb();
      console.log(`\n✅ Retornados ${membros.length} membros no total`);
      
      if (membros.length > 0) {
        console.log("\n📊 Estrutura do objeto MemberExtended retornado pela função:");
        const primeiroMembro = membros[0];
        Object.keys(primeiroMembro).sort().forEach(prop => {
          if (typeof primeiroMembro[prop] === 'object' && primeiroMembro[prop] !== null) {
            console.log(`- ${prop}: [${typeof primeiroMembro[prop]}]`);
          } else {
            console.log(`- ${prop}: ${typeof primeiroMembro[prop]} = ${JSON.stringify(primeiroMembro[prop])}`);
          }
        });
        
        // Salvar um exemplo completo em formato JSON
        fs.writeFileSync(
          path.join(process.cwd(), 'retorno-membro-exemplo.json'),
          JSON.stringify({
            dadosOriginais: membersData[0], 
            dadosProcessados: primeiroMembro
          }, null, 2)
        );
      }
    } catch (importError) {
      console.error("❌ Não foi possível importar getMembersFromDb:", importError);
    }
  } catch (e) {
    console.error("❌ Erro geral:", e);
  }
}

testarRetornoMembros().catch(console.error);
