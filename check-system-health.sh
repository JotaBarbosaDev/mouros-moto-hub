#!/bin/bash
# Script para verificar a saúde do sistema Mouros Moto Hub
# Autor: João Barbosa
# Data: 11/05/2025

echo "🔍 Verificando saúde do sistema Mouros Moto Hub..."

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para verificar componente
check_component() {
  local name=$1
  local result=$2
  
  if [ "$result" == "0" ]; then
    echo -e "${GREEN}✓ $name: OK${NC}"
    return 0
  else
    echo -e "${RED}✗ $name: FALHA${NC}"
    return 1
  fi
}

# Verifica instalações necessárias
echo -e "\n${YELLOW}Verificando ambiente de desenvolvimento...${NC}"

# Verifica Supabase CLI
echo -n "Verificando Supabase CLI... "
if command -v supabase &> /dev/null; then
  echo -e "${GREEN}OK${NC} ($(supabase --version))"
else
  echo -e "${RED}NÃO ENCONTRADO${NC}"
  echo "Para instalar: brew install supabase/tap/supabase"
fi

# Verifica Node.js
echo -n "Verificando Node.js... "
if command -v node &> /dev/null; then
  echo -e "${GREEN}OK${NC} ($(node --version))"
else
  echo -e "${RED}NÃO ENCONTRADO${NC}"
  echo "Para instalar: brew install node"
fi

# Verifica NPM
echo -n "Verificando NPM... "
if command -v npm &> /dev/null; then
  echo -e "${GREEN}OK${NC} ($(npm --version))"
else
  echo -e "${RED}NÃO ENCONTRADO${NC}"
  echo "Instale o Node.js para obter o NPM"
fi

# Verifica Docker
echo -n "Verificando Docker... "
if command -v docker &> /dev/null; then
  echo -e "${GREEN}OK${NC} ($(docker --version))"
else
  echo -e "${RED}NÃO ENCONTRADO${NC}"
  echo "Para instalar: brew install --cask docker"
fi

# Verifica se o Docker está rodando
echo -n "Verificando se o Docker está em execução... "
if docker info &> /dev/null; then
  echo -e "${GREEN}OK${NC}"
else
  echo -e "${RED}NÃO ESTÁ RODANDO${NC}"
  echo "Inicie o Docker Desktop antes de continuar"
fi

# Verifica jq
echo -n "Verificando jq... "
if command -v jq &> /dev/null; then
  echo -e "${GREEN}OK${NC} ($(jq --version))"
else
  echo -e "${RED}NÃO ENCONTRADO${NC}"
  echo "Para instalar: brew install jq"
fi

# Verifica se está logado no Supabase
echo -e "\n${YELLOW}Verificando conexão com Supabase...${NC}"
echo -n "Verificando login no Supabase... "
TOKEN=$(supabase tokens get 2> /dev/null)
if [ -n "$TOKEN" ]; then
  echo -e "${GREEN}OK${NC}"
else
  echo -e "${RED}NÃO LOGADO${NC}"
  echo "Para logar: supabase login"
fi

# Verifica projeto vinculado
echo -n "Verificando projeto vinculado... "
if supabase status &> /dev/null; then
  echo -e "${GREEN}OK${NC}"
else
  echo -e "${RED}NÃO VINCULADO${NC}"
  echo "Para vincular: supabase link --project-ref jugfkacnlgdjdosstiks"
fi

# Verifica funções implantadas
echo -e "\n${YELLOW}Verificando funções Edge...${NC}"

echo -n "Verificando implantação de user-management... "
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS "https://jugfkacnlgdjdosstiks.supabase.co/functions/v1/user-management")
if [ "$RESPONSE" == "204" ]; then
  echo -e "${GREEN}OK${NC}"
else
  echo -e "${RED}FALHA (HTTP $RESPONSE)${NC}"
  echo "Para implantar: supabase functions deploy user-management --project-ref jugfkacnlgdjdosstiks"
fi

echo -n "Verificando implantação de list-users... "
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS "https://jugfkacnlgdjdosstiks.supabase.co/functions/v1/list-users")
if [ "$RESPONSE" == "204" ]; then
  echo -e "${GREEN}OK${NC}"
else
  echo -e "${RED}FALHA (HTTP $RESPONSE)${NC}"
  echo "Para implantar: supabase functions deploy list-users --project-ref jugfkacnlgdjdosstiks"
fi

echo -e "\n${GREEN}✅ Verificação concluída!${NC}"
echo "Para mais detalhes, consulte a documentação em:"
echo "- RESUMO_SOLUCAO.md"
echo "- GUIA_MANUTENCAO.md"
echo "- VERIFICACAO_FINAL.md"
