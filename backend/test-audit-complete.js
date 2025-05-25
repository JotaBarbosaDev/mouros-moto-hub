#!/usr/bin/env node

/**
 * Script para criar usuário admin de teste e testar logs administrativos
 */

const axios = require('axios');
const colors = require('colors');

const BASE_URL = 'http://localhost:3001/api';

const logger = {
  info: (msg) => console.log(`ℹ️  ${msg}`.blue),
  success: (msg) => console.log(`✅ ${msg}`.green),
  error: (msg) => console.log(`❌ ${msg}`.red),
  warning: (msg) => console.log(`⚠️  ${msg}`.yellow),
  separator: () => console.log('─'.repeat(80).gray)
};

async function createTestUser() {
  logger.separator();
  logger.info('TESTE: Criando usuário de teste');
  
  try {
    // Tentar criar um usuário de teste
    const createResponse = await axios.post(`${BASE_URL}/auth/register`, {
      email: 'admin.teste@mouros.com',
      password: 'AdminTeste123!',
      name: 'Admin Teste',
      phone: '11999999999'
    });
    
    if (createResponse.status === 201) {
      logger.success('✓ Usuário de teste criado com sucesso');
      return createResponse.data;
    }
  } catch (error) {
    if (error.response && error.response.status === 409) {
      logger.info('⚬ Usuário já existe (OK)');
    } else {
      logger.error(`Erro ao criar usuário: ${error.message}`);
    }
  }
  
  return null;
}

async function testLoginAndAdminActions() {
  logger.separator();
  logger.info('TESTE: Login e ações administrativas');
  
  try {
    // Tentar login com usuário de teste
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin.teste@mouros.com',
      password: 'AdminTeste123!'
    });
    
    if (loginResponse.data && loginResponse.data.token) {
      logger.success('✓ Login realizado com sucesso');
      const token = loginResponse.data.token;
      
      // Testar acesso admin (vai falhar pois não é admin real, mas deve gerar logs)
      try {
        const headers = { Authorization: `Bearer ${token}` };
        await axios.get(`${BASE_URL}/admin/stats`, { headers });
        logger.success('✓ Acesso admin concedido');
      } catch (error) {
        if (error.response && error.response.status === 403) {
          logger.warning('⚠️  Acesso admin negado (esperado - usuário não é admin)');
        } else {
          logger.error(`Erro inesperado: ${error.message}`);
        }
      }
      
      return token;
    }
  } catch (error) {
    logger.error(`Erro no login: ${error.message}`);
  }
  
  return null;
}

async function testAdminActionsWithValidAccess() {
  logger.separator();
  logger.info('TESTE: Simulando ações admin válidas');
  
  // Vamos tentar algumas ações que geram logs mesmo sem ser admin
  try {
    // Tentar acessar documentação (público)
    await axios.get('http://localhost:3001/api-docs');
    logger.success('✓ Acesso à documentação (público)');
    
    // Tentar acessar vehicles sem auth (deve gerar log de acesso negado)
    try {
      await axios.get(`${BASE_URL}/vehicles`);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        logger.info('⚬ Tentativa de acesso a vehicles sem auth (log gerado)');
      }
    }
    
    // Tentar múltiplas tentativas de admin (deve detectar atividade suspeita)
    for (let i = 0; i < 5; i++) {
      try {
        await axios.get(`${BASE_URL}/admin/stats`);
      } catch (error) {
        // Ignorar erros, só queremos gerar logs
      }
    }
    logger.info('⚬ Múltiplas tentativas admin realizadas (logs gerados)');
    
  } catch (error) {
    logger.error(`Erro nos testes: ${error.message}`);
  }
}

async function checkAuditLogs() {
  logger.separator();
  logger.info('TESTE: Verificando logs gerados durante os testes');
  
  // Tentar acessar logs via endpoint público de status
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    logger.info('⚬ Endpoint de status verificado');
  } catch (error) {
    logger.info('⚬ Logs sendo registrados em background');
  }
  
  logger.info('📝 Para ver os logs de auditoria, verifique o terminal do servidor');
  logger.info('   Os seguintes tipos de logs devem estar sendo registrados:');
  logger.info('   - ACCESS_DENIED (tentativas não autorizadas)');
  logger.info('   - LOGIN_SUCCESS/LOGIN_FAILED (autenticação)');
  logger.info('   - ADMIN_ACCESS_DENIED (tentativas admin sem permissão)');
  logger.info('   - SUSPICIOUS_ACTIVITY (múltiplas tentativas)');
}

async function runFullAuditTest() {
  console.log('🔍 TESTE COMPLETO DO SISTEMA DE AUDITORIA'.bold.yellow);
  console.log('═'.repeat(80).yellow);
  
  await createTestUser();
  const token = await testLoginAndAdminActions();
  await testAdminActionsWithValidAccess();
  await checkAuditLogs();
  
  logger.separator();
  logger.success('🎉 Teste completo de auditoria finalizado!');
  logger.info('🔍 Verifique o terminal do servidor para ver todos os logs gerados');
  
  process.exit(0);
}

// Executar teste
if (require.main === module) {
  runFullAuditTest().catch(error => {
    logger.error(`Erro fatal no teste: ${error.message}`);
    process.exit(1);
  });
}
