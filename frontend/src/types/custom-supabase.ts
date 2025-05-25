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
  eq: (column: string, value: unknown) => SupabaseFilterQuery<T>;
  neq: (column: string, value: unknown) => SupabaseFilterQuery<T>;
  gt: (column: string, value: unknown) => SupabaseFilterQuery<T>;
  lt: (column: string, value: unknown) => SupabaseFilterQuery<T>;
  gte: (column: string, value: unknown) => SupabaseFilterQuery<T>;
  lte: (column: string, value: unknown) => SupabaseFilterQuery<T>;
  order: (column: string, options?: { ascending?: boolean }) => SupabaseFilterQuery<T>;
  limit: (count: number) => SupabaseFilterQuery<T>;
  single: () => Promise<SupabaseQueryResponse<T>>;
  maybeSingle: () => Promise<SupabaseQueryResponse<T>>;
  then: <TResult1 = SupabaseQueryResponse<T[]>, TResult2 = never>(
    onfulfilled?: ((value: SupabaseQueryResponse<T[]>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ) => Promise<TResult1 | TResult2>;
}

// Interface para o método from() do Supabase
export interface SupabaseFrom {
  from: <T>(table: string) => SupabaseSelectQuery<T> & {
    insert: (data: Partial<T>) => SupabaseInsertQuery<T>;
    update: (data: Partial<T>) => SupabaseUpdateQuery<T>;
    delete: () => SupabaseDeleteQuery<T>;
  };
}

// Interface para operações de inserção
export interface SupabaseInsertQuery<T> {
  select: (columns?: string) => SupabaseFilterQuery<T>;
  single: () => Promise<SupabaseQueryResponse<T>>;
  then: <TResult1 = SupabaseQueryResponse<T[]>, TResult2 = never>(
    onfulfilled?: ((value: SupabaseQueryResponse<T[]>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ) => Promise<TResult1 | TResult2>;
}

// Interface para operações de atualização
export interface SupabaseUpdateQuery<T> {
  eq: (column: string, value: unknown) => SupabaseUpdateQuery<T>;
  then: <TResult1 = SupabaseQueryResponse<T[]>, TResult2 = never>(
    onfulfilled?: ((value: SupabaseQueryResponse<T[]>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ) => Promise<TResult1 | TResult2>;
}

// Interface para operações de exclusão
export interface SupabaseDeleteQuery<T> {
  eq: (column: string, value: unknown) => SupabaseDeleteQuery<T>;
  then: <TResult1 = SupabaseQueryResponse<T[]>, TResult2 = never>(
    onfulfilled?: ((value: SupabaseQueryResponse<T[]>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ) => Promise<TResult1 | TResult2>;
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
