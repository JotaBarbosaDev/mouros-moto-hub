// Controlador para autenticação
const jwt = require('jsonwebtoken');
const { supabaseAdmin } = require('../config/supabase');

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
    // Autenticação usando Supabase Auth
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    if (!data || !data.user) {
      return res.status(401).json({
        error: 'Credenciais inválidas',
        details: 'Email ou senha incorretos'
      });
    }
    
    // Gerar token JWT para uso na API
    const token = jwt.sign(
      { 
        id: data.user.id,
        email: data.user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );
    
    res.json({
      token,
      user: {
        id: data.user.id,
        email: data.user.email
      }
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
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
    
    // Primeiro verifica se o usuário existe no Supabase Auth
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (userError || !userData || !userData.user) {
      console.error('Erro ao buscar usuário no Auth:', userError);
      return res.status(404).json({
        error: 'Usuário não encontrado',
        details: 'Perfil não encontrado para o usuário autenticado'
      });
    }
    
    // Tentar buscar dados adicionais do membro na tabela 'members'
    const { data: memberData, error: memberError } = await supabaseAdmin
      .from('members')
      .select('*')
      .eq('id', userId)
      .maybeSingle(); // Usa maybeSingle para não causar erro se não encontrar
    
    // Mesmo que não encontre na tabela members, retorna os dados do auth
    const userProfile = {
      id: userData.user.id,
      email: userData.user.email,
      user_metadata: userData.user.user_metadata || {},
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
