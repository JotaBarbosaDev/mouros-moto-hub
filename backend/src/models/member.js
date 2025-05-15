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
  // Adaptar campos entre formatos de frontend e backend
  const adaptedData = {};
  
  // Mapeamento direto
  if (memberData.name !== undefined) adaptedData.name = memberData.name;
  if (memberData.email !== undefined) adaptedData.email = memberData.email;
  
  // Garantir que campos obrigatórios não sejam nulos
  console.log('phoneMain recebido:', memberData.phoneMain);
  
  // Garantir que member_number seja válido (nunca nulo)
  // Usando um formato padronizado: ANO-TIMESTAMP para garantir exclusividade
  const currentYear = new Date().getFullYear();
  const uniqueSuffix = String(Date.now()).substring(8);
  adaptedData.member_number = memberData.memberNumber || memberData.member_number || 
    `${currentYear}-${uniqueSuffix}`;
  
  if (memberData.isAdmin !== undefined) adaptedData.is_admin = memberData.isAdmin;
  if (memberData.isActive !== undefined) adaptedData.is_active = memberData.isActive;
  
  // Campos de telefone
  if (memberData.phone !== undefined) adaptedData.phone = memberData.phone;
  if (memberData.phoneMain !== undefined) adaptedData.phone_main = memberData.phoneMain;
  // Garantir que phone_main nunca seja nulo (é um requisito do banco de dados)
  if (adaptedData.phone_main === undefined) {
    adaptedData.phone_main = memberData.phone || 'Não informado';
    console.log('Definindo phone_main padrão:', adaptedData.phone_main);
  }
  
  if (memberData.phoneAlternative !== undefined) adaptedData.phone_alternative = memberData.phoneAlternative;
  
  // Campos de datas
  if (memberData.birthdate !== undefined) adaptedData.birthdate = memberData.birthdate;
  if (memberData.joinDate !== undefined) adaptedData.member_since = memberData.joinDate;
  
  // Campos de tipo
  if (memberData.memberType !== undefined) adaptedData.member_type = memberData.memberType;
  if (memberData.honoraryMember !== undefined) adaptedData.honorary_member = memberData.honoraryMember;
  if (memberData.bloodType !== undefined) adaptedData.blood_type = memberData.bloodType;
  
  // Campos adicionais
  if (memberData.inWhatsappGroup !== undefined) adaptedData.in_whatsapp_group = memberData.inWhatsappGroup;
  if (memberData.receivedMemberKit !== undefined) adaptedData.received_member_kit = memberData.receivedMemberKit;
  if (memberData.username !== undefined) adaptedData.username = memberData.username;
  if (memberData.legacyMember !== undefined) adaptedData.legacy_member = memberData.legacyMember;
  if (memberData.registrationFeePaid !== undefined) adaptedData.registration_fee_paid = memberData.registrationFeePaid;
  if (memberData.registrationFeeExempt !== undefined) adaptedData.registration_fee_exempt = memberData.registrationFeeExempt;
  if (memberData.nickname !== undefined) adaptedData.nickname = memberData.nickname;
  if (memberData.photoUrl !== undefined) adaptedData.photo_url = memberData.photoUrl;
  
  // Logs para debug
  console.log(`Criando membro: ${memberData.name} (${adaptedData.member_number})`);
  console.log("Dados recebidos:", JSON.stringify({
    nome: memberData.name,
    email: memberData.email,
    memberNumber: memberData.memberNumber || memberData.member_number || 'não fornecido'
  }));
  
  const { data, error } = await supabaseAdmin
    .from('members')
    .insert(adaptedData)
    .select();
  
  if (error) throw error;
  
  return mapMemberResponse(data[0]);
};

const update = async (id, memberData) => {
  // Adaptar campos entre formatos de frontend e backend
  const adaptedData = {};
  
  // Mapeamento direto
  if (memberData.name !== undefined) adaptedData.name = memberData.name;
  if (memberData.email !== undefined) adaptedData.email = memberData.email;
  if (memberData.memberNumber !== undefined) adaptedData.member_number = memberData.memberNumber;
  if (memberData.isAdmin !== undefined) adaptedData.is_admin = memberData.isAdmin;
  if (memberData.isActive !== undefined) adaptedData.is_active = memberData.isActive;
  
  // Campos de telefone
  if (memberData.phone !== undefined) adaptedData.phone = memberData.phone;
  if (memberData.phoneMain !== undefined) adaptedData.phone_main = memberData.phoneMain;
  if (memberData.phoneAlternative !== undefined) adaptedData.phone_alternative = memberData.phoneAlternative;
  
  // Campos de datas
  if (memberData.birthdate !== undefined) adaptedData.birthdate = memberData.birthdate;
  if (memberData.joinDate !== undefined) adaptedData.member_since = memberData.joinDate;
  
  // Campos de tipo
  if (memberData.memberType !== undefined) adaptedData.member_type = memberData.memberType;
  if (memberData.honoraryMember !== undefined) adaptedData.honorary_member = memberData.honoraryMember;
  if (memberData.bloodType !== undefined) adaptedData.blood_type = memberData.bloodType;
  
  // Campos adicionais
  if (memberData.inWhatsappGroup !== undefined) adaptedData.in_whatsapp_group = memberData.inWhatsappGroup;
  if (memberData.receivedMemberKit !== undefined) adaptedData.received_member_kit = memberData.receivedMemberKit;
  if (memberData.username !== undefined) adaptedData.username = memberData.username;
  if (memberData.legacyMember !== undefined) adaptedData.legacy_member = memberData.legacyMember;
  if (memberData.registrationFeePaid !== undefined) adaptedData.registration_fee_paid = memberData.registrationFeePaid;
  if (memberData.registrationFeeExempt !== undefined) adaptedData.registration_fee_exempt = memberData.registrationFeeExempt;
  if (memberData.nickname !== undefined) adaptedData.nickname = memberData.nickname;
  if (memberData.photoUrl !== undefined) adaptedData.photo_url = memberData.photoUrl;
  
  // Logs para debug
  console.log("Dados recebidos para atualização de membro:", memberData);
  console.log("Dados adaptados para salvar no banco:", adaptedData);
  
  const { data, error } = await supabaseAdmin
    .from('members')
    .update(adaptedData)
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
