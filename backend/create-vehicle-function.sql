-- Script para criar função RPC que contorna as políticas RLS para inserção de veículos
CREATE OR REPLACE FUNCTION public.insert_vehicle(vehicle_data JSONB)
RETURNS SETOF vehicles
LANGUAGE plpgsql
SECURITY DEFINER -- Isso executa com as permissões do criador da função, não do chamador
AS $$
BEGIN
  -- Inserir o veículo ignorando as políticas RLS
  RETURN QUERY
  INSERT INTO public.vehicles (
    member_id,
    brand,
    model,
    type,
    displacement,
    nickname,
    photo_url,
    license_plate,
    year,
    color,
    created_at,
    updated_at
  )
  VALUES (
    (vehicle_data->>'member_id')::uuid, 
    vehicle_data->>'brand',
    vehicle_data->>'model',
    vehicle_data->>'type',
    COALESCE((vehicle_data->>'displacement')::integer, 0),
    vehicle_data->>'nickname',
    vehicle_data->>'photo_url',
    vehicle_data->>'license_plate',
    NULLIF(vehicle_data->>'year', '')::integer,
    vehicle_data->>'color',
    COALESCE((vehicle_data->>'created_at')::timestamp, NOW()),
    COALESCE((vehicle_data->>'updated_at')::timestamp, NOW())
  )
  RETURNING *;
END;
$$;

-- Conceder permissão para o service_role chamar esta função
GRANT EXECUTE ON FUNCTION public.insert_vehicle(JSONB) TO service_role;
