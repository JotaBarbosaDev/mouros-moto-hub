#!/bin/bash
# Script para criar a função exec_sql e corrigir as tabelas

echo "🔧 Criando função exec_sql e corrigindo tabelas..."

# Obter credenciais do arquivo .env.local do frontend
if [ -f "/Users/joaobarbosa/Desktop/projetos/mouros-moto-hub/frontend/.env.local" ]; then
  echo "📋 Lendo credenciais do arquivo .env.local do frontend..."
  
  # Extrair credenciais
  SUPABASE_URL=$(grep VITE_SUPABASE_URL /Users/joaobarbosa/Desktop/projetos/mouros-moto-hub/frontend/.env.local | cut -d '=' -f2 | tr -d '"' | tr -d "'" | tr -d ' ')
  SUPABASE_KEY=$(grep VITE_SUPABASE_ANON_KEY /Users/joaobarbosa/Desktop/projetos/mouros-moto-hub/frontend/.env.local | cut -d '=' -f2 | tr -d '"' | tr -d "'" | tr -d ' ')
  
  # Extrair host do Supabase da URL
  SUPABASE_HOST=$(echo $SUPABASE_URL | sed 's|^https\?://||' | sed 's|/.*||')
  
  if [ -z "$SUPABASE_HOST" ] || [ -z "$SUPABASE_KEY" ]; then
    echo "❌ Não foi possível extrair as credenciais corretamente!"
    exit 1
  fi
  
  echo "🔑 Credenciais extraídas com sucesso: URL=$SUPABASE_HOST"
else
  echo "❌ Arquivo .env.local não encontrado no frontend!"
  exit 1
fi

# Criar a função exec_sql
echo "🚀 Criando função exec_sql..."
PGPASSWORD=$SUPABASE_KEY psql -h $SUPABASE_HOST -U postgres -d postgres -f "/Users/joaobarbosa/Desktop/projetos/mouros-moto-hub/frontend/exec_sql_function.sql"

# Criar arquivo SQL temporário para corrigir as tabelas
TMP_SQL_FILE=$(mktemp)
cat > "$TMP_SQL_FILE" << 'EOL'
-- Script para corrigir as tabelas

-- Parte 1: Adicionar a coluna engine_size à tabela vehicles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'vehicles'
    AND column_name = 'engine_size'
  ) THEN
    ALTER TABLE public.vehicles ADD COLUMN engine_size INTEGER;
    RAISE NOTICE 'Coluna engine_size adicionada à tabela vehicles';
    
    -- Atualizar valores existentes
    UPDATE public.vehicles SET engine_size = displacement WHERE engine_size IS NULL AND displacement IS NOT NULL;
    RAISE NOTICE 'Valores da coluna engine_size atualizados com base em displacement';
  ELSE
    RAISE NOTICE 'Coluna engine_size já existe na tabela vehicles';
  END IF;
END $$;

-- Parte 2: Criar tabela activity_logs se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'activity_logs'
  ) THEN
    CREATE TABLE public.activity_logs (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID,
      username VARCHAR(255),
      action VARCHAR(50) NOT NULL,
      entity_type VARCHAR(50) NOT NULL,
      entity_id UUID,
      details JSONB,
      ip_address VARCHAR(45),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
    
    -- Garantir que RLS esteja ativado
    ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
    
    -- Conceder permissões para os perfis do Supabase
    GRANT SELECT, INSERT ON public.activity_logs TO authenticated;
    GRANT SELECT ON public.activity_logs TO anon;
    
    -- Políticas de segurança para a tabela de logs:
    -- Qualquer usuário autenticado pode inserir logs
    CREATE POLICY insert_logs_policy ON public.activity_logs FOR INSERT TO authenticated WITH CHECK (true);
    
    -- Somente administradores podem ver todos os logs
    CREATE POLICY select_logs_policy ON public.activity_logs FOR SELECT TO authenticated USING (
      auth.uid() IN (
        SELECT id FROM public.members WHERE is_admin = true
      )
    );
    
    RAISE NOTICE 'Tabela activity_logs criada com sucesso';
  ELSE
    RAISE NOTICE 'Tabela activity_logs já existe';
  END IF;
END $$;

-- Verificar as alterações realizadas
SELECT 'Verificação da coluna engine_size:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'vehicles'
AND column_name = 'engine_size';

SELECT 'Verificação da tabela activity_logs:' as info;
SELECT table_name, table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'activity_logs';
EOL

# Executar o script SQL
echo "🔧 Executando correções de tabelas..."
PGPASSWORD=$SUPABASE_KEY psql -h $SUPABASE_HOST -U postgres -d postgres -f "$TMP_SQL_FILE"

# Remover arquivo temporário
rm "$TMP_SQL_FILE"

echo "✅ Operação concluída com sucesso!"
