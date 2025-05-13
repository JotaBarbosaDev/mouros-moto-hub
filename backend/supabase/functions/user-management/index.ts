// supabase/functions/user-management/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.29.0';

// Definição de tipo TypeScript para o cliente Supabase
// Isso ajuda a resolver problemas de tipo com as funções Edge
type SupabaseAdmin = {
  auth: {
    getUser: (token: string) => Promise<{ 
      data: { user: { id: string; email: string; user_metadata: Record<string, unknown> } | null };
      error: Error | null;
    }>;
    admin: {
      getUserById: (id: string) => Promise<{
        data: { user: { id: string; email: string; user_metadata: Record<string, unknown> } | null };
        error: Error | null;
      }>;
      updateUserById: (id: string, attrs: Record<string, unknown>) => Promise<{
        data: unknown;
        error: Error | null;
      }>;
    };
  };
  from: (table: string) => {
    select: (columns?: string) => any;
    insert: (data: Record<string, unknown>) => any;
    update: (data: Record<string, unknown>) => any;
    delete: () => any;
    eq: (column: string, value: string) => any;
    single: () => Promise<{ data: any; error: Error | null }>;
  };
  postgres: {
    query: (query: string, params?: any[]) => Promise<{
      data: any[] | null;
      error: Error | null;
      count?: number;
    }>;
  };
}

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

    // Logs para depuração
    console.log(`Função Edge: Recebida ação ${action} para usuário ${requestData.userId}`);
    console.log(`Usuário chamador: ${caller.id}, é admin: ${isAdmin}`);
    
    // Com base na ação, executa a função apropriada
    let result;
    switch (action) {
      case 'getUser':
        // Busca detalhes de um usuário (requer admin)
        if (!isAdmin) {
          console.log('Permissão negada: getUser requer admin');
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
        console.log(`Verificando permissão para atualizar senha. Caller ID: ${caller.id}, Target ID: ${requestData.userId}, isAdmin: ${isAdmin}`);
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
        console.log(`Verificando permissão para atualizar metadados. Caller ID: ${caller.id}, Target ID: ${requestData.userId}, isAdmin: ${isAdmin}`);
        console.log(`Metadados a atualizar:`, requestData.metadata);
        
        // Sempre permitir atualização se o usuário for o próprio ou admin
        if (isAdmin || caller.id === requestData.userId) {
          result = await updateUserMetadata(supabaseAdmin, requestData);
        } else {
          console.log('Permissão negada: updateUserMetadata requer admin ou ser o próprio usuário');
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
        break;
        
      case 'fixUsername':
        // Corrigir username (somente admin)
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
        
        try {
          // Importação dinâmica da função de correção
          const { fixUsername } = await import('./fix-username.ts');
          result = await fixUsername(supabaseAdmin, requestData);
        } catch (error) {
          console.error('Erro ao importar ou executar fixUsername:', error);
          result = { error: { message: `Erro ao corrigir username: ${error.message}` } };
        }
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

    // Verificar se houve erro para definir o status da resposta
    const status = result?.error ? 400 : 200;
    
    console.log(`Enviando resposta com status ${status}:`, result);
    
    return new Response(JSON.stringify(result), {
      status: status,
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
    console.log(`Atualizando senha para usuário ${userId}`);
    
    // Verificar se a senha atende aos requisitos mínimos (8 caracteres)
    if (!password || password.length < 8) {
      return { error: { message: 'A senha deve ter pelo menos 8 caracteres' } };
    }
    
    // Verificar se o usuário existe antes de tentar atualizar
    const { data: userData, error: getUserError } = await supabase.auth.admin.getUserById(userId);
    
    if (getUserError) {
      console.error('Erro ao buscar usuário antes de atualizar senha:', getUserError);
      return { error: { message: `Usuário não encontrado: ${getUserError.message}` } };
    }
    
    if (!userData || !userData.user) {
      console.error('Usuário não encontrado pelo ID:', userId);
      return { error: { message: 'Usuário não encontrado com este ID' } };
    }
    
    // Log para diagnóstico (sem mostrar a senha em si)
    console.log('Características da senha:', { 
      length: password.length,
      hasSpecialChars: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      hasNumbers: /[0-9]/.test(password)
    });
    
    // Usar a senha exatamente como fornecida, sem qualquer modificação
    const { data, error } = await supabase.auth.admin.updateUserById(userId, {
      password
    });
    
    if (error) {
      console.error('Erro na API Supabase ao atualizar senha:', error);
      throw error;
    }
    
    console.log('Senha atualizada com sucesso');
    return { success: true, data };
  } catch (error) {
    console.error('Exceção ao atualizar senha:', error);
    return { error: { message: error.message } };
  }
}

// Importar função de filtragem de username
import { filterUsername } from './filter-username.ts';

// Função para atualizar metadados do usuário (incluindo username)
async function updateUserMetadata(supabase, { userId, metadata }) {
  try {
    console.log(`Atualizando metadados para usuário ${userId}:`, metadata);
    
    // Log para diagnóstico de problemas com username
    if (metadata.username) {
      console.log("DIAGNÓSTICO DE USERNAME NA FUNÇÃO EDGE:");
      console.log("- Username recebido:", JSON.stringify(metadata.username));
      console.log("- Tipo de dado:", typeof metadata.username);
      console.log("- Comprimento:", metadata.username.length);
      console.log("- Contém caracteres especiais?", /[!@#$%^&*(),.?":{}|<>]/.test(metadata.username));
      console.log("- Contém maiúsculas?", /[A-Z]/.test(metadata.username));
      console.log("- Contém números?", /[0-9]/.test(metadata.username));
      console.log("- Caracteres (para diagnóstico):", [...metadata.username].map(c => c.charCodeAt(0)).join(", "));
    }
    
    // Verificar se o usuário existe antes de tentar atualizar
    const { data: userData, error: getUserError } = await supabase.auth.admin.getUserById(userId);
    
    if (getUserError) {
      console.error('Erro ao buscar usuário antes de atualizar metadados:', getUserError);
      return { error: { message: `Usuário não encontrado: ${getUserError.message}` } };
    }
    
    if (!userData || !userData.user) {
      console.error('Usuário não encontrado pelo ID:', userId);
      return { error: { message: 'Usuário não encontrado com este ID' } };
    }
    
    // Mesclamos os metadados existentes com os novos para preservar dados
    const existingMetadata = userData.user.user_metadata || {};
    console.log('Metadados existentes antes da mesclagem:', existingMetadata);
    
    // Cria uma cópia segura dos metadados para não modificar o objeto original
    const metadataCopy = { ...metadata };
    
    // Garantir que o username está preservado exatamente como foi enviado
    if (metadataCopy.username) {
      // Obtém o username original - sem aplicar transformações
      const originalUsername = String(metadataCopy.username);
      
      // Log para verificação da preservação
      console.log("Username recebido (será preservado sem modificações):", originalUsername);
      
      // Chama filterUsername apenas para registrar informações de diagnóstico, 
      // mas usa o valor original
      filterUsername(originalUsername);
      
      // Garante que usamos o username exatamente como foi recebido
      metadataCopy.username = originalUsername;
    }
    
    const mergedMetadata = { ...existingMetadata, ...metadataCopy };
    
    console.log('Metadados mesclados para atualização:', mergedMetadata);
    
    const { data, error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: mergedMetadata
    });
    
    if (error) {
      console.error('Erro na API Supabase ao atualizar metadados:', error);
      throw error;
    }
    
    console.log('Metadados atualizados com sucesso', data);
    return { success: true, data };
  } catch (error) {
    console.error('Exceção ao atualizar metadados:', error);
    return { error: { message: error.message } };
  }
}
