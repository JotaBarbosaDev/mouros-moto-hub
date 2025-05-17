// Controller para gerenciamento de veículos
const VehicleModel = require('../models/vehicle');
const activityLogService = require('../services/activity-log-service');
const { addEngineSize } = require('../utils/vehicle-patch');

// Obter todos os veículos
exports.getAllVehicles = async (req, res) => {
  try {
    const vehicles = await VehicleModel.findAll();
    
    // Registrar a atividade de visualização
    const user = req.user || {};
    activityLogService.log({
      userId: user.id,
      username: user.email || user.username || 'anônimo',
      action: 'VIEW',
      entityType: 'VEHICLE',
      entityId: null,
      details: { count: vehicles.length },
      ipAddress: req.ip || req.connection?.remoteAddress || 'unknown'
    }).catch(err => console.error('Erro ao registrar log:', err));
    
    res.status(200).json(vehicles);
  } catch (error) {
    console.error('Erro ao buscar veículos:', error);
    res.status(500).json({ error: 'Erro ao buscar veículos', details: error.message });
  }
};

// Obter um veículo específico pelo ID
exports.getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await VehicleModel.findById(id);
    
    if (!vehicle) {
      return res.status(404).json({ error: 'Veículo não encontrado' });
    }
    
    // Registrar atividade de visualização de veículo específico
    const user = req.user || {};
    activityLogService.log({
      userId: user.id,
      username: user.email || user.username || 'anônimo',
      action: 'VIEW',
      entityType: 'VEHICLE',
      entityId: id,
      details: { 
        vehicleInfo: `${vehicle.brand} ${vehicle.model} ${vehicle.year || ''}`,
        licensePlate: vehicle.license_plate || vehicle.licensePlate || 'N/A'
      },
      ipAddress: req.ip || req.connection?.remoteAddress || 'unknown'
    }).catch(err => console.error('Erro ao registrar log:', err));
    
    res.status(200).json(vehicle);
  } catch (error) {
    console.error(`Erro ao buscar veículo com ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Erro ao buscar veículo', details: error.message });
  }
};

// Obter veículos por ID do membro
exports.getVehiclesByMemberId = async (req, res) => {
  try {
    const { memberId } = req.params;
    const vehicles = await VehicleModel.findByMemberId(memberId);
    res.status(200).json(vehicles);
  } catch (error) {
    console.error(`Erro ao buscar veículos para o membro ${req.params.memberId}:`, error);
    res.status(500).json({ error: 'Erro ao buscar veículos do membro', details: error.message });
  }
};

// Criar um novo veículo
exports.createVehicle = async (req, res) => {
  try {
    // Log dos dados recebidos
    console.log('Dados de veículo recebidos:', req.body);
    
    // Validação básica
    if (!req.body.brand || !req.body.model) {
      return res.status(400).json({
        error: 'Dados incompletos',
        details: 'Marca e modelo são campos obrigatórios'
      });
    }
    
    // Garantir que o veículo está associado a um membro
    if (!req.body.member_id) {
      return res.status(400).json({
        error: 'Dados incompletos',
        details: 'ID do membro é obrigatório'
      });
    }
    
    // Verificar e garantir que a coluna engine_size existe
    try {
      await addEngineSize();
    } catch (err) {
      console.warn('Não foi possível verificar a coluna engine_size:', err);
      // Continua mesmo com erro, pois se a coluna já existir, não haverá problemas
    }
    
    // Normalizar os dados do veículo
    const vehicleData = {
      ...req.body,
      // Garantir que temos displacement/engine_size independente de como foi enviado
      displacement: req.body.displacement || req.body.engine_size,
      engine_size: req.body.engine_size || req.body.displacement
    };

    const newVehicle = await VehicleModel.create(vehicleData);
    
    // Registrar a atividade de criação de veículo
    const user = req.user || {};
    activityLogService.log({
      userId: user.id,
      username: user.email || user.username || 'anônimo',
      action: 'CREATE',
      entityType: 'VEHICLE',
      entityId: newVehicle.id,
      details: { 
        vehicleInfo: `${newVehicle.brand} ${newVehicle.model} ${newVehicle.year || ''}`,
        licensePlate: newVehicle.license_plate || newVehicle.licensePlate || 'N/A',
        memberId: newVehicle.member_id
      },
      ipAddress: req.ip || req.connection?.remoteAddress || 'unknown'
    }).catch(err => console.error('Erro ao registrar log:', err));
    
    res.status(201).json(newVehicle);
  } catch (error) {
    console.error('Erro ao criar veículo:', error);
    res.status(500).json({ error: 'Erro ao criar veículo', details: error.message });
  }
};

// Atualizar um veículo existente
exports.updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se o veículo existe
    const existingVehicle = await VehicleModel.findById(id);
    if (!existingVehicle) {
      return res.status(404).json({ error: 'Veículo não encontrado' });
    }
    
    const updatedVehicle = await VehicleModel.update(id, req.body);
    
    // Registrar a atividade de atualização de veículo
    const user = req.user || {};
    activityLogService.log({
      userId: user.id,
      username: user.email || user.username || 'anônimo',
      action: 'UPDATE',
      entityType: 'VEHICLE',
      entityId: id,
      details: { 
        vehicleInfo: `${updatedVehicle.brand} ${updatedVehicle.model} ${updatedVehicle.year || ''}`,
        licensePlate: updatedVehicle.license_plate || updatedVehicle.licensePlate || 'N/A',
        changedFields: Object.keys(req.body),
        previousState: {
          brand: existingVehicle.brand,
          model: existingVehicle.model,
          year: existingVehicle.year,
          licensePlate: existingVehicle.license_plate || existingVehicle.licensePlate
        }
      },
      ipAddress: req.ip || req.connection?.remoteAddress || 'unknown'
    }).catch(err => console.error('Erro ao registrar log:', err));
    
    res.status(200).json(updatedVehicle);
  } catch (error) {
    console.error(`Erro ao atualizar veículo com ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Erro ao atualizar veículo', details: error.message });
  }
};

// Excluir um veículo
exports.deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se o veículo existe
    const existingVehicle = await VehicleModel.findById(id);
    if (!existingVehicle) {
      return res.status(404).json({ error: 'Veículo não encontrado' });
    }
    
    // Registrar a atividade de exclusão de veículo
    const user = req.user || {};
    activityLogService.log({
      userId: user.id,
      username: user.email || user.username || 'anônimo',
      action: 'DELETE',
      entityType: 'VEHICLE',
      entityId: id,
      details: { 
        vehicleInfo: `${existingVehicle.brand} ${existingVehicle.model} ${existingVehicle.year || ''}`,
        licensePlate: existingVehicle.license_plate || existingVehicle.licensePlate || 'N/A',
        memberId: existingVehicle.member_id
      },
      ipAddress: req.ip || req.connection?.remoteAddress || 'unknown'
    }).catch(err => console.error('Erro ao registrar log:', err));
    
    await VehicleModel.remove(id);
    res.status(200).json({ message: 'Veículo removido com sucesso' });
  } catch (error) {
    console.error(`Erro ao excluir veículo com ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Erro ao excluir veículo', details: error.message });
  }
};
