# Correção do Problema de Inicialização do Backend

## Problema Identificado

O servidor backend estava falhando ao inicializar com o seguinte erro:

```
Error: supabaseKey is required.
```

Isso ocorria porque:
1. O arquivo de configuração do Supabase estava procurando especificamente pelas variáveis `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` e `SUPABASE_ANON_KEY`.
2. No entanto, o arquivo `.env` estava configurado com `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` e `SUPABASE_KEY`.
3. O código não estava preparado para lidar com essa discrepância de nomes das variáveis.

## Solução Implementada

Modificamos o arquivo de configuração do Supabase (`/backend/src/config/supabase.js`) para:

1. Aceitar tanto `SUPABASE_SERVICE_ROLE_KEY` quanto `SUPABASE_KEY` para o cliente administrativo:
```javascript
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
```

2. Aceitar tanto `SUPABASE_ANON_KEY` quanto `SUPABASE_KEY` para o cliente público:
```javascript
const supabaseClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY
);
```

3. Melhorar a verificação das variáveis de ambiente para ser mais flexível:
```javascript
// Verificar URL
const requiredEnvVars = ['SUPABASE_URL'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Variável de ambiente ${envVar} não configurada. Verifique o arquivo .env`);
  }
}

// Verificar se pelo menos uma das chaves está disponível
if (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_KEY) {
  throw new Error(`Nem SUPABASE_SERVICE_ROLE_KEY nem SUPABASE_KEY foram configuradas. Verifique o arquivo .env`);
}
```

## Configuração do Ambiente Supabase

Para garantir que o backend funcione corretamente, o arquivo `.env` deve conter pelo menos as seguintes variáveis:

```
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-chave-de-servico
```

ou

```
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua-chave-de-acesso
```

## Como Testar

1. Certifique-se de que o arquivo `.env` na pasta `backend` contém as variáveis necessárias.
2. Execute o servidor backend:
```bash
cd /Users/joaobarbosa/Desktop/projetos/mouros-moto-hub
./start-backend.sh
```
3. Verifique se o servidor inicia sem erros e está disponível em http://localhost:3001

## Verificação Adicional

Se você precisar verificar suas variáveis de ambiente, use o script de teste:
```bash
cd /Users/joaobarbosa/Desktop/projetos/mouros-moto-hub/backend
node test-env.js
```

Este script mostrará quais variáveis de ambiente relacionadas ao Supabase estão definidas, sem revelar seus valores.
