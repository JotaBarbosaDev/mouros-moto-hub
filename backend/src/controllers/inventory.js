// backend/src/controllers/inventory.js
const { supabase } = require('../config/supabase');

// Obter todos os itens do inventário
exports.getAllItems = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Erro ao buscar itens do inventário:', error);
    res.status(500).json({ error: 'Erro ao buscar itens do inventário', details: error.message });
  }
};

// Obter um item específico pelo ID
exports.getItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    if (!data) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Erro ao buscar item do inventário:', error);
    res.status(500).json({ error: 'Erro ao buscar item do inventário', details: error.message });
  }
};

// Criar um novo item no inventário
exports.createItem = async (req, res) => {
  try {
    const itemData = req.body;
    
    // Validação básica
    if (!itemData.name || !itemData.quantity) {
      return res.status(400).json({ 
        error: 'Dados incompletos', 
        message: 'Os campos nome e quantidade são obrigatórios' 
      });
    }
    
    const { data, error } = await supabase
      .from('inventory')
      .insert(itemData)
      .select()
      .single();
    
    if (error) throw error;
    
    // Adicionar log de operação
    await supabase
      .from('inventory_logs')
      .insert({
        item_id: data.id,
        action: 'create',
        quantity: itemData.quantity,
        user_id: req.user?.id, // Assumindo que o middleware de autenticação adiciona o user ao req
        notes: `Item adicionado ao inventário: ${itemData.name}`,
        created_at: new Date().toISOString()
      });
    
    res.status(201).json(data);
  } catch (error) {
    console.error('Erro ao criar item no inventário:', error);
    res.status(500).json({ error: 'Erro ao criar item no inventário', details: error.message });
  }
};

// Atualizar um item existente
exports.updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const itemData = req.body;
    
    // Buscar o item existente para comparação
    const { data: existingItem, error: findError } = await supabase
      .from('inventory')
      .select('*')
      .eq('id', id)
      .single();
    
    if (findError) throw findError;
    
    if (!existingItem) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }
    
    // Atualizar o item
    const { data, error } = await supabase
      .from('inventory')
      .update(itemData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Verificar se houve mudança na quantidade
    if (itemData.quantity !== existingItem.quantity) {
      // Calcular a diferença na quantidade
      const quantityChange = itemData.quantity - existingItem.quantity;
      const action = quantityChange > 0 ? 'add' : 'remove';
      
      // Adicionar log da mudança de quantidade
      await supabase
        .from('inventory_logs')
        .insert({
          item_id: id,
          action,
          quantity: Math.abs(quantityChange),
          user_id: req.user?.id,
          notes: `Quantidade alterada de ${existingItem.quantity} para ${itemData.quantity}`,
          created_at: new Date().toISOString()
        });
    }
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Erro ao atualizar item do inventário:', error);
    res.status(500).json({ error: 'Erro ao atualizar item do inventário', details: error.message });
  }
};

// Excluir um item
exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se o item existe
    const { data: existingItem, error: findError } = await supabase
      .from('inventory')
      .select('*')
      .eq('id', id)
      .single();
    
    if (findError) throw findError;
    
    if (!existingItem) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }
    
    // Registrar log antes de excluir
    await supabase
      .from('inventory_logs')
      .insert({
        item_id: id,
        action: 'delete',
        quantity: existingItem.quantity,
        user_id: req.user?.id,
        notes: `Item excluído do inventário: ${existingItem.name}`,
        created_at: new Date().toISOString()
      });
    
    // Excluir o item
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.status(200).json({ message: 'Item excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir item do inventário:', error);
    res.status(500).json({ error: 'Erro ao excluir item do inventário', details: error.message });
  }
};

// Adicionar quantidade a um item existente
exports.addQuantity = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, notes } = req.body;
    
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Quantidade inválida' });
    }
    
    // Verificar se o item existe
    const { data: existingItem, error: findError } = await supabase
      .from('inventory')
      .select('*')
      .eq('id', id)
      .single();
    
    if (findError) throw findError;
    
    if (!existingItem) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }
    
    // Calcular nova quantidade
    const newQuantity = existingItem.quantity + quantity;
    
    // Atualizar quantidade
    const { data, error } = await supabase
      .from('inventory')
      .update({ quantity: newQuantity })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Registrar log da operação
    await supabase
      .from('inventory_logs')
      .insert({
        item_id: id,
        action: 'add',
        quantity,
        user_id: req.user?.id,
        notes: notes || `Quantidade aumentada em ${quantity}`,
        created_at: new Date().toISOString()
      });
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Erro ao adicionar quantidade:', error);
    res.status(500).json({ error: 'Erro ao adicionar quantidade', details: error.message });
  }
};

// Remover quantidade de um item existente
exports.removeQuantity = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, notes } = req.body;
    
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Quantidade inválida' });
    }
    
    // Verificar se o item existe
    const { data: existingItem, error: findError } = await supabase
      .from('inventory')
      .select('*')
      .eq('id', id)
      .single();
    
    if (findError) throw findError;
    
    if (!existingItem) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }
    
    // Verificar se há quantidade suficiente
    if (existingItem.quantity < quantity) {
      return res.status(400).json({ error: 'Quantidade insuficiente no inventário' });
    }
    
    // Calcular nova quantidade
    const newQuantity = existingItem.quantity - quantity;
    
    // Atualizar quantidade
    const { data, error } = await supabase
      .from('inventory')
      .update({ quantity: newQuantity })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Registrar log da operação
    await supabase
      .from('inventory_logs')
      .insert({
        item_id: id,
        action: 'remove',
        quantity,
        user_id: req.user?.id,
        notes: notes || `Quantidade reduzida em ${quantity}`,
        created_at: new Date().toISOString()
      });
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Erro ao remover quantidade:', error);
    res.status(500).json({ error: 'Erro ao remover quantidade', details: error.message });
  }
};

// Obter histórico de movimentações de um item
exports.getItemHistory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se o item existe
    const { data: existingItem, error: findError } = await supabase
      .from('inventory')
      .select('*')
      .eq('id', id)
      .single();
    
    if (findError) throw findError;
    
    if (!existingItem) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }
    
    // Buscar logs do item
    const { data, error } = await supabase
      .from('inventory_logs')
      .select('*, users(id, name)')
      .eq('item_id', id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Erro ao buscar histórico do item:', error);
    res.status(500).json({ error: 'Erro ao buscar histórico do item', details: error.message });
  }
};
