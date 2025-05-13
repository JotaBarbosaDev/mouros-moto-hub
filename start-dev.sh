#!/bin/bash

# Script para iniciar rapidamente o frontend e backend para testes

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Mouros Moto Hub - Script de inicialização rápida ===${NC}"
echo -e "${YELLOW}Este script inicia o frontend e backend em terminais separados${NC}"

# Verificar se os diretórios existem
if [ ! -d "./frontend" ] || [ ! -d "./backend" ]; then
  echo -e "${RED}Erro: Diretórios frontend ou backend não encontrados${NC}"
  exit 1
fi

# Iniciar backend em um terminal separado
echo -e "${GREEN}Iniciando backend na porta 3001...${NC}"

# Tenta usar osascript para abrir um novo terminal (macOS)
if command -v osascript &> /dev/null; then
  osascript -e 'tell app "Terminal" to do script "cd \"'$PWD'/backend\" && echo \"Iniciando backend...\" && npm run dev"'
else
  # Alternativa usando screen (mais portável)
  cd backend && npm run dev &
  cd ..
  echo "Backend iniciado em segundo plano"
fi

# Aguardar um pouco para o backend iniciar
echo -e "${YELLOW}Aguardando 5 segundos para o backend iniciar...${NC}"
sleep 5

# Iniciar frontend em um terminal separado
echo -e "${GREEN}Iniciando frontend na porta 5173...${NC}"

# Tenta usar osascript para abrir um novo terminal (macOS)
if command -v osascript &> /dev/null; then
  osascript -e 'tell app "Terminal" to do script "cd \"'$PWD'/frontend\" && echo \"Iniciando frontend...\" && npm run dev"'
else
  # Se não conseguir abrir um novo terminal, informa ao usuário
  echo -e "${YELLOW}Iniciando o frontend na janela atual...${NC}"
  echo -e "${YELLOW}Use Ctrl+C para encerrar o frontend quando terminar.${NC}"
  echo -e "${YELLOW}O backend continuará rodando em segundo plano.${NC}"
  cd frontend && npm run dev
fi

echo -e "${GREEN}Aplicação iniciada!${NC}"
echo -e "${BLUE}Frontend:${NC} http://localhost:5173"
echo -e "${BLUE}Backend:${NC} http://localhost:3001"
echo -e "${BLUE}API Docs:${NC} http://localhost:3001/api-docs"
echo -e "${YELLOW}Pressione CTRL+C para sair deste script (os serviços continuarão em execução nos terminais)${NC}"

# Manter script em execução até CTRL+C
read -r -d '' _ </dev/tty
