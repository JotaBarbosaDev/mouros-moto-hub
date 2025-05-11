-- filepath: /Users/joaobarbosa/Desktop/projetos/mouros-moto-hub/supabase/migrations/20250510120202_create_username_column.sql
DO $$
BEGIN
    -- Adiciona a coluna username se ela não existir
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'members' AND column_name = 'username'
    ) THEN
        ALTER TABLE members ADD COLUMN username VARCHAR(255);
    END IF;
    
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
    
    -- Adiciona a constraint UNIQUE se ela ainda não existir
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint c
        JOIN pg_namespace n ON n.oid = c.connamespace
        WHERE c.conname = 'username_unique'
        AND n.nspname = current_schema()
    ) THEN
        ALTER TABLE members ADD CONSTRAINT username_unique UNIQUE (username);
    END IF;
END
$$;
