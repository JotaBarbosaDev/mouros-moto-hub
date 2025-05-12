# 🏍️ Mouros Moto Hub

![Mouros Moto Hub](https://img.shields.io/badge/Mouros-Moto_Hub-e11d48?style=for-the-badge)
![Licença](https://img.shields.io/badge/Licença-MIT-blue?style=flat-square)
![Estágio](https://img.shields.io/badge/Status-Em_Desenvolvimento-yellow?style=flat-square)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-00C7B7?style=flat-square&logo=supabase)
![Vite](https://img.shields.io/badge/Vite-latest-646CFF?style=flat-square&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)

Plataforma completa de gerenciamento para o moto clube "Os Mouros", oferecendo funcionalidades públicas e privativas para membros, com foco na gestão de eventos, loja, bar e muito mais.

## 📋 Índice

- [🚀 Visão Geral](#-visão-geral)
- [✨ Funcionalidades](#-funcionalidades)
- [🛠️ Tecnologias](#️-tecnologias)
- [⚙️ Instalação e Uso](#️-instalação-e-uso)
- [📊 Estrutura do Projeto](#-estrutura-do-projeto)
- [🔒 Autenticação](#-autenticação)
- [🔍 Consultando Membros](#-consultando-membros)
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
  - [Supabase](https://supabase.io/) - Backend-as-a-Service com autenticação e banco de dados
  - [Express](https://expressjs.com/) - Framework para APIs REST

## ⚙️ Instalação e Uso

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm ou bun

### Instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seuusuario/mouros-moto-hub.git
   cd mouros-moto-hub
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   Edite o arquivo `.env` com suas credenciais:
   ```env
   VITE_SUPABASE_URL=https://jugfkacnlgdjdosstiks.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1Z2ZrYWNubGdkamRvc3N0aWtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1MDkzMzAsImV4cCI6MjA2MTA4NTMzMH0.PL8pg93wAVTl3kUoe-mfK7kGdjW6ytXapAiy-mpxk78
   VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1Z2ZrYWNubGdkamRvc3N0aWtzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTUwOTMzMCwiZXhwIjoyMDYxMDg1MzMwfQ.C2HRez4LljpctZPwLVTJUBvHjEaT79byefQRAb0MYwE
   ```

4. **Execute o projeto em desenvolvimento**
   ```bash
   npm run dev
   ```

5. **Iniciar o servidor de API**
   ```bash
   npm run api
   ```

6. **Consultar dados dos membros via navegador**
   ```bash
   npm run consult
   ```

7. **Build para produção**
   ```bash
   npm run build
   ```

## 🔍 Consultando Membros

A aplicação fornece várias maneiras de consultar os dados de membros:

### Interface HTML (consulta-membros.html)

Uma interface web simples para consultar membros através da API Supabase:

1. Execute `npm run consult` para abrir no navegador
2. Os dados de conexão já estão pré-configurados
3. Use os botões para testar diferentes consultas:
   - **Buscar Membros**: Lista os primeiros 5 membros
   - **Dados Brutos**: Mostra a estrutura completa da tabela
   - **Dados Processados**: Mostra o objeto MemberExtended processado

### API REST (api-server.js)

Um servidor Express que fornece endpoints para consulta de membros:

1. Execute `npm run api` para iniciar o servidor
2. Acesse os endpoints:
   - `GET http://localhost:3000/api/members` - Retorna membros brutos
   - `GET http://localhost:3000/api/members-extended` - Retorna membros processados

### Programaticamente

Você pode consultar membros diretamente através do Supabase em seu código:

```typescript
import { supabase } from '@/integrations/supabase/client';

// Buscar membros
const { data, error } = await supabase
  .from('members')
  .select('*')
  .limit(10);
```

## 📊 Estrutura do Projeto

```
mouros-moto-hub/
├── public/               # Arquivos estáticos e placeholders
├── src/
│   ├── components/       # Componentes React reutilizáveis
│   ├── pages/            # Páginas da aplicação
│   ├── hooks/            # Custom hooks React
│   │   ├── use-members.ts # Hook para acessar dados de membros
│   │   └── _backups/     # Versões antigas de hooks (para referência)
│   ├── integrations/     # Integração com serviços externos
│   │   └── supabase/     # Cliente e configurações do Supabase
│   ├── services/         # Serviços para lógica de negócios
│   │   ├── member-service-robust.ts # Serviço robusto para gerenciamento de membros
│   │   └── _backups/     # Versões antigas de serviços (para referência)
│   └── types/            # Definições de tipos TypeScript
│       └── member-extended.ts # Tipo para membros com relações
├── supabase/             # Código do backend Supabase
│   ├── functions/        # Funções Edge (serverless)
│   │   ├── user-management/ # Função para gerenciamento de usuários
│   │   ├── list-users/   # Função para listar usuários
│   │   └── _backups/     # Versões antigas de funções (para referência)
│   └── migrations/       # Migrações SQL para o banco de dados
├── _tests/               # Scripts de teste e utilitários
│   ├── teste-api-membros.js      # Teste básico da API de membros
│   ├── verificar-username.js     # Verifica se o campo username está sendo retornado
│   └── README.md                 # Documentação dos scripts de teste
├── swagger-server.js     # Servidor API para testes locais
├── swagger.yaml          # Documentação OpenAPI
├── test-members-api.html # Interface web para testar a API de membros
├── testar-api-membros.sh # Script para iniciar servidor e testes
├── STATUS_API_MEMBROS.md # Status atual da API de membros
├── ORGANIZACAO_PROJETO.md # Documentação da organização do projeto
└── .env                  # Configurações de ambiente
```

## 🧪 Testes

Para testar a API de membros localmente:

```bash
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
