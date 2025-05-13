// Controller para gerenciamento de membros
const MemberModel = require('../models/member');

// Obter todos os membros
const getAllMembers = async (req, res) => {
  try {
    const members = await MemberModel.findAll();
    res.json(members);
  } catch (error) {
    console.error('Erro ao obter membros:', error);
    res.status(500).json({
      error: 'Erro ao consultar membros',
      details: error.message
    });
  }
};

// Obter membro específico por ID
const getMemberById = async (req, res) => {
  const memberId = req.params.id;
  
  try {
    const member = await MemberModel.findById(memberId);
    
    if (!member) {
      return res.status(404).json({
        error: 'Membro não encontrado',
        details: `Não existe membro com o ID ${memberId}`
      });
    }
    
    res.json(member);
  } catch (error) {
    console.error(`Erro ao obter membro ${memberId}:`, error);
    res.status(500).json({
      error: 'Erro ao buscar membro',
      details: error.message
    });
  }
};

// Criar novo membro
const createMember = async (req, res) => {
  const memberData = req.body;
  
  // Validação básica
  if (!memberData.name || !memberData.email) {
    return res.status(400).json({
      error: "Dados incompletos",
      details: "Nome e email são obrigatórios"
    });
  }
  
  try {
    const newMember = await MemberModel.create(memberData);
    res.status(201).json(newMember);
  } catch (error) {
    console.error('Erro ao criar membro:', error);
    res.status(500).json({
      error: "Erro ao criar membro",
      details: error.message
    });
  }
};

// Atualizar membro existente
const updateMember = async (req, res) => {
  const memberId = req.params.id;
  const memberData = req.body;
  const isPatch = req.method === 'PATCH';
  
  try {
    // Para PUT, verificar se o membro existe antes
    if (!isPatch) {
      const existingMember = await MemberModel.findById(memberId);
        
      if (!existingMember) {
        return res.status(404).json({
          error: 'Membro não encontrado',
          details: `Não existe membro com o ID ${memberId}`
        });
      }
    }
    
    // Aplicar atualização
    const updatedMember = await MemberModel.update(memberId, memberData);
    res.json(updatedMember);
  } catch (error) {
    console.error(`Erro ao atualizar membro ${memberId}:`, error);
    res.status(500).json({
      error: `Erro ao ${isPatch ? 'atualizar parcialmente' : 'atualizar'} membro`,
      details: error.message
    });
  }
};

// Excluir membro
const deleteMember = async (req, res) => {
  const memberId = req.params.id;
  
  try {
    await MemberModel.remove(memberId);
    
    res.json({
      success: true,
      message: `Membro com ID ${memberId} removido com sucesso`
    });
  } catch (error) {
    console.error(`Erro ao remover membro ${memberId}:`, error);
    res.status(500).json({
      error: 'Erro ao remover membro',
      details: error.message
    });
  }
};

// Exportar controladores para uso nas rotas
module.exports = {
  getAllMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember
};
