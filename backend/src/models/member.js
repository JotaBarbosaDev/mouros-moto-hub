// Modelo para membros
const { supabaseAdmin } = require('../config/supabase');

// Enums
const MemberType = {
  FUNDADOR: 'FUNDADOR',
  EFETIVO: 'EFETIVO',
  SIMPATIZANTE: 'SIMPATIZANTE',
  HONORARIO: 'HONORÁRIO',
  NOVO: 'NOVO'
};

const BloodType = {
  A_POSITIVE: 'A+',
  A_NEGATIVE: 'A-',
  B_POSITIVE: 'B+',
  B_NEGATIVE: 'B-',
  AB_POSITIVE: 'AB+',
  AB_NEGATIVE: 'AB-',
  O_POSITIVE: 'O+',
  O_NEGATIVE: 'O-'
};

// Função para mapear resposta do banco para formato padronizado
const mapMemberResponse = (member) => {
  if (!member) return null;
  
  // Cria variável para username, tentando diferentes abordagens
  let username = '';
  if (member.username) {
    username = String(member.username);
  } else if (member.email) {
    username = member.email.split('@')[0];
  }
  
  return {
    id: member.id,
    name: member.name,
    memberNumber: member.member_number,
    isAdmin: member.is_admin || false,
    isActive: member.is_active || false,
    email: member.email,
    phone: member.phone || '',
    birthdate: member.birthdate || null,
    address: {
      street: member.street || '',
      city: member.city || '',
      state: member.state || '',
      postalCode: member.postal_code || ''
    },
    joinDate: member.member_since || null,
    memberType: member.member_type || MemberType.NOVO,
    isHonoraryMember: member.honorary_member || false,
    bloodType: member.blood_type || null,
    inWhatsappGroup: member.in_whatsapp_group || false,
    receivedMemberKit: member.received_member_kit || false,
    username: username,
    isLegacyMember: member.legacy_member || false,
    registrationFeePaid: member.registration_fee_paid || false,
    registrationFeeExempt: member.registration_fee_exempt || false
  };
};

// Métodos do modelo
const findAll = async () => {
  const { data, error } = await supabaseAdmin
    .from('members')
    .select('*');
  
  if (error) throw error;
  
  return data.map(member => mapMemberResponse(member));
};

const findById = async (id) => {
  const { data, error } = await supabaseAdmin
    .from('members')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  
  return mapMemberResponse(data);
};

const create = async (memberData) => {
  const { data, error } = await supabaseAdmin
    .from('members')
    .insert(memberData)
    .select();
  
  if (error) throw error;
  
  return mapMemberResponse(data[0]);
};

const update = async (id, memberData) => {
  const { data, error } = await supabaseAdmin
    .from('members')
    .update(memberData)
    .eq('id', id)
    .select();
  
  if (error) throw error;
  
  return mapMemberResponse(data[0]);
};

const remove = async (id) => {
  const { error } = await supabaseAdmin
    .from('members')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  
  return true;
};

// Schema de validação
const schema = {
  name: { type: 'string', required: true },
  email: { type: 'string', required: true },
  phone: { type: 'string' },
  birthdate: { type: 'string', format: 'date' },
  member_number: { type: 'number' },
  is_admin: { type: 'boolean', default: false },
  is_active: { type: 'boolean', default: true },
  member_since: { type: 'string', format: 'date' },
  member_type: { type: 'string', enum: Object.values(MemberType), default: MemberType.NOVO },
  honorary_member: { type: 'boolean', default: false },
  blood_type: { type: 'string', enum: Object.values(BloodType) },
  in_whatsapp_group: { type: 'boolean', default: false },
  received_member_kit: { type: 'boolean', default: false },
  username: { type: 'string' },
  legacy_member: { type: 'boolean', default: false },
  registration_fee_paid: { type: 'boolean', default: false },
  registration_fee_exempt: { type: 'boolean', default: false }
};

// Exportar módulos para uso em outros arquivos
module.exports = {
  MemberType,
  BloodType,
  mapMemberResponse,
  findAll,
  findById,
  create,
  update,
  remove,
  schema
};
