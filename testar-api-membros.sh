#!/bin/bash
# Script para iniciar o servidor e testar a API de membros

# Cores para saída no terminal
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Iniciando servidor para teste da API de Membros ===${NC}"

# Verifica se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js não encontrado. Por favor, instale o Node.js para continuar.${NC}"
    exit 1
fi

# Informa sobre como usar o script
echo -e "${YELLOW}Este script vai:${NC}"
echo -e "1. Iniciar o servidor de API em http://localhost:3000"
echo -e "2. Abrir o navegador com a interface de teste"
echo -e "3. Para encerrar o servidor, pressione Ctrl+C neste terminal\n"

# Pergunta se deseja continuar
read -p "Deseja continuar? (s/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo -e "${RED}Operação cancelada pelo usuário.${NC}"
    exit 0
fi

# Inicia o servidor de API em segundo plano
echo -e "${YELLOW}Iniciando servidor API...${NC}"
node swagger-server.js &
SERVER_PID=$!

# Aguarda o servidor iniciar
echo -e "${YELLOW}Aguardando servidor inicializar...${NC}"
sleep 3

# Verifica se o servidor está respondendo
if curl -s http://localhost:3000/api/health > /dev/null; then
    echo -e "${GREEN}Servidor API iniciado com sucesso em http://localhost:3000${NC}"
else
    echo -e "${RED}Falha ao iniciar o servidor API.${NC}"
    kill $SERVER_PID
    exit 1
fi

# Abre o navegador com a interface de teste
echo -e "${YELLOW}Abrindo interface de teste no navegador...${NC}"
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open "http://localhost:3000/test-members-api.html"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    xdg-open "http://localhost:3000/test-members-api.html"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows
    start "http://localhost:3000/test-members-api.html"
else
    echo -e "${YELLOW}Não foi possível abrir o navegador automaticamente.${NC}"
    echo -e "Por favor, acesse: http://localhost:3000/test-members-api.html"
fi

echo -e "${GREEN}Ambiente de teste inicializado!${NC}"
echo -e "${YELLOW}Para testar o script de verificação de username, execute em outro terminal:${NC}"
echo -e "node _tests/verificar-username.js\n"
echo -e "${YELLOW}Para encerrar o servidor, pressione Ctrl+C${NC}"

# Aguarda o sinal de interrupção (Ctrl+C)
trap "echo -e '\n${RED}Encerrando servidor...${NC}'; kill $SERVER_PID; exit 0" INT
wait $SERVER_PID
