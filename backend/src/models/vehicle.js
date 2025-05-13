// Modelo para veículos
const { supabaseAdmin } = require('../config/supabase');

// Enums para tipos de veículos
const VehicleType = {
  MOTORCYCLE: 'MOTORCYCLE',
  BUGGY: 'BUGGY',
  QUAD: 'QUAD',
  CAR: 'CAR',
  OTHER: 'OTHER'
};

// Função para mapear resposta do banco para formato padronizado
const mapVehicleResponse = (vehicle) => {
  if (!vehicle) return null;
  
  return {
    id: vehicle.id,
    memberId: vehicle.member_id,
    brand: vehicle.brand || '',
    model: vehicle.model || '',
    year: vehicle.year || null,
    licensePlate: vehicle.license_plate || '',
    type: vehicle.type || 'Mota',
    displacement: vehicle.displacement || vehicle.engine_size || 0,
    engineSize: vehicle.engine_size || vehicle.displacement || 0,
    nickname: vehicle.nickname || '',
    photoUrl: vehicle.photo_url || '',
    color: vehicle.color || '',
    createdAt: vehicle.created_at || null,
    updatedAt: vehicle.updated_at || null
  };
};

// Métodos do modelo
const findAll = async () => {
  const { data, error } = await supabaseAdmin
    .from('vehicles')
    .select(`
      *,
      member:member_id (
        id,
        name,
        member_number
      )
    `);
  
  if (error) throw error;
  
  return data.map(vehicle => {
    const vehicleData = mapVehicleResponse(vehicle);
    // Adicionar informações do membro se disponíveis
    if (vehicle.member) {
      vehicleData.owner = {
        id: vehicle.member.id,
        name: vehicle.member.name,
        memberNumber: vehicle.member.member_number
      };
    }
    return vehicleData;
  });
};

const findById = async (id) => {
  const { data, error } = await supabaseAdmin
    .from('vehicles')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  
  return mapVehicleResponse(data);
};

const findByMemberId = async (memberId) => {
  const { data, error } = await supabaseAdmin
    .from('vehicles')
    .select(`
      *,
      member:member_id (
        id,
        name,
        member_number
      )
    `)
    .eq('member_id', memberId);
  
  if (error) throw error;
  
  return data.map(vehicle => {
    const vehicleData = mapVehicleResponse(vehicle);
    // Adicionar informações do membro se disponíveis
    if (vehicle.member) {
      vehicleData.owner = {
        id: vehicle.member.id,
        name: vehicle.member.name,
        memberNumber: vehicle.member.member_number
      };
    }
    return vehicleData;
  });
};

const create = async (vehicleData) => {
  // Garantir que temos os campos corretos
  const dataToInsert = {
    ...vehicleData,
    // Se displacement foi fornecido, usar como engine_size também
    engine_size: vehicleData.engine_size || vehicleData.displacement,
    displacement: vehicleData.displacement || vehicleData.engine_size
  };
  
  const { data, error } = await supabaseAdmin
    .from('vehicles')
    .insert(dataToInsert)
    .select(`
      *,
      member:member_id (
        id,
        name,
        member_number
      )
    `);
  
  if (error) throw error;
  
  const vehicleResponse = mapVehicleResponse(data[0]);
  
  // Adicionar informações do membro se disponíveis
  if (data[0].member) {
    vehicleResponse.owner = {
      id: data[0].member.id,
      name: data[0].member.name,
      memberNumber: data[0].member.member_number
    };
  }
  
  return vehicleResponse;
};

const update = async (id, vehicleData) => {
  const { data, error } = await supabaseAdmin
    .from('vehicles')
    .update(vehicleData)
    .eq('id', id)
    .select();
  
  if (error) throw error;
  
  return mapVehicleResponse(data[0]);
};

const remove = async (id) => {
  const { error } = await supabaseAdmin
    .from('vehicles')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  
  return true;
};

// Schema de validação
const schema = {
  type: { type: 'string', enum: Object.values(VehicleType) },
  brand: { type: 'string', required: true },
  model: { type: 'string', required: true },
  year: { type: 'number' },
  license_plate: { type: 'string' },
  engine_size: { type: 'string' },
  nickname: { type: 'string' },
  photo_url: { type: 'string' },
  color: { type: 'string' }
};

// Exportar módulos para uso em outros arquivos
module.exports = {
  VehicleType,
  mapVehicleResponse,
  findAll,
  findById,
  findByMemberId,
  create,
  update,
  remove,
  schema
};
