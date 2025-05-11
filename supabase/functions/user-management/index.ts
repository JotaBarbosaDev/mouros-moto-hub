// supabase/functions/user-management/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.29.0';

// Esse arquivo define funções Edge que podem ser chamadas pelo frontend
// com segurança, uma vez que vão rodar com as permissões de SERVICE_ROLE
// e não com as permissões limitadas do cliente anônimo

serve(async (req) => {
  try {
    // CORS para permitir chamadas do frontend
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
        }
      });
    }

    // Cria cliente Supabase com SERVICE_ROLE (privilégios administrativos)
    const supabaseAdmin = createClient(
      // Supabase URL e chave SERVICE_ROLE são visíveis somente no ambiente seguro do Deno
      // e não são expostas ao cliente frontend
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Extrai JWT do header da requisição
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Token não fornecido' }), {
        status: 401,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
        }
      });
    }

    // Verifica token e pega o usuário autenticado
    const token = authHeader.replace('Bearer ', '');
    const { data: { user: caller }, error: tokenError } = await supabaseAdmin.auth.getUser(token);

    if (tokenError || !caller) {
      return new Response(JSON.stringify({ error: 'Token inválido' }), {
        status: 401,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
        }
      });
    }

    // Verificar se o usuário tem permissão de administrador
    const { data: memberData, error: memberError } = await supabaseAdmin
      .from('members')
      .select('is_admin')
      .eq('id', caller.id)
      .single();

    const isAdmin = memberData?.is_admin === true;

    // Recebe os dados do corpo da requisição
    const requestData = await req.json();
    const { action } = requestData;

    // Com base na ação, executa a função apropriada
    let result;
    switch (action) {
      case 'getUser':
        // Busca detalhes de um usuário (requer admin)
        if (!isAdmin) {
          return new Response(JSON.stringify({ error: 'Permissão negada' }), {
            status: 403,
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
            }
          });
        }
        result = await getUserById(supabaseAdmin, requestData);
        break;
        
      case 'updateUserPassword':
        // Atualiza senha de um usuário (requer admin, ou ser o próprio usuário)
        if (!isAdmin && caller.id !== requestData.userId) {
          return new Response(JSON.stringify({ error: 'Permissão negada' }), {
            status: 403,
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
            }
          });
        }
        result = await updateUserPassword(supabaseAdmin, requestData);
        break;
        
      case 'updateUserMetadata':
        // Atualiza metadados de usuário (requer admin, ou ser o próprio usuário)
        if (!isAdmin && caller.id !== requestData.userId) {
          return new Response(JSON.stringify({ error: 'Permissão negada' }), {
            status: 403,
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
            }
          });
        }
        result = await updateUserMetadata(supabaseAdmin, requestData);
        break;
        
      default:
        return new Response(JSON.stringify({ error: 'Ação inválida' }), {
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
          }
        });
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
      }
    });
  } catch (error) {
    console.error('Erro na função Edge:', error);
    return new Response(JSON.stringify({ error: `Erro interno: ${error.message}` }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
      }
    });
  }
});

// Função para buscar usuário por ID
async function getUserById(supabase, { userId }) {
  try {
    const { data, error } = await supabase.auth.admin.getUserById(userId);
    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('Erro ao buscar usuário por ID:', error);
    return { error: { message: error.message } };
  }
}

// Função para atualizar a senha de um usuário
async function updateUserPassword(supabase, { userId, password }) {
  try {
    const { data, error } = await supabase.auth.admin.updateUserById(userId, {
      password
    });
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao atualizar senha:', error);
    return { error: { message: error.message } };
  }
}

// Função para atualizar metadados do usuário (incluindo username)
async function updateUserMetadata(supabase, { userId, metadata }) {
  try {
    const { data, error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: metadata
    });
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao atualizar metadados:', error);
    return { error: { message: error.message } };
  }
}
