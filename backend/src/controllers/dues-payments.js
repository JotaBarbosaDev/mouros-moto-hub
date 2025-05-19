// Controller para gerenciamento de pagamentos de quotas
const DuesPaymentModel = require('../models/dues-payment');
const activityLogService = require('../services/activity-log-service');

// Obter todos os pagamentos de quotas
exports.getAllDuesPayments = async (req, res) => {
  try {
    const duesPayments = await DuesPaymentModel.findAll();
    
    // Registrar a atividade de visualização
    const user = req.user || {};
    activityLogService.log({
      userId: user.id,
      username: user.email || user.username || 'anônimo',
      action: 'VIEW',
      entityType: 'DUES_PAYMENT',
      entityId: null,
      details: { count: duesPayments.length },
      ipAddress: req.ip || req.connection?.remoteAddress || 'unknown'
    }).catch(err => console.error('Erro ao registrar log:', err));
    
    res.status(200).json(duesPayments);
  } catch (error) {
    console.error('Erro ao buscar pagamentos de quotas:', error);
    res.status(500).json({ error: 'Erro ao buscar pagamentos de quotas', details: error.message });
  }
};

// Obter um pagamento de quota específico pelo ID
exports.getDuesPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const duesPayment = await DuesPaymentModel.findById(id);
    
    if (!duesPayment) {
      return res.status(404).json({ error: 'Pagamento de quota não encontrado' });
    }
    
    // Registrar atividade de visualização de pagamento de quota específico
    const user = req.user || {};
    activityLogService.log({
      userId: user.id,
      username: user.email || user.username || 'anônimo',
      action: 'VIEW',
      entityType: 'DUES_PAYMENT',
      entityId: id,
      details: { 
        memberId: duesPayment.member_id,
        year: duesPayment.year,
        status: duesPayment.paid ? 'Pago' : 'Pendente'
      },
      ipAddress: req.ip || req.connection?.remoteAddress || 'unknown'
    }).catch(err => console.error('Erro ao registrar log:', err));
    
    res.status(200).json(duesPayment);
  } catch (error) {
    console.error(`Erro ao buscar pagamento de quota com ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Erro ao buscar pagamento de quota', details: error.message });
  }
};

// Obter pagamentos de quotas por ID do membro
exports.getDuesPaymentsByMemberId = async (req, res) => {
  try {
    const { memberId } = req.params;
    const duesPayments = await DuesPaymentModel.findByMemberId(memberId);
    res.status(200).json(duesPayments);
  } catch (error) {
    console.error(`Erro ao buscar pagamentos de quotas para o membro ${req.params.memberId}:`, error);
    res.status(500).json({ error: 'Erro ao buscar pagamentos de quotas do membro', details: error.message });
  }
};

// Criar um novo pagamento de quota
exports.createDuesPayment = async (req, res) => {
  try {
    // Validação básica
    if (!req.body.member_id || !req.body.year) {
      return res.status(400).json({
        error: 'Dados incompletos',
        details: 'ID do membro e ano são campos obrigatórios'
      });
    }
    
    // Criar o pagamento de quota
    const newDuesPayment = await DuesPaymentModel.create(req.body);
    
    // Registrar atividade de criação de pagamento
    const user = req.user || {};
    activityLogService.log({
      userId: user.id,
      username: user.email || user.username || 'anônimo',
      action: 'CREATE',
      entityType: 'DUES_PAYMENT',
      entityId: newDuesPayment.id,
      details: {
        memberId: newDuesPayment.member_id,
        year: newDuesPayment.year,
        paid: newDuesPayment.paid,
        exempt: newDuesPayment.exempt
      },
      ipAddress: req.ip || req.connection?.remoteAddress || 'unknown'
    }).catch(err => console.error('Erro ao registrar log:', err));
    
    res.status(201).json(newDuesPayment);
  } catch (error) {
    console.error('Erro ao criar pagamento de quota:', error);
    res.status(500).json({ error: 'Erro ao criar pagamento de quota', details: error.message });
  }
};

// Atualizar um pagamento de quota existente
exports.updateDuesPayment = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se o pagamento existe
    const existingDuesPayment = await DuesPaymentModel.findById(id);
    if (!existingDuesPayment) {
      return res.status(404).json({ error: 'Pagamento de quota não encontrado' });
    }
    
    // Atualizar o pagamento
    const updatedDuesPayment = await DuesPaymentModel.update(id, req.body);
    
    // Registrar atividade de atualização
    const user = req.user || {};
    activityLogService.log({
      userId: user.id,
      username: user.email || user.username || 'anônimo',
      action: 'UPDATE',
      entityType: 'DUES_PAYMENT',
      entityId: id,
      details: {
        memberId: updatedDuesPayment.member_id,
        year: updatedDuesPayment.year,
        paid: updatedDuesPayment.paid,
        exempt: updatedDuesPayment.exempt,
        fields: Object.keys(req.body).join(', ')
      },
      ipAddress: req.ip || req.connection?.remoteAddress || 'unknown'
    }).catch(err => console.error('Erro ao registrar log:', err));
    
    res.status(200).json(updatedDuesPayment);
  } catch (error) {
    console.error(`Erro ao atualizar pagamento de quota ${req.params.id}:`, error);
    res.status(500).json({ error: 'Erro ao atualizar pagamento de quota', details: error.message });
  }
};

// Excluir um pagamento de quota
exports.deleteDuesPayment = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se o pagamento existe
    const existingDuesPayment = await DuesPaymentModel.findById(id);
    if (!existingDuesPayment) {
      return res.status(404).json({ error: 'Pagamento de quota não encontrado' });
    }
    
    // Excluir o pagamento
    await DuesPaymentModel.delete(id);
    
    // Registrar atividade de exclusão
    const user = req.user || {};
    activityLogService.log({
      userId: user.id,
      username: user.email || user.username || 'anônimo',
      action: 'DELETE',
      entityType: 'DUES_PAYMENT',
      entityId: id,
      details: {
        memberId: existingDuesPayment.member_id,
        year: existingDuesPayment.year
      },
      ipAddress: req.ip || req.connection?.remoteAddress || 'unknown'
    }).catch(err => console.error('Erro ao registrar log:', err));
    
    res.status(200).json({ message: 'Pagamento de quota excluído com sucesso' });
  } catch (error) {
    console.error(`Erro ao excluir pagamento de quota ${req.params.id}:`, error);
    res.status(500).json({ error: 'Erro ao excluir pagamento de quota', details: error.message });
  }
};
