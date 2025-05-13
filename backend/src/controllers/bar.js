// backend/src/controllers/bar.js
const { supabaseAdmin } = require('../config/supabase');

// Obter todos os produtos do bar
exports.getAllProducts = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('bar_products')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Erro ao buscar produtos do bar:', error);
    res.status(500).json({ error: 'Erro ao buscar produtos do bar', details: error.message });
  }
};

// Obter um produto específico pelo ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('bar_products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    if (!data) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Erro ao buscar produto do bar:', error);
    res.status(500).json({ error: 'Erro ao buscar produto do bar', details: error.message });
  }
};

// Criar novo produto
exports.createProduct = async (req, res) => {
  try {
    const productData = req.body;
    
    // Validação básica
    if (!productData.name || !productData.price) {
      return res.status(400).json({
        error: "Dados incompletos",
        details: "Nome e preço são obrigatórios"
      });
    }
    
    // Inserir no Supabase
    const { data, error } = await supabaseAdmin
      .from('bar_products')
      .insert([productData])
      .select()
      .single();
    
    if (error) throw error;
    
    res.status(201).json(data);
  } catch (error) {
    console.error('Erro ao criar produto do bar:', error);
    res.status(500).json({ error: 'Erro ao criar produto do bar', details: error.message });
  }
};

// Atualizar produto existente
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const productData = req.body;
    
    // Validação básica
    if (!productData.name || !productData.price) {
      return res.status(400).json({
        error: "Dados incompletos",
        details: "Nome e preço são obrigatórios"
      });
    }
    
    // Verificar se o produto existe
    const { data: existingProduct, error: findError } = await supabaseAdmin
      .from('bar_products')
      .select('id')
      .eq('id', id)
      .single();
    
    if (findError || !existingProduct) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    // Atualizar no Supabase
    const { data, error } = await supabaseAdmin
      .from('bar_products')
      .update(productData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Erro ao atualizar produto do bar:', error);
    res.status(500).json({ error: 'Erro ao atualizar produto do bar', details: error.message });
  }
};

// Excluir produto
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se o produto existe
    const { data: existingProduct, error: findError } = await supabaseAdmin
      .from('bar_products')
      .select('id')
      .eq('id', id)
      .single();
    
    if (findError || !existingProduct) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    // Excluir do Supabase
    const { error } = await supabaseAdmin
      .from('bar_products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir produto do bar:', error);
    res.status(500).json({ error: 'Erro ao excluir produto do bar', details: error.message });
  }
};

// Atualizar estoque de um produto
exports.updateProductStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;
    
    // Validação básica
    if (stock === undefined || stock === null) {
      return res.status(400).json({
        error: "Dados incompletos",
        details: "Quantidade em estoque é obrigatória"
      });
    }
    
    // Verificar se o produto existe
    const { data: existingProduct, error: findError } = await supabaseAdmin
      .from('bar_products')
      .select('id')
      .eq('id', id)
      .single();
    
    if (findError || !existingProduct) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    // Atualizar no Supabase
    const { data, error } = await supabaseAdmin
      .from('bar_products')
      .update({ stock })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Erro ao atualizar estoque do produto:', error);
    res.status(500).json({ error: 'Erro ao atualizar estoque do produto', details: error.message });
  }
};

// Implementações básicas para vendas do bar
exports.getAllSales = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('bar_sales')
      .select('*, bar_sale_items(*)')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Erro ao buscar vendas do bar:', error);
    res.status(500).json({ error: 'Erro ao buscar vendas do bar', details: error.message });
  }
};

exports.getSaleById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('bar_sales')
      .select('*, bar_sale_items(*)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    if (!data) {
      return res.status(404).json({ error: 'Venda não encontrada' });
    }
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Erro ao buscar venda do bar:', error);
    res.status(500).json({ error: 'Erro ao buscar venda do bar', details: error.message });
  }
};

exports.createSale = async (req, res) => {
  try {
    const { sale, items } = req.body;
    
    // Validação básica
    if (!sale || !items || items.length === 0) {
      return res.status(400).json({
        error: "Dados incompletos",
        details: "Dados da venda e itens são obrigatórios"
      });
    }
    
    // Iniciar uma transação no Supabase
    const { data: saleData, error: saleError } = await supabaseAdmin
      .from('bar_sales')
      .insert([{
        total_amount: sale.totalAmount,
        payment_method: sale.paymentMethod,
        operator_id: sale.operatorId,
        notes: sale.notes || null
      }])
      .select()
      .single();
    
    if (saleError) throw saleError;
    
    // Adicionar os itens da venda
    const saleItems = items.map(item => ({
      sale_id: saleData.id,
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.totalPrice
    }));
    
    const { error: itemsError } = await supabaseAdmin
      .from('bar_sale_items')
      .insert(saleItems);
    
    if (itemsError) throw itemsError;
    
    // Atualizar estoque dos produtos
    for (const item of items) {
      // Obter estoque atual
      const { data: productData, error: getProductError } = await supabaseAdmin
        .from('bar_products')
        .select('stock')
        .eq('id', item.productId)
        .single();
      
      if (getProductError) throw getProductError;
      
      // Calcular novo estoque
      const newStock = productData.stock - item.quantity;
      
      // Atualizar estoque
      const { error: updateStockError } = await supabaseAdmin
        .from('bar_products')
        .update({ stock: newStock })
        .eq('id', item.productId);
      
      if (updateStockError) throw updateStockError;
    }
    
    // Buscar a venda completa com todos os itens
    const { data: completeSale, error: getCompleteError } = await supabaseAdmin
      .from('bar_sales')
      .select('*, bar_sale_items(*)')
      .eq('id', saleData.id)
      .single();
    
    if (getCompleteError) throw getCompleteError;
    
    res.status(201).json(completeSale);
  } catch (error) {
    console.error('Erro ao criar venda do bar:', error);
    res.status(500).json({ error: 'Erro ao criar venda do bar', details: error.message });
  }
};

exports.updateSale = async (req, res) => {
  try {
    const { id } = req.params;
    const saleData = req.body;
    
    // Verificar se a venda existe
    const { data: existingSale, error: findError } = await supabaseAdmin
      .from('bar_sales')
      .select('id')
      .eq('id', id)
      .single();
    
    if (findError || !existingSale) {
      return res.status(404).json({ error: 'Venda não encontrada' });
    }
    
    // Atualizar no Supabase
    const { data, error } = await supabaseAdmin
      .from('bar_sales')
      .update(saleData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Erro ao atualizar venda do bar:', error);
    res.status(500).json({ error: 'Erro ao atualizar venda do bar', details: error.message });
  }
};

exports.deleteSale = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se a venda existe
    const { data: existingSale, error: findError } = await supabaseAdmin
      .from('bar_sales')
      .select('id')
      .eq('id', id)
      .single();
    
    if (findError || !existingSale) {
      return res.status(404).json({ error: 'Venda não encontrada' });
    }
    
    // Excluir do Supabase - os itens serão excluídos automaticamente devido à constraint foreign key
    const { error } = await supabaseAdmin
      .from('bar_sales')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir venda do bar:', error);
    res.status(500).json({ error: 'Erro ao excluir venda do bar', details: error.message });
  }
};
