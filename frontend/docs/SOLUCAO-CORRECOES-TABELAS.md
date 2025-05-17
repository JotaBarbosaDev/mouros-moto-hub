# Correção de Problemas no Mouros Moto Hub

Este documento descreve como resolver dois problemas encontrados no sistema:

1. **Erro 500 ao salvar veículos**: `Could not find the 'engine_size' column of 'vehicles' in the schema cache`
2. **Erro de tabela não encontrada**: `relation "public.activity_logs" does not exist`

## 🔧 Soluções Implementadas

### 1. Solução para o problema da coluna `engine_size`

#### Implementado:
- ✅ Modificamos o serviço de veículos (`vehicle-service.ts`) para lidar com o erro de coluna inexistente
- ✅ Criamos um script para adicionar a coluna `engine_size` à tabela `vehicles`

#### Como usar a solução:

**Opção A - Usando a tratativa de erro:**
A solução já está implementada no serviço de veículos. O código agora identifica o erro de "engine_size não encontrada" e faz uma segunda tentativa sem esse campo.

**Opção B - Executar o script para adicionar a coluna:**
Execute o script para adicionar a coluna via frontend:

```bash
cd /Users/joaobarbosa/Desktop/projetos/mouros-moto-hub/frontend
npx vite-node src/scripts/add-engine-size.ts
```

### 2. Solução para o problema da tabela `activity_logs`

#### Implementado:
- ✅ Criamos um script para criar a tabela `activity_logs`
- ✅ Removemos as dependências diretas para logs de atividades não críticos

#### Como usar a solução:

Execute o script para criar a tabela via frontend:

```bash
cd /Users/joaobarbosa/Desktop/projetos/mouros-moto-hub/frontend
npx vite-node src/scripts/create-activity-logs.ts
```

## 🧪 Como testar a solução

1. Reinicie o servidor backend e o frontend:
   ```bash
   cd /Users/joaobarbosa/Desktop/projetos/mouros-moto-hub
   ./start-backend.sh
   cd frontend
   npm run dev
   ```

2. Tente adicionar um novo veículo:
   - Se você executou os scripts, deve funcionar normalmente
   - Se não executou os scripts, o sistema tentará uma segunda abordagem automaticamente

## 🧩 Soluções alternativas (se necessário)

### Executar SQL diretamente no Supabase

Se você tiver acesso ao Console SQL do Supabase, execute:

```sql
-- Criar função exec_sql (necessária para os scripts)
CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
RETURNS SETOF json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY EXECUTE sql;
END;
$$;

-- Configurar permissões
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO anon, authenticated;

-- Adicionar coluna engine_size
ALTER TABLE public.vehicles 
ADD COLUMN IF NOT EXISTS engine_size INTEGER;

-- Atualizar valores existentes
UPDATE public.vehicles SET engine_size = displacement 
WHERE engine_size IS NULL AND displacement IS NOT NULL;

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

-- Configurar RLS e permissões para a tabela
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT ON public.activity_logs TO authenticated;
GRANT SELECT ON public.activity_logs TO anon;
CREATE POLICY insert_logs_policy ON public.activity_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY select_logs_policy ON public.activity_logs FOR SELECT TO authenticated USING (
  auth.uid() IN (
    SELECT id FROM public.members WHERE is_admin = true
  )
);
```

## 📝 Notas Adicionais

1. Este é um problema comum em ambientes com bancos de dados desincronizados entre desenvolvimento e produção.

2. Para evitar problemas similares no futuro, recomenda-se:
   - Manter scripts SQL de migração atualizados
   - Implementar um sistema de controle de versão para o esquema do banco de dados
   - Usar tratamento de erros consistente para lidar com discrepâncias entre ambientes

3. Se os problemas persistirem, entre em contato com o DBA para verificar a estrutura do banco de dados.
