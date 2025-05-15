#!/bin/bash

# Este script libera a porta 3001 encerrando qualquer processo que a esteja usando

# Verificar se já existe um processo usando a porta 3001
PORT_PID=$(lsof -t -i:3001)
if [ ! -z "$PORT_PID" ]; then
  echo "Porta 3001 está em uso pelo processo $PORT_PID. Encerrando..."
  kill -9 $PORT_PID
  sleep 1
  echo "Porta 3001 liberada com sucesso."
else
  echo "Porta 3001 já está livre."
fi

exit 0
