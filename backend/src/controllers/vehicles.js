// Controller para gerenciamento de veículos
const VehicleModel = require('../models/vehicle');

// Obter todos os veículos
exports.getAllVehicles = async (req, res) => {
  try {
    const vehicles = await VehicleModel.findAll();
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
    
    // Normalizar os dados do veículo
    const vehicleData = {
      ...req.body,
      // Garantir que temos displacement/engine_size independente de como foi enviado
      displacement: req.body.displacement || req.body.engine_size,
      engine_size: req.body.engine_size || req.body.displacement
    };

    const newVehicle = await VehicleModel.create(vehicleData);
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
    
    await VehicleModel.remove(id);
    res.status(200).json({ message: 'Veículo removido com sucesso' });
  } catch (error) {
    console.error(`Erro ao excluir veículo com ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Erro ao excluir veículo', details: error.message });
  }
};
