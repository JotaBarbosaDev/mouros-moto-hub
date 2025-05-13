// Para compatibilidade com o tipo de módulo "module" definido no package.json
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yaml';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0'; // Usando 0.0.0.0 em vez de localhost para resolver problemas de firewall

// Ler o arquivo YAML
let swaggerDocument;
try {
  const swaggerFile = fs.readFileSync(path.join(__dirname, 'swagger.yaml'), 'utf8');
  swaggerDocument = YAML.parse(swaggerFile);
} catch (error) {
  console.error('Erro ao ler ou analisar o arquivo swagger.yaml:', error);
  process.exit(1);
}

// Configurar rota para o Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Middleware para fazer proxy para o Supabase
app.use(express.json());

// Configurar CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
    return res.status(200).json({});
  }
  next();
});

// Função auxiliar para criar headers do Supabase
const getSupabaseHeaders = () => {
  const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
  return {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };
};

// Endpoint para testar as credenciais
app.get('/test-supabase', (req, res) => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({
      error: "Configuração de ambiente incompleta",
      message: "As variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY devem estar definidas no arquivo .env"
    });
  }
  
  res.json({
    message: "Configuração do Supabase OK",
    url: supabaseUrl,
    key_length: supabaseKey.length,
    key_preview: `${supabaseKey.substring(0, 10)}...${supabaseKey.substring(supabaseKey.length - 10)}`
  });
});

// === API DE MEMBROS - ENDPOINTS CRUD COMPLETOS ===

// 1. GET - Listar todos os membros
app.get('/v1/members', async (req, res) => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const headers = getSupabaseHeaders();
  
  try {
    console.log('Acessando endpoint GET /v1/members');
    const response = await fetch(`${supabaseUrl}/rest/v1/members?select=*`, {
      method: 'GET',
      headers
    });
    
    if (response.ok) {
      const data = await response.json();
      res.json(data);
    } else {
      const errorText = await response.text();
      res.status(response.status).json({
        error: "Erro ao consultar membros",
        details: errorText
      });
    }
  } catch (error) {
    res.status(500).json({
      error: "Erro interno ao consultar membros",
      details: error.message
    });
  }
});

// 2. GET - Buscar membro por ID
app.get('/v1/members/:id', async (req, res) => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const headers = getSupabaseHeaders();
  const memberId = req.params.id;
  
  try {
    console.log(`Buscando membro com ID: ${memberId}`);
    const response = await fetch(`${supabaseUrl}/rest/v1/members?id=eq.${memberId}&select=*`, {
      method: 'GET',
      headers
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.length === 0) {
        return res.status(404).json({
          error: "Membro não encontrado",
          details: `Não existe membro com o ID ${memberId}`
        });
      }
      res.json(data[0]);
    } else {
      const errorText = await response.text();
      res.status(response.status).json({
        error: "Erro ao buscar membro",
        details: errorText
      });
    }
  } catch (error) {
    res.status(500).json({
      error: "Erro interno ao buscar membro",
      details: error.message
    });
  }
});

// 3. POST - Criar um novo membro
app.post('/v1/members', async (req, res) => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const headers = getSupabaseHeaders();
  const memberData = req.body;
  
  // Validação simples
  if (!memberData.name || !memberData.email) {
    return res.status(400).json({
      error: "Dados incompletos",
      details: "Nome e email são obrigatórios"
    });
  }
  
  try {
    console.log('Criando novo membro:', memberData.name);
    const response = await fetch(`${supabaseUrl}/rest/v1/members`, {
      method: 'POST',
      headers,
      body: JSON.stringify(memberData)
    });
    
    if (response.ok) {
      const data = await response.json();
      res.status(201).json(data[0]);
    } else {
      const errorText = await response.text();
      res.status(response.status).json({
        error: "Erro ao criar membro",
        details: errorText
      });
    }
  } catch (error) {
    res.status(500).json({
      error: "Erro interno ao criar membro",
      details: error.message
    });
  }
});

// 4. PUT - Atualizar um membro existente
app.put('/v1/members/:id', async (req, res) => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const headers = getSupabaseHeaders();
  const memberId = req.params.id;
  const memberData = req.body;
  
  try {
    console.log(`Atualizando membro com ID: ${memberId}`);
    const response = await fetch(`${supabaseUrl}/rest/v1/members?id=eq.${memberId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(memberData)
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.length === 0) {
        return res.json({
          message: "Membro atualizado",
          details: "Nenhum dado retornado pelo Supabase"
        });
      }
      res.json(data[0]);
    } else {
      const errorText = await response.text();
      res.status(response.status).json({
        error: "Erro ao atualizar membro",
        details: errorText
      });
    }
  } catch (error) {
    res.status(500).json({
      error: "Erro interno ao atualizar membro",
      details: error.message
    });
  }
});

// 5. PATCH - Atualizar parcialmente um membro
app.patch('/v1/members/:id', async (req, res) => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const headers = getSupabaseHeaders();
  const memberId = req.params.id;
  const memberData = req.body;
  
  try {
    console.log(`Atualizando parcialmente membro com ID: ${memberId}`);
    const response = await fetch(`${supabaseUrl}/rest/v1/members?id=eq.${memberId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(memberData)
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.length === 0) {
        return res.json({
          message: "Membro atualizado",
          details: "Nenhum dado retornado pelo Supabase"
        });
      }
      res.json(data[0]);
    } else {
      const errorText = await response.text();
      res.status(response.status).json({
        error: "Erro ao atualizar parcialmente membro",
        details: errorText
      });
    }
  } catch (error) {
    res.status(500).json({
      error: "Erro interno ao atualizar parcialmente membro",
      details: error.message
    });
  }
});

// 6. DELETE - Remover um membro
app.delete('/v1/members/:id', async (req, res) => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const headers = getSupabaseHeaders();
  const memberId = req.params.id;
  
  try {
    console.log(`Removendo membro com ID: ${memberId}`);
    const response = await fetch(`${supabaseUrl}/rest/v1/members?id=eq.${memberId}`, {
      method: 'DELETE',
      headers
    });
    
    if (response.ok) {
      res.json({
        success: true,
        message: `Membro com ID ${memberId} removido com sucesso`
      });
    } else {
      const errorText = await response.text();
      res.status(response.status).json({
        error: "Erro ao remover membro",
        details: errorText
      });
    }
  } catch (error) {
    res.status(500).json({
      error: "Erro interno ao remover membro",
      details: error.message
    });
  }
});

// === ROTAS ALTERNATIVAS PARA COMPATIBILIDADE ===

// Rota alternativa para a API de membros (para compatibilidade com os clientes)
app.get('/api/members', async (req, res) => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const headers = getSupabaseHeaders();
  
  try {
    console.log('Acessando endpoint /api/members');
    const response = await fetch(`${supabaseUrl}/rest/v1/members?select=*`, {
      method: 'GET',
      headers
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`Dados obtidos: ${data.length} membros`);
      res.json(data);
    } else {
      const errorText = await response.text();
      console.error(`Erro ao consultar API: ${errorText}`);
      res.status(response.status).json({
        error: "Erro ao consultar membros",
        details: errorText
      });
    }
  } catch (error) {
    console.error(`Exceção: ${error.message}`);
    res.status(500).json({
      error: "Erro interno ao consultar membros",
      details: error.message
    });
  }
});

// Rota alternativa para obter membro por ID
app.get('/api/members/:id', async (req, res) => {
  const memberId = req.params.id;
  
  try {
    const result = await fetch(`http://localhost:${PORT}/v1/members/${memberId}`);
    const data = await result.json();
    res.status(result.status).json(data);
  } catch (error) {
    res.status(500).json({
      error: "Erro ao encaminhar requisição",
      details: error.message
    });
  }
});

// Rota alternativa para criar um membro
app.post('/api/members', async (req, res) => {
  try {
    const result = await fetch(`http://localhost:${PORT}/v1/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await result.json();
    res.status(result.status).json(data);
  } catch (error) {
    res.status(500).json({
      error: "Erro ao encaminhar requisição",
      details: error.message
    });
  }
});

// Rota alternativa para atualizar um membro
app.put('/api/members/:id', async (req, res) => {
  const memberId = req.params.id;
  
  try {
    const result = await fetch(`http://localhost:${PORT}/v1/members/${memberId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await result.json();
    res.status(result.status).json(data);
  } catch (error) {
    res.status(500).json({
      error: "Erro ao encaminhar requisição",
      details: error.message
    });
  }
});

// Rota alternativa para atualizar parcialmente um membro
app.patch('/api/members/:id', async (req, res) => {
  const memberId = req.params.id;
  
  try {
    const result = await fetch(`http://localhost:${PORT}/v1/members/${memberId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await result.json();
    res.status(result.status).json(data);
  } catch (error) {
    res.status(500).json({
      error: "Erro ao encaminhar requisição",
      details: error.message
    });
  }
});

// Rota alternativa para remover um membro
app.delete('/api/members/:id', async (req, res) => {
  const memberId = req.params.id;
  
  try {
    const result = await fetch(`http://localhost:${PORT}/v1/members/${memberId}`, {
      method: 'DELETE'
    });
    const data = await result.json();
    res.status(result.status).json(data);
  } catch (error) {
    res.status(500).json({
      error: "Erro ao encaminhar requisição",
      details: error.message
    });
  }
});

// Rota de teste simples
app.get('/api/ping', (req, res) => {
  res.json({ 
    status: "ok",
    message: "API está funcionando!",
    timestamp: new Date().toISOString() 
  });
});

// Rota principal
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

// Iniciar o servidor
app.listen(PORT, HOST, () => {
  console.log(`Servidor Swagger rodando em http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}/api-docs`);
  console.log(`Documentação da API Mouros Moto Hub agora disponível!`);
  console.log(`Para acessar externamente: http://${HOST}:${PORT}/api-docs`);
  console.log(`Para acessar o teste de API: http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}/test-members-api.html`);
  
  // Mostrar informações sobre a configuração
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
  if (supabaseUrl && supabaseKey) {
    console.log(`Supabase URL: ${supabaseUrl}`);
    console.log(`Supabase Key presente: ${supabaseKey.substring(0, 10)}...`);
  } else {
    console.log('AVISO: Variáveis de ambiente do Supabase não configuradas');
  }
});
