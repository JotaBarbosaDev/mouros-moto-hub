#!/bin/bash
# filepath: /Users/joaobarbosa/Desktop/projetos/mouros-moto-hub/fix-dues-payments-rls.sh
# Script para corrigir políticas RLS na tabela dues_payments

# Cores para melhor formatação da saída
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Verificação de RLS na tabela dues_payments ===${NC}"

# Carregando variáveis de ambiente do arquivo .env
echo "Carregando variáveis de ambiente do arquivo .env..."
if [ -f .env ]; then
    source .env
else
    echo -e "${RED}Arquivo .env não encontrado!${NC}"
fi

# Verificar configurações do Supabase
SUPABASE_URL=${SUPABASE_URL:-$VITE_SUPABASE_URL}
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY:-$SUPABASE_KEY}

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo -e "${RED}Erro: Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são necessárias.${NC}"
  echo "Execute: export SUPABASE_URL=sua-url"
  echo "Execute: export SUPABASE_SERVICE_ROLE_KEY=sua-chave"
  exit 1
fi

# Função para executar SQL no Supabase
exec_sql() {
  local sql="$1"
  local escaped_sql=$(echo "$sql" | sed 's/"/\\"/g')
  
  # Usar curl para executar SQL diretamente no PostgreSQL
  curl -s -X POST \
    -H "Content-Type: application/json" \
    -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
    --data "{\"query\": \"$escaped_sql\"}" \
    "${SUPABASE_URL}/rest/v1/rpc/exec" | jq '.'
}

# Verificar se a tabela existe
echo -e "${YELLOW}Verificando se a tabela 'dues_payments' existe...${NC}"
TABLE_EXISTS=$(exec_sql "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'dues_payments') as exists;")

if [[ $TABLE_EXISTS == *"true"* ]]; then
  echo -e "${GREEN}Tabela dues_payments encontrada!${NC}"
else
  echo -e "${RED}A tabela dues_payments não existe. Execute o script de migração para criá-la.${NC}"
  exit 1
fi

# Remover políticas existentes e criar novas
echo -e "${YELLOW}Atualizando políticas RLS...${NC}"

SQL_CONTENT="
-- Habilitar RLS para a tabela
ALTER TABLE public.dues_payments ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes
DROP POLICY IF EXISTS \"Pagamentos visíveis para usuários autenticados\" ON public.dues_payments;
DROP POLICY IF EXISTS \"Admins podem inserir pagamentos\" ON public.dues_payments;
DROP POLICY IF EXISTS \"Admins podem atualizar pagamentos\" ON public.dues_payments;
DROP POLICY IF EXISTS \"Admins podem excluir pagamentos\" ON public.dues_payments;
DROP POLICY IF EXISTS \"Usuários podem visualizar seus próprios pagamentos\" ON public.dues_payments;
DROP POLICY IF EXISTS \"Frontend pode inserir pagamentos\" ON public.dues_payments;

-- Criar políticas mais permissivas
-- Política para SELECT: qualquer usuário autenticado pode ver qualquer registro
CREATE POLICY \"Pagamentos visíveis para usuários autenticados\" ON public.dues_payments
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Política para INSERT: qualquer usuário autenticado pode inserir pagamentos
CREATE POLICY \"Frontend pode inserir pagamentos\" ON public.dues_payments
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Política para UPDATE: apenas admins podem atualizar pagamentos
CREATE POLICY \"Admins podem atualizar pagamentos\" ON public.dues_payments
  FOR UPDATE
  USING (auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM public.members
    WHERE members.id = auth.uid()
    AND members.is_admin = true
  ));

-- Política para DELETE: apenas admins podem excluir pagamentos
CREATE POLICY \"Admins podem excluir pagamentos\" ON public.dues_payments
  FOR DELETE
  USING (auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM public.members
    WHERE members.id = auth.uid()
    AND members.is_admin = true
  ));
"

# Executar cada consulta SQL separadamente
echo -e "${YELLOW}Aplicando políticas RLS...${NC}"

# Executar o SQL para atualizar políticas
RESULT=$(exec_sql "$SQL_CONTENT")
echo "$RESULT"

# Verificar se as políticas foram aplicadas com sucesso
POLICIES=$(exec_sql "SELECT * FROM pg_policies WHERE tablename = 'dues_payments';")

if [[ $POLICIES == *"Frontend pode inserir pagamentos"* ]]; then
  echo -e "${GREEN}Políticas RLS atualizadas com sucesso para permitir inserção pelo frontend.${NC}"
else
  echo -e "${RED}Falha ao aplicar todas as políticas RLS. Verificar erros acima.${NC}"
fi

echo -e "${YELLOW}Próximos passos:${NC}"
echo "1. Reinicie o servidor frontend"
echo "2. Certifique-se de que o usuário está autenticado ao tentar inserir pagamentos"
