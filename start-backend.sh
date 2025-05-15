#!/bin/bash

# Diretório do projeto
BACKEND_DIR="/Users/joaobarbosa/Desktop/projetos/mouros-moto-hub/backend"

# Navegar para o diretório do backend
cd "$BACKEND_DIR"

# Limpar a porta usando o script clean-port.sh
echo "Executando script de limpeza da porta 3001..."
/Users/joaobarbosa/Desktop/projetos/mouros-moto-hub/clean-port.sh

# Verificar se há um PID anterior salvo
if [ -f backend.pid ]; then
  OLD_PID=$(cat backend.pid)
  if ps -p $OLD_PID > /dev/null; then
    echo "Encontrado servidor anterior rodando (PID: $OLD_PID). Encerrando..."
    kill $OLD_PID
    sleep 2
  fi
fi

# Iniciar o servidor em background e salvar o PID
npm run dev > backend.log 2>&1 &
echo $! > backend.pid

echo "Servidor backend iniciado. PID: $(cat backend.pid)"
echo "Log sendo salvo em: $BACKEND_DIR/backend.log"

# Aguardar um momento para o servidor iniciar
echo "Aguardando o servidor iniciar..."
sleep 3

# Verificar se o servidor está rodando acessando um endpoint
curl -s http://localhost:3001/api/health -o /dev/null
if [ $? -eq 0 ]; then
  echo "Servidor backend está funcionando na porta 3001!"
else
  echo "ERRO: Servidor backend não está respondendo na porta 3001."
  echo "Verifique os logs em $BACKEND_DIR/backend.log"
fi
