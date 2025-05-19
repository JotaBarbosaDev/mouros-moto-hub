#!/bin/bash
# Script completo para resolver problemas de RLS do Supabase na tabela vehicles

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${BLUE}${BOLD}=== CORREÇÃO COMPLETA DO RLS PARA VEÍCULOS ===${NC}"
echo -e "Este script resolve problemas com Row Level Security (RLS) na tabela vehicles."
echo -e "Data: $(date)"
echo -e ""

# Verificar permissões de execução dos scripts
check_execute_permission() {
  local script="$1"
  if [ ! -x "$script" ]; then
    echo -e "${YELLOW}Adicionando permissão de execução para $script${NC}"
    chmod +x "$script"
  fi
}

# Verificar se os scripts necessários estão disponíveis com permissão de execução
check_execute_permission "./fix-vehicles-rls.sh"
check_execute_permission "./fix-sql-execution.sh"
check_execute_permission "./check-rpc-functions.sh"

echo -e "${BLUE}${BOLD}ETAPA 1: Instalando funções RPC para bypass de RLS${NC}"
echo -e "${YELLOW}Verificando e instalando funções RPC necessárias...${NC}"
./check-rpc-functions.sh

echo -e "${BLUE}${BOLD}ETAPA 2: Configurando políticas RLS para veículos${NC}"
echo -e "${YELLOW}Aplicando configurações de RLS para a tabela vehicles...${NC}"
./fix-vehicles-rls.sh

echo -e "${BLUE}${BOLD}ETAPA 3: Verificando conexão direta com o backend${NC}"
echo -e "${YELLOW}Testando se o backend consegue acessar a API do Supabase...${NC}"

# Testar conexão com o backend
if [ -f "./backend/src/config/supabase.js" ]; then
  echo -e "${GREEN}Arquivo de configuração do Supabase encontrado no backend.${NC}"
  
  # Executar script de teste de conexão se existir
  if [ -f "./test-supabase-connection.js" ]; then
    echo -e "${YELLOW}Testando conexão...${NC}"
    node ./test-supabase-connection.js
  else
    echo -e "${YELLOW}Criando script de teste de conexão...${NC}"
    
    # Criar script temporário para testar conexão
    cat > test-temp-connection.js << EOF
const { supabase } = require('./backend/src/config/supabase');

async function testConnection() {
  try {
    console.log('Testando conexão com Supabase...');
    const { data, error } = await supabase
      .from('vehicles')
      .select('count')
      .limit(1);
      
    if (error) {
      console.error('Erro ao conectar:', error);
      return false;
    }
    
    console.log('Conexão bem-sucedida!');
    return true;
  } catch (err) {
    console.error('Exceção ao conectar:', err);
    return false;
  }
}

testConnection().then(success => {
  if (!success) {
    console.log('Falha no teste de conexão');
    process.exit(1);
  }
  process.exit(0);
});
EOF
    
    node test-temp-connection.js
    rm test-temp-connection.js
  fi
fi

echo -e "${BLUE}${BOLD}ETAPA 4: Aplicando solução alternativa${NC}"
echo -e "${YELLOW}Criando função no banco de dados que faz bypass do RLS...${NC}"
./fix-sql-execution.sh ./backend/create-vehicle-function.sql

echo -e "${BLUE}${BOLD}ETAPA 5: Verificação final${NC}"
echo -e "${YELLOW}Verificando status do RLS após correções...${NC}"

# Verificar se curl e jq estão instalados
if command -v curl >/dev/null 2>&1 && command -v jq >/dev/null 2>&1; then
  # Carregar variáveis de ambiente
  if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
  fi
  
  if [ -n "$SUPABASE_URL" ] && [ -n "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    RLS_CHECK=$(curl -s -X POST \
      -H "Content-Type: application/json" \
      -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
      -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
      --data '{"query": "SELECT relrowsecurity FROM pg_class WHERE relname = '\''vehicles'\'' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = '\''public'\'');"}' \
      "${SUPABASE_URL}/rest/v1/rpc/exec")
      
    echo -e "${GREEN}Status do RLS na tabela vehicles:${NC}"
    echo "$RLS_CHECK" | jq '.'
    
    POLICIES_CHECK=$(curl -s -X POST \
      -H "Content-Type: application/json" \
      -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
      -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
      --data '{"query": "SELECT * FROM pg_policies WHERE tablename = '\''vehicles'\'';"}' \
      "${SUPABASE_URL}/rest/v1/rpc/exec")
      
    echo -e "${GREEN}Políticas RLS na tabela vehicles:${NC}"
    echo "$POLICIES_CHECK" | jq '.'
  else
    echo -e "${RED}Variáveis de ambiente do Supabase não definidas. Não é possível verificar o RLS.${NC}"
  fi
else
  echo -e "${YELLOW}curl ou jq não encontrados. Não é possível verificar o status do RLS.${NC}"
fi

echo -e "${BLUE}${BOLD}=== CORREÇÃO COMPLETA! ===${NC}"
echo -e "${GREEN}Todos os passos de correção foram aplicados.${NC}"
echo -e ""
echo -e "${BOLD}Próximos passos:${NC}"
echo -e "1. Reinicie o backend: ${YELLOW}cd /Users/joaobarbosa/Desktop/projetos/mouros-moto-hub && ./start-backend.sh${NC}"
echo -e "2. Teste adicionar um veículo na interface"
echo -e "3. Se ainda houver problemas, verifique os logs do backend em ${YELLOW}backend/backend.log${NC}"
echo -e ""
echo -e "Se precisar de mais ajuda, consulte a documentação em ${BLUE}SOLUCAO-CAMPOS-DUPLICADOS-RLS.md${NC}"
