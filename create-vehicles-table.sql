-- ============================================
-- SCRIPT SQL PARA CRIAR TABELA VEHICLES
-- Execute este SQL no Console do Supabase
-- ============================================

-- 1. Verificar se a tabela já existe
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'vehicles') THEN
        RAISE NOTICE 'Tabela vehicles já existe!';
    ELSE
        RAISE NOTICE 'Criando tabela vehicles...';
    END IF;
END $$;

-- 2. Criar a tabela vehicles conforme especificado no GUIAO_DO_SISTEMA.md
CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM NOW()) + 2),
  type VARCHAR(50) DEFAULT 'Mota',
  displacement INTEGER, -- Cilindrada em cc
  engine_size INTEGER, -- Campo adicional para compatibilidade
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

-- 3. Adicionar comentários à tabela
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

-- 4. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_vehicles_member ON public.vehicles(member_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_active ON public.vehicles(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_vehicles_license_plate ON public.vehicles(license_plate);
CREATE INDEX IF NOT EXISTS idx_vehicles_brand_model ON public.vehicles(brand, model);
CREATE INDEX IF NOT EXISTS idx_vehicles_type ON public.vehicles(type);

-- 5. Configurar Row Level Security (RLS)
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- 6. Criar políticas de segurança
-- Política para membros verem apenas seus próprios veículos
CREATE POLICY "Members can view own vehicles" ON public.vehicles
  FOR SELECT USING (
    member_id IN (
      SELECT id FROM public.members 
      WHERE email = auth.jwt() ->> 'email'
    )
  );

-- Política para membros criarem seus próprios veículos
CREATE POLICY "Members can create own vehicles" ON public.vehicles
  FOR INSERT WITH CHECK (
    member_id IN (
      SELECT id FROM public.members 
      WHERE email = auth.jwt() ->> 'email'
    )
  );

-- Política para membros atualizarem seus próprios veículos
CREATE POLICY "Members can update own vehicles" ON public.vehicles
  FOR UPDATE USING (
    member_id IN (
      SELECT id FROM public.members 
      WHERE email = auth.jwt() ->> 'email'
    )
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

-- 7. Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_vehicles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vehicles_updated_at
  BEFORE UPDATE ON public.vehicles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_vehicles_updated_at();

-- 8. Criar função para sincronizar displacement e engine_size
CREATE OR REPLACE FUNCTION public.sync_vehicle_engine_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Se displacement foi alterado e engine_size está vazio, copiar valor
  IF NEW.displacement IS NOT NULL AND (OLD.engine_size IS NULL OR NEW.displacement != COALESCE(OLD.displacement, 0)) THEN
    NEW.engine_size = NEW.displacement;
  END IF;
  
  -- Se engine_size foi alterado e displacement está vazio, copiar valor
  IF NEW.engine_size IS NOT NULL AND (OLD.displacement IS NULL OR NEW.engine_size != COALESCE(OLD.displacement, 0)) THEN
    NEW.displacement = NEW.engine_size;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_vehicle_engine_fields_trigger
  BEFORE INSERT OR UPDATE ON public.vehicles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_vehicle_engine_fields();

-- 9. Conceder permissões necessárias
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vehicles TO authenticated;
GRANT SELECT ON public.vehicles TO anon;

-- 10. Criar alguns dados de exemplo (opcional)
-- INSERT INTO public.vehicles (member_id, brand, model, year, type, displacement, license_plate, nickname, color)
-- VALUES 
--   ((SELECT id FROM public.members LIMIT 1), 'Honda', 'CBR600F', 2020, 'Mota', 600, 'AA-00-AA', 'A Vermelha', 'Vermelho'),
--   ((SELECT id FROM public.members LIMIT 1), 'Yamaha', 'MT-07', 2019, 'Mota', 689, 'BB-11-BB', 'A Azul', 'Azul');

-- 11. Verificação final
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'vehicles') THEN
        RAISE NOTICE '✅ Tabela vehicles criada com sucesso!';
        RAISE NOTICE 'Estrutura: id, member_id, brand, model, year, type, displacement, engine_size, license_plate, nickname, photo_url, color, vin, insurance_company, insurance_policy, insurance_expiry, inspection_expiry, is_active, notes, created_at, updated_at';
        RAISE NOTICE 'RLS habilitado com políticas para membros e administradores';
        RAISE NOTICE 'Triggers configurados para updated_at e sincronização de campos de motor';
        RAISE NOTICE 'Índices criados para performance otimizada';
    ELSE
        RAISE NOTICE '❌ Erro: Tabela vehicles não foi criada';
    END IF;
END $$;
