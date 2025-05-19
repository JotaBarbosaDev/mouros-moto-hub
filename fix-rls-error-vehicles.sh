#!/bin/bash
# Fix para o erro "new row violates row-level security policy for table "vehicles"

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${BLUE}${BOLD}CORREÇÃO PARA O ERRO DE ROW LEVEL SECURITY (RLS)${NC}"
echo -e "${YELLOW}Este script resolve o erro ao adicionar veículos:${NC}"
echo -e "${RED}new row violates row-level security policy for table \"vehicles\"${NC}"
echo ""

# Definir diretório base
BASE_DIR="/Users/joaobarbosa/Desktop/projetos/mouros-moto-hub"
cd "$BASE_DIR"

echo -e "${YELLOW}Verificando permissões dos scripts...${NC}"
chmod +x fix-vehicles-rls.sh
chmod +x fix-sql-execution.sh
chmod +x check-rpc-functions.sh

# Executar as correções na ordem correta
echo -e "${BOLD}PASSO 1:${NC} Configurando políticas RLS..."
./fix-vehicles-rls.sh

echo -e "\n${BOLD}PASSO 2:${NC} Instalando funções RPC para bypass do RLS..."
./fix-sql-execution.sh ./backend/create-vehicle-function.sql

echo -e "\n${BOLD}PASSO 3:${NC} Instalando função para desabilitar RLS..."
./fix-sql-execution.sh ./backend/create-disable-rls-function.sql

echo -e "\n${BOLD}PASSO 4:${NC} Instalando função para habilitar RLS..."
./fix-sql-execution.sh ./backend/create-enable-rls-function.sql

echo -e "\n${BOLD}PASSO 5:${NC} Reiniciando o backend para aplicar as alterações..."
./start-backend.sh

echo -e "\n${GREEN}${BOLD}✅ CORREÇÃO APLICADA COM SUCESSO!${NC}"
echo -e "Agora tente adicionar um veículo novamente. O erro de RLS deve estar resolvido."
echo -e "${YELLOW}Se o problema persistir, execute: ./fix-vehicles-rls-complete.sh${NC}"
