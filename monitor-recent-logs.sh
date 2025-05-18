#!/bin/bash
# Script para verificar se novos logs estão sendo registrados no sistema
# Este script pode ser executado periodicamente para garantir que o sistema de logs está funcionando

# Definir cores para saída
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=========================================================${NC}"
echo -e "${YELLOW}      VERIFICANDO ATIVIDADE RECENTE DO SISTEMA DE LOGS     ${NC}"
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

# Verificar total de logs
echo -e "\n${YELLOW}Verificando total de logs no sistema...${NC}"

TOTAL_LOGS=$(curl -s -X GET "$SUPABASE_URL/rest/v1/activity_logs?select=count" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: count=exact")

if [[ $TOTAL_LOGS == *"error"* || $TOTAL_LOGS == *"not exist"* ]]; then
  echo -e "${RED}❌ Erro ao verificar logs: $TOTAL_LOGS${NC}"
  exit 1
fi

LOGS_COUNT=$(echo $TOTAL_LOGS | grep -o '"count":[0-9]*' | cut -d':' -f2)

if [ -z "$LOGS_COUNT" ]; then
  echo -e "${RED}❌ Não foi possível determinar o número de logs.${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Total de logs no sistema: $LOGS_COUNT${NC}"

# Verificar logs recentes (últimas 24 horas)
echo -e "\n${YELLOW}Verificando logs recentes (últimas 24 horas)...${NC}"

# Obter data de 24 horas atrás no formato ISO 8601
DATE_24H_AGO=$(date -u -v-1d +"%Y-%m-%dT%H:%M:%SZ")

RECENT_LOGS=$(curl -s -X GET "$SUPABASE_URL/rest/v1/activity_logs?select=count&created_at=gte.$DATE_24H_AGO" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: count=exact")

RECENT_COUNT=$(echo $RECENT_LOGS | grep -o '"count":[0-9]*' | cut -d':' -f2)

if [ -z "$RECENT_COUNT" ]; then
  echo -e "${RED}❌ Não foi possível determinar o número de logs recentes.${NC}"
else
  echo -e "${GREEN}✅ Logs nas últimas 24 horas: $RECENT_COUNT${NC}"

  if [ "$RECENT_COUNT" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Nenhum log registrado nas últimas 24 horas. Isso pode ser normal se não houve atividade, mas verifique se o sistema está funcionando corretamente.${NC}"
  fi
fi

# Verificar tipos de ação registrados
echo -e "\n${YELLOW}Verificando tipos de ação registrados...${NC}"

ACTION_TYPES=$(curl -s -X GET "$SUPABASE_URL/rest/v1/activity_logs?select=action&distinct=true" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY")

echo -e "${GREEN}✅ Tipos de ação registrados no sistema:${NC}"
echo "$ACTION_TYPES" | grep -o '"action":"[^"]*"' | cut -d'"' -f4 | sort | uniq | while read -r action; do
  echo "   - $action"
done

# Registrar um log de verificação
echo -e "\n${YELLOW}Registrando log de verificação...${NC}"

VERIFICATION_LOG=$(curl -s -X POST "$SUPABASE_URL/rest/v1/activity_logs" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d "{\"user_id\": \"system\", \"username\": \"Script de Monitoramento\", \"action\": \"CHECK\", \"entity_type\": \"SYSTEM\", \"details\": {\"message\": \"Verificação periódica do sistema de logs\", \"total_logs\": $LOGS_COUNT, \"recent_logs\": $RECENT_COUNT}}")

if [[ $VERIFICATION_LOG == *"id"* ]]; then
  LOG_ID=$(echo $VERIFICATION_LOG | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
  echo -e "${GREEN}✅ Log de verificação registrado com sucesso! ID: $LOG_ID${NC}"
else
  echo -e "${RED}❌ Falha ao registrar log de verificação.${NC}"
  echo -e "Resposta: $VERIFICATION_LOG"
  exit 1
fi

echo -e "\n${GREEN}=====================================${NC}"
echo -e "${GREEN}    VERIFICAÇÃO CONCLUÍDA COM SUCESSO    ${NC}"
echo -e "${GREEN}=====================================${NC}"
echo -e "O sistema de logs está operacional e registrando atividades."
echo -e "Total de logs: $LOGS_COUNT"
echo -e "Logs nas últimas 24 horas: $RECENT_COUNT"
exit 0
