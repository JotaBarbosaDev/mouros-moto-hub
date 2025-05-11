# Instruções para aplicar a migração da coluna Username

Você está enfrentando problemas porque a coluna `username` não existe na tabela `members` do seu banco de dados Supabase, mas o código da aplicação espera que ela exista.

## Opção 1: Aplicar a migração existente

Uma migração para adicionar esta coluna já foi criada, mas parece que ainda não foi aplicada ao seu banco de dados. Para aplicá-la:

1. Navegue até a pasta raiz do projeto:
```bash
cd /Users/joaobarbosa/Desktop/projetos/mouros-moto-hub
```

2. Execute o comando para aplicar a migração:
```bash
npx supabase migration up
```

Ou, se você usa o CLI do Supabase diretamente:
```bash
supabase db push
```

## Opção 2: Criar a coluna manualmente

Se a opção 1 não funcionar, você pode criar a coluna manualmente:

1. Acesse o painel do Supabase (console.supabase.com)
2. Vá para o seu projeto
3. Na seção "Table Editor", selecione a tabela "members"
4. Clique em "Add column"
5. Configure a nova coluna:
   - Nome: `username`
   - Tipo: `varchar(255)`
   - Marque como nullable (pode ser nulo)
   - Opcional: Adicione um constraint UNIQUE

6. Execute este SQL para preencher os usernames existentes:
```sql
-- Preenche usernames vazios com base no email
UPDATE members
SET username = SPLIT_PART(email, '@', 1)
WHERE username IS NULL OR username = '';

-- Adiciona um sufixo numérico para usernames duplicados
WITH duplicados AS (
    SELECT id, username, 
    ROW_NUMBER() OVER (PARTITION BY username ORDER BY id) AS rn
    FROM members
    WHERE username IS NOT NULL
)
UPDATE members m
SET username = m.username || (SELECT rn FROM duplicados d WHERE d.id = m.id)
WHERE m.id IN (SELECT id FROM duplicados WHERE rn > 1);
```

## Observações importantes

- A aplicação foi projetada para funcionar tanto com quanto sem a coluna `username`.
- Se você optar por não criar a coluna, parte da funcionalidade relacionada a usernames estará indisponível, mas a aplicação continuará funcionando.
- As modificações feitas neste projeto garantem que a aplicação não quebre caso a coluna não exista.
