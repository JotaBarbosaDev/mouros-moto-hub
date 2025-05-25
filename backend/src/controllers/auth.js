// filepath: /Users/joaobarbosa/Desktop/projetos/mouros-moto-hub/backend/src/controllers/auth.js
// Controlador para autenticação
const jwt = require('jsonwebtoken');
const { supabaseAdmin } = require('../config/supabase');
const SecurityAuditLogger = require('../middleware/security-audit');

// Login de usuário
const login = async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      error: 'Dados incompletos',
      details: 'Email e senha são obrigatórios'
    });
  }
  
  try {
    console.log(`Tentativa de login para: ${email}`);
    
    // MODO DE DESENVOLVIMENTO DESATIVADO EM PRODUÇÃO
    // Para ativar novamente em desenvolvimento, defina: NODE_ENV=development e ENABLE_TEST_USERS=true
    const DESENVOLVIMENTO_ATIVADO = false; // Forçado para false em produção
    const usuariosTeste = [
      { email: 'admin@mourosmotohub.com', password: 'admin123', isAdmin: true, name: 'Administrador' },
      { email: 'teste@exemplo.com', password: 'senhateste', isAdmin: false, name: 'Usuário Teste' },
      { email: 'joao@mourosmotohub.com', password: 'joao2025', isAdmin: true, name: 'João Barbosa' },
      { email: 'admin@admin.com', password: 'admin', isAdmin: true, name: 'Admin' }
    ];
    
    // Verificar se estamos em desenvolvimento e se o usuário está na lista de teste
    if (DESENVOLVIMENTO_ATIVADO) {
      const usuarioTeste = usuariosTeste.find(u => 
        u.email === email && u.password === password
      );
      
      if (usuarioTeste) {
        console.log('Login usando modo de desenvolvimento para:', email);
        
        // Gerar um ID fictício baseado no email (apenas para testes)
        const mockUserId = Buffer.from(email).toString('base64').substring(0, 36);
        
        // Gerar token JWT para uso na API
        if (!process.env.JWT_SECRET) {
          console.error('JWT_SECRET não está definido no arquivo .env');
          return res.status(500).json({
            error: 'Erro de configuração do servidor',
            details: 'JWT_SECRET não configurado'
          });
        }
        
        const token = jwt.sign(
          { 
            id: mockUserId,
            email: email,
            isAdmin: usuarioTeste.isAdmin,
            name: usuarioTeste.name,
            user_metadata: {
              name: usuarioTeste.name
            }
          },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
        );
        
        return res.json({
          token,
          user: {
            id: mockUserId,
            email: email,
            name: usuarioTeste.name,
            role: usuarioTeste.isAdmin ? 'admin' : 'user'
          }
        });
      }
    }
    
    // Se não estiver em modo de desenvolvimento ou o usuário não for encontrado na lista,
    // continuar com a autenticação normal do Supabase
    console.log('Tentando autenticação via Supabase');
    
    // Autenticação usando Supabase Auth
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('Erro na autenticação do Supabase:', error);
      
      // Log de auditoria para falha de autenticação
      await SecurityAuditLogger.logAuthAttempt(req, false, {
        email: email,
        reason: error.message || 'Credenciais inválidas'
      });
      
      return res.status(401).json({
        error: 'Credenciais inválidas',
        details: 'Email ou senha incorretos'
      });
    }
    
    if (!data || !data.user) {
      console.error('Dados de usuário inválidos retornados pelo Supabase');
      
      // Log de auditoria para dados inválidos
      await SecurityAuditLogger.logAuthAttempt(req, false, {
        email: email,
        reason: 'Dados de usuário inválidos'
      });
      
      return res.status(401).json({
        error: 'Credenciais inválidas',
        details: 'Email ou senha incorretos'
      });
    }
    
    console.log('Login bem-sucedido para usuário:', data.user.id);
    
    // Buscar informações adicionais do usuário da tabela members
    const { data: memberData } = await supabaseAdmin
      .from('members')
      .select('name, is_admin')
      .eq('id', data.user.id)
      .maybeSingle();
    
    const name = data.user.user_metadata?.name || memberData?.name || '';
    const isAdmin = memberData?.is_admin || false;
    
    // Gerar token JWT para uso na API com mais informações para o perfil
    const token = jwt.sign(
      { 
        id: data.user.id,
        email: data.user.email,
        isAdmin: isAdmin,
        name: name,
        user_metadata: {
          name: name,
          ...data.user.user_metadata
        }
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );
    
    // Log de auditoria para login bem-sucedido
    await SecurityAuditLogger.logAuthAttempt(req, true, {
      userId: data.user.id,
      email: data.user.email,
      name: name,
      isAdmin: isAdmin
    });
    
    res.json({
      token,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: name,
        role: isAdmin ? 'admin' : 'user'
      }
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    
    // Log de auditoria para login falhado
    await SecurityAuditLogger.logAuthAttempt(req, false, {
      email: email,
      reason: error.message
    });
    
    res.status(500).json({
      error: 'Erro na autenticação',
      details: error.message
    });
  }
};

// Registro de novo usuário
const register = async (req, res) => {
  const { email, password, name } = req.body;
  
  if (!email || !password || !name) {
    return res.status(400).json({
      error: 'Dados incompletos',
      details: 'Nome, email e senha são obrigatórios'
    });
  }
  
  try {
    // Criar usuário no Supabase Auth
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { name }
    });
    
    if (error) throw error;
    
    if (!data || !data.user) {
      return res.status(500).json({
        error: 'Erro ao criar usuário',
        details: 'Falha no registro'
      });
    }
    
    // Criar registro do membro na tabela members
    const { data: memberData, error: memberError } = await supabaseAdmin
      .from('members')
      .insert({
        id: data.user.id,
        name,
        email,
        is_active: true,
        member_since: new Date().toISOString().split('T')[0]
      })
      .select()
      .single();
    
    if (memberError) throw memberError;
    
    res.status(201).json({
      message: 'Usuário registrado com sucesso',
      user: {
        id: data.user.id,
        email: data.user.email,
        name
      }
    });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({
      error: 'Erro no registro',
      details: error.message
    });
  }
};

// Logout
const logout = async (req, res) => {
  try {
    // Não precisamos realmente fazer nada com o JWT,
    // o cliente deve apenas descartar o token
    res.json({
      message: 'Logout realizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    res.status(500).json({
      error: 'Erro ao processar logout',
      details: error.message
    });
  }
};

// Obter perfil do usuário autenticado
const getProfile = async (req, res) => {
  try {
    // O usuário já foi autenticado pelo middleware
    const userId = req.user.id;
    const userEmail = req.user.email;
    
    console.log('Autenticação via JWT local bem-sucedida:', userId);
    
    // Usando abordagem alternativa que não depende do admin.getUserById
    // Já que sabemos que o usuário está autenticado pelo JWT
    
    // Tentar buscar dados adicionais do membro na tabela 'members'
    const { data: memberData, error: memberError } = await supabaseAdmin
      .from('members')
      .select('*')
      .eq('id', userId)
      .maybeSingle(); // Usa maybeSingle para não causar erro se não encontrar
    
    if (memberError) {
      console.error('Erro ao buscar dados do membro:', memberError);
    }
    
    // Construir perfil do usuário a partir dos dados do JWT + tabela members
    const userProfile = {
      id: userId,
      email: userEmail,
      name: req.user.name || memberData?.name || '',
      user_metadata: req.user.user_metadata || {},
      role: req.user.isAdmin || memberData?.is_admin ? 'admin' : 'user',
      ...((memberData && !memberError) ? memberData : {})
    };
    
    res.json(userProfile);
  } catch (error) {
    console.error('Erro ao obter perfil:', error);
    res.status(500).json({
      error: 'Erro ao buscar perfil',
      details: error.message
    });
  }
};

// Exportar controladores
module.exports = {
  login,
  register,
  logout,
  getProfile
};
