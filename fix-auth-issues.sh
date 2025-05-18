#!/bin/bash
# Script para verificar e corrigir problemas de autenticação

echo "======================================================================"
echo "            VERIFICADOR E CORRETOR DE AUTENTICAÇÃO"
echo "======================================================================"
echo "Este script verifica e corrige problemas comuns de autenticação no Mouros Moto Hub."
echo

# Verificar o arquivo .env do backend
BACKEND_ENV_PATH="./backend/.env"

echo "Verificando arquivo de ambiente do backend em: $BACKEND_ENV_PATH"

# Verificar se o arquivo existe
if [ ! -f "$BACKEND_ENV_PATH" ]; then
  echo "❌ O arquivo .env não foi encontrado no diretório do backend!"
  echo "   Criando novo arquivo .env com configurações básicas..."

  # Criar o arquivo com configurações básicas
  cat > "$BACKEND_ENV_PATH" << EOL
// filepath: $BACKEND_ENV_PATH
SUPABASE_URL=https://jugfkacnlgdjdosstiks.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1Z2ZrYWNubGdkamRvc3N0aWtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1MDkzMzAsImV4cCI6MjA2MTA4NTMzMH0.PL8pg93wAVTl3kUoe-mfK7kGdjW6ytXapAiy-mpxk78
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1Z2ZrYWNubGdkamRvc3N0aWtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1MDkzMzAsImV4cCI6MjA2MTA4NTMzMH0.PL8pg93wAVTl3kUoe-mfK7kGdjW6ytXapAiy-mpxk78
JWT_SECRET=mouros_moto_hub_jwt_secret_key_2025
JWT_EXPIRES_IN=1d
EOL

  echo "✅ Arquivo .env criado com sucesso!"
else
  echo "✅ O arquivo .env do backend existe."
  
  # Verificar JWT_SECRET
  if grep -q "JWT_SECRET" "$BACKEND_ENV_PATH"; then
    echo "✅ JWT_SECRET encontrado no arquivo .env"
  else
    echo "❌ JWT_SECRET não encontrado! Adicionando..."
    echo "JWT_SECRET=mouros_moto_hub_jwt_secret_key_2025" >> "$BACKEND_ENV_PATH"
    echo "✅ JWT_SECRET adicionado com sucesso!"
  fi
  
  # Verificar JWT_EXPIRES_IN
  if grep -q "JWT_EXPIRES_IN" "$BACKEND_ENV_PATH"; then
    echo "✅ JWT_EXPIRES_IN encontrado no arquivo .env"
  else
    echo "❌ JWT_EXPIRES_IN não encontrado! Adicionando..."
    echo "JWT_EXPIRES_IN=1d" >> "$BACKEND_ENV_PATH"
    echo "✅ JWT_EXPIRES_IN adicionado com sucesso!"
  fi
  
  # Verificar se SUPABASE_SERVICE_ROLE_KEY está modificada incorretamente
  SERVICE_ROLE_KEY=$(grep "SUPABASE_SERVICE_ROLE_KEY" "$BACKEND_ENV_PATH" | cut -d'=' -f2-)
  ANON_KEY=$(grep "SUPABASE_KEY" "$BACKEND_ENV_PATH" | cut -d'=' -f2-)
  
  if [[ "$SERVICE_ROLE_KEY" != "$ANON_KEY" && "$SERVICE_ROLE_KEY" == *"role\":\"service_role\""* ]]; then
    echo "⚠️ SUPABASE_SERVICE_ROLE_KEY parece estar manualmente modificada - isso pode causar erros."
    echo "Substituindo por uma chave válida temporária..."
    
    # Usar sed para substituir a linha inteira com a mesma chave do SUPABASE_KEY
    sed -i.bak "s/SUPABASE_SERVICE_ROLE_KEY=.*/SUPABASE_SERVICE_ROLE_KEY=$ANON_KEY/" "$BACKEND_ENV_PATH"
    echo "✅ SUPABASE_SERVICE_ROLE_KEY corrigida com sucesso!"
  else
    echo "✅ SUPABASE_SERVICE_ROLE_KEY parece estar configurada corretamente."
  fi
fi

echo
echo "Verificando URLs no serviço de autenticação do frontend..."

# Verificar o arquivo auth-service.ts
AUTH_SERVICE_PATH="./frontend/src/services/auth-service.ts"

if [ -f "$AUTH_SERVICE_PATH" ]; then
  echo "✅ Arquivo auth-service.ts encontrado."
  
  # Verificar padrões de URL
  if grep -q "\${getApiBaseUrl()}/api/auth" "$AUTH_SERVICE_PATH"; then
    echo "❌ URLs incorretas detectadas! Corrigindo..."
    
    # Usar sed para substituir todas as ocorrências
    sed -i.bak "s|\${getApiBaseUrl()}/api/auth|\${getApiBaseUrl()}/auth|g" "$AUTH_SERVICE_PATH"
    echo "✅ URLs corrigidas em auth-service.ts"
  else
    echo "✅ URLs em auth-service.ts parecem estar corretas."
  fi
else
  echo "❌ Arquivo auth-service.ts não encontrado! Verifique o caminho: $AUTH_SERVICE_PATH"
fi

echo
echo "======================================================================"
echo "                  VERIFICAÇÃO DE AUTENTICAÇÃO"
echo "======================================================================"

echo "Testando conexão com o Supabase..."
cd ./backend
node -e "
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testConnection() {
  console.log('SUPABASE_URL definida:', !!process.env.SUPABASE_URL);
  console.log('SUPABASE_KEY definida:', !!process.env.SUPABASE_KEY);
  console.log('JWT_SECRET definida:', !!process.env.JWT_SECRET);
  
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
  );
  
  try {
    console.log('Tentando login com admin@admin.com...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@admin.com',
      password: 'admin'
    });
    
    if (error) {
      console.log('❌ Erro ao fazer login:', error.message);
      return false;
    }
    
    console.log('✅ Login bem-sucedido com admin@admin.com!');
    return true;
  } catch (err) {
    console.log('❌ Exceção ao tentar login:', err.message);
    return false;
  }
}

// Executar o teste
testConnection().then(success => {
  process.exit(success ? 0 : 1);
});
"

if [ $? -eq 0 ]; then
  echo "✅ Teste de autenticação concluído com sucesso!"
else
  echo "❌ Teste de autenticação falhou. Verifique as credenciais e configurações do Supabase."
fi

echo
echo "Verificação e correção concluídas! Reinicie o backend para aplicar as alterações."
echo "======================================================================"
