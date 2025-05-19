// Modelo para pagamentos de quotas de membros
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config();

// Configurações do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

// Logging para debug
console.log('URL Supabase:', supabaseUrl);
console.log('Chave Supabase disponível:', supabaseKey ? 'Sim' : 'Não');

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

const TABLE_NAME = 'dues_payments';

// Buscar todos os pagamentos de quotas
const findAll = async () => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar pagamentos de quotas:', error);
    throw error;
  }
};

// Buscar pagamentos de quotas por ID
const findById = async (id) => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 é "não encontrado"
    return data;
  } catch (error) {
    console.error(`Erro ao buscar pagamento de quota ${id}:`, error);
    throw error;
  }
};

// Buscar pagamentos de quotas por ID do membro
const findByMemberId = async (memberId) => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('member_id', memberId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`Erro ao buscar pagamentos de quotas para o membro ${memberId}:`, error);
    throw error;
  }
};

// Criar um novo pagamento de quota
const create = async (duesPaymentData) => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert(duesPaymentData)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao criar pagamento de quota:', error);
    throw error;
  }
};

// Atualizar um pagamento de quota existente
const update = async (id, duesPaymentData) => {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(duesPaymentData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Erro ao atualizar pagamento de quota ${id}:`, error);
    throw error;
  }
};

// Excluir um pagamento de quota
const remove = async (id) => {
  try {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Erro ao excluir pagamento de quota ${id}:`, error);
    throw error;
  }
};

module.exports = {
  findAll,
  findById,
  findByMemberId,
  create,
  update,
  delete: remove
};
