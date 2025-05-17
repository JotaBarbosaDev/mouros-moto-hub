#!/bin/bash
# Script para criar tabela de logs de atividade usando a função exec_sql

echo "Criando tabela de logs de atividade..."

# Obter o diretório atual do script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Executar o script SQL
cd "$DIR"/../frontend && node create-exec-sql-direct.sh ../backend/create-activity-logs-table.sql

echo "Tabela de logs criada com sucesso!"
