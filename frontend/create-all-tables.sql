-- Script para criar todas as tabelas necessárias no Supabase

-- Criar extensão uuid-ossp
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar tabela club_settings
CREATE TABLE IF NOT EXISTS public.club_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  short_name VARCHAR(100) NOT NULL,
  founding_date TIMESTAMP WITH TIME ZONE NOT NULL,
  logo_url TEXT,
  banner_url TEXT,
  primary_color VARCHAR(50) NOT NULL,
  secondary_color VARCHAR(50) NOT NULL,
  accent_color VARCHAR(50) NOT NULL,
  text_color VARCHAR(50) NOT NULL,
  annual_fee DECIMAL(10, 2) NOT NULL,
  fee_start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  inactive_periods JSONB DEFAULT '[]'::jsonb,
  address TEXT,
  email TEXT,
  phone TEXT,
  social_media JSONB DEFAULT '{}'::jsonb,
  description TEXT,
  welcome_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela settings
CREATE TABLE IF NOT EXISTS public.settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(100) NOT NULL UNIQUE,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela member_fee_settings
CREATE TABLE IF NOT EXISTS public.member_fee_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id uuid NOT NULL,
  join_date TIMESTAMP WITH TIME ZONE NOT NULL,
  exempt_periods JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela fee_payments
CREATE TABLE IF NOT EXISTS public.fee_payments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id uuid NOT NULL,
  year INT NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  notes TEXT,
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(member_id, year)
);

-- Configurações iniciais para tabela settings
INSERT INTO public.settings (key, value)
VALUES
  ('club_info', '{"name":"Mouros Moto Hub","shortName":"Mouros MC","foundingDate":"2015-01-01","logoUrl":"/assets/logo-default.png","bannerUrl":"/assets/banner-default.jpg","colors":{"primary":"#e11d48","secondary":"#27272a","accent":"#f59e0b","text":"#27272a"},"contact":{"address":"Rua Principal, 123 - Centro, Mouros","email":"info@mourosmotohub.pt","phone":"+351 123 456 789"},"description":"Associação motociclística dedicada à paixão pelas duas rodas e ao companheirismo.","welcomeMessage":"Bem-vindo ao Mouros Moto Hub! Junte-se a nós nesta viagem."}'::jsonb),
  ('fees', '{"annualFee":60.00,"feeStartDate":"2015-01-01","inactivePeriods":[]}'::jsonb),
  ('scale', '{"rolesOrder":["bartender","helper","cleaner"],"defaultShiftHours":{"start":"18:00","end":"23:00"}}'::jsonb),
  ('defaults', '{"allowGuests":true,"membershipApproval":"admin","autoRemoveInactive":false,"inactiveMonthsLimit":6}'::jsonb)
ON CONFLICT (key) DO NOTHING;
