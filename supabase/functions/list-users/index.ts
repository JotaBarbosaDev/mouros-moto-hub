// supabase/functions/list-users/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.29.0';

/**
 * Função Edge segura para listar usuários do Supabase Auth
 * Contorna as limitações de permissão usando o SERVICE_ROLE
 */
serve(async (req) => {
  try {
    // Configuração de CORS
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
        }
      });
    }

    // Cria cliente Supabase com SERVICE_ROLE
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Autenticação: Verifica se quem chamou é um administrador
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Token não fornecido' }), {
        status: 401,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
        }
      });
    }

    // Verifica token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user: caller }, error: tokenError } = await supabaseAdmin.auth.getUser(token);

    if (tokenError || !caller) {
      return new Response(JSON.stringify({ error: 'Token inválido' }), {
        status: 401,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
        }
      });
    }

    // Verifica se o usuário é administrador
    const { data: memberData, error: memberError } = await supabaseAdmin
      .from('members')
      .select('is_admin')
      .eq('id', caller.id)
      .single();

    if (memberError || !memberData || memberData.is_admin !== true) {
      return new Response(JSON.stringify({ error: 'Permissão negada' }), {
        status: 403,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
        }
      });
    }

    // Recebe parâmetros do corpo da requisição
    const { filter = '', page = 1, pageSize = 10 } = await req.json();

    // Busca usuários no sistema Supabase
    let query = `
      SELECT 
        au.id, 
        au.email, 
        au.created_at,
        au.updated_at,
        au.last_sign_in_at,
        au.raw_user_meta_data,
        m.name,
        m.member_number,
        m.is_admin
      FROM auth.users au
      LEFT JOIN public.members m ON m.id = au.id
    `;

    // Adiciona filtro se fornecido
    const queryParams: Array<string | number> = [];
    if (filter) {
      query += `
        WHERE 
          au.email ILIKE $1 OR
          m.name ILIKE $1 OR
          au.raw_user_meta_data->>'username' ILIKE $1
      `;
      queryParams.push(`%${filter}%`);
    }

    // Adiciona paginação
    query += `
      ORDER BY au.created_at DESC
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;
    queryParams.push(pageSize);
    queryParams.push((page - 1) * pageSize);

    // Executa a query
    const { data: users, error: usersError } = await supabaseAdmin.postgres.query(query, queryParams);

    if (usersError) {
      throw usersError;
    }

    // Conta total de registros para paginação
    // Usando postgres.query para acessar tabelas do schema auth
    const { count: totalCount, error: countError } = await supabaseAdmin.postgres.query(
      `SELECT count(*)::integer FROM auth.users`
    );

    if (countError) {
      throw countError;
    }
    
    // Extrai o número total de usuários (primeiro valor da primeira linha)
    const totalUsers = totalCount[0]?.count || 0;

    return new Response(JSON.stringify({ 
      users, 
      totalPages: Math.ceil((totalUsers || 0) / pageSize),
      currentPage: page,
      totalUsers 
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
      }
    });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    return new Response(JSON.stringify({ error: `Erro interno: ${error.message}` }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
      }
    });
  }
});
