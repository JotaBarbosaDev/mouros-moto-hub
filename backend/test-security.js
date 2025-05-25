#!/usr/bin/env node

/**
 * Script de teste para verificar o sistema de auditoria e segurança
 * Testa logs de autenticação, rate limiting e auditoria administrativa
 */

const axios = require('axios');
const colors = require('colors');

const BASE_URL = 'http://localhost:3001/api';

// Configurar timeout global
axios.defaults.timeout = 10000;

/**
 * Utilitário para pausar execução
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Logger colorido para testes
 */
const logger = {
  info: (msg) => console.log(`ℹ️  ${msg}`.blue),
  success: (msg) => console.log(`✅ ${msg}`.green),
  error: (msg) => console.log(`❌ ${msg}`.red),
  warning: (msg) => console.log(`⚠️  ${msg}`.yellow),
  separator: () => console.log('─'.repeat(80).gray)
};

/**
 * Teste 1: Verificar logs de tentativas de acesso não autorizado
 */
async function testUnauthorizedAccess() {
  logger.separator();
  logger.info('TESTE 1: Tentativas de acesso não autorizado');
  
  try {
    // Tentativa de acesso à área admin sem token
    await axios.get(`${BASE_URL}/admin/stats`);
    logger.error('Falha: Deveria ter negado acesso');
  } catch (error) {
    if (error.response && error.response.status === 401) {
      logger.success('✓ Acesso negado corretamente (401)');
    } else {
      logger.error(`Erro inesperado: ${error.message}`);
    }
  }

  try {
    // Tentativa com token inválido
    await axios.get(`${BASE_URL}/admin/stats`, {
      headers: { Authorization: 'Bearer token_falso_123' }
    });
    logger.error('Falha: Deveria ter negado acesso com token inválido');
  } catch (error) {
    if (error.response && error.response.status === 401) {
      logger.success('✓ Token inválido rejeitado corretamente (401)');
    } else {
      logger.error(`Erro inesperado: ${error.message}`);
    }
  }
}

/**
 * Teste 2: Verificar rate limiting
 */
async function testRateLimiting() {
  logger.separator();
  logger.info('TESTE 2: Rate Limiting');
  
  let blockedRequests = 0;
  const totalRequests = 25; // Exceder limite geral de 20/15min
  
  logger.info(`Enviando ${totalRequests} requisições para testar rate limiting...`);
  
  for (let i = 1; i <= totalRequests; i++) {
    try {
      const response = await axios.get(`${BASE_URL}/vehicles`);
      if (i <= 20) {
        logger.info(`Requisição ${i}: OK (${response.status})`);
      }
    } catch (error) {
      if (error.response && error.response.status === 429) {
        blockedRequests++;
        if (blockedRequests === 1) {
          logger.warning(`Requisição ${i}: Rate limited (429) - PRIMEIRO BLOQUEIO`);
        }
      } else {
        logger.error(`Requisição ${i}: Erro ${error.message}`);
      }
    }
    
    // Pequena pausa entre requisições
    await sleep(100);
  }
  
  if (blockedRequests > 0) {
    logger.success(`✓ Rate limiting funcionando: ${blockedRequests} requisições bloqueadas`);
  } else {
    logger.warning('⚠️  Rate limiting pode não estar funcionando como esperado');
  }
}

/**
 * Teste 3: Autenticação e logs de usuário válido
 */
async function testAuthentication() {
  logger.separator();
  logger.info('TESTE 3: Autenticação de usuário');
  
  try {
    // Tentar fazer login com credenciais de teste
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@mouros.com',
      password: 'admin123'
    });
    
    if (loginResponse.data && loginResponse.data.token) {
      logger.success('✓ Login realizado com sucesso');
      logger.info(`Token obtido: ${loginResponse.data.token.substring(0, 20)}...`);
      return loginResponse.data.token;
    } else {
      logger.warning('⚠️  Login retornou resposta inesperada');
      return null;
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      logger.warning('⚠️  Credenciais de teste não encontradas (esperado em primeiro teste)');
    } else {
      logger.error(`Erro no login: ${error.message}`);
    }
    return null;
  }
}

/**
 * Teste 4: Logs de ações administrativas (se tiver token válido)
 */
async function testAdminActions(token) {
  if (!token) {
    logger.warning('⚠️  Pulando teste de ações admin (sem token válido)');
    return;
  }
  
  logger.separator();
  logger.info('TESTE 4: Logs de ações administrativas');
  
  const headers = { Authorization: `Bearer ${token}` };
  
  try {
    // Testar acesso às estatísticas (deve gerar log VIEW_STATS)
    const statsResponse = await axios.get(`${BASE_URL}/admin/stats`, { headers });
    logger.success('✓ Acesso às estatísticas admin realizado');
  } catch (error) {
    logger.error(`Erro ao acessar stats: ${error.message}`);
  }
  
  try {
    // Testar acesso aos logs (deve gerar log VIEW_SYSTEM_LOGS)
    const logsResponse = await axios.get(`${BASE_URL}/admin/logs`, { headers });
    logger.success('✓ Acesso aos logs do sistema realizado');
  } catch (error) {
    logger.error(`Erro ao acessar logs: ${error.message}`);
  }
}

/**
 * Teste 5: Verificar se logs estão sendo registrados
 */
async function testAuditLogs(token) {
  logger.separator();
  logger.info('TESTE 5: Verificação dos logs de auditoria');
  
  if (!token) {
    logger.warning('⚠️  Sem token admin - tentando verificar logs publicamente');
    return;
  }
  
  try {
    const headers = { Authorization: `Bearer ${token}` };
    const response = await axios.get(`${BASE_URL}/admin/logs?type=audit&limit=10`, { headers });
    
    if (response.data && response.data.logs) {
      logger.success(`✓ Logs de auditoria encontrados: ${response.data.logs.length} registros`);
      
      // Mostrar alguns logs recentes
      response.data.logs.slice(0, 3).forEach((log, index) => {
        logger.info(`  Log ${index + 1}: ${log.event} - ${log.user_id || 'Anônimo'} - ${log.timestamp}`);
      });
    } else {
      logger.warning('⚠️  Nenhum log de auditoria encontrado');
    }
  } catch (error) {
    logger.error(`Erro ao verificar logs: ${error.message}`);
  }
}

/**
 * Função principal de execução dos testes
 */
async function runSecurityTests() {
  console.log('🔒 TESTE DE SISTEMA DE AUDITORIA E SEGURANÇA'.bold.yellow);
  console.log('═'.repeat(80).yellow);
  
  logger.info('Iniciando bateria de testes de segurança...');
  
  // Teste 1: Acesso não autorizado
  await testUnauthorizedAccess();
  await sleep(1000);
  
  // Teste 2: Rate limiting
  await testRateLimiting();
  await sleep(2000);
  
  // Teste 3: Autenticação
  const token = await testAuthentication();
  await sleep(1000);
  
  // Teste 4: Ações administrativas
  await testAdminActions(token);
  await sleep(1000);
  
  // Teste 5: Verificar logs
  await testAuditLogs(token);
  
  logger.separator();
  logger.success('🎉 Bateria de testes concluída!');
  logger.info('Verifique os logs no terminal do servidor para ver os registros de auditoria.');
  
  process.exit(0);
}

// Executar testes
if (require.main === module) {
  runSecurityTests().catch(error => {
    logger.error(`Erro fatal nos testes: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  runSecurityTests,
  testUnauthorizedAccess,
  testRateLimiting,
  testAuthentication,
  testAdminActions,
  testAuditLogs
};
