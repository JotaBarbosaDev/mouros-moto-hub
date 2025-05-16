#!/usr/bin/env python3
import os
import requests
import json

# Carregar as variáveis de ambiente do arquivo .env
env_vars = {}
with open('.env', 'r') as f:
    for line in f:
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        key, value = line.split('=', 1)
        env_vars[key] = value

# Obter as variáveis necessárias
supabase_url = env_vars.get('SUPABASE_URL')
service_key = env_vars.get('SUPABASE_SERVICE_ROLE_KEY')

if not supabase_url or not service_key:
    print("❌ Variáveis de ambiente SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não encontradas")
    exit(1)

print(f"✅ Variáveis de ambiente carregadas: URL={supabase_url}")

# Ler o SQL do arquivo
with open('create-activity-logs-table.sql', 'r') as f:
    sql_content = f.read()

# Criar a tabela
url = f"{supabase_url}/rest/v1/sql"
headers = {
    "apikey": service_key,
    "Authorization": f"Bearer {service_key}",
    "Content-Type": "application/json"
}

# Sanitizar SQL para evitar problemas de formatação JSON
sql_content = sql_content.replace('\n', ' ').replace('"', '\\"')

print("📝 Enviando SQL para criar a tabela...")
payload = {"query": sql_content}
response = requests.post(url, headers=headers, json=payload)

if response.status_code >= 200 and response.status_code < 300:
    print(f"✅ Tabela criada com sucesso! Status code: {response.status_code}")
else:
    print(f"❌ Erro ao criar tabela. Status code: {response.status_code}")
    print(f"Resposta: {response.text}")

# Verificar se a tabela foi criada
verify_url = f"{supabase_url}/rest/v1/information_schema/tables"
query_params = {
    "select": "table_name",
    "table_schema": "eq.public",
    "table_name": "eq.activity_logs"
}

print("🔍 Verificando se a tabela foi criada...")
response = requests.get(verify_url, headers=headers, params=query_params)

if response.status_code >= 200 and response.status_code < 300:
    results = response.json()
    if results:
        print(f"✅ Tabela activity_logs encontrada: {results}")
    else:
        print("❌ Tabela activity_logs NÃO foi encontrada no banco")
else:
    print(f"❌ Erro ao verificar tabela. Status code: {response.status_code}")
    print(f"Resposta: {response.text}")

# Tentar um teste direto
try_url = f"{supabase_url}/rest/v1/activity_logs"
test_data = {
    "username": "sistema_teste",
    "action": "TEST",
    "entity_type": "SYSTEM",
    "details": {"message": "Teste de criação da tabela de logs"}
}

print("🧪 Tentando inserir um registro de teste...")
response = requests.post(try_url, headers=headers, json=test_data)

if response.status_code >= 200 and response.status_code < 300:
    print("✅ Registro de teste inserido com sucesso!")
else:
    print(f"❌ Erro ao inserir registro de teste. Status code: {response.status_code}")
    print(f"Resposta: {response.text}")

print("✨ Processo concluído")
