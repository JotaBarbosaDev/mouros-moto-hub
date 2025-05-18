# CORREÇÕES IMPLEMENTADAS - MOUROS MOTO HUB

Este documento detalha todas as correções implementadas para resolver os problemas identificados no sistema Mouros Moto Hub.

## 📋 VISÃO GERAL DOS PROBLEMAS RESOLVIDOS

Foram identificados e corrigidos seis problemas principais:

1. **URLs incorretas nos serviços de autenticação** - Causando erros 500 ao tentar fazer login e acessar `/api/auth/me`
2. **Coluna `engine_size` ausente** - Causando erros 500 ao salvar veículos
3. **Tabela `activity_logs` inexistente** - Causando erros ao tentar registrar atividades
4. **Problemas na inicialização do backend** - Relacionados à configuração do Supabase
5. **Inconsistência nos padrões de URL da API** - Causando conflitos entre frontend e backend
6. **Configuração incorreta de autenticação** - Problemas nas chaves do Supabase e JWT_SECRET causando erros de login

## 🔧 DETALHES DAS CORREÇÕES

### 1. Correção das URLs de Autenticação

**Problema:** URLs com formatação incorreta nos serviços de autenticação causando erros 500.

**Causa:** Inconsistência na construção das URLs:
- A função `getApiBaseUrl()` já inclui o prefixo `/api`
- No backend, as rotas são montadas como `/api/auth/...`
- No frontend, após correção anterior, as chamadas estavam usando `${getApiBaseUrl()}/auth/...`, resultando em um caminho incorreto

**Solução:**
- Identificamos que a variável de ambiente `VITE_API_URL` já contém `/api` e as rotas no backend são configuradas como `/api/auth/*`
- Corrigidas as URLs no arquivo `frontend/src/services/auth-service.ts` para usar o caminho correto:
  - De: `${getApiBaseUrl()}/api/auth/login` para `${getApiBaseUrl()}/auth/login`
  - De: `${getApiBaseUrl()}/api/auth/register` para `${getApiBaseUrl()}/auth/register`
  - De: `${getApiBaseUrl()}/api/auth/logout` para `${getApiBaseUrl()}/auth/logout`
  - De: `${getApiBaseUrl()}/api/auth/me` para `${getApiBaseUrl()}/auth/me`
- Criado script `check-api-url-patterns.sh` para verificar e corrigir automaticamente todos os padrões de URL nos serviços

### 2. Correção da Coluna `engine_size`

**Problema:** Erro 500 ao salvar veículos devido à ausência da coluna `engine_size`.

**Causa:** A coluna `engine_size` estava sendo esperada pelo backend, mas não existia no banco de dados.

**Soluções:**
1. **Frontend:** Modificado `vehicle-service.ts` para incluir o campo `engine_size` em todas as operações
2. **Backend:** Criada utilidade `vehicle-patch.js` para verificar e adicionar a coluna se não existir
3. **Banco de dados:** Criado script SQL para adicionar a coluna ao banco de dados

**Scripts SQL:**
```sql
-- Adicionar coluna engine_size
DO $$
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
END $$;
```

### 3. Correção da Tabela `activity_logs`

**Problema:** Erros ao tentar registrar atividades no sistema devido à ausência da tabela `activity_logs`.

**Causa:** A tabela `activity_logs` era referenciada pelo código, mas não existia no banco de dados.

**Soluções:**
1. **Frontend:** Criado script `create-activity-logs.ts` para criar a tabela via código
2. **Backend:** Adicionado tratamento de erro no `activity-log-service.js` para verificar se a tabela existe
3. **Banco de dados:** Criado script SQL para adicionar a tabela ao banco de dados

**Scripts SQL:**
```sql
-- Criar tabela activity_logs
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

-- Políticas de segurança para a tabela de logs
CREATE POLICY insert_logs_policy ON public.activity_logs 
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY select_logs_policy ON public.activity_logs 
  FOR SELECT TO authenticated USING (
    auth.uid() IN (
      SELECT id FROM public.members WHERE is_admin = true
    )
  );
```

### 4. Correção da Inicialização do Backend

**Problema:** Erros na inicialização do backend relacionados à configuração do Supabase.

**Causa:** O backend esperava variáveis de ambiente específicas, mas não tinha fallbacks adequados.

**Solução:**
- Modificado o arquivo `backend/src/config/supabase.js` para aceitar múltiplas variáveis de ambiente:
  ```js
  const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY,
    {...}
  );
  
  const supabaseClient = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY
  );
  ```

## 📝 SCRIPTS CRIADOS

Para facilitar o diagnóstico e a correção dos problemas, foram criados os seguintes scripts:

1. **`verify-and-fix-tables.sh`** - Script bash para verificar e corrigir problemas nas tabelas do banco de dados
2. **`fix-all-issues.sh`** - Script bash para diagnosticar e corrigir todos os problemas do sistema
3. **`fix-all-tables.sql`** - Script SQL unificado para corrigir todas as tabelas no banco de dados
4. **`check-api-url-patterns.sh`** - Script para verificar e corrigir padrões de URL nos serviços de API do frontend

## 🔍 COMO TESTAR AS CORREÇÕES

1. **Autenticação:**
   - Fazer login no sistema
   - Verificar se a informação do usuário é carregada corretamente
   - Verificar se o histórico de atividades está sendo exibido

2. **Cadastro de Veículos:**
   - Adicionar um novo veículo
   - Verificar se o veículo é salvo sem erros
   - Verificar se o veículo aparece na lista de veículos

3. **Sistema de Logs:**
   - Realizar algumas ações no sistema (adicionar membro, veículo, etc.)
   - Verificar se as atividades estão sendo registradas no histórico
   - Verificar se não há erros no console relacionados aos logs

## 🚀 COMO IMPLEMENTAR AS CORREÇÕES

1. **Correções Automáticas:**
   - Execute o script `fix-all-issues.sh` para diagnóstico e correção automática
   - Execute o script `verify-and-fix-tables.sh` para verificar e corrigir problemas nas tabelas do banco de dados

2. **Correções Manuais:**
   - Execute o script SQL `fix-all-tables.sql` no Console SQL do Supabase
   - Reinicie o backend e o frontend após as correções

## 🔐 CONSIDERAÇÕES DE SEGURANÇA

- Os scripts criados utilizam a chave de serviço do Supabase, que tem privilégios elevados
- Evite compartilhar os scripts com pessoas não autorizadas
- Considere revogar ou substituir as chaves de acesso após a correção dos problemas

## 📈 PRÓXIMOS PASSOS RECOMENDADOS

1. **Implementar sistema de migração** - Utilizar um sistema formal de migração de banco de dados para evitar problemas similares no futuro
2. **Melhorar tratamento de erros** - Adicionar mais logs e validações para facilitar a detecção de problemas
3. **Testes automatizados** - Implementar testes automatizados para verificar a integridade do banco de dados e dos serviços
4. **Documentação** - Manter a documentação atualizada sobre a estrutura do banco de dados e requisitos do sistema

### 6. Correção da Configuração de Autenticação

**Problema:** Erros 500 ao tentar fazer login, mesmo após correção das URLs.

**Causa:** Identificamos três causas principais:
1. Configuração incorreta das chaves do Supabase, com a mesma chave sendo usada para `SUPABASE_KEY` e `SUPABASE_SERVICE_ROLE_KEY`, mas com token JWT inválido
2. Ausência da variável de ambiente `JWT_SECRET` necessária para assinar tokens JWT no processo de autenticação
3. Uso da função `admin.getUserById` no controlador de perfil que requer permissões administrativas que a chave anônima não possui

**Solução:**
1. **Configuração do Supabase:** 
   - Revertido o `SUPABASE_SERVICE_ROLE_KEY` para usar a mesma chave anônima do `SUPABASE_KEY`, permitindo a autenticação básica
   - Esta é uma correção temporária, enquanto não se obtém a chave de serviço correta

2. **Variáveis de ambiente JWT:**
   - Adicionadas as variáveis essenciais ao arquivo `.env` do backend:
     ```
     JWT_SECRET=mouros_moto_hub_jwt_secret_key_2025
     JWT_EXPIRES_IN=1d
     ```

3. **Modificação do controlador de autenticação:**
   - Atualizado o controlador para incluir mais informações no token JWT (nome, role, metadata)
   - Implementado suporte para usuários de teste, incluindo admin@admin.com para facilitar desenvolvimento
   - Eliminada a dependência da função `admin.getUserById` do Supabase para obter perfil

4. **Verificação de funcionamento:**
   - Criado script de teste `test-supabase-connection.js` para validar a conexão com o Supabase
   - Criado script `test-auth.sh` para validar todo o fluxo de autenticação
   - Confirmado funcionamento correto do login e da rota de perfil

**Documentação adicional:**
- Criado arquivo `docs/CORRECAO-AUTENTICACAO.md` com detalhes sobre a solução e recomendações futuras
- Adicionadas instruções para obter a chave de serviço correta em produção
- Documetada a abordagem alternativa para obter o perfil sem precisar de permissões administrativas

---

**Autor:** João Barbosa  
**Data:** 18 de maio de 2025  
**Versão:** 1.1
