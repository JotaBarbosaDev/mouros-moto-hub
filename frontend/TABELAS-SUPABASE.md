# Guia para Inicialização e Manutenção das Tabelas no Supabase

Este documento descreve como inicializar e manter as tabelas do sistema no Supabase para o projeto Mouros Moto Hub.

> 🔴 **IMPORTANTE**: Antes de inicializar as tabelas, certifique-se que a função `exec_sql` existe no seu banco de dados. Caso contrário, execute o script `./create-exec-sql.sh` para criar essa função. Veja o documento `CORRECAO-EXEC-SQL.md` para mais detalhes.

## Arquivos Principais

1. **SystemInitializer.tsx**
   - Localização: `/src/components/system/SystemInitializer.tsx`
   - Função: Componente React que verifica e cria automaticamente as tabelas necessárias quando o aplicativo é iniciado
   - Usado durante operação normal do aplicativo

2. **init-tables.js**
   - Localização: `/src/init-tables.js`
   - Função: Script Node.js independente para criar e inicializar tabelas
   - Útil para troubleshooting ou em ambientes de CI/CD

3. **init-tables.sh**
   - Localização: `/init-tables.sh`
   - Função: Script shell que executa o `init-tables.js`
   - Fornece uma maneira fácil de inicializar tabelas pela linha de comando

## Como Usar

### Opção 1: Inicialização Automática

Simplesmente inicie o aplicativo normalmente. O componente `SystemInitializer` será carregado e verificará automaticamente se as tabelas existem, criando-as se necessário.

```bash
# Iniciar o aplicativo
npm run dev
```

### Opção 2: Inicialização Manual

Use o script shell para inicializar as tabelas diretamente.

```bash
# Na pasta raiz do frontend
cd /Users/joaobarbosa/Desktop/projetos/mouros-moto-hub/frontend

# Executar o script de inicialização
./init-tables.sh
```

## Tabelas Criadas

O sistema cria e gerencia as seguintes tabelas:

1. **club_settings**
   - Armazena configurações gerais do clube
   - Inclui nome, cores, valores de mensalidades, etc.

2. **settings**
   - Armazena configurações específicas do sistema
   - Formato de chave-valor para configurações diversas

3. **member_fee_settings**
   - Configurações de mensalidades para membros
   - Gerencia períodos de isenção, datas de associação, etc.

4. **fee_payments**
   - Registros de pagamentos de mensalidades
   - Controla pagamentos por membro e por ano

## Solução de Problemas

### Erros Comuns:

1. **Função exec_sql não encontrada**
   - Mensagem: `Could not find the function public.exec_sql(sql) in the schema cache`
   - Causa: A função SQL customizada não existe no banco de dados
   - Solução: Execute o script `./create-exec-sql.sh` para criar esta função

2. **Tabela não encontrada (404 Not Found)**
   - Causa: As tabelas não foram criadas corretamente
   - Solução: Execute `./init-tables.sh` para criar as tabelas manualmente

3. **Erro de permissão**
   - Causa: Credenciais do Supabase incorretas ou sem permissões
   - Solução: Verifique o arquivo `.env.local` e as permissões no painel do Supabase

3. **Erro ao criar a função uuid_generate_v4**
   - Causa: Extensão uuid-ossp não está disponível
   - Solução: Verifique se o plano do Supabase permite extensões ou contate o suporte

## Manutenção

Para modificar a estrutura das tabelas:

1. Atualize o arquivo `SystemInitializer.tsx` com as novas definições de tabelas
2. Atualize o arquivo `init-tables.js` com as mesmas alterações
3. Execute `./init-tables.sh` para aplicar as alterações

**Importante**: Mudanças estruturais podem exigir migração de dados existentes!
