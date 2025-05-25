-- =========================================
-- CORREÇÃO DA ESTRUTURA DO BANCO DE DADOS
-- Mouros Moto Hub - Resolver discrepâncias
-- =========================================

-- 1. CRIAR TABELA VEHICLES (referenciada mas não existe)
-- Baseada na estrutura definida no GUIAO_DO_SISTEMA.md

CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM NOW()) + 2),
  type VARCHAR(50) DEFAULT 'Mota',
  displacement INTEGER, -- Cilindrada em cc
  engine_size INTEGER, -- Compatibilidade com campo existente
  license_plate VARCHAR(20) UNIQUE,
  nickname VARCHAR(100),
  photo_url TEXT,
  color VARCHAR(50),
  vin VARCHAR(100), -- Vehicle Identification Number
  insurance_company VARCHAR(200),
  insurance_policy VARCHAR(100),
  insurance_expiry DATE,
  inspection_expiry DATE,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. COMENTÁRIOS PARA A TABELA VEHICLES
COMMENT ON TABLE public.vehicles IS 'Tabela de veículos dos membros do moto clube';
COMMENT ON COLUMN public.vehicles.id IS 'ID único do veículo';
COMMENT ON COLUMN public.vehicles.member_id IS 'ID do membro proprietário do veículo';
COMMENT ON COLUMN public.vehicles.brand IS 'Marca do veículo';
COMMENT ON COLUMN public.vehicles.model IS 'Modelo do veículo';
COMMENT ON COLUMN public.vehicles.year IS 'Ano de fabricação do veículo';
COMMENT ON COLUMN public.vehicles.type IS 'Tipo de veículo (Mota, Moto-quatro, Buggy, etc.)';
COMMENT ON COLUMN public.vehicles.displacement IS 'Cilindrada do motor em cc';
COMMENT ON COLUMN public.vehicles.engine_size IS 'Tamanho do motor em cc (campo compatibilidade)';
COMMENT ON COLUMN public.vehicles.license_plate IS 'Matrícula do veículo';
COMMENT ON COLUMN public.vehicles.nickname IS 'Apelido ou nome carinhoso do veículo';
COMMENT ON COLUMN public.vehicles.photo_url IS 'URL da foto do veículo';
COMMENT ON COLUMN public.vehicles.color IS 'Cor do veículo';

-- 3. ÍNDICES DE PERFORMANCE PARA VEHICLES
CREATE INDEX IF NOT EXISTS idx_vehicles_member ON public.vehicles(member_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_active ON public.vehicles(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_vehicles_license_plate ON public.vehicles(license_plate);
CREATE INDEX IF NOT EXISTS idx_vehicles_brand_model ON public.vehicles(brand, model);

-- 4. CONFIGURAR ROW LEVEL SECURITY (RLS)
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- Política para membros verem apenas seus próprios veículos
CREATE POLICY "Members can view own vehicles" ON public.vehicles
  FOR SELECT USING (
    member_id = (SELECT id FROM public.members WHERE email = auth.jwt() ->> 'email')
  );

-- Política para membros criarem seus próprios veículos
CREATE POLICY "Members can create own vehicles" ON public.vehicles
  FOR INSERT WITH CHECK (
    member_id = (SELECT id FROM public.members WHERE email = auth.jwt() ->> 'email')
  );

-- Política para membros atualizarem seus próprios veículos
CREATE POLICY "Members can update own vehicles" ON public.vehicles
  FOR UPDATE USING (
    member_id = (SELECT id FROM public.members WHERE email = auth.jwt() ->> 'email')
  );

-- Política para administradores terem acesso completo
CREATE POLICY "Admins full access to vehicles" ON public.vehicles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.members 
      WHERE email = auth.jwt() ->> 'email' 
      AND is_admin = true
    )
  );

-- 5. TRIGGERS PARA AUDITORIA E UPDATED_AT
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vehicles_updated_at
  BEFORE UPDATE ON public.vehicles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 6. MIGRAR DADOS EXISTENTES (se houver veículos em outras estruturas)
-- Sincronizar displacement e engine_size para compatibilidade
CREATE OR REPLACE FUNCTION sync_vehicle_engine_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Se displacement foi alterado e engine_size está vazio, copiar valor
  IF NEW.displacement IS NOT NULL AND (OLD.engine_size IS NULL OR NEW.displacement != OLD.displacement) THEN
    NEW.engine_size = NEW.displacement;
  END IF;
  
  -- Se engine_size foi alterado e displacement está vazio, copiar valor
  IF NEW.engine_size IS NOT NULL AND (OLD.displacement IS NULL OR NEW.engine_size != OLD.displacement) THEN
    NEW.displacement = NEW.engine_size;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_vehicle_engine_fields_trigger
  BEFORE INSERT OR UPDATE ON public.vehicles
  FOR EACH ROW
  EXECUTE FUNCTION sync_vehicle_engine_fields();

-- 7. VERIFICAR E CORRIGIR FOREIGN KEYS EXISTENTES
-- As tabelas que referenciam vehicles já existem, agora a referência será válida

-- 8. CONCEDER PERMISSÕES NECESSÁRIAS
GRANT SELECT, INSERT, UPDATE ON public.vehicles TO authenticated;
GRANT SELECT ON public.vehicles TO anon;
GRANT USAGE ON SEQUENCE vehicles_id_seq TO authenticated;

-- 9. ADICIONAR ENUM TYPES SE NÃO EXISTIREM
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vehicle_type') THEN
        CREATE TYPE vehicle_type AS ENUM ('Mota', 'Moto-quatro', 'Buggy', 'Carro', 'Outro');
    END IF;
END $$;

-- Alterar coluna type para usar o ENUM (opcional, pode manter VARCHAR)
-- ALTER TABLE public.vehicles ALTER COLUMN type TYPE vehicle_type USING type::vehicle_type;

-- 10. VERIFICAÇÃO FINAL - MOSTRAR INFORMAÇÕES DA TABELA CRIADA
DO $$ 
BEGIN
    RAISE NOTICE 'Tabela vehicles criada com sucesso!';
    RAISE NOTICE 'Estrutura disponível: id, member_id, brand, model, year, type, displacement, engine_size, license_plate, nickname, photo_url, color, vin, insurance_company, insurance_policy, insurance_expiry, inspection_expiry, is_active, notes, created_at, updated_at';
    RAISE NOTICE 'RLS habilitado com políticas para membros e administradores';
    RAISE NOTICE 'Triggers configurados para updated_at e sincronização de campos de motor';
END $$;

-- =========================================
-- FIM DO SCRIPT DE CORREÇÃO
-- =========================================
