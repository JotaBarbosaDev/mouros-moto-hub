#!/usr/bin/env node

/**
 * Teste específico para verificar rotas públicas e sistema completo
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

async function testPublicRoutes() {
  logger.separator();
  logger.info('TESTE: Rotas públicas (sem autenticação)');
  
  try {
    // Testar rota de documentação (deve ser pública)
    const docsResponse = await axios.get('http://localhost:3001/api-docs');
    logger.success('✓ Documentação Swagger acessível');
  } catch (error) {
    logger.error(`Erro ao acessar documentação: ${error.message}`);
  }

  try {
    // Testar rota de health check (se existir)
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    logger.success('✓ Health check funcionando');
  } catch (error) {
    if (error.response && error.response.status === 404) {
      logger.info('⚬ Rota de health check não implementada (OK)');
    } else {
      logger.error(`Erro inesperado no health check: ${error.message}`);
    }
  }
}

async function testSpeedLimiting() {
  logger.separator();
  logger.info('TESTE: Speed limiting (throttling progressivo)');
  
  // Fazer muitas requisições para uma rota que deveria ter throttling
  for (let i = 1; i <= 60; i++) {
    try {
      const start = Date.now();
      await axios.get('http://localhost:3001/api-docs');
      const duration = Date.now() - start;
      
      if (i % 10 === 0) {
        logger.info(`Requisição ${i}: ${duration}ms`);
      }
      
      if (duration > 1000) {
        logger.warning(`Requisição ${i}: Throttling detectado (${duration}ms)`);
        break;
      }
    } catch (error) {
      logger.error(`Erro na requisição ${i}: ${error.message}`);
      break;
    }
  }
}

async function testSecurityHeaders() {
  logger.separator();
  logger.info('TESTE: Headers de segurança');
  
  try {
    const response = await axios.get('http://localhost:3001/api-docs');
    const headers = response.headers;
    
    // Verificar headers de segurança
    const securityHeaders = [
      'x-content-type-options',
      'x-frame-options', 
      'x-xss-protection',
      'strict-transport-security'
    ];
    
    securityHeaders.forEach(header => {
      if (headers[header]) {
        logger.success(`✓ ${header}: ${headers[header]}`);
      } else {
        logger.warning(`⚠️  Header ${header} não encontrado`);
      }
    });
    
  } catch (error) {
    logger.error(`Erro ao verificar headers: ${error.message}`);
  }
}

async function runAdditionalTests() {
  console.log('🔒 TESTES ADICIONAIS DE SEGURANÇA'.bold.yellow);
  console.log('═'.repeat(80).yellow);
  
  await testPublicRoutes();
  await testSecurityHeaders();
  await testSpeedLimiting();
  
  logger.separator();
  logger.success('🎉 Testes adicionais concluídos!');
  
  process.exit(0);
}

// Executar testes
if (require.main === module) {
  runAdditionalTests().catch(error => {
    logger.error(`Erro fatal nos testes: ${error.message}`);
    process.exit(1);
  });
}
