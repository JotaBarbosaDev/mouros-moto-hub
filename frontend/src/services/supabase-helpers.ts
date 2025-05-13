/**
 * Este arquivo contém funções auxiliares para interagir com o Supabase
 * e resolver os problemas de tipagem que ocorrem devido à definição de schema.
 */

import { supabase } from '@/integrations/supabase/client';
import { CustomSupabaseClient, SupabaseQueryResponse } from '@/types/custom-supabase';
import { Vehicle, VehicleType } from '@/types/member';
import { VehicleData } from '@/types/member-extended';

// Interface para respostas do Supabase para veículos
export interface SupabaseVehicleResponse {
  id: string;
  brand: string;
  model: string;
  type: string;
  displacement: string | number;
  nickname?: string | null;
  photo_url?: string | null;
  member_id: string;
  created_at?: string;
  updated_at?: string;
}

// Interface para respostas do Supabase para pagamentos de cotas
export interface SupabaseDuesPaymentResponse {
  id: string;
  member_id: string;
  year: number;
  paid: boolean;
  exempt: boolean;
  payment_date?: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Função para fazer chamadas seguras à tabela 'vehicles' independentemente do schema
 * Com tipos aprimorados para maior segurança
 */
export const vehiclesTable = {
  select: async (columns: string, options?: { eq?: [string, string] }): Promise<SupabaseQueryResponse<SupabaseVehicleResponse[]>> => {
    const customSupabase = supabase as CustomSupabaseClient;
    let query = customSupabase.from<SupabaseVehicleResponse>('vehicles').select(columns);
    
    if (options?.eq) {
      query = query.eq(options.eq[0], options.eq[1]);
    }
    
    return await query as unknown as Promise<SupabaseQueryResponse<SupabaseVehicleResponse[]>>;
  },
  
  insert: async (data: Omit<VehicleData, 'id'> | Array<Omit<VehicleData, 'id'>>): Promise<SupabaseQueryResponse<SupabaseVehicleResponse>> => {
    const customSupabase = supabase as CustomSupabaseClient;
    return await customSupabase
      .from<SupabaseVehicleResponse>('vehicles')
      .insert(data)
      .single() as unknown as Promise<SupabaseQueryResponse<SupabaseVehicleResponse>>;
  },
  
  update: async (data: Partial<VehicleData>, options: { eq: [string, string] }): Promise<SupabaseQueryResponse<SupabaseVehicleResponse[]>> => {
    const customSupabase = supabase as CustomSupabaseClient;
    return await customSupabase
      .from<SupabaseVehicleResponse>('vehicles')
      .update(data)
      .eq(options.eq[0], options.eq[1]) as unknown as Promise<SupabaseQueryResponse<SupabaseVehicleResponse[]>>;
  },
  
  delete: async (options: { eq: [string, string] }): Promise<SupabaseQueryResponse<SupabaseVehicleResponse[]>> => {
    const customSupabase = supabase as CustomSupabaseClient;
    return await customSupabase
      .from<SupabaseVehicleResponse>('vehicles')
      .delete()
      .eq(options.eq[0], options.eq[1]) as unknown as Promise<SupabaseQueryResponse<SupabaseVehicleResponse[]>>;
  }
};

/**
 * Função para fazer chamadas seguras à tabela 'dues_payments' independentemente do schema
 * Com tipos aprimorados para maior segurança
 */
export const duesPaymentsTable = {
  select: async (columns: string, options?: { eq?: [string, string] }): Promise<SupabaseQueryResponse<SupabaseDuesPaymentResponse[]>> => {
    const customSupabase = supabase as CustomSupabaseClient;
    let query = customSupabase.from<SupabaseDuesPaymentResponse>('dues_payments').select(columns);
    
    if (options?.eq) {
      query = query.eq(options.eq[0], options.eq[1]);
    }
    
    return await query as unknown as Promise<SupabaseQueryResponse<SupabaseDuesPaymentResponse[]>>;
  },
  
  insert: async (data: Omit<SupabaseDuesPaymentResponse, 'id' | 'created_at' | 'updated_at'>): Promise<SupabaseQueryResponse<SupabaseDuesPaymentResponse>> => {
    const customSupabase = supabase as CustomSupabaseClient;
    return await customSupabase
      .from<SupabaseDuesPaymentResponse>('dues_payments')
      .insert(data)
      .single() as unknown as Promise<SupabaseQueryResponse<SupabaseDuesPaymentResponse>>;
  },
  
  update: async (data: Partial<SupabaseDuesPaymentResponse>, options: { eq: [string, string] }): Promise<SupabaseQueryResponse<SupabaseDuesPaymentResponse[]>> => {
    const customSupabase = supabase as CustomSupabaseClient;
    return await customSupabase
      .from<SupabaseDuesPaymentResponse>('dues_payments')
      .update(data)
      .eq(options.eq[0], options.eq[1]) as unknown as Promise<SupabaseQueryResponse<SupabaseDuesPaymentResponse[]>>;
  },
  
  delete: async (options: { eq: [string, string] }): Promise<SupabaseQueryResponse<SupabaseDuesPaymentResponse[]>> => {
    const customSupabase = supabase as CustomSupabaseClient;
    return await customSupabase
      .from<SupabaseDuesPaymentResponse>('dues_payments')
      .delete()
      .eq(options.eq[0], options.eq[1]) as unknown as Promise<SupabaseQueryResponse<SupabaseDuesPaymentResponse[]>>;
  }
};

/**
 * Função para fazer chamadas seguras à tabela 'addresses' independentemente do schema
 * Com tipos aprimorados para maior segurança
 */
import { AddressData } from '@/types/member-extended';

export const addressesTable = {
  select: async (columns: string, options?: { eq?: [string, string] }): Promise<SupabaseQueryResponse<AddressData[]>> => {
    const customSupabase = supabase as CustomSupabaseClient;
    let query = customSupabase.from<AddressData>('addresses').select(columns);
    
    if (options?.eq) {
      query = query.eq(options.eq[0], options.eq[1]);
    }
    
    return await query as unknown as Promise<SupabaseQueryResponse<AddressData[]>>;
  },
  
  maybeSingle: async (options: { eq: [string, string] }): Promise<SupabaseQueryResponse<AddressData>> => {
    const customSupabase = supabase as CustomSupabaseClient;
    return await customSupabase
      .from<AddressData>('addresses')
      .select('*')
      .eq(options.eq[0], options.eq[1])
      .maybeSingle() as unknown as Promise<SupabaseQueryResponse<AddressData>>;
  },
  
  insert: async (data: Omit<AddressData, 'id' | 'created_at' | 'updated_at'>): Promise<SupabaseQueryResponse<AddressData>> => {
    const customSupabase = supabase as CustomSupabaseClient;
    return await customSupabase
      .from<AddressData>('addresses')
      .insert(data)
      .single() as unknown as Promise<SupabaseQueryResponse<AddressData>>;
  },
  
  update: async (data: Partial<AddressData>, options: { eq: [string, string] }): Promise<SupabaseQueryResponse<AddressData[]>> => {
    const customSupabase = supabase as CustomSupabaseClient;
    return await customSupabase
      .from<AddressData>('addresses')
      .update(data)
      .eq(options.eq[0], options.eq[1]) as unknown as Promise<SupabaseQueryResponse<AddressData[]>>;
  },
};

/**
 * Função para verificar se uma coluna específica existe em uma tabela
 */
export const checkColumnExists = async (tableName: string, columnName: string): Promise<boolean> => {
  try {
    const customSupabase = supabase as CustomSupabaseClient;
    // Tenta fazer uma consulta que inclui a coluna específica
    const { data } = await customSupabase
      .from(tableName)
      .select(columnName)
      .limit(1);
      
    return true;
  } catch (e) {
    // Se der erro, provavelmente a coluna não existe
    return false;
  }
};

/**
 * Função genérica para verificar se uma coluna existe em uma tabela
 * @param tableName Nome da tabela a verificar
 * @param columnName Nome da coluna a verificar
 * @returns Promessa que resolve para true se a coluna existe, false caso contrário
 */
export const columnExists = async (tableName: string, columnName: string): Promise<boolean> => {
  try {
    const customSupabase = supabase as CustomSupabaseClient;
    
    // Primeiro método: verificar nos dados retornados
    const { data } = await customSupabase
      .from(tableName)
      .select()
      .limit(1);
      
    if (data && data.length > 0) {
      return columnName in data[0];
    }
    
    // Segundo método: tentar selecionar apenas a coluna específica
    try {
      // Construir uma consulta que seleciona apenas a coluna em questão
      const { error } = await customSupabase
        .from(tableName)
        .select(columnName)
        .limit(1);
        
      // Se não houver erro, a coluna provavelmente existe
      return !error;
    } catch (e) {
      console.warn(`Erro ao verificar coluna ${columnName} na tabela ${tableName}:`, e);
      return false;
    }
  } catch (error) {
    console.warn(`Erro ao verificar existência da coluna ${columnName} na tabela ${tableName}:`, error);
    return false;
  }
};

/**
 * Função específica para verificar se a coluna username existe na tabela members
 * Retorna false por padrão já que sabemos que a coluna não existe
 */
export const isUsernameColumnAvailable = async (): Promise<boolean> => {
  // Retorna diretamente false porque sabemos que a coluna não existe na tabela members
  return false;
};
