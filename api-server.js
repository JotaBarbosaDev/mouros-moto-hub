// Arquivo API de exemplo para consulta de membros
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config();

// Configurações do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Variáveis de ambiente do Supabase não configuradas');
  process.exit(1);
}

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Criar aplicação Express
const app = express();
app.use(cors());
app.use(express.json());

// Rota para buscar membros simples
app.get('/api/members', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .limit(10);
      
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rota para buscar membros estendidos (com relações)
app.get('/api/members-extended', async (req, res) => {
  try {
    // Buscar membros
    const { data: members, error: membersError } = await supabase
      .from('members')
      .select('*')
      .limit(5);
      
    if (membersError) throw membersError;
    
    if (!members || members.length === 0) {
      return res.json([]);
    }
    
    // Para cada membro, buscar dados relacionados
    const membersWithDetails = await Promise.all(members.map(async (member) => {
      // Buscar veículos
      const { data: vehicles } = await supabase
        .from('vehicles')
        .select('*')
        .eq('member_id', member.id);
        
      // Buscar pagamentos de cotas
      const { data: duesPayments } = await supabase
        .from('dues_payments')
        .select('*')
        .eq('member_id', member.id);
        
      // Buscar endereço
      const { data: addresses } = await supabase
        .from('addresses')
        .select('*')
        .eq('member_id', member.id);
        
      // Montar objeto MemberExtended
      return {
        id: member.id,
        name: member.name,
        memberNumber: member.member_number,
        isAdmin: member.is_admin,
        isActive: member.is_active,
        email: member.email,
        phoneMain: member.phone_main,
        phoneAlternative: member.phone_alternative,
        nickname: member.nickname,
        photoUrl: member.photo_url,
        joinDate: member.join_date,
        memberType: member.member_type,
        honoraryMember: member.honorary_member,
        address: addresses && addresses.length > 0 ? {
          street: addresses[0].street || '',
          number: addresses[0].number || '',
          postalCode: addresses[0].postal_code || '',
          city: addresses[0].city || '',
          district: addresses[0].district || '',
          country: addresses[0].country || ''
        } : {
          street: '',
          number: '',
          postalCode: '',
          city: '',
          district: '',
          country: ''
        },
        bloodType: member.blood_type,
        legacyMember: member.legacy_member || false,
        registrationFeePaid: member.registration_fee_paid || false,
        registrationFeeExempt: member.registration_fee_exempt || false,
        inWhatsAppGroup: member.in_whatsapp_group || false,
        receivedMemberKit: member.received_member_kit || false,
        username: member.username || member.email?.split('@')[0] || '',
        vehicles: vehicles ? vehicles.map(v => ({
          id: v.id,
          brand: v.brand,
          model: v.model,
          type: v.type,
          displacement: v.displacement,
          nickname: v.nickname || null,
          photoUrl: v.photo_url || null
        })) : [],
        duesPayments: duesPayments ? duesPayments.map(p => ({
          id: p.id,
          year: p.year,
          paid: p.paid,
          exempt: p.exempt,
          paymentDate: p.payment_date
        })) : []
      };
    }));
    
    res.json(membersWithDetails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`API disponível em http://localhost:${PORT}/api/members`);
  console.log(`API estendida disponível em http://localhost:${PORT}/api/members-extended`);
});
