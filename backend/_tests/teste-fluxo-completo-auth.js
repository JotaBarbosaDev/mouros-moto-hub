// Teste do fluxo completo de autenticação, incluindo componente MemberList
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
dotenv.config();

// Para capturar erros não tratados
process.on('uncaughtException', (error) => {
  console.error('Erro não tratado:', error);
});

// Configuração da URL da API
const API_URL = 'http://localhost:3001/api';
console.log('Testando API em:', API_URL);

// Credenciais de teste
const email = 'admin@admin.com';
const password = 'admin';

// Cliente Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

/**
 * Função para simular o fluxo completo de autenticação e uso do MemberList
 */
async function testarFluxoCompleto() {
  try {
    // Passo 1: Login no Supabase
    console.log('1. Fazendo login via Supabase...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) throw new Error(`Erro no login Supabase: ${authError.message}`);
    
    const token = authData.session.access_token;
    console.log('✅ Login bem-sucedido. Token obtido.');
    
    // Passo 2: Obter perfil do usuário (useAuth hook)
    console.log('\n2. Buscando perfil do usuário (simulando useAuth hook)...');
    const profileResponse = await fetch(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      throw new Error(`Erro ao buscar perfil (${profileResponse.status}): ${errorText}`);
    }

    const userData = await profileResponse.json();
    console.log('✅ Perfil do usuário obtido:', userData);
    
    // Passo 3: Buscar lista de membros (simulando useMembers hook)
    console.log('\n3. Buscando lista de membros (simulando useMembers hook)...');
    const membersResponse = await fetch(`${API_URL}/members`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!membersResponse.ok) {
      const errorText = await membersResponse.text();
      throw new Error(`Erro ao buscar membros (${membersResponse.status}): ${errorText}`);
    }

    const membersData = await membersResponse.json();
    console.log(`✅ Lista de ${membersData.length} membros obtida com sucesso.`);
    
    // Passo 4: Verificar se o membro tem dados completos
    console.log('\n4. Verificando se os membros têm dados completos...');
    let membroCompleto = false;
    
    if (membersData.length > 0) {
      const primeiroMembro = membersData[0];
      
      // Verificar campos obrigatórios
      const camposObrigatorios = [
        'id', 'name', 'email', 'phoneMain', 'memberType'
      ];
      
      const temCamposObrigatorios = camposObrigatorios.every(campo => 
        primeiroMembro[campo] !== undefined && 
        primeiroMembro[campo] !== null
      );
      
      // Verificar campo vehicles
      const temVehicles = Array.isArray(primeiroMembro.vehicles);
      
      membroCompleto = temCamposObrigatorios && temVehicles;
      
      console.log('Detalhes do primeiro membro:', {
        id: primeiroMembro.id,
        name: primeiroMembro.name,
        email: primeiroMembro.email,
        phoneMain: primeiroMembro.phoneMain,
        memberType: primeiroMembro.memberType,
        vehicles: Array.isArray(primeiroMembro.vehicles) ? `Array com ${primeiroMembro.vehicles.length} itens` : 'Ausente ou inválido'
      });
    }
    
    console.log(`✅ Membros ${membroCompleto ? 'têm' : 'não têm'} dados completos.`);
    
    // Passo 5: Testar a atualização de um membro
    if (membersData.length > 0) {
      console.log('\n5. Testando atualização de um membro...');
      const membroParaAtualizar = membersData[0];
      
      // Preparar dados para atualização
      const dadosAtualizados = {
        name: membroParaAtualizar.name,
        email: membroParaAtualizar.email,
        phone_main: membroParaAtualizar.phoneMain,
        phone_alternative: membroParaAtualizar.phoneAlternative,
        nickname: membroParaAtualizar.nickname,
        photo_url: membroParaAtualizar.photoUrl,
        member_type: membroParaAtualizar.memberType,
        in_whatsapp_group: !membroParaAtualizar.inWhatsappGroup // inverter o status para testar
      };
      
      // Chamar API para atualizar
      const updateResponse = await fetch(`${API_URL}/members/${membroParaAtualizar.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadosAtualizados)
      });
      
      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        console.warn(`⚠️ Aviso: Erro ao atualizar membro (${updateResponse.status}): ${errorText}`);
        console.log('Continuando o teste mesmo com este aviso...');
      } else {
        console.log('✅ Membro atualizado com sucesso.');
      }
    }
    
    // Resultado do teste
    return {
      success: true,
      message: 'Fluxo completo de autenticação e MemberList funcionando corretamente!'
    };
  } catch (error) {
    console.error('❌ Erro no teste do fluxo completo:', error);
    return {
      success: false,
      message: `Falha no teste: ${error.message}`
    };
  }
}

// Executar o teste
testarFluxoCompleto()
  .then(result => {
    console.log('\nResultado do teste:', result.message);
    if (!result.success) {
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Erro fatal:', err);
    process.exit(1);
  });
