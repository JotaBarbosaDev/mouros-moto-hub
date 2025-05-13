// backend/src/controllers/admin.js
const { supabase } = require('../config/supabase');

// Obter estatísticas gerais do sistema
exports.getStats = async (req, res) => {
  try {
    // Contagem de membros
    const { count: membersCount, error: membersError } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true });
    
    if (membersError) throw membersError;
    
    // Contagem de veículos
    const { count: vehiclesCount, error: vehiclesError } = await supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true });
    
    if (vehiclesError) throw vehiclesError;
    
    // Contagem de eventos
    const { count: eventsCount, error: eventsError } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true });
    
    if (eventsError) throw eventsError;
    
    // Contagem de produtos no bar
    const { count: barProductsCount, error: barProductsError } = await supabase
      .from('bar_products')
      .select('*', { count: 'exact', head: true });
    
    if (barProductsError) throw barProductsError;
    
    // Vendas recentes do bar (últimos 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: recentSales, error: salesError } = await supabase
      .from('bar_sales')
      .select('total_value')
      .gte('sale_date', thirtyDaysAgo.toISOString());
    
    if (salesError) throw salesError;
    
    // Cálculo do total de vendas recentes
    const totalRecentSales = recentSales.reduce((sum, sale) => sum + sale.total_value, 0);
    
    // Contagem de itens no inventário
    const { count: inventoryCount, error: inventoryError } = await supabase
      .from('inventory')
      .select('*', { count: 'exact', head: true });
    
    if (inventoryError) throw inventoryError;
    
    // Retornar as estatísticas
    res.status(200).json({
      members: membersCount,
      vehicles: vehiclesCount,
      events: eventsCount,
      barProducts: barProductsCount,
      recentSales: totalRecentSales,
      inventoryItems: inventoryCount
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({ error: 'Erro ao obter estatísticas', details: error.message });
  }
};

// Obter logs de atividades do sistema
exports.getLogs = async (req, res) => {
  try {
    // Parâmetros de paginação opcionais
    const { page = 0, limit = 20 } = req.query;
    const offset = page * limit;
    
    const { data, error } = await supabase
      .from('system_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    
    // Contagem total para paginação
    const { count, error: countError } = await supabase
      .from('system_logs')
      .select('*', { count: 'exact', head: true });
    
    if (countError) throw countError;
    
    res.status(200).json({
      logs: data,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar logs:', error);
    res.status(500).json({ error: 'Erro ao buscar logs', details: error.message });
  }
};

// Atualizar configurações do sistema
exports.updateConfig = async (req, res) => {
  try {
    const configData = req.body;
    
    // Verificar se já existem configurações
    const { data: existingConfig, error: findError } = await supabase
      .from('system_config')
      .select('*')
      .single();
    
    if (findError && findError.code !== 'PGRST116') throw findError;
    
    let result;
    
    if (existingConfig) {
      // Atualizar configurações existentes
      const { data, error } = await supabase
        .from('system_config')
        .update(configData)
        .eq('id', existingConfig.id)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    } else {
      // Criar novas configurações
      const { data, error } = await supabase
        .from('system_config')
        .insert(configData)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    }
    
    // Adicionar log de atualização
    await supabase
      .from('system_logs')
      .insert({
        action: 'update_config',
        description: 'Configurações do sistema atualizadas',
        user_id: req.user.id, // Assumindo que o middleware de autenticação adiciona o user ao req
        created_at: new Date().toISOString()
      });
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    res.status(500).json({ error: 'Erro ao atualizar configurações', details: error.message });
  }
};

// Fazer backup do banco de dados (apenas metadados, para uso com Supabase)
exports.createBackup = async (req, res) => {
  try {
    // Esta função é apenas um placeholder, pois o backup real do Supabase 
    // precisa ser feito através da API do Supabase ou Console de Admin
    
    // Registrar tentativa de backup
    await supabase
      .from('system_logs')
      .insert({
        action: 'backup_requested',
        description: 'Solicitação de backup do banco de dados',
        user_id: req.user.id,
        created_at: new Date().toISOString()
      });
    
    res.status(200).json({ 
      message: 'Solicitação de backup registrada', 
      instructions: 'Para realizar o backup completo, acesse o Console de Admin do Supabase' 
    });
  } catch (error) {
    console.error('Erro ao solicitar backup:', error);
    res.status(500).json({ error: 'Erro ao solicitar backup', details: error.message });
  }
};
