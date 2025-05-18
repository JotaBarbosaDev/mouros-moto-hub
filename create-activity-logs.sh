#!/bin/bash
# Script para criar a tabela activity_logs no banco de dados Supabase

# Definir cores para saída
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=========================================================${NC}"
echo -e "${YELLOW}      CRIANDO TABELA DE LOGS DE ATIVIDADE NO SUPABASE     ${NC}"
echo -e "${YELLOW}=========================================================${NC}"

# Verificar se o arquivo .env existe no backend
if [ ! -f ./backend/.env ]; then
  echo -e "${RED}❌ Arquivo .env não encontrado no diretório backend!${NC}"
  exit 1
fi

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
TABLE_EXISTS=$(curl -s -X POST "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"sql\": \"SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'activity_logs') as exists\"}" | grep -o 'true\|false')

if [ "$TABLE_EXISTS" == "true" ]; then
  echo -e "${YELLOW}A tabela activity_logs já existe. Deseja recriá-la? (s/n)${NC}"
  read -r RECREATE
  if [ "$RECREATE" != "s" ] && [ "$RECREATE" != "S" ]; then
    echo -e "${GREEN}Operação cancelada pelo usuário.${NC}"
    exit 0
  fi
  
  echo -e "${YELLOW}Removendo tabela activity_logs existente...${NC}"
  DROP_RESULT=$(curl -s -X POST "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
    -H "apikey: ${SUPABASE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_KEY}" \
    -H "Content-Type: application/json" \
    -d "{\"sql\": \"DROP TABLE IF EXISTS public.activity_logs CASCADE\"}")
  
  echo -e "${GREEN}✅ Tabela antiga removida com sucesso.${NC}"
fi

# SQL para criar a tabela activity_logs
SQL_CONTENT=$(cat <<EOF
-- Script para criar tabela de logs de atividade no Supabase
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT, -- Alterado para TEXT para aceitar IDs diversos
    username TEXT,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id TEXT, -- Alterado para TEXT para aceitar IDs diversos
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Adicionando comentários na tabela
COMMENT ON TABLE public.activity_logs IS 'Registros de todas as atividades realizadas pelos usuários no sistema';
COMMENT ON COLUMN public.activity_logs.user_id IS 'ID do usuário que realizou a ação';
COMMENT ON COLUMN public.activity_logs.username IS 'Nome do usuário que realizou a ação';
COMMENT ON COLUMN public.activity_logs.action IS 'Ação realizada (CREATE, UPDATE, DELETE, VIEW)';
COMMENT ON COLUMN public.activity_logs.entity_type IS 'Tipo de entidade afetada (MEMBER, VEHICLE, EVENT)';
COMMENT ON COLUMN public.activity_logs.entity_id IS 'ID da entidade afetada';
COMMENT ON COLUMN public.activity_logs.details IS 'Detalhes da ação em formato JSON';
COMMENT ON COLUMN public.activity_logs.ip_address IS 'Endereço IP de onde a ação foi realizada';

-- Garantir que RLS esteja ativado
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Conceder permissões para os perfis do Supabase
GRANT ALL ON public.activity_logs TO postgres;
GRANT SELECT, INSERT ON public.activity_logs TO authenticated;
GRANT SELECT, INSERT ON public.activity_logs TO anon;

-- Políticas de segurança para a tabela de logs:
-- Qualquer usuário pode inserir logs
CREATE POLICY insert_logs_policy ON public.activity_logs 
  FOR INSERT TO authenticated, anon
  WITH CHECK (true);

-- Qualquer usuário pode inserir logs anônimos
CREATE POLICY insert_anon_logs_policy ON public.activity_logs 
  FOR INSERT TO anon
  WITH CHECK (true);

-- Todos podem ver logs
CREATE POLICY select_logs_policy ON public.activity_logs 
  FOR SELECT TO authenticated, anon
  USING (true);

-- Criar índices para melhorar a performance das consultas mais comuns
CREATE INDEX IF NOT EXISTS activity_logs_user_id_idx ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS activity_logs_entity_type_idx ON public.activity_logs(entity_type);
CREATE INDEX IF NOT EXISTS activity_logs_entity_id_idx ON public.activity_logs(entity_id);
CREATE INDEX IF NOT EXISTS activity_logs_action_idx ON public.activity_logs(action);
CREATE INDEX IF NOT EXISTS activity_logs_created_at_idx ON public.activity_logs(created_at);
EOF
)

echo -e "\n${YELLOW}Executando script SQL para criar a tabela activity_logs...${NC}"
CREATE_RESULT=$(curl -s -X POST "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"sql\": $(echo "$SQL_CONTENT" | jq -s -R .)}")

# Verificar se a tabela foi criada com sucesso
VERIFY_RESULT=$(curl -s -X POST "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"sql\": \"SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'activity_logs') as exists\"}" | grep -o 'true\|false')

if [ "$VERIFY_RESULT" == "true" ]; then
  echo -e "${GREEN}✅ Tabela activity_logs criada com sucesso!${NC}"
  
  # Inserir um log de teste
  echo -e "\n${YELLOW}Inserindo um registro de log de teste...${NC}"
  INSERT_TEST=$(curl -s -X POST "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
    -H "apikey: ${SUPABASE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_KEY}" \
    -H "Content-Type: application/json" \
    -d "{\"sql\": \"INSERT INTO public.activity_logs (user_id, username, action, entity_type, details) VALUES ('system', 'Sistema', 'CREATE', 'SYSTEM', '{\\\"message\\\": \\\"Tabela de logs criada com sucesso\\\"}') RETURNING id\"}")
  
  echo -e "${GREEN}✅ Log de teste inserido com sucesso!${NC}"
  
  # Verificar se podemos buscar um log
  echo -e "\n${YELLOW}Verificando se podemos buscar logs...${NC}"
  TEST_SELECT=$(curl -s -X GET "${SUPABASE_URL}/rest/v1/activity_logs?select=*&limit=1" \
    -H "apikey: ${SUPABASE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_KEY}")
  
  if [[ "$TEST_SELECT" == *"id"* ]]; then
    echo -e "${GREEN}✅ Conseguimos buscar logs com sucesso!${NC}"
  else
    echo -e "${RED}❌ Não foi possível buscar logs. Verifique as permissões.${NC}"
    echo "$TEST_SELECT"
  fi
  
  echo -e "\n${GREEN}=====================================${NC}"
  echo -e "${GREEN}    CONFIGURAÇÃO CONCLUÍDA COM SUCESSO    ${NC}"
  echo -e "${GREEN}=====================================${NC}"
else
  echo -e "${RED}❌ Não foi possível confirmar a criação da tabela activity_logs.${NC}"
  echo -e "${RED}Resposta da verificação: $VERIFY_RESULT${NC}"
  echo -e "${RED}Resposta da criação: $CREATE_RESULT${NC}"
  exit 1
fi
