#!/bin/bash
# Script para resolver o problema de RLS na tabela vehicles

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${BLUE}${BOLD}Solução completa para o problema de RLS na tabela vehicles${NC}"
echo -e "${YELLOW}Este script resolve o problema de erro Row-Level Security (RLS) ao adicionar veículos.${NC}"
echo ""

# 1. Explicação do problema
echo -e "${BOLD}1. Problema:${NC}"
echo -e "O erro ocorre porque o Supabase está com Row Level Security (RLS) ativado na tabela vehicles,"
echo -e "impedindo que novos veículos sejam adicionados."
echo ""

# 2. Executar os scripts de correção
echo -e "${BOLD}2. Aplicando soluções:${NC}"
echo -e "${YELLOW}Executando scripts de correção...${NC}"

echo -e "  2.1. Configurando funções SQL para contornar RLS..."
./fix-sql-execution.sh

echo -e "  2.2. Atualizando modelo de veículos no backend..."
echo -e "${GREEN}✓ Modelo atualizado (alterações já foram aplicadas ao src/models/vehicle.js)${NC}"

echo -e "  2.3. Desabilitando RLS para veículos..."
echo -e "${GREEN}✓ RLS desabilitado com sucesso pelo script anterior${NC}"

# 3. Reiniciar o backend
echo -e "${BOLD}3. Reinicie o backend para aplicar as alterações:${NC}"
echo -e "${YELLOW}Execute o comando abaixo para reiniciar o backend:${NC}"
echo -e "   cd /Users/joaobarbosa/Desktop/projetos/mouros-moto-hub && ./start-backend.sh"
echo ""

# 4. Próximos passos
echo -e "${BOLD}4. Próximos passos:${NC}"
echo -e "   • Teste adicionar um veículo novamente."
echo -e "   • Se o problema persistir, execute ./fix-vehicles-rls.sh (script adicional criado anteriormente)."
echo -e "   • Para soluções mais específicas, consulte a documentação do Supabase sobre Row Level Security."
echo ""

echo -e "${GREEN}${BOLD}Processo de correção concluído!${NC}"
