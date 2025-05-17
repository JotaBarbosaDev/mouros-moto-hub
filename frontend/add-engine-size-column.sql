-- Adicionar a coluna engine_size à tabela vehicles se ela não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'vehicles'
    AND column_name = 'engine_size'
  ) THEN
    ALTER TABLE public.vehicles ADD COLUMN engine_size INTEGER;
  END IF;
END $$;

-- Atualizar valores existentes para garantir que engine_size corresponda a displacement
UPDATE public.vehicles SET engine_size = displacement WHERE engine_size IS NULL AND displacement IS NOT NULL;

-- Comentário para verificar se a coluna foi adicionada
SELECT * FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'vehicles' 
AND column_name = 'engine_size';

-- Listar todas as colunas da tabela vehicles
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'vehicles'
ORDER BY ordinal_position;
