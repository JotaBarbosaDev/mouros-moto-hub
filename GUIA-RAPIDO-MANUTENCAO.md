# 🚀 Guia Rápido de Manutenção - Mouros Moto Hub

## 📋 Pontos de Atenção

### 1. URLs de API

A estrutura de URLs da API requer atenção especial:

- **Configuração no .env**: `VITE_API_URL=http://localhost:3001/api` (já inclui o prefixo `/api`)
- **Chamadas corretas**: `${getApiBaseUrl()}/auth/login` (resultando em `http://localhost:3001/api/auth/login`)
- **Chamadas ERRADAS**: `${getApiBaseUrl()}/api/auth/login` (resultaria em `http://localhost:3001/api/api/auth/login`)

⚠️ **NUNCA** adicione `/api` nas chamadas, pois a função `getApiBaseUrl()` já retorna a URL com esse prefixo!

### 2. Estrutura do Banco de Dados

Ao trabalhar com o banco de dados, certifique-se de:

- ✅ Verificar a existência da coluna `engine_size` na tabela `vehicles`
- ✅ Verificar a existência da tabela `activity_logs`
- ✅ Executar os scripts de verificação de esquema antes de lançar atualizações

Em caso de dúvida, execute o script de verificação: `./verify-and-fix-tables.sh`

### 3. Autenticação e Tokens

Aspectos importantes sobre o sistema de autenticação:

- Os tokens são armazenados no `localStorage` com a chave `accessToken`
- A função `getAccessToken()` busca tokens de múltiplas fontes para maior robustez
- Os controllers do backend verificam tokens do Supabase e JWT

## 🛠️ Scripts Úteis para Manutenção

| Script | Descrição |
|--------|-----------|
| `check-api-url-patterns.sh` | Verifica e corrige padrões de URL nos serviços do frontend |
| `verify-and-fix-tables.sh` | Verifica e corrige estrutura do banco de dados |
| `fix-all-issues.sh` | Script abrangente para diagnosticar e corrigir todos os problemas |

## 📚 Documentação

Para mais detalhes, consulte:

- 📝 [Índice de Documentação](/DOCUMENTACAO-INDICE.md) - Lista completa de documentos
- 🔧 [Correções Implementadas](/CORRECOES-IMPLEMENTADAS.md) - Detalhes das correções
- 🔍 [Correção de URLs da API](/frontend/docs/CORRECAO-URLS-API.md) - Explicação do problema de URLs

## 🚨 Em Caso de Problemas

1. Verifique os logs do frontend e backend
2. Execute os scripts de diagnóstico automático
3. Consulte a documentação de correções anteriores
4. Verifique a configuração do ambiente e variáveis de ambiente

---

**Última atualização**: 18 de maio de 2025  
**Autor**: João Barbosa
