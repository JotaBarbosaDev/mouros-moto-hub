// Utilitários para bypass de RLS em operações críticas
const { supabaseAdmin } = require('../config/supabase');

/**
 * Cria um membro sem ser afetado por políticas RLS
 * @param {Object} memberData - Dados do membro a ser criado
 * @returns {Promise<Object>} - Membro criado
 */
const createMemberBypassRLS = async (memberData) => {
  try {
    console.log('Criando membro com bypass de RLS:', memberData.name);
    
    // Usamos o cliente Supabase Admin que tem a chave service_role
    // que ignora as políticas de RLS
    const { data, error } = await supabaseAdmin
      .from('members')
      .insert({
        name: memberData.name,
        email: memberData.email,
        member_number: memberData.memberNumber,
        is_admin: memberData.isAdmin || false,
        is_active: memberData.isActive || true,
        phone: memberData.phone,
        birthdate: memberData.birthdate,
        street: memberData.address?.street,
        city: memberData.address?.city,
        state: memberData.address?.state,
        postal_code: memberData.address?.postalCode,
        additional_info: memberData.additionalInfo || {},
        // Outros campos conforme necessário
      })
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao criar membro com bypass de RLS:', error);
      throw error;
    }
    
    console.log('Membro criado com bypass RLS com sucesso:', data.id);
    return data;
  } catch (error) {
    console.error('Exceção ao criar membro com bypass de RLS:', error);
    throw error;
  }
};

/**
 * Recupera todos os membros sem ser afetado por políticas RLS
 * @returns {Promise<Array>} - Lista de membros
 */
const getAllMembersBypassRLS = async () => {
  try {
    console.log('Buscando todos os membros com bypass de RLS');
    
    // Usamos o cliente Supabase Admin que ignora as políticas de RLS
    const { data, error } = await supabaseAdmin
      .from('members')
      .select('*');
    
    if (error) {
      console.error('Erro ao buscar membros com bypass de RLS:', error);
      throw error;
    }
    
    console.log(`Recuperados ${data.length} membros com bypass RLS`);
    return data;
  } catch (error) {
    console.error('Exceção ao buscar membros com bypass de RLS:', error);
    throw error;
  }
};

module.exports = {
  createMemberBypassRLS,
  getAllMembersBypassRLS
};
