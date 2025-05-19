#!/bin/bash
# filepath: /Users/joaobarbosa/Desktop/projetos/mouros-moto-hub/direct-pgsql-fix.sh

# Script para resolver os problemas RLS usando conexão direta ao PostgreSQL

# Cores para saída mais legível
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Tentando solução alternativa usando conexão direta ao PostgreSQL ===${NC}"

# Carregando variáveis de ambiente do arquivo .env
echo "Carregando variáveis de ambiente do arquivo .env..."
if [ -f .env ]; then
    source .env
else
    echo -e "${RED}Arquivo .env não encontrado!${NC}"
    exit 1
fi

# Extrair informações de conexão do URI de banco de dados
echo -e "${YELLOW}Precisamos dos detalhes da conexão PostgreSQL do seu projeto Supabase.${NC}"
echo "Por favor, forneça as seguintes informações (encontradas no painel do Supabase):"
read -p "Host do banco de dados (ex: db.jugfkacnlgdjdosstiks.supabase.co): " DB_HOST
read -p "Nome do banco de dados (ex: postgres): " DB_NAME
read -p "Porta (geralmente 5432): " DB_PORT
read -p "Usuário (ex: postgres): " DB_USER
read -s -p "Senha: " DB_PASSWORD
echo ""

# Testar conexão
echo -e "${YELLOW}Testando conexão com o banco de dados...${NC}"
if ! command -v psql &> /dev/null; then
    echo -e "${RED}O comando psql não foi encontrado. Por favor, instale o cliente PostgreSQL.${NC}"
    exit 1
fi

# Criar um arquivo temporário com os comandos SQL
TMP_FILE=$(mktemp)

cat > $TMP_FILE << EOF
-- Verifique se a tabela dues_payments existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'dues_payments'
);

-- Se não existir, crie a tabela
CREATE TABLE IF NOT EXISTS public.dues_payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  paid BOOLEAN NOT NULL DEFAULT false,
  exempt BOOLEAN NOT NULL DEFAULT false, 
  payment_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(member_id, year)
);

-- Habilitar RLS e configurar políticas
ALTER TABLE public.dues_payments ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes
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

-- Verificar as políticas
SELECT * FROM pg_policies WHERE tablename = 'dues_payments';
EOF

# Executar os comandos SQL
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -d $DB_NAME -U $DB_USER -f $TMP_FILE

# Limpar o arquivo temporário
rm $TMP_FILE

echo -e "${GREEN}Configuração concluída!${NC}"
echo "Por favor, reinicie seu aplicativo frontend e tente novamente as operações."
