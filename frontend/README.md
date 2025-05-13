# 🏍️ Mouros Moto Hub

![Mouros Moto Hub](https://img.shields.io/badge/Mouros-Moto_Hub-e11d48?style=for-the-badge)
![Licença](https://img.shields.io/badge/Licença-MIT-blue?style=flat-square)
![Estágio](https://img.shields.io/badge/Status-Em_Desenvolvimento-yellow?style=flat-square)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-00C7B7?style=flat-square&logo=supabase)
![Vite](https://img.shields.io/badge/Vite-latest-646CFF?style=flat-square&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)
![Express](https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=node.js)

Plataforma completa de gerenciamento para o moto clube "Os Mouros", oferecendo funcionalidades públicas e privativas para membros, com foco na gestão de eventos, loja, bar e muito mais.

## 📋 Índice

- [🚀 Visão Geral](#-visão-geral)
- [✨ Funcionalidades](#-funcionalidades)
- [🛠️ Tecnologias](#️-tecnologias)
- [⚙️ Instalação e Uso](#️-instalação-e-uso)
- [📊 Estrutura do Projeto](#-estrutura-do-projeto)
- [🔒 Autenticação](#-autenticação)
- [🔍 Consultando a API](#-consultando-a-api)
- [📷 Screenshots](#-screenshots)
- [👥 Contribuidores](#-contribuidores)
- [📄 Licença](#-licença)

## 🚀 Visão Geral

O Mouros Moto Hub é uma aplicação web completa desenvolvida para o moto clube "Os Mouros". A plataforma permite gerenciar todos os aspectos do clube, desde eventos e membros até produtos da loja, stock do bar e escalas de trabalho. O sistema possui uma área pública com informações do clube e uma área privativa para membros com acesso a funcionalidades administrativas.

## ✨ Funcionalidades

### Área Pública
- **🏠 Página Inicial** - Landing page com informações sobre o clube
- **📜 Sobre** - História e valores do moto clube
- **🎭 Eventos** - Calendário e detalhes de eventos públicos
- **🖼️ Galeria** - Fotos de eventos e atividades
- **🛒 Loja** - Produtos do clube disponíveis para compra
- **🍻 Bar** - Informações sobre o bar do clube
- **📞 Contato** - Formulário para contatar o clube

### Área de Membros (Protegida)
- **📊 Dashboard** - Visão geral das atividades do clube
- **👥 Gestão de Membros** - Cadastro e gerenciamento de membros
- **🗓️ Gestão de Eventos** - Criação e organização de eventos
- **🍺 Gestão do Bar** - Controle de vendas e stock do bar
- **👕 Gestão da Loja** - Gerenciamento de produtos e vendas
- **📦 Gestão de Inventário** - Controle de stock de produtos
- **⏰ Escalas** - Gerenciamento de escalas/turnos
- **🏍️ Garagem** - Cadastro de motocicletas dos membros
- **📚 Histórico** - Registro de atividades e eventos passados
- **👑 Administração** - Configurações administrativas do clube
- **⚙️ Configurações** - Preferências e configurações do sistema

## 🛠️ Tecnologias

O projeto é construído com um stack moderno de tecnologias:

- **Frontend**: 
  - [React](https://reactjs.org/) - Biblioteca JavaScript para construção de interfaces
  - [TypeScript](https://www.typescriptlang.org/) - Superset tipado de JavaScript
  - [Vite](https://vitejs.dev/) - Build tool para desenvolvimento rápido
  - [React Router](https://reactrouter.com/) - Roteamento dinâmico para aplicações React

- **Estilização**:
  - [Tailwind CSS](https://tailwindcss.com/) - Framework CSS utilitário
  - [shadcn/ui](https://ui.shadcn.com/) - Componentes reutilizáveis construídos com Radix UI

- **Estado e Requisições**:
  - [React Query](https://tanstack.com/query) - Gerenciamento de estado do servidor
  - [React Hook Form](https://react-hook-form.com/) - Gerenciamento de formulários
  - [Zod](https://zod.dev/) - Validação de esquemas TypeScript

- **Backend**:
  - [Express](https://expressjs.com/) - Framework para APIs REST
  - [Supabase](https://supabase.io/) - Backend-as-a-Service com autenticação e banco de dados

## ⚙️ Instalação e Uso

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm ou bun

### 📦 Instalação Rápida

```bash
# Clone este repositório
git clone https://github.com/seu-usuario/mouros-moto-hub.git
cd mouros-moto-hub

# Use o Makefile para configurar tudo automaticamente
make setup

# Inicie o ambiente de desenvolvimento (frontend + backend)
make dev
```

### 🧰 Instalação Manual

```bash
# Clone este repositório
git clone https://github.com/seu-usuario/mouros-moto-hub.git
cd mouros-moto-hub

# Instale as dependências do backend
cd backend
npm install

# Crie o arquivo .env com as variáveis necessárias
cp .env.example .env

# Inicie o servidor backend
npm start

# Em outro terminal, instale as dependências do frontend
cd ../frontend
npm install

# Crie o arquivo .env com as variáveis necessárias
cp .env.example .env

# Inicie o servidor de desenvolvimento do frontend
npm run dev
```

```bash
# Configure o frontend
cd frontend
npm install
cp .env.example .env  # Configure suas variáveis de ambiente

# Configure o backend
cd ../backend
npm install
cp .env.example .env  # Configure suas variáveis de ambiente

# Para iniciar os dois serviços
cd ..
./start-dev.sh
```

### 🔄 Scripts Disponíveis

- `make dev` - Inicia o frontend e o backend em terminais separados
- `make build` - Compila o frontend e o backend
- `make setup` - Instala todas as dependências
- `./update_api_urls.sh` - Atualiza URLs da API no frontend
- `./cleanup.sh` - Remove arquivos duplicados após a reorganização

## 📊 Estrutura do Projeto

O projeto foi reorganizado e agora está claramente dividido em frontend e backend:

```
mouros-moto-hub/
├── frontend/               # Aplicação React (cliente)
│   ├── src/                # Código-fonte do frontend
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── hooks/          # Custom hooks
│   │   ├── integrations/   # Integrações com serviços externos
│   │   ├── lib/            # Funções utilitárias 
│   │   ├── pages/          # Páginas da aplicação
│   │   ├── services/       # Serviços e comunicação com API
│   │   ├── types/          # Definições de tipos TypeScript
│   │   ├── utils/          # Funções utilitárias
│   │   ├── App.tsx         # Componente raiz
│   │   └── main.tsx        # Ponto de entrada
│   ├── public/             # Arquivos estáticos
│   └── package.json        # Dependências do frontend
│
├── backend/                # Servidor API (Express)
│   ├── src/                # Código-fonte do backend
│   │   ├── controllers/    # Controladores da API
│   │   ├── models/         # Modelos de dados
│   │   ├── routes/         # Rotas da API
│   │   ├── middlewares/    # Middlewares Express
│   │   ├── config/         # Configurações
│   │   ├── index.js        # Ponto de entrada principal
│   │   ├── api-server.js   # Configuração do servidor API
│   │   └── swagger-server.js # Documentação da API
│   ├── supabase/           # Funções e configurações do Supabase
│   ├── _tests/             # Testes da API e funcionalidades
│   └── package.json        # Dependências do backend
│
├── Makefile                # Comandos para facilitar o desenvolvimento
├── start-dev.sh            # Script para iniciar frontend e backend em terminais separados
├── start-manual.sh         # Script alternativo para iniciar os serviços
├── update_api_urls.sh      # Script para atualizar URLs da API no frontend
└── cleanup.sh              # Script para remover arquivos duplicados
```

Para mais detalhes, consulte o arquivo [REORGANIZACAO_IMPLEMENTADA.md](./REORGANIZACAO_IMPLEMENTADA.md).

## 🔍 API e Comunicação

A aplicação agora está dividida em frontend e backend, que se comunicam via API REST:

### API REST (backend)

O backend fornece os seguintes endpoints principais:

1. **Membros**:
   - `GET /api/members` - Lista todos os membros
   - `GET /api/members/:id` - Obtém um membro específico
   - `POST /api/members` - Cria um novo membro
   - `PUT /api/members/:id` - Atualiza um membro
   - `DELETE /api/members/:id` - Remove um membro

2. **Veículos**:
   - `GET /api/vehicles` - Lista todos os veículos
   - `GET /api/vehicles/:id` - Obtém um veículo específico
   - `GET /api/vehicles/member/:memberId` - Obtém veículos de um membro
   - `POST /api/vehicles` - Cadastra um novo veículo
   - `PUT /api/vehicles/:id` - Atualiza um veículo
   - `DELETE /api/vehicles/:id` - Remove um veículo

3. **Autenticação**:
   - `POST /api/auth/login` - Realiza login e retorna token JWT
   - `POST /api/auth/register` - Registra um novo usuário
   - `GET /api/auth/profile` - Obtém perfil do usuário autenticado

4. **Bar**:
   - `GET /api/bar/products` - Lista produtos do bar
   - `POST /api/bar/sales` - Registra uma venda
   - `GET /api/bar/shifts` - Lista escalas de trabalho

5. **Eventos**:
   - `GET /api/events` - Lista todos os eventos
   - `GET /api/events/:id/participants` - Lista participantes de um evento

A documentação completa da API está disponível em `http://localhost:3001/api-docs` quando o backend está em execução.

2. **Autenticação**:
   - `POST /api/auth/login` - Login
   - `POST /api/auth/register` - Registro
   - `POST /api/auth/logout` - Logout
   - `GET /api/auth/profile` - Perfil do usuário autenticado

3. **Veículos**:
   - `GET /api/vehicles` - Lista todos os veículos
   - `GET /api/vehicles/:id` - Obtém um veículo específico
   - `POST /api/vehicles` - Adiciona um novo veículo
   - `PUT /api/vehicles/:id` - Atualiza um veículo
   - `DELETE /api/vehicles/:id` - Remove um veículo

4. **Bar**:
   - `GET /api/bar/products` - Lista produtos do bar
   - `POST /api/bar/sales` - Registra uma venda
   - `GET /api/bar/shifts` - Obtém escala do bar

5. **Eventos**:
   - `GET /api/events` - Lista todos os eventos
   - `GET /api/events/:id` - Obtém detalhes de um evento
   - `POST /api/events` - Cria um novo evento
   - `PUT /api/events/:id` - Atualiza um evento
   - `DELETE /api/events/:id` - Remove um evento

6. **Administração**:
   - `GET /api/admin/stats` - Estatísticas do sistema
   - `GET /api/admin/logs` - Logs de atividades
   - `POST /api/admin/config` - Configurações do sistema

7. **Inventário**:
   - `GET /api/inventory` - Lista itens do inventário
   - `POST /api/inventory` - Adiciona item ao inventário
   - `PUT /api/inventory/:id` - Atualiza item do inventário
   - `DELETE /api/inventory/:id` - Remove item do inventário

### Documentação da API

A documentação detalhada da API está disponível via Swagger:

```
http://localhost:3001/api-docs
```

### Usando a API no Frontend

No frontend, você pode acessar a API usando o serviço personalizado:

```typescript
// No frontend
import { api } from '@/services/api';

// Exemplo de consulta de membros
const getMembers = async () => {
  try {
    const response = await api.get('/members');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar membros:', error);
    throw error;
  }
};
```

## 🧪 Testes

Para testar a API de membros localmente:

```bash
cd backend

# Inicia o servidor de API e abre a interface de teste
./testar-api-membros.sh

# Para verificar se o campo username está sendo retornado corretamente
node _tests/verificar-username.js
```

## 🔒 Autenticação

O sistema utiliza o Supabase para autenticação:
- Login com e-mail/senha
- Controle de permissões baseado em papéis
- Token JWT para autenticação de API

## 📷 Screenshots

*(Adicione screenshots da aplicação quando disponíveis)*

## 👥 Contribuidores

- João Barbosa - Desenvolvedor Principal

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - consulte o arquivo [LICENSE](LICENSE) para obter detalhes.
