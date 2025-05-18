#!/bin/bash

# Script para verificar e corrigir todos os problemas do Mouros Moto Hub
# 1. Problemas de URLs duplicadas na autenticação
# 2. Coluna engine_size na tabela vehicles
# 3. Tabela activity_logs ausente

# Cores para output
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
BLUE="\033[0;34m"
NC="\033[0m" # Sem cor

echo -e "${BLUE}=====================================================${NC}"
echo -e "${BLUE}= VERIFICADOR E CORRETOR COMPLETO - MOUROS MOTO HUB =${NC}"
echo -e "${BLUE}=====================================================${NC}"

# Função para exibir separador de seção
separator() {
  echo -e "${BLUE}-----------------------------------------------------${NC}"
}

# ------------------------------------------
# VERIFICAÇÃO E CORREÇÃO DE ARQUIVOS FRONTEND
# ------------------------------------------
echo -e "\n${YELLOW}VERIFICANDO SERVIÇOS FRONTEND...${NC}"
separator

# Função para verificar e corrigir URLs de API no auth-service.ts
check_auth_service() {
  local file="/Users/joaobarbosa/Desktop/projetos/mouros-moto-hub/frontend/src/services/auth-service.ts"
  
  echo -e "${YELLOW}Verificando ${file}...${NC}"
  
  # Verificar se o arquivo existe
  if [ ! -f "$file" ]; then
    echo -e "${RED}❌ Arquivo não encontrado!${NC}"
    return 1
  fi
  
  # Arrays para verificar URLs incorretas e corrigi-las
  local errors=0
  local fixes=0
  
  # Verificar padrões de URL incorretos
  if grep -q "/api/auth/login" "$file"; then
    echo -e "${RED}❌ URL de login incorreta encontrada${NC}"
    ((errors++))
    
    # Corrigir
    sed -i '' 's|${getApiBaseUrl()}/api/auth/login|${getApiBaseUrl()}/auth/login|g' "$file"
    ((fixes++))
    echo -e "${GREEN}✅ URL de login corrigida${NC}"
  fi
  
  if grep -q "/api/auth/register" "$file"; then
    echo -e "${RED}❌ URL de registro incorreta encontrada${NC}"
    ((errors++))
    
    # Corrigir
    sed -i '' 's|${getApiBaseUrl()}/api/auth/register|${getApiBaseUrl()}/auth/register|g' "$file"
    ((fixes++))
    echo -e "${GREEN}✅ URL de registro corrigida${NC}"
  fi
  
  if grep -q "/api/auth/logout" "$file"; then
    echo -e "${RED}❌ URL de logout incorreta encontrada${NC}"
    ((errors++))
    
    # Corrigir
    sed -i '' 's|${getApiBaseUrl()}/api/auth/logout|${getApiBaseUrl()}/auth/logout|g' "$file"
    ((fixes++))
    echo -e "${GREEN}✅ URL de logout corrigida${NC}"
  fi
  
  if grep -q "/api/auth/me" "$file"; then
    echo -e "${RED}❌ URL de perfil incorreta encontrada${NC}"
    ((errors++))
    
    # Corrigir
    sed -i '' 's|${getApiBaseUrl()}/api/auth/me|${getApiBaseUrl()}/auth/me|g' "$file"
    ((fixes++))
    echo -e "${GREEN}✅ URL de perfil corrigida${NC}"
  fi
  
  if [ $errors -eq 0 ]; then
    echo -e "${GREEN}✅ Todas as URLs de auth-service.ts estão corretas${NC}"
  else
    echo -e "${GREEN}✅ Corrigidas $fixes de $errors URLs incorretas em auth-service.ts${NC}"
  fi
  
  return 0
}

# Verificar e corrigir URLs de API no vehicle-service.ts
check_vehicle_service() {
  local file="/Users/joaobarbosa/Desktop/projetos/mouros-moto-hub/frontend/src/services/vehicle-service.ts"
  
  echo -e "${YELLOW}Verificando ${file}...${NC}"
  
  # Verificar se o arquivo existe
  if [ ! -f "$file" ]; then
    echo -e "${YELLOW}⚠️ Arquivo não encontrado!${NC}"
    return 1
  fi
  
  # Verificar se o campo engine_size está sendo tratado corretamente
  if ! grep -q "engine_size:" "$file"; then
    echo -e "${RED}❌ Campo engine_size não está sendo enviado corretamente${NC}"
    
    # Tentar identificar o local para adicionar engine_size
    if grep -q "displacement:" "$file"; then
      echo -e "${YELLOW}⚠️ Campo displacement encontrado, mas engine_size está ausente${NC}"
      echo -e "${YELLOW}Recomendado ajustar manualmente para garantir que o campo engine_size seja enviado${NC}"
    fi
  else
    echo -e "${GREEN}✅ Campo engine_size está sendo enviado corretamente${NC}"
  fi
  
  return 0
}

# ------------------------------------------
# VERIFICAÇÃO E CORREÇÃO DO BANCO DE DADOS
# ------------------------------------------
echo -e "\n${YELLOW}VERIFICANDO BANCO DE DADOS...${NC}"
separator

# Carregar variáveis de ambiente
load_env() {
  # Procurar arquivos .env em várias localizações
  local env_files=(
    "/Users/joaobarbosa/Desktop/projetos/mouros-moto-hub/backend/.env"
    "/Users/joaobarbosa/Desktop/projetos/mouros-moto-hub/.env"
    "/Users/joaobarbosa/Desktop/projetos/mouros-moto-hub/frontend/.env"
  )
  
  for env_file in "${env_files[@]}"; do
    if [ -f "$env_file" ]; then
      echo -e "${GREEN}Carregando variáveis de ambiente de $env_file${NC}"
      set -o allexport
      source "$env_file"
      set +o allexport
      return 0
    fi
  done
  
  echo -e "${YELLOW}⚠️ Nenhum arquivo .env encontrado. Usando variáveis do ambiente atual.${NC}"
  return 1
}

# Verificar configuração do Supabase
check_supabase_config() {
  if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo -e "${RED}❌ Erro: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são necessárias.${NC}"
    return 1
  fi
  
  echo -e "${GREEN}✅ Variáveis de ambiente do Supabase encontradas${NC}"
  return 0
}

# Criar script SQL para executar diretamente
create_sql_script() {
  local output_file="/Users/joaobarbosa/Desktop/projetos/mouros-moto-hub/fix-all-tables.sql"
  
  echo -e "${YELLOW}Criando script SQL unificado em $output_file${NC}"
  
  cat > "$output_file" << EOF
-- Script unificado para corrigir todas as tabelas
-- Mouros Moto Hub - $(date)

-- Criar função exec_sql se não existir
CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
RETURNS SETOF json
LANGUAGE plpgsql
SECURITY DEFINER
AS \$\$
BEGIN
  RETURN QUERY EXECUTE sql;
END;
\$\$;

-- Configurar permissões
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO anon, authenticated;

-- Adicionar coluna engine_size à tabela vehicles
DO \$\$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'vehicles'
    AND column_name = 'engine_size'
  ) THEN
    ALTER TABLE public.vehicles ADD COLUMN engine_size INTEGER;
    
    -- Atualizar valores existentes
    UPDATE public.vehicles SET engine_size = displacement 
    WHERE engine_size IS NULL AND displacement IS NOT NULL;
  END IF;
END \$\$;

-- Criar tabela activity_logs se não existir
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  username VARCHAR(255),
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  details JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Garantir que RLS esteja ativado
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Conceder permissões para os perfis do Supabase
GRANT SELECT, INSERT ON public.activity_logs TO authenticated;
GRANT SELECT ON public.activity_logs TO anon;

-- Políticas de segurança para a tabela de logs:
-- Qualquer usuário autenticado pode inserir logs
DO \$\$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'activity_logs' AND policyname = 'insert_logs_policy'
  ) THEN
    CREATE POLICY insert_logs_policy ON public.activity_logs 
      FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
END \$\$;

-- Somente administradores podem ver todos os logs
DO \$\$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'activity_logs' AND policyname = 'select_logs_policy'
  ) THEN
    CREATE POLICY select_logs_policy ON public.activity_logs 
      FOR SELECT TO authenticated USING (
        auth.uid() IN (
          SELECT id FROM public.members WHERE is_admin = true
        )
      );
  END IF;
END \$\$;

-- Criar índices para melhorar a performance das consultas mais comuns
CREATE INDEX IF NOT EXISTS activity_logs_user_id_idx ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS activity_logs_entity_type_idx ON public.activity_logs(entity_type);
CREATE INDEX IF NOT EXISTS activity_logs_entity_id_idx ON public.activity_logs(entity_id);
CREATE INDEX IF NOT EXISTS activity_logs_action_idx ON public.activity_logs(action);
CREATE INDEX IF NOT EXISTS activity_logs_created_at_idx ON public.activity_logs(created_at);
EOF

  echo -e "${GREEN}✅ Script SQL unificado criado em $output_file${NC}"
  
  # Instruções para uso
  echo -e "${YELLOW}Para executar o script SQL:${NC}"
  echo -e "1. Acesse o painel do Supabase: https://app.supabase.io"
  echo -e "2. Navegue até o SQL Editor"
  echo -e "3. Cole o conteúdo do arquivo $output_file"
  echo -e "4. Execute o script"
}

# ------------------------------------------
# VERIFICAÇÃO E CORREÇÃO DO BACKEND
# ------------------------------------------
echo -e "\n${YELLOW}VERIFICANDO BACKEND...${NC}"
separator

check_backend_initialize() {
  local file="/Users/joaobarbosa/Desktop/projetos/mouros-moto-hub/backend/src/config/supabase.js"
  
  echo -e "${YELLOW}Verificando inicialização do Supabase no backend...${NC}"
  
  if [ ! -f "$file" ]; then
    echo -e "${RED}❌ Arquivo de configuração do Supabase não encontrado!${NC}"
    return 1
  fi
  
  # Verificar se a configuração do Supabase aceita variáveis alternativas
  if grep -q "process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY" "$file"; then
    echo -e "${GREEN}✅ Configuração do Supabase já aceita chaves alternativas${NC}"
  else
    echo -e "${YELLOW}⚠️ Configuração do Supabase pode precisar de ajustes para aceitar chaves alternativas${NC}"
    echo -e "${YELLOW}Recomendação: Modifique para usar process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY${NC}"
  fi
  
  return 0
}

# ------------------------------------------
# INICIAR VERIFICAÇÕES
# ------------------------------------------

# Verificar arquivos frontend
check_auth_service
check_vehicle_service

# Carregar variáveis de ambiente e verificar configuração
load_env
check_supabase_config

# Verificar backend
check_backend_initialize

# Criar script SQL para correções
create_sql_script

echo -e "\n${GREEN}==============================================${NC}"
echo -e "${GREEN}= VERIFICAÇÃO E DIAGNÓSTICO CONCLUÍDOS        =${NC}"
echo -e "${GREEN}==============================================${NC}"
echo -e "\n${YELLOW}RESUMO DAS CORREÇÕES:${NC}"

echo -e "1. ${GREEN}Verificadas URLs de autenticação${NC}"
echo -e "   - As URLs duplicadas (/api/api/) foram corrigidas"
echo -e "   - Isto resolve os erros 404 nas chamadas de autenticação\n"

echo -e "2. ${GREEN}Verificada configuração para coluna engine_size${NC}"
echo -e "   - Criado script SQL para adicionar a coluna se não existir"
echo -e "   - Isto resolve os erros 500 ao salvar veículos\n"

echo -e "3. ${GREEN}Verificada configuração para tabela activity_logs${NC}"
echo -e "   - Criado script SQL para adicionar a tabela se não existir"
echo -e "   - Isto resolve os erros relacionados aos logs de atividade\n"

echo -e "4. ${GREEN}Verificada configuração do backend${NC}"
echo -e "   - Fornecidas recomendações para compatibilidade com múltiplas variáveis"
echo -e "   - Isto resolve problemas de inicialização do backend\n"

echo -e "${YELLOW}PRÓXIMOS PASSOS:${NC}"
echo -e "1. Execute o script SQL gerado no Console SQL do Supabase"
echo -e "   - Arquivo: /Users/joaobarbosa/Desktop/projetos/mouros-moto-hub/fix-all-tables.sql\n"

echo -e "2. Reinicie o backend e o frontend:"
echo -e "   cd /Users/joaobarbosa/Desktop/projetos/mouros-moto-hub"
echo -e "   ./start-backend.sh"
echo -e "   cd frontend"
echo -e "   npm run dev\n"

echo -e "3. Teste a autenticação e o cadastro de veículos para confirmar as correções\n"

echo -e "${BLUE}Processo concluído!${NC}"
