// middleware/auth.js - Middleware para autenticação JWT e Supabase
const jwt = require('jsonwebtoken');
const { supabaseAdmin } = require('../config/supabase');

// Middleware que verifica e valida o token JWT ou token Supabase
const authenticate = async (req, res, next) => {
  // Obter o token do cabeçalho Authorization
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ 
      error: 'Não autorizado',
      details: 'Token de autenticação não fornecido' 
    });
  }

  // Formato padrão: "Bearer TOKEN"
  const token = authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      error: 'Token inválido',
      details: 'Formato de token inválido' 
    });
  }
  
  try {
    // Primeiro tenta verificar como token Supabase (prioridade maior)
    try {
      const { data, error: supabaseError } = await supabaseAdmin.auth.getUser(token);
      
      if (data?.user && !supabaseError) {
        // O token é válido para o Supabase
        console.log('Autenticação via Supabase bem-sucedida:', data.user.id);
        
        // Verifica se o usuário é admin na tabela members (se existir)
        let isAdmin = false;
        try {
          const { data: memberData } = await supabaseAdmin
            .from('members')
            .select('is_admin')
            .eq('id', data.user.id)
            .maybeSingle();
            
          isAdmin = memberData?.is_admin === true;
        } catch (memberError) {
          console.log('Erro ao verificar status de admin:', memberError.message);
        }
        
        req.user = {
          id: data.user.id,
          email: data.user.email,
          isSupabaseToken: true,
          isAdmin: isAdmin
        };
        return next();
      }
    } catch (supabaseError) {
      console.log('Falha ao autenticar com Supabase, tentando JWT local...', supabaseError.message);
    }
    
    // Se não foi um token Supabase válido, tenta como JWT local
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Adicionar dados do usuário ao objeto de requisição
    req.user = decoded;
    
    // Continuar para o próximo middleware ou controlador
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Não autorizado',
        details: 'Token expirado' 
      });
    }
    
    return res.status(401).json({ 
      error: 'Não autorizado',
      details: 'Token inválido' 
    });
  }
};

// Middleware para verificar se o usuário é administrador
const isAdmin = async (req, res, next) => {
  console.log('Verificando privilégios de administrador para:', req.user);
  
  // Modo de desenvolvimento: permitir acesso de admin se variável de ambiente estiver definida
  if (process.env.ALLOW_DEV_ADMIN === 'true') {
    console.log('Modo de desenvolvimento ativo: concedendo privilégios de administrador');
    req.user = req.user || { id: 'dev-admin', email: 'dev@admin.com', isAdmin: true };
    return next();
  }
  
  // authenticate deve ter sido executado primeiro
  if (!req.user) {
    return res.status(401).json({ 
      error: 'Não autorizado',
      details: 'Usuário não autenticado' 
    });
  }
  
  // Se já validamos o admin no middleware authenticate
  if (req.user.isAdmin === true) {
    console.log('Usuário já validado como admin');
    return next();
  }
  
  // Verificar se o usuário é admin na tabela members
  try {
    const { data, error } = await supabaseAdmin
      .from('members')
      .select('is_admin')
      .eq('id', req.user.id)
      .single();
      
    if (error) {
      console.error('Erro ao verificar status de admin:', error);
      return res.status(500).json({ 
        error: 'Erro interno',
        details: 'Falha ao verificar privilégios de administrador' 
      });
    }
    
    if (!data || data.is_admin !== true) {
      return res.status(403).json({ 
        error: 'Acesso negado',
        details: 'Usuário não possui privilégios de administrador' 
      });
    }
    
    // Atualiza o status de admin no objeto da requisição para futuras verificações
    req.user.isAdmin = true;
    
    // Usuário é admin, continuar
    next();
  } catch (err) {
    console.error('Exceção ao verificar status de admin:', err);
    return res.status(500).json({ 
      error: 'Erro interno',
      details: 'Falha ao processar verificação de administrador' 
    });
  }
};

// Exportar middlewares
module.exports = { authenticate, isAdmin };
