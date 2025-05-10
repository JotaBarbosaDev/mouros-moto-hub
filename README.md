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

## ⚙️ Instalação e Uso

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm ou bun

### Instalação

1. Clone o repositório
   ```bash
   git clone https://github.com/seuusuario/mouros-moto-hub.git
   cd mouros-moto-hub
   ```

2. Instale as dependências
   ```bash
   # Usando npm
   npm install
   
   # Usando bun
   bun install
   ```

3. Configure as variáveis de ambiente
   ```bash
   cp .env.example .env.local
   # Edite o arquivo .env.local com suas credenciais do Supabase
   ```

4. Inicie o servidor de desenvolvimento
   ```bash
   npm run dev
   # ou
   bun dev
   ```

5. Acesse o site em `http://localhost:5173`

## 📊 Estrutura do Projeto

```
mouros-moto-hub/
├── public/                # Arquivos estáticos
├── src/
│   ├── components/        # Componentes React reutilizáveis
│   ├── pages/             # Páginas da aplicação
│   ├── hooks/             # Custom hooks React
│   ├── data/              # Dados estáticos/mock
│   ├── integrations/      # Integração com serviços externos
│   ├── utils/             # Funções utilitárias
│   ├── lib/               # Bibliotecas e configurações
│   ├── types/             # Definições de tipos TypeScript
│   ├── App.tsx            # Componente principal da aplicação
│   └── main.tsx           # Ponto de entrada da aplicação
├── supabase/              # Configurações do Supabase
└── ...                    # Arquivos de configuração
```

## 🔒 Autenticação

O sistema utiliza o Supabase para autenticação, permitindo os seguintes métodos:
- Login com e-mail/senha
- Login com redes sociais (opcional)
- Sistema de recuperação de senha

## 📷 Screenshots

*(Adicione screenshots da aplicação quando disponíveis)*

## 👥 Contribuidores

- João Barbosa - Desenvolvedor Principal

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - consulte o arquivo [LICENSE](LICENSE) para obter detalhes.
