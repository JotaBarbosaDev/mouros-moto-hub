#!/bin/bash
# Script para atualizar os arquivos de serviço para a versão corrigida

echo "Iniciando atualização de código para resolver problema de coluna username..."

# Verifica se o arquivo member-service-robust-fixed.ts existe
if [ -f "./src/services/member-service-robust-fixed.ts" ]; then
    echo "Encontrado arquivo de serviço corrigido."
    
    # Faz um backup do arquivo original
    echo "Criando backup do serviço original..."
    cp ./src/services/member-service-robust.ts ./src/services/member-service-robust.bak
    
    # Substitui o arquivo original pelo corrigido
    echo "Substituindo pelo arquivo corrigido..."
    cp ./src/services/member-service-robust-fixed.ts ./src/services/member-service-robust.ts
    
    echo "Serviço atualizado com sucesso!"
else
    echo "Erro: Arquivo de serviço corrigido não encontrado."
    exit 1
fi

echo ""
echo "Leia o arquivo COMO_CORRIGIR_ERRO_USERNAME.md para mais informações sobre as alterações."
echo "Para adicionar a coluna username no banco de dados, siga as instruções no mesmo arquivo."
echo ""
echo "Atualização concluída!"
