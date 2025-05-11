#!/bin/bash
# Script para testar as funções Edge localmente

echo "🔬 Testando funções Edge do Supabase"

# Verificar instalação do Supabase CLI
if ! command -v supabase &> /dev/null; then
    echo "❌ CLI do Supabase não encontrado!"
    echo "Instale com: brew install supabase/tap/supabase"
    exit 1
fi

# Obter token de acesso JWT para teste
echo "🔑 Obtendo token JWT para testes..."
TOKEN=$(supabase tokens get)

if [ -z "$TOKEN" ]; then
    echo "❌ Falha ao obter token JWT. Faça login primeiro com 'supabase login'"
    exit 1
fi

# Cores para saída
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Testar função user-management
test_user_management() {
    echo -e "\n${GREEN}🧪 Testando função user-management...${NC}"
    
    # Testar a função para obter um usuário
    echo "📥 Enviando requisição para buscar usuário..."
    RESPONSE=$(curl -s -X POST "http://localhost:54321/functions/v1/user-management" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"action":"getUser","userId":"COLOQUE_UM_ID_DE_USUARIO_VALIDO_AQUI"}')
    
    echo "📤 Resposta:"
    echo "$RESPONSE" | jq
}

# Testar função list-users
test_list_users() {
    echo -e "\n${GREEN}🧪 Testando função list-users...${NC}"
    
    # Testar a função para listar usuários
    echo "📥 Enviando requisição para listar usuários..."
    RESPONSE=$(curl -s -X POST "http://localhost:54321/functions/v1/list-users" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"filter":"","page":1,"pageSize":10}')
    
    echo "📤 Resposta:"
    echo "$RESPONSE" | jq
}

# Iniciar o servidor de funções localmente
start_functions_server() {
    echo -e "${GREEN}🚀 Iniciando servidor de funções Edge...${NC}"
    supabase functions serve &
    FUNCTIONS_PID=$!
    
    # Aguardar o servidor iniciar
    echo "⏳ Aguardando o servidor iniciar..."
    sleep 5
    
    return $FUNCTIONS_PID
}

# Parar o servidor de funções
stop_functions_server() {
    echo -e "\n${GREEN}🛑 Parando servidor de funções Edge...${NC}"
    kill $1
    wait $1 2>/dev/null
}

# Menu principal
echo -e "\n${GREEN}Escolha a função para testar:${NC}"
echo "1) user-management"
echo "2) list-users"
echo "3) Testar todas as funções"
echo "q) Sair"

read -p "Opção: " option

case $option in
    1)
        start_functions_server
        SERVER_PID=$?
        test_user_management
        stop_functions_server $SERVER_PID
        ;;
    2)
        start_functions_server
        SERVER_PID=$?
        test_list_users
        stop_functions_server $SERVER_PID
        ;;
    3)
        start_functions_server
        SERVER_PID=$?
        test_user_management
        test_list_users
        stop_functions_server $SERVER_PID
        ;;
    q|Q)
        echo "Saindo..."
        exit 0
        ;;
    *)
        echo -e "${RED}Opção inválida!${NC}"
        exit 1
        ;;
esac

echo -e "\n${GREEN}✅ Teste concluído!${NC}"
