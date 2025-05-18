#!/bin/bash

# Script para verificar e corrigir URLs da API nos serviços do frontend
# Este script garante que as chamadas API estejam corretamente formatadas

# Cores para output
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
NC="\033[0m" # Sem cor

echo -e "${YELLOW}=== Verificador de URLs da API no Frontend ===${NC}"

# Diretório dos serviços frontend
SERVICES_DIR="/Users/joaobarbosa/Desktop/projetos/mouros-moto-hub/frontend/src/services"

# Verificar o arquivo .env para entender qual é a URL base da API
ENV_FILE="/Users/joaobarbosa/Desktop/projetos/mouros-moto-hub/frontend/.env"
API_URL_CONFIG=$(grep "VITE_API_URL" "$ENV_FILE" | cut -d '=' -f2)

echo -e "${YELLOW}URL base da API configurada como: $API_URL_CONFIG${NC}"

# Verificar estrutura da URL base
if [[ "$API_URL_CONFIG" == *"/api" ]]; then
  echo -e "${YELLOW}Detectado '/api' na URL base. As chamadas nos serviços NÃO devem incluir '/api/' novamente!${NC}"
  echo -e "${YELLOW}Usar: \${getApiBaseUrl()}/auth/login${NC}"
  PATTERN_SHOULD_INCLUDE_API=false
else
  echo -e "${YELLOW}URL base não inclui '/api'. As chamadas nos serviços devem incluir '/api/recurso'${NC}"
  echo -e "${YELLOW}Usar: \${getApiBaseUrl()}/api/auth/login${NC}"
  PATTERN_SHOULD_INCLUDE_API=true
fi

# Função para verificar e corrigir um arquivo de serviço
check_and_fix_service() {
  local file="$1"
  local filename=$(basename "$file")
  
  echo -e "\n${YELLOW}Verificando $filename...${NC}"
  
  # Padrões a verificar no arquivo
  local pattern1="\${getApiBaseUrl()}/([^a]|a[^p]|ap[^i])"
  local pattern2="\${getApiBaseUrl()}/api/"
  
  # Detectar URLs incorretas
  if $PATTERN_SHOULD_INCLUDE_API; then
    # Se a URL base já inclui /api, então as chamadas não devem ter /api/
    if grep -q "$pattern1" "$file"; then
      echo -e "${RED}✘ URLs sem '/api/' encontradas${NC}"
      
      # Exibir os problemas encontrados
      echo -e "${YELLOW}Problemas encontrados:${NC}"
      grep -n "$pattern1" "$file" | head -n 5 # Mostrar até 5 exemplos
      
      # Backup do arquivo
      cp "$file" "${file}.bak"
      
      # Correção: substituir getApiBaseUrl()/ por getApiBaseUrl()/api/
      sed -i.tmp -E "s|(\\\${getApiBaseUrl\(\)})/([^a]|a[^p]|ap[^i])|\\1/api/\\2|g" "$file"
      echo -e "${GREEN}✓ URLs corrigidas com '/api/' adicionado${NC}"
    else
      echo -e "${GREEN}✓ Todas as URLs usam '/api/' corretamente${NC}"
    fi
  else
    # Se a URL base não inclui /api, então as chamadas devem ter /api/
    if grep -q "$pattern2" "$file"; then
      echo -e "${RED}✘ URLs com '/api/' redundante encontradas${NC}"
      
      # Exibir os problemas encontrados
      echo -e "${YELLOW}Problemas encontrados:${NC}"
      grep -n "$pattern2" "$file" | head -n 5 # Mostrar até 5 exemplos
      
      # Backup do arquivo
      cp "$file" "${file}.bak"
      
      # Correção: substituir getApiBaseUrl()/api/ por getApiBaseUrl()/
      sed -i.tmp -E "s|(\\\${getApiBaseUrl\(\)})/api/|\\1/|g" "$file"
      echo -e "${GREEN}✓ URLs corrigidas com '/api/' removido${NC}"
    else
      echo -e "${GREEN}✓ Todas as URLs estão corretas sem '/api/' redundante${NC}"
    fi
  fi
  
  # Limpar arquivos temporários
  rm -f "${file}.tmp"
}

# Verificar serviços específicos
echo -e "${YELLOW}\nVerificando serviços específicos...${NC}"

# Lista de serviços mais propensos a terem problemas de URL
PRIORITY_SERVICES=(
  "$SERVICES_DIR/auth-service.ts"
  "$SERVICES_DIR/vehicle-service.ts"
  "$SERVICES_DIR/member-service.ts"
  "$SERVICES_DIR/activity-log-service.ts"
)

# Verificar os serviços prioritários
for service in "${PRIORITY_SERVICES[@]}"; do
  if [ -f "$service" ]; then
    check_and_fix_service "$service"
  else
    echo -e "${YELLOW}Arquivo $service não encontrado, pulando...${NC}"
  fi
done

# Verificar todos os outros serviços
echo -e "\n${YELLOW}Verificando serviços restantes...${NC}"

find "$SERVICES_DIR" -name "*-service.ts" | while read -r service; do
  # Pular os serviços já verificados
  if [[ ! " ${PRIORITY_SERVICES[@]} " =~ " $service " ]]; then
    check_and_fix_service "$service"
  fi
done

echo -e "\n${GREEN}===========================${NC}"
echo -e "${GREEN}Verificação completa!${NC}"
echo -e "${GREEN}===========================${NC}"
echo -e "${YELLOW}Se necessário, arquivos .bak foram criados como backups${NC}"
echo -e "${YELLOW}Para reverter alterações: mv [arquivo].bak [arquivo]${NC}"
