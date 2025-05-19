// Arquivo para testar a criação de eventos
const fetch = require('node-fetch');
const fs = require('fs');

async function getToken() {
  try {
    // Tente ler o token do arquivo local se existir
    if (fs.existsSync('./token.txt')) {
      const token = fs.readFileSync('./token.txt', 'utf8');
      console.log('Token carregado do arquivo local');
      return token.trim();
    }
  } catch (error) {
    console.error('Erro ao ler token do arquivo:', error);
  }
  
  console.error('Token não encontrado. Crie um arquivo token.txt com seu token JWT');
  process.exit(1);
}

async function createEvent() {
  const token = await getToken();
  const apiUrl = 'http://localhost:3001/api/events';
  
  // Payload de teste usando o formato do frontend
  const payload = {
    title: "Evento de Teste",
    description: "Descrição do evento de teste",
    location: "Local de teste",
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 86400000).toISOString(), // Um dia depois
    type: "encontro",
    image_url: "https://example.com/image.jpg",
    is_public: true,
    status: "scheduled",
    creator_id: "1",
    is_featured: false,
    registration_open: true,
    max_participants: 50
  };
  
  console.log('Enviando payload:', JSON.stringify(payload, null, 2));
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    
    const responseData = await response.text();
    console.log('Status da resposta:', response.status);
    try {
      const jsonData = JSON.parse(responseData);
      console.log('Resposta da API:', JSON.stringify(jsonData, null, 2));
    } catch (e) {
      console.log('Resposta não-JSON:', responseData);
    }
    
  } catch (error) {
    console.error('Erro ao criar evento:', error);
  }
}

createEvent();
