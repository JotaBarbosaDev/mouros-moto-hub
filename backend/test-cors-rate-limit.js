#!/usr/bin/env node

/**
 * Script de teste para verificar as correções de CORS e Rate Limiting
 * 
 * Testa:
 * 1. CORS com diferentes origens
 * 2. Rate limiting em desenvolvimento
 * 3. Requisições preflight
 * 4. Headers de segurança
 */

const http = require('http');

class CORSRateLimitTester {
  constructor() {
    this.baseUrl = 'http://localhost:3001';
    this.results = [];
  }

  async makeRequest(path, options = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.baseUrl);
      const requestOptions = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: options.method || 'GET',
        headers: options.headers || {}
      };

      const req = http.request(requestOptions, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data
          });
        });
      });

      req.on('error', reject);
      
      if (options.body) {
        req.write(options.body);
      }
      
      req.end();
    });
  }

  async testCORS() {
    console.log('\n🌐 === TESTE DE CORS ===');
    
    const origins = [
      'http://localhost:8080',  // Frontend principal
      'http://localhost:5173',  // Vite dev server
      'http://localhost:3000',  // React dev server
      'http://localhost:9999'   // Origem não permitida
    ];

    for (const origin of origins) {
      try {
        const response = await this.makeRequest('/api/health', {
          headers: { 'Origin': origin }
        });

        const allowed = response.headers['access-control-allow-origin'] === origin;
        const status = allowed ? '✅' : '❌';
        
        console.log(`${status} Origem: ${origin} - Status: ${response.statusCode} - ${allowed ? 'Permitida' : 'Bloqueada'}`);
        
        this.results.push({
          test: 'CORS',
          origin,
          allowed,
          statusCode: response.statusCode
        });
      } catch (error) {
        console.log(`❌ Erro ao testar origem ${origin}:`, error.message);
      }
    }
  }

  async testPreflightRequests() {
    console.log('\n✈️  === TESTE DE PREFLIGHT REQUESTS ===');
    
    const endpoints = ['/api/vehicles', '/api/members', '/api/dues-payments'];
    
    for (const endpoint of endpoints) {
      try {
        const response = await this.makeRequest(endpoint, {
          method: 'OPTIONS',
          headers: {
            'Origin': 'http://localhost:8080',
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type,Authorization'
          }
        });

        const hasAllowMethods = response.headers['access-control-allow-methods'];
        const hasAllowHeaders = response.headers['access-control-allow-headers'];
        const status = (hasAllowMethods && hasAllowHeaders) ? '✅' : '❌';
        
        console.log(`${status} Preflight ${endpoint} - Status: ${response.statusCode}`);
        console.log(`   Methods: ${hasAllowMethods || 'N/A'}`);
        console.log(`   Headers: ${hasAllowHeaders || 'N/A'}`);
        
      } catch (error) {
        console.log(`❌ Erro no preflight para ${endpoint}:`, error.message);
      }
    }
  }

  async testRateLimiting() {
    console.log('\n🚦 === TESTE DE RATE LIMITING ===');
    
    console.log('Testando múltiplas requisições rápidas...');
    
    const promises = [];
    for (let i = 0; i < 20; i++) {
      promises.push(this.makeRequest('/api/health', {
        headers: { 'Origin': 'http://localhost:8080' }
      }));
    }

    try {
      const responses = await Promise.all(promises);
      const successCount = responses.filter(r => r.statusCode === 200).length;
      const blockedCount = responses.filter(r => r.statusCode === 429).length;
      
      console.log(`✅ Requisições bem-sucedidas: ${successCount}/20`);
      console.log(`🚫 Requisições bloqueadas: ${blockedCount}/20`);
      
      if (blockedCount === 0) {
        console.log('✅ Rate limiting está configurado corretamente para desenvolvimento');
      } else {
        console.log('⚠️  Algumas requisições foram bloqueadas (pode ser normal em produção)');
      }
      
    } catch (error) {
      console.log('❌ Erro no teste de rate limiting:', error.message);
    }
  }

  async testSecurityHeaders() {
    console.log('\n🔒 === TESTE DE HEADERS DE SEGURANÇA ===');
    
    try {
      const response = await this.makeRequest('/api/health');
      
      const securityHeaders = [
        'x-content-type-options',
        'x-frame-options',
        'strict-transport-security',
        'content-security-policy'
      ];

      securityHeaders.forEach(header => {
        const value = response.headers[header];
        const status = value ? '✅' : '❌';
        console.log(`${status} ${header}: ${value || 'Missing'}`);
      });
      
    } catch (error) {
      console.log('❌ Erro no teste de headers de segurança:', error.message);
    }
  }

  async testAPIEndpoints() {
    console.log('\n🔍 === TESTE DE ENDPOINTS DA API ===');
    
    const endpoints = [
      '/api/health',
      '/api/vehicles',
      '/api/members',
      '/api/dues-payments'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await this.makeRequest(endpoint, {
          headers: { 'Origin': 'http://localhost:8080' }
        });

        const status = response.statusCode < 500 ? '✅' : '❌';
        console.log(`${status} ${endpoint} - Status: ${response.statusCode}`);
        
      } catch (error) {
        console.log(`❌ Erro ao testar ${endpoint}:`, error.message);
      }
    }
  }

  async runAllTests() {
    console.log('🧪 === INICIANDO TESTES DE CORS E RATE LIMITING ===');
    console.log(`🎯 Servidor alvo: ${this.baseUrl}`);
    
    await this.testCORS();
    await this.testPreflightRequests();
    await this.testRateLimiting();
    await this.testSecurityHeaders();
    await this.testAPIEndpoints();
    
    console.log('\n📊 === RESUMO DOS TESTES ===');
    console.log('Todos os testes foram executados.');
    console.log('Verifique os resultados acima para identificar possíveis problemas.');
  }
}

// Executar os testes
const tester = new CORSRateLimitTester();
tester.runAllTests().catch(console.error);
