#!/bin/bash
# Script alternativo para criar a tabela activity_logs diretamente via API REST do Supabase

# Definir cores para saída
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=========================================================${NC}"
echo -e "${YELLOW}      CRIANDO TABELA DE LOGS DE ATIVIDADE NO SUPABASE     ${NC}"
echo -e "${YELLOW}=========================================================${NC}"

# Verificar se o arquivo .env existe no frontend
if [ ! -f ./frontend/.env ]; then
  echo -e "${RED}❌ Arquivo .env não encontrado no diretório frontend!${NC}"
  exit 1
fi

# Extrair credenciais do Supabase do arquivo .env
SUPABASE_URL=$(grep VITE_SUPABASE_URL ./frontend/.env | cut -d '=' -f2)
SUPABASE_KEY=$(grep VITE_SUPABASE_ANON_KEY ./frontend/.env | cut -d '=' -f2)

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
  echo -e "${RED}❌ Credenciais do Supabase não encontradas nos arquivos .env!${NC}"
  echo -e "Verifique se as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão definidas."
  exit 1
fi

echo -e "${GREEN}✅ Credenciais do Supabase encontradas.${NC}"
echo -e "URL do Supabase: $SUPABASE_URL"

# Verificar se a tabela activity_logs já existe
echo -e "\n${YELLOW}Verificando se a tabela activity_logs já existe...${NC}"
TABLE_CHECK=$(curl -s -X GET "$SUPABASE_URL/rest/v1/activity_logs?select=id&limit=1" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY")

# Verificar se a resposta indica erro 404 (tabela não existe)
if [[ $TABLE_CHECK == *"relation \"public.activity_logs\" does not exist"* ]]; then
  echo -e "${YELLOW}A tabela activity_logs não existe. Vamos criá-la.${NC}"
else
  echo -e "${YELLOW}A tabela activity_logs parece já existir. Deseja recriá-la? (s/n)${NC}"
  read -r RECREATE
  if [ "$RECREATE" != "s" ] && [ "$RECREATE" != "S" ]; then
    echo -e "${GREEN}Operação cancelada pelo usuário.${NC}"
    exit 0
  fi
fi

# Criar tabela usando SQL direto com API POST
echo -e "\n${YELLOW}Criando tabela activity_logs...${NC}"

# SQL para criar a tabela
CREATE_TABLE_SQL="CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT,
    username TEXT,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id TEXT,
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
)"

# SQL para comentários
COMMENTS_SQL="
COMMENT ON TABLE public.activity_logs IS 'Registros de todas as atividades realizadas pelos usuários no sistema';
COMMENT ON COLUMN public.activity_logs.user_id IS 'ID do usuário que realizou a ação';
COMMENT ON COLUMN public.activity_logs.username IS 'Nome do usuário que realizou a ação';
COMMENT ON COLUMN public.activity_logs.action IS 'Ação realizada (CREATE, UPDATE, DELETE, VIEW)';
COMMENT ON COLUMN public.activity_logs.entity_type IS 'Tipo de entidade afetada (MEMBER, VEHICLE, EVENT)';
COMMENT ON COLUMN public.activity_logs.entity_id IS 'ID da entidade afetada';
COMMENT ON COLUMN public.activity_logs.details IS 'Detalhes da ação em formato JSON';
COMMENT ON COLUMN public.activity_logs.ip_address IS 'Endereço IP de onde a ação foi realizada'"

# SQL para RLS e permissões
PERMISSIONS_SQL="
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.activity_logs TO postgres;
GRANT SELECT, INSERT ON public.activity_logs TO authenticated;
GRANT SELECT, INSERT ON public.activity_logs TO anon"

# SQL para políticas
POLICIES_SQL="
CREATE POLICY insert_logs_policy ON public.activity_logs FOR INSERT TO authenticated, anon WITH CHECK (true);
CREATE POLICY insert_anon_logs_policy ON public.activity_logs FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY select_logs_policy ON public.activity_logs FOR SELECT TO authenticated, anon USING (true)"

# SQL para índices
INDEXES_SQL="
CREATE INDEX IF NOT EXISTS activity_logs_user_id_idx ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS activity_logs_entity_type_idx ON public.activity_logs(entity_type);
CREATE INDEX IF NOT EXISTS activity_logs_entity_id_idx ON public.activity_logs(entity_id);
CREATE INDEX IF NOT EXISTS activity_logs_action_idx ON public.activity_logs(action);
CREATE INDEX IF NOT EXISTS activity_logs_created_at_idx ON public.activity_logs(created_at)"

# Usar API SQL do Supabase para executar cada comando
execute_sql() {
  local sql="$1"
  local description="$2"
  
  echo -e "${YELLOW}Executando: $description${NC}"
  
  # Usar a API REST direta da Postgres
  local result=$(curl -s -X POST "$SUPABASE_URL/rest/v1/sql" \
    -H "apikey: $SUPABASE_KEY" \
    -H "Authorization: Bearer $SUPABASE_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"query\": \"$sql\"}")
  
  if [[ $result == *"error"* ]]; then
    echo -e "${RED}❌ Erro ao executar SQL: $description${NC}"
    echo -e "${RED}$result${NC}"
    return 1
  else
    echo -e "${GREEN}✅ $description completado com sucesso${NC}"
    return 0
  fi
}

# Executar cada passo
execute_sql "$CREATE_TABLE_SQL" "Criar tabela"
execute_sql "$COMMENTS_SQL" "Adicionar comentários"
execute_sql "$PERMISSIONS_SQL" "Configurar permissões e RLS"
execute_sql "$POLICIES_SQL" "Criar políticas de segurança"
execute_sql "$INDEXES_SQL" "Criar índices para performance"

# Inserir um registro de teste
echo -e "\n${YELLOW}Inserindo registro de teste...${NC}"
INSERT_TEST=$(curl -s -X POST "$SUPABASE_URL/rest/v1/activity_logs" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{"user_id": "system", "username": "Sistema", "action": "CREATE", "entity_type": "SYSTEM", "details": {"message": "Tabela de logs criada com sucesso"}}')

if [[ $INSERT_TEST == *"id"* ]]; then
  echo -e "${GREEN}✅ Registro de teste inserido com sucesso!${NC}"
  
  # Verificar se podemos buscar um log
  echo -e "\n${YELLOW}Verificando se podemos buscar logs...${NC}"
  TEST_SELECT=$(curl -s -X GET "$SUPABASE_URL/rest/v1/activity_logs?select=*&limit=1" \
    -H "apikey: $SUPABASE_KEY" \
    -H "Authorization: Bearer $SUPABASE_KEY")
    
  if [[ $TEST_SELECT == *"id"* ]]; then
    echo -e "${GREEN}✅ Conseguimos buscar logs com sucesso!${NC}"
    
    echo -e "\n${GREEN}=====================================${NC}"
    echo -e "${GREEN}    CONFIGURAÇÃO CONCLUÍDA COM SUCESSO    ${NC}"
    echo -e "${GREEN}=====================================${NC}"
    exit 0
  else
    echo -e "${RED}❌ Não foi possível buscar logs. Verifique as permissões.${NC}"
    echo "$TEST_SELECT"
    exit 1
  fi
else
  echo -e "${RED}❌ Falha ao inserir registro de teste.${NC}"
  echo -e "${RED}Resposta: $INSERT_TEST${NC}"
  exit 1
fi
