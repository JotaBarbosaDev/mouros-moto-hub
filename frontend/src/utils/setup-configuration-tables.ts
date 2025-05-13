import { supabase } from '@/integrations/supabase/client';

/**
 * Script para inicializar as tabelas necessárias para o sistema de configurações
 * Este script deve ser executado uma única vez para criar as tabelas no Supabase
 */
async function setupConfigurationTables() {
  try {
    console.log("Iniciando configuração das tabelas do sistema...");
    
    // Tabela de configurações do clube
    const { error: clubSettingsError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'club_settings',
      columns: `
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
      `
    });

    if (clubSettingsError) {
      throw new Error(`Erro ao criar tabela club_settings: ${clubSettingsError.message}`);
    }
    
    // Tabela de configurações de cotas de membros
    const { error: memberFeeSettingsError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'member_fee_settings',
      columns: `
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
        join_date TIMESTAMP WITH TIME ZONE NOT NULL,
        exempt_periods JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        UNIQUE(member_id)
      `
    });

    if (memberFeeSettingsError) {
      throw new Error(`Erro ao criar tabela member_fee_settings: ${memberFeeSettingsError.message}`);
    }
    
    // Tabela de pagamentos de cotas
    const { error: feePaymentsError } = await supabase.rpc('create_table_if_not_exists', {
      table_name: 'fee_payments',
      columns: `
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
        year INTEGER NOT NULL,
        paid BOOLEAN NOT NULL DEFAULT false,
        paid_date TIMESTAMP WITH TIME ZONE,
        amount DECIMAL(10, 2) NOT NULL,
        receipt_number TEXT,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        UNIQUE(member_id, year)
      `
    });

    if (feePaymentsError) {
      throw new Error(`Erro ao criar tabela fee_payments: ${feePaymentsError.message}`);
    }

    // Criar função RPC personalizada no Supabase para buscar histórico de cotas
    const rpcQuery = `
    CREATE OR REPLACE FUNCTION get_member_fee_history(p_member_id UUID)
    RETURNS TABLE (
        year INTEGER,
        should_pay BOOLEAN,
        exempt BOOLEAN,
        exempt_reason TEXT,
        club_inactive BOOLEAN,
        club_inactive_reason TEXT,
        payment_info JSONB
    )
    LANGUAGE plpgsql
    AS $$
    DECLARE
        v_club_settings RECORD;
        v_member_settings RECORD;
        v_start_year INTEGER;
        v_current_year INTEGER := EXTRACT(YEAR FROM CURRENT_DATE);
        v_member_join_date DATE;
    BEGIN
        -- Get club settings
        SELECT * INTO v_club_settings FROM club_settings LIMIT 1;
        
        -- Get member settings
        SELECT * INTO v_member_settings FROM member_fee_settings WHERE member_id = p_member_id;
        
        -- If member not found in fee settings, get join date from members
        IF v_member_settings IS NULL THEN
            SELECT join_date INTO v_member_join_date FROM members WHERE id = p_member_id;
        ELSE
            v_member_join_date := v_member_settings.join_date;
        END IF;
        
        -- Determine start year (max of club fee start date or member join date)
        v_start_year := GREATEST(
            EXTRACT(YEAR FROM v_club_settings.fee_start_date),
            EXTRACT(YEAR FROM v_member_join_date)
        );
        
        -- Return records for each year
        FOR year IN v_start_year..v_current_year LOOP
            RETURN QUERY
            SELECT 
                year,
                -- Should pay logic
                NOT (
                    -- Check if club was inactive
                    EXISTS (
                        SELECT 1
                        FROM jsonb_array_elements(v_club_settings.inactive_periods) AS p
                        WHERE EXTRACT(YEAR FROM (p->>'startDate')::timestamp) <= year
                          AND EXTRACT(YEAR FROM (p->>'endDate')::timestamp) >= year
                    )
                    -- Check if member was exempt
                    OR EXISTS (
                        SELECT 1
                        FROM jsonb_array_elements(COALESCE(v_member_settings.exempt_periods, '[]'::jsonb)) AS p
                        WHERE EXTRACT(YEAR FROM (p->>'startDate')::timestamp) <= year
                          AND EXTRACT(YEAR FROM (p->>'endDate')::timestamp) >= year
                    )
                ),
                -- Exempt logic
                CASE WHEN v_member_settings IS NOT NULL THEN
                    EXISTS (
                        SELECT 1
                        FROM jsonb_array_elements(COALESCE(v_member_settings.exempt_periods, '[]'::jsonb)) AS p
                        WHERE EXTRACT(YEAR FROM (p->>'startDate')::timestamp) <= year
                          AND EXTRACT(YEAR FROM (p->>'endDate')::timestamp) >= year
                    )
                ELSE false
                END,
                -- Exempt reason
                CASE WHEN v_member_settings IS NOT NULL THEN
                    (
                        SELECT p->>'reason'
                        FROM jsonb_array_elements(COALESCE(v_member_settings.exempt_periods, '[]'::jsonb)) AS p
                        WHERE EXTRACT(YEAR FROM (p->>'startDate')::timestamp) <= year
                          AND EXTRACT(YEAR FROM (p->>'endDate')::timestamp) >= year
                        LIMIT 1
                    )
                ELSE NULL
                END,
                -- Club inactive logic
                EXISTS (
                    SELECT 1
                    FROM jsonb_array_elements(v_club_settings.inactive_periods) AS p
                    WHERE EXTRACT(YEAR FROM (p->>'startDate')::timestamp) <= year
                      AND EXTRACT(YEAR FROM (p->>'endDate')::timestamp) >= year
                ),
                -- Club inactive reason
                (
                    SELECT p->>'reason'
                    FROM jsonb_array_elements(v_club_settings.inactive_periods) AS p
                    WHERE EXTRACT(YEAR FROM (p->>'startDate')::timestamp) <= year
                      AND EXTRACT(YEAR FROM (p->>'endDate')::timestamp) >= year
                    LIMIT 1
                ),
                -- Payment information
                COALESCE(
                    (
                        SELECT jsonb_build_object(
                            'id', fp.id,
                            'paid', fp.paid,
                            'paidDate', fp.paid_date,
                            'amount', fp.amount,
                            'receiptNumber', fp.receipt_number,
                            'notes', fp.notes
                        )
                        FROM fee_payments fp
                        WHERE fp.member_id = p_member_id AND fp.year = year
                    ),
                    '{}'::jsonb
                );
        END LOOP;
    END;
    $$;
    `;

    // Tente criar a função RPC
    const { error: rpcError } = await supabase.rpc('exec_sql', { sql: rpcQuery });

    if (rpcError) {
      console.warn(`Aviso ao criar função RPC: ${rpcError.message}`);
      // Não falhe completamente aqui, já que alguns ambientes não permitem criação de funções RPC
    }

    console.log("Tabelas do sistema de configurações criadas com sucesso!");
    return { success: true };
  } catch (error) {
    console.error("Erro na configuração das tabelas:", error);
    return { success: false, error };
  }
}

// Executar o setup
setupConfigurationTables()
  .then((result) => {
    if (result.success) {
      console.log("Sistema de configurações inicializado com sucesso!");
    } else {
      console.error("Falha ao inicializar sistema de configurações:", result.error);
    }
  });

export default setupConfigurationTables;
