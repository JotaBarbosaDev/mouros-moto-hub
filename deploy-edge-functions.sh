#!/bin/bash
# Script para implantar as funções Edge no Supabase

echo "🚀 Iniciando implantação das funções Edge do Supabase..."

# Verifica se o CLI do Supabase está instalado
if ! command -v supabase &> /dev/null; then
    echo "❌ CLI do Supabase não encontrado! Instalando..."
    brew install supabase/tap/supabase
fi

echo "🔑 Fazendo login no Supabase..."
supabase login

# Obtém o projeto atual
PROJECT_ID=$(supabase projects list --db-url | grep -i "mouros-moto-hub" | awk '{print $1}')

if [ -z "$PROJECT_ID" ]; then
    echo "❌ Projeto não encontrado. Por favor, forneça o ID do projeto:"
    read PROJECT_ID
fi

echo "🔍 Implantando para o projeto: $PROJECT_ID"

# Implanta as funções Edge
echo "📤 Implantando função user-management..."
supabase functions deploy user-management --project-ref "$PROJECT_ID"

echo "📤 Implantando função list-users..."
supabase functions deploy list-users --project-ref "$PROJECT_ID"

# Verifica se a implantação foi bem-sucedida
if [ $? -eq 0 ]; then
    echo "✅ Funções Edge implantadas com sucesso!"
    
    echo "📝 Configurando permissões das funções..."
    supabase functions update-policy user-management --project-ref "$PROJECT_ID" --policy public
    supabase functions update-policy list-users --project-ref "$PROJECT_ID" --policy public
    
    echo "📋 Lista de funções implantadas:"
    supabase functions list --project-ref "$PROJECT_ID"
else
    echo "❌ Erro ao implantar funções Edge!"
fi

echo "🔄 Implantando migrações SQL..."
supabase db push

echo "🎉 Processo concluído!"
