import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Tipos customizados para estender o cliente Supabase
 * Facilita o uso de tabelas que não estão presentes nos tipos gerados
 */

// Tipo básico para uma resposta do Supabase
export interface SupabaseQueryResponse<T> {
  data: T | null;
  error: {
    message: string;
    details?: string;
    hint?: string;
    code?: string;
  } | null;
}

// Interface para o método select() do Supabase
export interface SupabaseSelectQuery<T> {
  select: (columns: string) => SupabaseFilterQuery<T>;
}

// Interface para os métodos de filtragem do Supabase
export interface SupabaseFilterQuery<T> {
  eq: (column: string, value: any) => SupabaseFilterQuery<T>;
  neq: (column: string, value: any) => SupabaseFilterQuery<T>;
  gt: (column: string, value: any) => SupabaseFilterQuery<T>;
  lt: (column: string, value: any) => SupabaseFilterQuery<T>;
  gte: (column: string, value: any) => SupabaseFilterQuery<T>;
  lte: (column: string, value: any) => SupabaseFilterQuery<T>;
  order: (column: string, options?: { ascending?: boolean }) => SupabaseFilterQuery<T>;
  limit: (count: number) => SupabaseFilterQuery<T>;
  single: () => Promise<SupabaseQueryResponse<T>>;
  maybeSingle: () => Promise<SupabaseQueryResponse<T>>;
  then: (onfulfilled?: ((value: SupabaseQueryResponse<T[]>) => any)) => Promise<any>;
}

// Interface para o método from() do Supabase
export interface SupabaseFrom {
  from: <T>(table: string) => SupabaseSelectQuery<T> & {
    insert: (data: any) => SupabaseInsertQuery<T>;
    update: (data: any) => SupabaseUpdateQuery<T>;
    delete: () => SupabaseDeleteQuery<T>;
  };
}

// Interface para operações de inserção
export interface SupabaseInsertQuery<T> {
  select: (columns?: string) => SupabaseFilterQuery<T>;
  single: () => Promise<SupabaseQueryResponse<T>>;
  then: (onfulfilled?: ((value: SupabaseQueryResponse<T[]>) => any)) => Promise<any>;
}

// Interface para operações de atualização
export interface SupabaseUpdateQuery<T> {
  eq: (column: string, value: any) => SupabaseUpdateQuery<T>;
  then: (onfulfilled?: ((value: SupabaseQueryResponse<T[]>) => any)) => Promise<any>;
}

// Interface para operações de exclusão
export interface SupabaseDeleteQuery<T> {
  eq: (column: string, value: any) => SupabaseDeleteQuery<T>;
  then: (onfulfilled?: ((value: SupabaseQueryResponse<T[]>) => any)) => Promise<any>;
}

// Tipo para autenticação do administrador
export interface AuthAdmin {
  createUser: (params: {
    email: string;
    password: string;
    email_confirm: boolean;
    user_metadata: Record<string, unknown>;
  }) => Promise<{
    data: unknown;
    error: { message: string } | null;
  }>;
}

// Tipo para o cliente Supabase customizado
export type CustomSupabaseClient = SupabaseClient & SupabaseFrom & {
  auth: {
    admin: AuthAdmin;
  };
};
