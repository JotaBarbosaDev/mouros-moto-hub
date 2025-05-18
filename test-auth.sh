#!/bin/bash
# Script para testar o sistema de autenticação

echo "======================================================================"
echo "           TESTE DO SISTEMA DE AUTENTICAÇÃO"
echo "======================================================================"
echo

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Testar login com admin@admin.com
echo -e "${YELLOW}Testando login com admin@admin.com...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"admin"}' \
  http://localhost:3001/api/auth/login)

# Verificar se o login foi bem-sucedido (verificando se contém "token")
if [[ $LOGIN_RESPONSE == *"token"* ]]; then
  echo -e "${GREEN}✓ Login bem-sucedido!${NC}"
  
  # Extrair o token
  TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | sed 's/"token":"//')
  echo -e "Token JWT recebido: ${TOKEN:0:20}...${TOKEN:(-20)}"
  
  # Testar obtenção do perfil
  echo
  echo -e "${YELLOW}Testando obtenção do perfil do usuário...${NC}"
  PROFILE_RESPONSE=$(curl -s \
    -H "Authorization: Bearer $TOKEN" \
    http://localhost:3001/api/auth/me)
  
  if [[ $PROFILE_RESPONSE == *"id"* && $PROFILE_RESPONSE == *"email"* ]]; then
    echo -e "${GREEN}✓ Perfil obtido com sucesso!${NC}"
    echo -e "Dados do perfil: $PROFILE_RESPONSE"
  else
    echo -e "${RED}✗ Falha ao obter o perfil do usuário.${NC}"
    echo -e "Resposta: $PROFILE_RESPONSE"
  fi
else
  echo -e "${RED}✗ Falha no login.${NC}"
  echo -e "Resposta: $LOGIN_RESPONSE"
fi

echo
echo "======================================================================"
echo "           VERIFICAÇÃO DA CONFIGURAÇÃO"
echo "======================================================================"
echo

# Verificar variáveis de ambiente no backend
echo -e "${YELLOW}Verificando variáveis de ambiente do backend...${NC}"
cd backend

if grep -q "JWT_SECRET" .env; then
  echo -e "${GREEN}✓ JWT_SECRET encontrado no arquivo .env${NC}"
else
  echo -e "${RED}✗ JWT_SECRET não encontrado no arquivo .env${NC}"
fi

if grep -q "JWT_EXPIRES_IN" .env; then
  echo -e "${GREEN}✓ JWT_EXPIRES_IN encontrado no arquivo .env${NC}"
else
  echo -e "${RED}✗ JWT_EXPIRES_IN não encontrado no arquivo .env${NC}"
fi

if grep -q "SUPABASE_URL" .env; then
  echo -e "${GREEN}✓ SUPABASE_URL encontrado no arquivo .env${NC}"
else
  echo -e "${RED}✗ SUPABASE_URL não encontrado no arquivo .env${NC}"
fi

if grep -q "SUPABASE_KEY" .env; then
  echo -e "${GREEN}✓ SUPABASE_KEY encontrado no arquivo .env${NC}"
else
  echo -e "${RED}✗ SUPABASE_KEY não encontrado no arquivo .env${NC}"
fi

echo
echo -e "${YELLOW}Verificando controlador de autenticação...${NC}"
if grep -q "Usando abordagem alternativa que não depende do admin.getUserById" src/controllers/auth.js; then
  echo -e "${GREEN}✓ Controlador está usando a abordagem alternativa sem admin.getUserById${NC}"
else
  echo -e "${RED}✗ Controlador pode estar usando admin.getUserById que requer service_role${NC}"
fi

echo
echo -e "${YELLOW}Verificando usuário admin@admin.com...${NC}"
if grep -q "admin@admin.com" src/controllers/auth.js; then
  echo -e "${GREEN}✓ Usuário admin@admin.com está configurado para testes${NC}"
else
  echo -e "${RED}✗ Usuário admin@admin.com não está configurado para testes${NC}"
fi

echo
echo "======================================================================"
echo "                     TESTES CONCLUÍDOS"
echo "======================================================================"
