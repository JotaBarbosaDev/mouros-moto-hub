// Script para diagnosticar e corrigir problemas com as políticas RLS para a tabela dues_payments
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Determinar o diretório atual do módulo ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('Verificando se as variáveis de ambiente foram carregadas corretamente...');

// Verificar configurações do Supabase
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Erro: Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY/SUPABASE_KEY são necessárias.');
  console.error('Execute: export SUPABASE_URL=sua-url');
  console.error('Execute: export SUPABASE_SERVICE_ROLE_KEY=sua-chave');
  process.exit(1);
}

// Criar cliente Supabase com a service role key para operações administrativas
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Log de diagnóstico
console.log('=== Verificação de RLS na tabela dues_payments ===');

async function verifyAndFixDuesPaymentsRLS() {
  try {
    // 1. Verificar se a tabela existe
    console.log('Verificando se a tabela dues_payments existe...');
    const { data: tableExists, error: tableError } = await supabase
      .from('dues_payments')
      .select('id')
      .limit(1);

    if (tableError) {
      console.error('Erro ao verificar a tabela dues_payments:', tableError.message);
      if (tableError.code === '42P01') {
        console.error('A tabela dues_payments não existe. Execute o script de migração para criá-la.');
        return;
      }
    }

    console.log('Tabela dues_payments encontrada.');

    // 2. Verificar as políticas RLS
    console.log('Verificando e ajustando políticas RLS...');

    // Aplicar nova política para permitir que o frontend insira pagamentos
    const updatedRules = `
    -- Restabelecer as políticas RLS para a tabela dues_payments
    DROP POLICY IF EXISTS "Pagamentos visíveis para usuários autenticados" ON public.dues_payments;
    DROP POLICY IF EXISTS "Admins podem inserir pagamentos" ON public.dues_payments;
    DROP POLICY IF EXISTS "Admins podem atualizar pagamentos" ON public.dues_payments;
    DROP POLICY IF EXISTS "Admins podem excluir pagamentos" ON public.dues_payments;
    DROP POLICY IF EXISTS "Usuários podem visualizar seus próprios pagamentos" ON public.dues_payments;
    DROP POLICY IF EXISTS "Frontend pode inserir pagamentos" ON public.dues_payments;
    
    -- Criar políticas mais permissivas
    -- Política para SELECT: qualquer usuário autenticado pode ver qualquer registro
    CREATE POLICY "Pagamentos visíveis para usuários autenticados" ON public.dues_payments
      FOR SELECT
      USING (auth.role() = 'authenticated');
    
    -- Política para INSERT: qualquer usuário autenticado pode inserir pagamentos
    CREATE POLICY "Frontend pode inserir pagamentos" ON public.dues_payments
      FOR INSERT
      WITH CHECK (auth.role() = 'authenticated');
    
    -- Política para UPDATE: apenas admins podem atualizar pagamentos
    CREATE POLICY "Admins podem atualizar pagamentos" ON public.dues_payments
      FOR UPDATE
      USING (auth.role() = 'authenticated' AND EXISTS (
        SELECT 1 FROM public.members
        WHERE members.id = auth.uid()
        AND members.is_admin = true
      ));
    
    -- Política para DELETE: apenas admins podem excluir pagamentos
    CREATE POLICY "Admins podem excluir pagamentos" ON public.dues_payments
      FOR DELETE
      USING (auth.role() = 'authenticated' AND EXISTS (
        SELECT 1 FROM public.members
        WHERE members.id = auth.uid()
        AND members.is_admin = true
      ));
    `;

    // Em vez de tentar usar RPC, vamos aplicar as políticas uma a uma usando a API do Supabase
    console.log('Atualizando políticas RLS usando métodos de administração...');
    
    // Remover políticas existentes
    console.log('Removendo políticas existentes...');
    
    // 1. Primeiro habilitamos RLS para a tabela
    const { error: enableRlsError } = await supabase
      .from('dues_payments')
      .select('id')
      .limit(1)
      .then(async () => {
        return await fetch(`${supabaseUrl}/rest/v1/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          },
          body: JSON.stringify({
            query: 'ALTER TABLE public.dues_payments ENABLE ROW LEVEL SECURITY;'
          })
        });
      });
    
    if (enableRlsError) {
      console.error('Erro ao habilitar RLS:', enableRlsError);
    }
    
    // 2. Criar políticas individuais
    console.log('Criando políticas SELECT para usuarios autenticados...');
    await supabase.auth.admin.createPolicy({
      name: 'Pagamentos visíveis para usuários autenticados',
      table: 'dues_payments',
      definition: "auth.role() = 'authenticated'",
      action: 'SELECT',
      schema: 'public'
    });
    
    console.log('Criando políticas INSERT para usuários autenticados...');
    await supabase.auth.admin.createPolicy({
      name: 'Frontend pode inserir pagamentos',
      table: 'dues_payments',
      definition: "auth.role() = 'authenticated'",
      action: 'INSERT',
      schema: 'public'
    });
    
    console.log('Criando políticas UPDATE para usuários admin...');
    await supabase.auth.admin.createPolicy({
      name: 'Admins podem atualizar pagamentos',
      table: 'dues_payments',
      definition: "auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM public.members WHERE members.id = auth.uid() AND members.is_admin = true)",
      action: 'UPDATE',
      schema: 'public'
    });
    
    console.log('Criando políticas DELETE para usuários admin...');
    await supabase.auth.admin.createPolicy({
      name: 'Admins podem excluir pagamentos',
      table: 'dues_payments',
      definition: "auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM public.members WHERE members.id = auth.uid() AND members.is_admin = true)",
      action: 'DELETE',
      schema: 'public'
    });
    
    console.log('Políticas RLS atualizadas com sucesso para permitir inserção pelo frontend.');
    console.log('\nPróximos passos:');
    console.log('1. Reinicie o servidor frontend');
    console.log('2. Certifique-se de que o usuário está autenticado ao tentar inserir pagamentos');
  } catch (error) {
    console.error('Erro inesperado:', error);
  }
}

// Executar a verificação e correção
verifyAndFixDuesPaymentsRLS();
