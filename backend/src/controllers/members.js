// Controller para gerenciamento de membros
const MemberModel = require('../models/member');
const activityLogService = require('../services/activity-log-service');

// Obter todos os membros
const getAllMembers = async (req, res) => {
  try {
    const members = await MemberModel.findAll();
    
    // Registrar a atividade de visualização
    const user = req.user || {};
    activityLogService.log({
      userId: user.id,
      username: user.email || user.username || 'anônimo',
      action: 'VIEW',
      entityType: 'MEMBER',
      entityId: null,
      details: { count: members.length },
      ipAddress: req.ip || req.connection?.remoteAddress || 'unknown'
    }).catch(err => console.error('Erro ao registrar log:', err));
    
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
    
    // Registrar a atividade de visualização de membro específico
    const user = req.user || {};
    activityLogService.log({
      userId: user.id,
      username: user.email || user.username || 'anônimo',
      action: 'VIEW',
      entityType: 'MEMBER',
      entityId: memberId,
      details: { memberName: member.name },
      ipAddress: req.ip || req.connection?.remoteAddress || 'unknown'
    }).catch(err => console.error('Erro ao registrar log:', err));
    
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
    
    // Registrar a atividade de criação de membro
    const user = req.user || {};
    activityLogService.log({
      userId: user.id,
      username: user.email || user.username || 'anônimo',
      action: 'CREATE',
      entityType: 'MEMBER',
      entityId: newMember.id,
      details: { 
        memberName: newMember.name,
        memberEmail: newMember.email,
        memberType: newMember.memberType
      },
      ipAddress: req.ip || req.connection?.remoteAddress || 'unknown'
    }).catch(err => console.error('Erro ao registrar log:', err));
    
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
    // Para PUT, verificar se o membro existe antes e guardar dados anteriores para log
    let existingMember = null;
    if (!isPatch) {
      existingMember = await MemberModel.findById(memberId);
        
      if (!existingMember) {
        return res.status(404).json({
          error: 'Membro não encontrado',
          details: `Não existe membro com o ID ${memberId}`
        });
      }
    } else {
      // Para PATCH também precisamos do estado anterior para o log
      existingMember = await MemberModel.findById(memberId);
    }
    
    // Aplicar atualização
    const updatedMember = await MemberModel.update(memberId, memberData);
    
    // Registrar a atividade de atualização
    const user = req.user || {};
    activityLogService.log({
      userId: user.id,
      username: user.email || user.username || 'anônimo',
      action: 'UPDATE',
      entityType: 'MEMBER',
      entityId: memberId,
      details: { 
        memberName: updatedMember.name,
        changedFields: Object.keys(memberData),
        previousState: existingMember ? {
          name: existingMember.name,
          email: existingMember.email,
          memberType: existingMember.memberType,
          isActive: existingMember.isActive
        } : null,
        currentState: {
          name: updatedMember.name,
          email: updatedMember.email,
          memberType: updatedMember.memberType,
          isActive: updatedMember.isActive
        }
      },
      ipAddress: req.ip || req.connection?.remoteAddress || 'unknown'
    }).catch(err => console.error('Erro ao registrar log:', err));
    
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
    // Obter informações do membro antes de excluir para o log
    const memberToDelete = await MemberModel.findById(memberId);
    
    if (!memberToDelete) {
      return res.status(404).json({
        error: 'Membro não encontrado',
        details: `Não existe membro com o ID ${memberId}`
      });
    }
    
    // Realizar a exclusão
    await MemberModel.remove(memberId);
    
    // Registrar a atividade de exclusão
    const user = req.user || {};
    activityLogService.log({
      userId: user.id,
      username: user.email || user.username || 'anônimo',
      action: 'DELETE',
      entityType: 'MEMBER',
      entityId: memberId,
      details: { 
        memberName: memberToDelete.name,
        memberEmail: memberToDelete.email,
        memberType: memberToDelete.memberType
      },
      ipAddress: req.ip || req.connection?.remoteAddress || 'unknown'
    }).catch(err => console.error('Erro ao registrar log:', err));
    
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
