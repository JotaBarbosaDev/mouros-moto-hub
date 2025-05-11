## Como Corrigir Erros de Colunas no Banco de Dados

Este documento explica como resolver problemas de TypeScript relacionados a colunas que não existem na tabela `members` do banco de dados Supabase.

## Diagnóstico do Problema

O código atual tenta acessar uma coluna `username` na tabela `members` que não existe no banco de dados. Além disso, foram identificadas inconsistências com os campos `legacy_member`, `registration_fee_paid` e `registration_fee_exempt`. Isso causa erros TypeScript e problemas em tempo de execução quando o aplicativo tenta usar estas colunas.Corrigir o Erro de Coluna Username

Este documento explica como resolver o problema de TypeScript relacionado à coluna `username` que não existe na tabela `members` do banco de dados Supabase.

## Diagnóstico do Problema

O código atual tenta acessar uma coluna `username` na tabela `members` que não existe no banco de dados. Isso causa erros TypeScript e problemas em tempo de execução quando o aplicativo tenta usar esta coluna.

## Solução Implementada

As seguintes correções foram aplicadas para resolver o problema:

1. **Atualização do helper `isUsernameColumnAvailable()`**:
   - Agora a função retorna diretamente `false` sem consultar o banco de dados, já que sabemos que a coluna não existe.

2. **Remoção do campo username do componente `MemberBasicInfoTab`**:
   - O campo foi comentado no componente para que não apareça mais na interface.

3. **Atualização da função `handleSubmit()` no `EditMemberDialog.tsx`**:
   - Removida a lógica que tentava salvar o username no banco de dados.
   - Adicionados logs informativos quando um usuário fornece um username.

4. **Correção das definições de tipos**:
   - Atualizada a interface `MemberDbResponse` para incluir os campos `legacy_member`, `registration_fee_paid` e `registration_fee_exempt`.
   - Atualizada a interface `MemberExtended` para refletir os mesmos campos.
   - Ajustado o tipo base `Member` para tornar esses campos opcionais e compatíveis.

5. **Correção de erros de sintaxe**:
   - Corrigido um problema na função `getMembersFromDb()` onde havia uma chave de fechamento extra.
   - Melhorada a desestruturação para atribuir diretamente a variável `membersData`.

6. **Criação de uma versão robusta do serviço de membros**:
   - Criado um arquivo `member-service-robust-fixed.ts` que não tenta mais usar a coluna username.
   - O serviço agora deriva o username do email do usuário para fins de UI.

## Como Aplicar esta Correção

Você tem duas opções:

### Opção 1: Continuar sem a coluna username

1. Substitua o arquivo `member-service-robust.ts` pelo arquivo `member-service-robust-fixed.ts` que foi criado.
   ```bash
   cp /Users/joaobarbosa/Desktop/projetos/mouros-moto-hub/src/services/member-service-robust-fixed.ts /Users/joaobarbosa/Desktop/projetos/mouros-moto-hub/src/services/member-service-robust.ts
   ```

### Opção 2: Adicionar a coluna username ao banco de dados

Se você precisar da funcionalidade de username, você pode adicionar a coluna ao banco de dados:

1. Acesse o painel de controle do Supabase.
2. Vá para a seção "Table Editor".
3. Selecione a tabela `members`.
4. Adicione uma nova coluna chamada `username` do tipo `text`, permitindo valores nulos.
5. Opcionalmente, defina a coluna como única para evitar nomes de usuário duplicados.

Também é possível usar a migração existente:

1. Execute o comando SQL da migração no Console SQL do Supabase:
   ```sql
   ALTER TABLE members ADD COLUMN IF NOT EXISTS username TEXT;
   ALTER TABLE members ADD CONSTRAINT members_username_unique UNIQUE (username);
   ```

## Considerações Adicionais

- O sistema agora vai usar o nome antes do @ do email como username para fins de exibição.
- Se você precisar da funcionalidade completa de username, é recomendado implementar a opção 2.
- Após aplicar a migração, você pode remover todos os comentários e ajustes temporários relacionados ao username que foram adicionados como solução.

## Impacto da Mudança

### Componentes Afetados
1. **EditMemberDialog.tsx**: O diálogo não tentará mais salvar o campo username no banco de dados.
2. **MemberBasicInfoTab.tsx**: O campo de entrada para username está oculto na interface.
3. **member-service-robust.ts**: O serviço agora deriva o username do email em vez de tentar buscá-lo do banco de dados.

### Comportamento da Aplicação
- Os usernames exibidos na UI serão derivados do texto antes do @ nos endereços de email.
- Formulários que anteriormente permitiam personalizar o username não terão mais efeito (o campo está oculto).
- O login e autenticação não são afetados, pois usam a tabela auth.users do Supabase.

## Script de Automação

Foi incluído um script `atualizar_codigo_username.sh` que pode ser executado para aplicar automaticamente as correções:

```bash
cd /Users/joaobarbosa/Desktop/projetos/mouros-moto-hub
chmod +x atualizar_codigo_username.sh
./atualizar_codigo_username.sh
```
