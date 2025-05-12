// Definições de tipo para os módulos Deno usados nas funções Edge
// Este arquivo é necessário apenas para desenvolvimento local e não afeta a execução no Supabase

/* eslint-disable @typescript-eslint/no-explicit-any */

declare module 'https://deno.land/std@0.177.0/http/server.ts' {
  export function serve(handler: (req: Request) => Promise<Response>): void;
}

// Interface para as opções do cliente Supabase
interface SupabaseClientOptions {
  auth?: {
    autoRefreshToken?: boolean;
    persistSession?: boolean;
    detectSessionInUrl?: boolean;
  };
  global?: {
    headers?: Record<string, string>;
  };
}

// Interface para o método admin.getUserById
interface AuthAdminApi {
  getUserById(id: string): Promise<{
    data: { user: any } | null;
    error: { message: string } | null;
  }>;
  updateUserById(id: string, attributes: any): Promise<{
    data: any | null;
    error: { message: string } | null;
  }>;
  createUser(attributes: any): Promise<{
    data: any | null;
    error: { message: string } | null;
  }>;
}

// Interface para o método auth
interface AuthApi {
  getUser(token: string): Promise<{
    data: { user: any } | null;
    error: { message: string } | null;
  }>;
  admin: AuthAdminApi;
}

// Interface para o método postgres
interface PostgresApi {
  query(query: string, params?: any[]): Promise<{
    data: any[] | null;
    error: { message: string } | null;
    count?: number;
  }>;
}

// Interface para o método from
interface FromApi {
  select(columns?: string): FromApi;
  eq(column: string, value: any): FromApi;
  single(): Promise<{
    data: any | null;
    error: { message: string } | null;
  }>;
  maybeSingle(): Promise<{
    data: any | null;
    error: { message: string } | null;
  }>;
}

// Interface para o método from estendido
interface FromApiExtended extends FromApi {
  insert(data: any): {
    select(columns?: string): FromApi;
    single(): Promise<{ data: any | null; error: { message: string } | null }>;
  };
  update(data: any): FromApi;
  delete(): FromApi;
}

// Interface para o cliente Supabase
interface SupabaseClient {
  auth: AuthApi;
  from(table: string): FromApiExtended;
  postgres: PostgresApi;
}

// Definições para os módulos Supabase
declare module 'https://esm.sh/@supabase/supabase-js@2.29.0' {
  export function createClient(
    url: string, 
    key: string, 
    options?: SupabaseClientOptions
  ): SupabaseClient;
}

declare module 'https://esm.sh/@supabase/supabase-js@2.23.0' {
  export function createClient(
    url: string, 
    key: string, 
    options?: SupabaseClientOptions
  ): SupabaseClient;
}

// Definições para o namespace Deno
declare namespace Deno {
  export const env: {
    get(key: string): string | undefined;
  };
}
