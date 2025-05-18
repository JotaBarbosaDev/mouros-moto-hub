#!/bin/bash
# Script para executar a verificação da tabela de logs via JavaScript

# Definir cores para saída
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=========================================================${NC}"
echo -e "${YELLOW}  VERIFICANDO TABELA DE LOGS DE ATIVIDADE COM JAVASCRIPT  ${NC}"
echo -e "${YELLOW}=========================================================${NC}"

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
  echo -e "${RED}❌ Node.js não está instalado. Por favor, instale o Node.js para executar este script.${NC}"
  exit 1
fi

# Verificar se o arquivo .env existe no frontend
if [ ! -f ./frontend/.env ]; then
  echo -e "${RED}❌ Arquivo .env não encontrado no diretório frontend!${NC}"
  exit 1
fi

# Verificar dependências necessárias
echo -e "${YELLOW}Verificando dependências...${NC}"
if ! node -e "try { require('@supabase/supabase-js'); } catch(e) { console.error('Módulo @supabase/supabase-js não encontrado'); process.exit(1); }"; then
  echo -e "${YELLOW}Instalando dependência @supabase/supabase-js...${NC}"
  npm install --no-save @supabase/supabase-js dotenv
fi

echo -e "${GREEN}✅ Dependências OK.${NC}"

# Executar o script de verificação
echo -e "${YELLOW}Executando verificação da tabela de logs...${NC}"
node verify-logs-table.cjs

# Verificar o resultado
if [ $? -eq 0 ]; then
  echo -e "\n${GREEN}=====================================${NC}"
  echo -e "${GREEN}    SISTEMA DE LOGS ESTÁ OPERACIONAL    ${NC}"
  echo -e "${GREEN}=====================================${NC}"
else
  echo -e "\n${RED}=====================================${NC}"
  echo -e "${RED}    SISTEMA DE LOGS APRESENTA PROBLEMAS   ${NC}"
  echo -e "${RED}=====================================${NC}"
  echo -e "${YELLOW}Por favor, verifique os erros acima e consulte a documentação em:${NC}"
  echo -e "DOCUMENTACAO-LOGS-ATIVIDADES.md"
  exit 1
fi
