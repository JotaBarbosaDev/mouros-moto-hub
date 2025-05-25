// middleware/auth.js - Middleware para autenticação JWT e Supabase
const jwt = require('jsonwebtoken');
const { supabaseAdmin } = require('../config/supabase');
const SecurityAuditLogger = require('../middleware/security-audit');

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
    // Primeiro tenta verificar como token JWT local
    try {
      if (process.env.JWT_SECRET) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded && decoded.id && decoded.email) {
          console.log('Autenticação via JWT local bem-sucedida:', decoded.id);
          
          // Extrair todos os dados relevantes do token para não precisar buscar no Supabase Admin
          const user = {
            id: decoded.id,
            email: decoded.email,
            isAdmin: decoded.isAdmin === true,
            name: decoded.name,
            user_metadata: {
              name: decoded.name,
              ...(decoded.user_metadata || {})
            }
          };
          
          req.user = user;
          return next();
        }
      }
    } catch (jwtError) {
      console.log('Token não é um JWT válido, tentando Supabase...', jwtError.message);
    }
  
    // Se não for um JWT válido, tenta verificar como token Supabase
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
          isAdmin
        };
        
        return next();
      }
    } catch (supabaseError) {
      console.error('Erro ao verificar token Supabase:', supabaseError);
    }
    
    // Se chegou até aqui, o token não é válido
    await SecurityAuditLogger.logAccessDenied(req, 'Token inválido ou expirado', {
      token: '[REDACTED]',
      authHeader: authHeader ? '[PRESENT]' : '[MISSING]'
    });
    
    return res.status(401).json({
      error: 'Token inválido ou expirado',
      details: 'Faça login novamente'
    });
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    
    // Log de erro crítico
    await SecurityAuditLogger.logSuspiciousActivity(req, 'AUTH_MIDDLEWARE_ERROR', {
      errorMessage: error.message,
      errorName: error.name
    });
    
    return res.status(500).json({
      error: 'Erro de autenticação',
      details: error.message
    });
  }
};

// Middleware para verificar se o usuário é administrador
const isAdmin = async (req, res, next) => {
  console.log('Verificando privilégios de administrador para:', req.user);
  
  // MODO DE DESENVOLVIMENTO DESATIVADO EM PRODUÇÃO
  // Para reativar em desenvolvimento, defina: ALLOW_DEV_ADMIN=true
  // No entanto, em produção isso deve estar sempre desabilitado por segurança
  
  // authenticate deve ter sido executado primeiro
  if (!req.user) {
    // Log de tentativa de acesso não autorizado
    await SecurityAuditLogger.logAccessDenied(req, 'Usuário não autenticado tentando acessar área administrativa', {
      path: req.path,
      method: req.method
    });
    
    return res.status(401).json({ 
      error: 'Não autorizado',
      details: 'Usuário não autenticado' 
    });
  }
  
  // Se já validamos o admin no middleware authenticate
  if (req.user.isAdmin === true) {
    console.log('Usuário já validado como admin');
    
    // Log de acesso administrativo autorizado
    await SecurityAuditLogger.logAdminAction(req, 'ACCESS_ADMIN_AREA', { path: req.path }, {
      accessType: 'admin_area_access',
      authorized: true
    });
    
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
      
      // Log de erro na verificação de admin
      await SecurityAuditLogger.logSuspiciousActivity(req, 'ADMIN_VERIFICATION_ERROR', {
        errorMessage: error.message,
        userId: req.user.id,
        path: req.path
      });
      
      return res.status(500).json({ 
        error: 'Erro interno',
        details: 'Falha ao verificar privilégios de administrador' 
      });
    }
    
    if (!data || data.is_admin !== true) {
      // Log de tentativa de acesso administrativo não autorizada
      await SecurityAuditLogger.logAccessDenied(req, 'Usuário não possui privilégios administrativos', {
        userId: req.user.id,
        email: req.user.email,
        attemptedPath: req.path,
        method: req.method,
        hasAdminFlag: false
      });
      
      return res.status(403).json({ 
        error: 'Acesso negado',
        details: 'Usuário não possui privilégios de administrador' 
      });
    }
    
    // Atualiza o status de admin no objeto da requisição para futuras verificações
    req.user.isAdmin = true;
    
    // Log de acesso administrativo bem-sucedido
    await SecurityAuditLogger.logAdminAction(req, 'ADMIN_ACCESS_GRANTED', { path: req.path }, {
      accessType: 'admin_privilege_verified',
      verificationMethod: 'database_lookup'
    });
    
    // Usuário é admin, continuar
    next();
  } catch (err) {
    console.error('Exceção ao verificar status de admin:', err);
    
    // Log de exceção crítica na verificação de admin
    await SecurityAuditLogger.logSuspiciousActivity(req, 'ADMIN_VERIFICATION_EXCEPTION', {
      errorMessage: err.message,
      errorName: err.name,
      userId: req.user?.id,
      stack: err.stack?.substring(0, 500) // Apenas primeiros 500 chars do stack
    });
    
    return res.status(500).json({ 
      error: 'Erro interno',
      details: 'Falha ao processar verificação de administrador' 
    });
  }
};

// Exportar middlewares
module.exports = { authenticate, isAdmin };
