#!/bin/bash

# Script para simular uma consulta aos membros diretamente do banco de dados

# Cores para saída
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_DIR="/Users/joaobarbosa/Desktop/projetos/mouros-moto-hub"
SUPABASE_URL=$(grep VITE_SUPABASE_URL $PROJECT_DIR/.env | cut -d '=' -f2)
SUPABASE_KEY=$(grep VITE_SUPABASE_ANON_KEY $PROJECT_DIR/.env | cut -d '=' -f2)

echo -e "${BLUE}=== Consulta à API do Supabase ===${NC}"
echo

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
  echo -e "${RED}Erro: Credenciais do Supabase não encontradas no arquivo .env${NC}"
  exit 1
fi

echo -e "${GREEN}URL do Supabase configurada:${NC} $SUPABASE_URL"
echo -e "${GREEN}Chave do Supabase configurada:${NC} $(echo $SUPABASE_KEY | cut -c 1-10)... (parcialmente oculta)"
echo

echo -e "${BLUE}Consultando tabela 'members'...${NC}"
echo

# Fazer requisição à API REST do Supabase
HTTP_RESULT=$(curl -s \
  -X GET "$SUPABASE_URL/rest/v1/members?select=*&limit=1" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY" \
  -H "Content-Type: application/json")

# Verificar se a resposta é um JSON válido
if ! echo "$HTTP_RESULT" | jq . > /dev/null 2>&1; then
  echo -e "${RED}Erro: A resposta não é um JSON válido.${NC}"
  echo "$HTTP_RESULT"
  exit 1
fi

# Extrair colunas do primeiro registro
COLUMNS=$(echo "$HTTP_RESULT" | jq -r 'if length > 0 then .[0] | keys_unsorted | .[] else "" end')

echo -e "${YELLOW}Colunas disponíveis na tabela 'members':${NC}"
for COLUMN in $COLUMNS; do
  TYPE=$(echo "$HTTP_RESULT" | jq -r "if .[0][\"$COLUMN\"] == null then \"null\" else typeof(.[0][\"$COLUMN\"]) end")
  VALUE=$(echo "$HTTP_RESULT" | jq -r "if .[0][\"$COLUMN\"] == null then \"null\" else .[0][\"$COLUMN\"] end")
  
  # Truncar valores longos para melhor visualização
  if [ ${#VALUE} -gt 30 ] && [ "$TYPE" == "string" ]; then
    VALUE="${VALUE:0:30}..."
  fi
  
  echo -e "  ${GREEN}$COLUMN:${NC} $TYPE = $VALUE"
done

echo
echo -e "${BLUE}Detalhes completos do primeiro membro:${NC}"
echo "$HTTP_RESULT" | jq '.[0]'

echo
echo -e "${YELLOW}Concluído!${NC}"
