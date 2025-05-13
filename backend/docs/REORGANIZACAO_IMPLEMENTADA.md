# Reorganização Implementada: Mouros Moto Hub

## 📋 Visão Geral

O projeto Mouros Moto Hub foi reorganizado com sucesso, dividindo-o em componentes independentes de **frontend** e **backend** que se comunicam via API REST. Esta reorganização seguiu as melhores práticas de arquitetura de software e segurança.

## 🏗️ Alterações Estruturais

### Nova Estrutura de Diretórios

```
mouros-moto-hub/
├── frontend/                # Aplicação React (Vite + TypeScript)
│   ├── src/                 # Código fonte do frontend
│   │   ├── components/      # Componentes React
│   │   ├── hooks/           # Custom hooks
│   │   ├── pages/           # Páginas da aplicação
│   │   └── ...              # Outros módulos frontend
│   ├── public/              # Arquivos estáticos
│   ├── .env                 # Variáveis ambiente (apenas públicas)
│   └── package.json         # Dependências frontend
│
├── backend/                 # Servidor API (Express + Node.js)
│   ├── src/                 # Código fonte do backend
│   │   ├── controllers/     # Controladores da API
│   │   ├── models/          # Modelos de dados
│   │   ├── routes/          # Rotas da API
│   │   ├── middlewares/     # Middlewares Express
│   │   └── ...              # Outros módulos backend
│   ├── .env                 # Variáveis ambiente (com chaves sensíveis)
│   └── package.json         # Dependências backend
│
├── Makefile                 # Automação de tarefas comuns
├── start-dev.sh             # Script para iniciar serviços em desenvolvimento
├── start-manual.sh          # Alternativa para iniciar serviços
└── update_api_urls.sh       # Script para atualizar URLs da API
│   │   └── index.js         # Ponto de entrada do servidor
│   │
│   ├── supabase/            # Código do backend Supabase
│   ├── .env                 # Variáveis de ambiente do backend (incluindo chaves sensíveis)
│   └── package.json         # Dependências do backend
│
└── Makefile                 # Scripts para facilitar a execução do projeto
```

## Alterações Realizadas

### 1. Separação de Código
- O código React foi movido para a pasta `frontend/`
- O código da API e do Supabase foi movido para a pasta `backend/`
- Arquivos de configuração específicos foram mantidos em cada diretório

### 2. Segurança
- As chaves de serviço do Supabase foram removidas do frontend
- Todas as chaves sensíveis foram movidas para o arquivo `.env` no backend
- Frontend utiliza apenas chaves públicas e a URL da API

### 3. Implementação de API
- API RESTful completa foi implementada no backend
- Endpoints criados para todos os recursos:
  - `/api/members` - Gerenciamento de membros
  - `/api/auth` - Autenticação
  - `/api/vehicles` - Gerenciamento de veículos
  - `/api/bar` - Gerenciamento de bar
  - `/api/events` - Gerenciamento de eventos
  - `/api/admin` - Funções administrativas
  - `/api/inventory` - Gerenciamento de inventário

### 4. Autenticação Aprimorada
- Token JWT implementado para autenticação
- Middleware para validação de autenticação
- Middleware para checagem de roles (admin)

## 🔐 Melhorias de Segurança

- **Segregação de Chaves Sensíveis**: As chaves de serviço do Supabase (chaves com permissões elevadas) agora ficam exclusivamente no backend
- **Comunicação via API**: O frontend não acessa mais o banco de dados diretamente, todas as operações passam pela API
- **Autenticação**: Implementação de sistema de autenticação baseado em tokens JWT

## 🔄 Mudanças nos Módulos

### Frontend

1. **Comunicação com Backend**:
   - Adaptação de hooks para consumir a API REST
   - Implementação de novo hook `use-vehicles.ts` usando fetch ao invés de Supabase
   - Configuração de variáveis de ambiente para comunicação com a API

2. **Mudanças nos Arquivos**:
   - Refatoração do sistema de importação/exportação
   - Adaptação das chamadas para APIs do backend
   - Remoção de acessos diretos ao banco de dados

### Backend

1. **Sistema de API REST**:
   - Implementação de controladores para lógica de negócios
   - Criação de modelos para acesso aos dados
   - Definição de rotas para endpoints da API
   - Implementação de middlewares para autenticação e autorização

2. **Conversão para CommonJS**:
   - Padronização do formato de módulos para CommonJS
   - Correção de exportações duplicadas nos arquivos de rotas
   - Atualização do sistema de importação/exportação

## 🛠️ Ferramentas de Automação

- **Makefile**: Comandos para setup, build e execução
- **start-dev.sh**: Script para executar frontend e backend em terminais separados
- **start-manual.sh**: Alternativa mais robusta para iniciar os serviços
- **update_api_urls.sh**: Script para atualizar URLs da API no frontend
- **cleanup.sh**: Script para remover arquivos duplicados após a reorganização
```bash
make build
```

## Autores

- João Barbosa
## 📝 Mudanças Específicas

1. **Veículos**:
   - Implementação completa do CRUD de veículos no backend
   - Adaptação do frontend para consumir a API de veículos
   - Correção do formato das respostas para compatibilidade com a interface existente

2. **Autenticação**:
   - Implementação de middleware de autenticação baseado em JWT
   - Adaptação das rotas para exigir autenticação
   - Implementação de verificação de permissões administrativas

3. **Documentação**:
   - Implementação de documentação Swagger para a API
   - Atualização do README.md com a nova estrutura
   - Criação de documentos detalhados sobre a reorganização

## 🧪 Testes

- Endpoints de API testados individualmente
- Funcionalidades básicas verificadas
- Comunicação frontend-backend validada para veículos

## 🚀 Próximos Passos

Para detalhes sobre os próximos passos, consulte o arquivo [PROXIMOS_PASSOS.md](./PROXIMOS_PASSOS.md).
