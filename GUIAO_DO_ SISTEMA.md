# GUIA MESTRE - MOUROS MOTO HUB
*Sistema Completo de Gestão de Moto Clube*

---

## 1. VISÃO GERAL DO SISTEMA

### Objetivo Principal
O Mouros Moto Hub é um sistema completo que permite ao Moto Clube Os Mouros:
- **Presença Online**: Landing page pública com eventos, contactos e loja
- **Gestão Interna**: Área de membros com diferentes níveis de acesso
- **Automatização**: Agilizar processos administrativos do moto clube

### Arquitetura
- **Frontend**: Interface web separada (porta específica)
- **Backend**: API REST separada (porta específica) 
- **Base de Dados**: Supabase (migração fácil para PostgreSQL)
- **Autenticação**: Username/Email + Password

---

## 2. LANDING PAGE (Acesso Público)

### Funcionalidades Principais
- **Eventos**: Listagem e detalhes dos eventos do clube
- **Contactos**: Informações de contacto do clube
- **Loja**: Catálogo de produtos com carrinho de compras
- **Sobre Nós**: Informações do clube, história, missão
- **Galeria**: Fotos de eventos e atividades
- **Notícias**: Últimas novidades do clube

### Páginas/Seções
```
├── Home
├── Eventos
│   ├── Lista de eventos
│   ├── Detalhes do evento
│   └── Calendário
├── Loja
│   ├── Catálogo de produtos
│   ├── Detalhes do produto
│   ├── Carrinho de compras
│   └── Checkout (requer registo)
├── Sobre Nós
├── Contactos
├── Galeria
├── Notícias
└── Login/Registo
```

### Casos de Uso - Landing Page
- **Visitante não registado**:
  - ✅ Navegar por todas as seções
  - ✅ Ver eventos e detalhes (apenas eventos públicos)
  - ✅ Ver produtos da loja
  - ✅ Adicionar produtos ao carrinho
  - ✅ **Inscrição em eventos**: Deve criar conta obrigatória para ter dados pessoais, contactos e veículo(s)
  - ❌ Finalizar compra (deve criar conta)

### Inscrições em Eventos
- **Processo de Inscrição**:
  1. Se já tem conta → Login direto
  2. Se é visitante → **Criação de conta obrigatória**
  3. Deve adicionar pelo menos 1 veículo ao perfil
  4. Pode selecionar qual veículo levará ao evento específico
  5. Dados necessários: Nome, contactos, veículo(s)

---

## 3. TIPOS DE UTILIZADORES

### Hierarquia de Utilizadores
```
├── Visitante (não autenticado)
├── Cliente (registado, não sócio)
├── Sócio
├── Direção (com cargos específicos)
│   ├── Presidente
│   ├── Vice-Presidente  
│   ├── Secretário
│   ├── Tesoureiro
│   └── Outros cargos...
└── Admin (acesso total)
```

### Tipos de Sócios
- **Sócio**: Membro regular do clube
- **Criança**: Membro menor de idade (filhos de sócios)
- **Mulher**: Categoria específica para membros femininos

### Sistema de Numeração de Sócios
- **Incremento automático**: #001, #002, #004... (saltando bloqueados)
- **Expansão**: 3 dígitos até centenas, depois 4+ dígitos se necessário
- **Números não transferíveis**: Cada número fica associado permanentemente
- **Estados dos números**:
  - ✅ **Utilizado**: Número ativo de sócio atual
  - 🔒 **Bloqueado**: Ex-sócio expulso/saiu (motivo obrigatório)
  - 🚫 **Reservado**: Reservado para casos especiais (motivo obrigatório)
- **Gestão**: Apenas admin/secretário podem desbloquear números
- **Transparência**: Estado e motivo visível para admin/secretário

---

## 4. PERMISSÕES POR TIPO DE UTILIZADOR

### 🔴 VISITANTE (Landing Page)
**Acesso**: Apenas landing page pública
- Ver eventos, produtos, contactos
- Adicionar ao carrinho
- **Registo obrigatório** para comprar
- **FUNCIONALIDADES ADICIONAIS**:
  - ✅ Subscrever newsletter
  - ✅ Formulário de contacto/interesse em ser sócio
  - ✅ Ver galeria pública limitada (sem fotos privadas)
  - ✅ Download de documentos públicos (regulamentos, estatutos)

### 🟡 CLIENTE (Registado, não sócio)
**Acesso**: Landing page + área limitada de membro
```
Área de Membro (muito limitada):
├── Dados Pessoais (editar próprios)
├── Histórico de Compras
├── Estado de Encomendas
├── Candidatura a Sócio (formulário)
├── Wishlist de produtos
├── Avaliações/Reviews de produtos
├── Newsletter personalizada
└── Logout
```

### 🟢 SÓCIO 
**Acesso**: Landing page + área de sócio
```
Área de Membro:
├── Dashboard Pessoal
├── Dados Pessoais (editar próprios)
├── Veículos (gerir próprios)
├── Mensalidades (ver próprias + pagamento online)
├── Eventos (ver, inscrever-se, cancelar inscrição)
├── Histórico de Atividades (próprio)
├── Compras/Encomendas (desconto de sócio)
├── Notificações
├── FUNCIONALIDADES ADICIONAIS:
│   ├── Diretório de sócios (contactos básicos)
│   ├── Fórum/Chat de sócios
│   ├── Galeria completa (incluindo fotos privadas)
│   ├── Download de atas de reuniões
│   ├── Votações online (quando aplicável)
│   ├── Check-in em eventos (QR code)
│   ├── Histórico de participação em eventos
│   └── Sistema de referenciação (indicar novos sócios)
└── Logout
```

### 🔵 DIREÇÃO (por cargo)
**Acesso**: Landing page + área de direção + específico do cargo

#### Secretário
```
Gestão de Membros:
├── Criar novos sócios (c/ numeração)
├── Editar dados de sócios
├── Bloquear/desbloquear números
├── Atribuir números personalizados
├── Ver relatórios de membros
├── Gerir correspondência
├── FUNCIONALIDADES ADICIONAIS:
│   ├── Aprovar candidaturas a sócio
│   ├── Gerir suspensões/expulsões
│   ├── Criar e enviar comunicados
│   ├── Gestão de presença em reuniões
│   ├── Arquivo de documentos oficiais
│   ├── Controle de cartões de sócio
│   └── Relatórios de atividade dos sócios
│
└── 🔒 LIMITAÇÕES FINANCEIRAS:
    ├── ❌ NÃO pode definir valores de taxas de inscrição
    ├── ❌ NÃO pode definir valores de multas/penalizações
    ├── ✅ PODE criar multas SEM valor (vai para aprovação do Tesoureiro)
    ├── ✅ PODE sugerir alterações de valores via sistema de aprovação
    ├── ✅ PODE ver histórico de aprovações financeiras relacionadas aos sócios
    └── ✅ PODE criar eventos SEM taxa de participação (gratuitos)
```

#### Tesoureiro  
```
Gestão Financeira:
├── Entradas e saídas de dinheiro
├── Relatórios mensais/anuais
├── Gestão de mensalidades
├── Controle de pagamentos
├── Faturação
├── Orçamentos
├── FUNCIONALIDADES ADICIONAIS:
│   ├── Dashboard financeiro em tempo real
│   ├── Alertas de mensalidades em atraso
│   ├── Gestão de multas e penalizações
│   ├── Controle de subsídios/apoios
│   ├── Reconciliação bancária
│   ├── Previsões orçamentais
│   ├── Controle de despesas por categoria
│   └── Relatórios fiscais/contabilísticos
│
└── 🔒 SISTEMA DE APROVAÇÃO FINANCEIRA (CRÍTICO):
    ├── Aprovar/rejeitar TODOS os valores monetários do sistema
    ├── Solicitar alterações em preços de produtos da loja
    ├── Validar taxas de participação em eventos
    ├── Aprovar alterações em mensalidades e taxas de inscrição
    ├── Revisar multas e penalizações propostas
    ├── Dashboard de aprovações pendentes com notificações
    ├── Sistema de comentários para justificar decisões
    ├── Fluxo iterativo de negociação com criadores
    ├── Escalamento automático para Presidente (após 3 rondas)
    ├── Relatórios de atividade de aprovações
    ├── Definir valores alternativos/sugestões
    ├── Aprovar isenções e descontos especiais
    ├── Controle de tempo de resposta (SLA 48h)
    └── Histórico completo de decisões para auditoria
```

#### Presidente/Vice-Presidente
```
Visão Geral:
├── Dashboard executivo
├── Aprovar decisões importantes
├── Ver todos os relatórios
├── Gerir outros cargos
├── Configurações gerais
├── FUNCIONALIDADES ADICIONAIS:
│   ├── Agenda/calendário executivo
│   ├── Aprovar orçamentos e despesas grandes
│   ├── Gerir parcerias e protocolos
│   ├── Sistema de delegação de tarefas
│   ├── Relatórios de performance do clube
│   ├── Gestão de comunicação externa
│   └── Arquivo de decisões/deliberações
│
└── 🔒 PODERES ESPECIAIS - APROVAÇÃO FINANCEIRA:
    ├── Bypass de aprovação: pode aprovar qualquer valor diretamente
    ├── Decisão final em escalamentos (após 3 rondas sem consenso)
    ├── Resolver conflitos entre Tesoureiro e criadores
    ├── Aprovar aumentos de mensalidade >10% automaticamente
    ├── Definir políticas e limites de aprovação automática
    ├── Dashboard de escalamentos pendentes (prazo 5 dias úteis)
    ├── Relatórios executivos de todas as aprovações financeiras
    ├── Configurar delegações de aprovação para ausências
    └── Auditoria: acesso completo ao histórico de decisões financeiras
```

#### 🆕 OUTROS CARGOS SUGERIDOS:
```
Responsável de Eventos:
├── Criar e gerir eventos
├── Controle de inscrições
├── Gestão de logistics de eventos
├── Relatórios de participação
├── Coordenação de voluntários
└── 🔒 LIMITAÇÃO: Taxas de participação precisam aprovação do Tesoureiro

Responsável de Comunicação:
├── Gestão de conteúdo da landing page
├── Gestão de redes sociais
├── Newsletter e comunicados
├── Galeria de fotos
├── Relações públicas
└── 🔒 SEM ACESSO a valores financeiros

Responsável Técnico:
├── Gestão de manutenções de veículos
├── Organização de workshops técnicos
├── Base de dados de oficinas parceiras
├── Calendário de inspeções
└── 🔒 LIMITAÇÃO: Custos de serviços precisam aprovação do Tesoureiro

Responsável da Loja (NOVO CARGO):
├── Gestão de catálogo de produtos
├── Controle de stock e inventário
├── Atendimento ao cliente da loja
├── Coordenação de entregas
├── Análise de vendas e relatórios
└── 🔒 LIMITAÇÃO CRÍTICA: Preços precisam sempre aprovação do Tesoureiro
    ├── PODE adicionar produtos SEM preço (rascunho)
    ├── PODE sugerir preços via sistema de aprovação
    ├── PODE gerir promoções PRÉ-APROVADAS pelo Tesoureiro
    └── PODE alterar descrições/imagens sem nova aprovação
```

### 🔴 ADMIN (Acesso Total)
**Acesso**: Tudo + configurações do sistema
```
Sistema Completo:
├── Todas as funcionalidades anteriores
├── Gestão de utilizadores e permissões
├── Configurações do sistema
├── Backup e manutenção
├── Logs e auditoria
├── Gestão de conteúdo da landing page
├── FUNCIONALIDADES ADICIONAIS:
│   ├── Monitorização de performance
│   ├── Gestão de templates de email
│   ├── Configuração de integrações externas
│   ├── Gestão de políticas de privacidade
│   ├── Sistema de notificações push
│   ├── Análise de dados e métricas
│   ├── Gestão de backups automáticos
│   └── Centro de suporte técnico
```

---

## 5. 🔒 SISTEMA DE APROVAÇÃO FINANCEIRA (CRÍTICO)

### Visão Geral
**Problema**: Atualmente qualquer utilizador com permissões pode definir valores monetários diretamente no sistema (produtos, eventos, taxas), criando riscos de transparência e controle financeiro.

**Solução**: Sistema de aprovação iterativa onde o **Tesoureiro deve validar TODOS os valores monetários** antes da publicação no sistema.

### Itens Sujeitos a Aprovação Financeira
```
Produtos da Loja:
├── Preço de custo
├── Preço de venda
├── Margem de lucro
└── Descontos especiais para sócios

Eventos:
├── Taxa de participação
├── Custos estimados
├── Orçamento do evento
└── Valores de subsídios/apoios

Mensalidades e Taxas:
├── Valor da mensalidade anual
├── Taxa de inscrição de novos sócios
├── Multas e penalizações
└── Isenções e descontos especiais

Transações Financeiras:
├── Despesas do clube
├── Receitas extraordinárias
├── Investimentos e compras
└── Transferências e pagamentos
```

### Fluxo de Aprovação Iterativa

#### 1. **Criação de Item com Valores Monetários**
```
┌─────────────────────────────────────────────────────────────┐
│ UTILIZADOR CRIA ITEM (Produto/Evento/Taxa)                 │
│ ┌─ Status: "RASCUNHO" (não visível publicamente)           │
│ ┌─ Valores: Definidos pelo criador                         │
│ ┌─ Notificação: Enviada automaticamente ao Tesoureiro      │
└─────────────────────────────────────────────────────────────┘
```

#### 2. **Primeira Avaliação do Tesoureiro**
```
┌─────────────────────────────────────────────────────────────┐
│ TESOUREIRO ANALISA O ITEM                                   │
│ ├─ APROVAR ➤ Status: "APROVADO" ➤ Publicação automática    │
│ ├─ SOLICITAR ALTERAÇÕES ➤ Status: "EM_REVISAO"             │
│ │  ├─ Comentários obrigatórios com justificação            │
│ │  ├─ Sugestões de valores alternativos                    │
│ │  └─ Prazo para resposta (72h)                            │
│ └─ REJEITAR ➤ Status: "REJEITADO" ➤ Item arquivado         │
└─────────────────────────────────────────────────────────────┘
```

#### 3. **Revisão pelo Criador**
```
┌─────────────────────────────────────────────────────────────┐
│ CRIADOR RESPONDE À SOLICITAÇÃO                              │
│ ├─ ACEITAR SUGESTÕES ➤ Altera valores ➤ Reenvio automático │
│ ├─ PROPOR CONTRAPROPOSTAS ➤ Justifica valores originais    │
│ │  ├─ Comentários obrigatórios                             │
│ │  ├─ Documentação de suporte (opcional)                   │
│ │  └─ Status: "AGUARDANDO_REAVALIACAO"                     │
│ └─ CANCELAR ITEM ➤ Status: "CANCELADO"                     │
└─────────────────────────────────────────────────────────────┘
```

#### 4. **Reavaliação e Consenso**
```
┌─────────────────────────────────────────────────────────────┐
│ PROCESSO ITERATIVO ATÉ CONSENSO                             │
│ ├─ Máximo de 3 rondas de negociação                        │
│ ├─ Se sem consenso ➤ Escalamento para Presidente           │
│ ├─ Presidente decide valor final (decisão vinculativa)     │
│ └─ Histórico completo mantido para auditoria               │
└─────────────────────────────────────────────────────────────┘
```

### Estados dos Itens Financeiros
```
┌── 🔵 RASCUNHO
│   ├─ Criado mas não enviado para aprovação
│   ├─ Editável pelo criador
│   └─ Não visível publicamente
│
├── 🟡 AGUARDANDO_APROVACAO  
│   ├─ Enviado para análise do Tesoureiro
│   ├─ Não editável pelo criador
│   └─ Não visível publicamente
│
├── 🟠 EM_REVISAO
│   ├─ Tesoureiro solicitou alterações
│   ├─ Editável pelo criador (apenas valores financeiros)
│   └─ Comentários/sugestões visíveis
│
├── 🔄 AGUARDANDO_REAVALIACAO
│   ├─ Criador respondeu às solicitações
│   ├─ Awaiting Tesoureiro para nova análise
│   └─ Não editável por ninguém
│
├── 🔴 ESCALADO
│   ├─ Sem consenso após 3 rondas
│   ├─ Decisão pendente do Presidente
│   └─ Prazo máximo: 5 dias úteis
│
├── ✅ APROVADO
│   ├─ Aprovado pelo Tesoureiro
│   ├─ Visível publicamente
│   └─ Valores financeiros bloqueados para edição
│
└── ❌ REJEITADO/CANCELADO
    ├─ Rejeitado definitivamente
    ├─ Arquivado com motivo
    └─ Não visível publicamente
```

### Notificações Automáticas
```
Para o Tesoureiro:
├── 📧 Email: Novo item aguardando aprovação
├── 📱 Notificação push: Prazo de resposta se aproximando
├── 📊 Dashboard: Items pendentes em destaque
└── 📅 Lembrete: Items sem resposta há >48h

Para o Criador:
├── 📧 Email: Status do item alterado
├── 📱 Notificação push: Solicitação de alterações
├── 📝 Comentários: Feedback do Tesoureiro disponível
└── ⏰ Aviso: Prazo para resposta (72h)

Para o Presidente (escalamentos):
├── 🚨 Email urgente: Item escalado para decisão
├── 📋 Resumo: Histórico da negociação
├── ⚖️ Responsabilidade: Decisão vinculativa necessária
└── 📅 Prazo: 5 dias úteis para decisão final
```

### Dashboards Específicos

#### Dashboard do Tesoureiro
```
┌── 📊 VISÃO GERAL FINANCEIRA
│   ├─ Items aguardando aprovação (contador)
│   ├─ Items em revisão (contador + dias pendentes)
│   ├─ Items aprovados hoje/semana
│   └─ Valor total pendente de aprovação
│
├── 📋 LISTA DE APROVAÇÕES PENDENTES
│   ├─ Ordenação por urgência/prazo
│   ├─ Filtros por tipo (produto/evento/taxa)
│   ├─ Valores propostos vs. sugeridos
│   └─ Ações rápidas (aprovar/solicitar alteração)
│
├── 📈 RELATÓRIOS DE ATIVIDADE
│   ├─ Tempo médio de aprovação
│   ├─ Taxa de aprovação vs. revisão
│   ├─ Items mais contestados
│   └─ Volume de aprovações por período
│
└── 📝 HISTÓRICO DE DECISÕES
    ├─ Todas as aprovações/rejeições
    ├─ Justificações dadas
    ├─ Comentários e feedbacks
    └─ Análise de padrões
```

#### Dashboard do Criador
```
┌── 📄 MEUS ITEMS EM APROVAÇÃO
│   ├─ Status atual de cada item
│   ├─ Tempo decorrido desde submissão
│   ├─ Próximos prazos de resposta
│   └─ Ações necessárias
│
├── 💬 COMENTÁRIOS PENDENTES
│   ├─ Solicitações do Tesoureiro
│   ├─ Sugestões de valores alternativos
│   ├─ Documentação solicitada
│   └─ Área de resposta rápida
│
├── 📊 HISTÓRICO DE APROVAÇÕES
│   ├─ Items aprovados anteriormente
│   ├─ Taxa de sucesso pessoal
│   ├─ Tempo médio até aprovação
│   └─ Lições aprendidas/padrões
│
└── 📚 GUIA DE BOAS PRÁTICAS
    ├─ Diretrizes para precificação
    ├─ Documentação recomendada
    ├─ Modelos de justificação
    └─ FAQ sobre aprovações
```

### Implementação Técnica

#### Base de Dados - Novas Tabelas
```sql
-- Tabela principal de aprovações financeiras
CREATE TABLE financial_approvals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_type VARCHAR(50) NOT NULL, -- 'product', 'event', 'fee', 'transaction'
  item_id UUID NOT NULL, -- ID do item referenciado
  creator_id UUID NOT NULL REFERENCES members(id),
  treasurer_id UUID REFERENCES members(id),
  president_id UUID REFERENCES members(id),
  
  status financial_approval_status NOT NULL DEFAULT 'draft',
  current_round INTEGER DEFAULT 1,
  max_rounds INTEGER DEFAULT 3,
  
  original_values JSONB NOT NULL, -- Valores originais propostos
  current_values JSONB NOT NULL,  -- Valores atuais (podem ter mudado)
  approved_values JSONB,          -- Valores finais aprovados
  
  created_at TIMESTAMP DEFAULT NOW(),
  submitted_at TIMESTAMP,         -- Quando foi enviado para aprovação
  first_response_at TIMESTAMP,    -- Primeira resposta do tesoureiro
  approved_at TIMESTAMP,          -- Quando foi aprovado
  escalated_at TIMESTAMP,         -- Quando foi escalado (se aplicável)
  
  escalation_reason TEXT,         -- Motivo do escalamento
  final_decision_by UUID REFERENCES members(id), -- Quem tomou decisão final
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de comentários/feedback
CREATE TABLE approval_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  approval_id UUID NOT NULL REFERENCES financial_approvals(id),
  user_id UUID NOT NULL REFERENCES members(id),
  user_role VARCHAR(20) NOT NULL, -- 'creator', 'treasurer', 'president'
  
  comment_type VARCHAR(30) NOT NULL, -- 'request_changes', 'counteroffer', 'justification', 'approval_note'
  content TEXT NOT NULL,
  suggested_values JSONB, -- Valores sugeridos (se aplicável)
  
  round_number INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tipos de status
CREATE TYPE financial_approval_status AS ENUM (
  'draft',
  'awaiting_approval',
  'in_revision', 
  'awaiting_reevaluation',
  'escalated',
  'approved',
  'rejected',
  'cancelled'
);
```

#### API Endpoints Adicionais
```
POST /api/financial-approvals
  ├─ Criar nova solicitação de aprovação
  ├─ Parâmetros: item_type, item_id, values
  └─ Resposta: approval_id, status

GET /api/financial-approvals
  ├─ Listar aprovações (filtros por status, usuário)
  ├─ Parâmetros: status[], user_role, page, limit
  └─ Resposta: Lista paginada com detalhes

PUT /api/financial-approvals/:id/review
  ├─ Tesoureiro avaliar solicitação
  ├─ Parâmetros: action (approve|request_changes|reject), comments, suggested_values
  └─ Resposta: new_status, next_actions

PUT /api/financial-approvals/:id/respond
  ├─ Criador responder a solicitação de alterações
  ├─ Parâmetros: updated_values, response_comment, action
  └─ Resposta: new_status, round_number

PUT /api/financial-approvals/:id/escalate
  ├─ Sistema escalar para Presidente (automático)
  ├─ Trigger: após 3 rondas sem consenso
  └─ Resposta: escalation_details

PUT /api/financial-approvals/:id/final-decision
  ├─ Presidente tomar decisão final
  ├─ Parâmetros: final_values, decision_comment
  └─ Resposta: final_status

GET /api/financial-approvals/:id/comments
  ├─ Histórico completo de comentários
  ├─ Parâmetros: round (opcional)
  └─ Resposta: comentários organizados por ronda

GET /api/financial-approvals/dashboard/:role
  ├─ Dashboard específico por papel (treasurer|creator|president)
  ├─ Métricas, pendências, relatórios
  └─ Resposta: dados específicos do dashboard
```

### Integrações nos Módulos Existentes

#### Produtos da Loja
```
Criação de Produto:
├─ Campos financeiros vão para financial_approvals
├─ Produto criado com status "pending_financial_approval"
├─ Não aparece na loja pública até aprovação
└─ Criador pode editar detalhes não-financeiros

Edição de Produto Aprovado:
├─ Alterações de preço = nova aprovação necessária
├─ Alterações de descrição/imagem = diretas
├─ Histórico de alterações financeiras mantido
└─ Produto volta a status "pending" se preços alterados
```

#### Eventos
```
Criação de Evento:
├─ Taxa de participação vai para aprovação
├─ Evento visível mas inscrições bloqueadas
├─ Organizador pode ajustar logística
└─ Inscrições liberadas após aprovação financeira

Eventos Gratuitos:
├─ Taxa = 0 ainda precisa de aprovação
├─ Confirmação de que é realmente gratuito
├─ Aprovação mais rápida (processo simplificado)
└─ Evita eventos "falsos gratuitos"
```

#### Sistema de Mensalidades
```
Alteração de Valores:
├─ Proposta vai para aprovação do Tesoureiro
├─ Impacto em todos os sócios calculado
├─ Justificação obrigatória para aumentos
└─ Aprovação do Presidente para aumentos >10%

Isenções e Descontos:
├─ Cada isenção individual precisa aprovação
├─ Critérios claros para concessão
├─ Limite anual de isenções definido
└─ Relatório de impacto financeiro
```

---

## 6. 🔍 SISTEMA DE AUDITORIA E LOGS (CRÍTICO)

### Visão Geral
**Objetivo**: Implementar um sistema abrangente de auditoria e logs com controle granular de acesso baseado em níveis hierárquicos de utilizadores, garantindo transparência, conformidade e rastreabilidade de todas as ações no sistema.

### Categorias de Logs
```
1. 🔐 AUTENTICAÇÃO E SEGURANÇA
   ├── Login/logout de utilizadores
   ├── Tentativas de acesso falhadas
   ├── Alterações de passwords
   ├── Criação/ativação/desativação de contas
   ├── Mudanças de permissões e roles
   └── Acessos a dados sensíveis

2. 👥 GESTÃO DE MEMBROS
   ├── Criação/edição/remoção de sócios
   ├── Alterações de status de sócio
   ├── Aprovação/rejeição de candidaturas
   ├── Gestão de veículos
   ├── Mudanças de dados pessoais
   └── Atribuição de números de sócio

3. 💰 OPERAÇÕES FINANCEIRAS
   ├── Todas as ações do sistema de aprovação financeira
   ├── Alterações de preços de produtos
   ├── Modificações de mensalidades/taxas
   ├── Pagamentos processados
   ├── Isenções e descontos concedidos
   └── Relatórios financeiros gerados

4. 📅 EVENTOS E ATIVIDADES
   ├── Criação/edição/cancelamento de eventos
   ├── Inscrições e cancelamentos
   ├── Alterações de capacidade/preços
   ├── Gestão de presenças
   └── Relatórios de eventos

5. 🛍️ LOJA E INVENTORY
   ├── Gestão de produtos e categorias
   ├── Controle de stock
   ├── Processamento de encomendas
   ├── Gestão de promoções
   └── Relatórios de vendas

6. 🏍️ GESTÃO DE VEÍCULOS
   ├── Registo/edição/remoção de veículos
   ├── Verificações e inspeções
   ├── Histórico de manutenções
   └── Documentação de veículos

7. ⚙️ CONFIGURAÇÕES DO SISTEMA
   ├── Alterações de configurações gerais
   ├── Gestão de utilizadores admin
   ├── Modificações de permissões
   ├── Backups e restauros
   └── Atualizações do sistema

8. 📊 RELATÓRIOS E ANALYTICS
   ├── Geração de relatórios
   ├── Exportação de dados
   ├── Consultas de dados sensíveis
   └── Análises de performance

9. 📧 COMUNICAÇÕES
   ├── Envio de emails/SMS
   ├── Notificações push
   ├── Alterações de templates
   └── Gestão de newsletters

10. 🗄️ OPERAÇÕES DE DADOS
    ├── Importação/exportação de dados
    ├── Operações de backup
    ├── Sincronizações
    └── Migrações de dados

11. 🔧 MANUTENÇÃO E SUPORTE
    ├── Operações de manutenção
    ├── Logs de erros e exceções
    ├── Performance e monitorização
    └── Suporte técnico
```

### Controlo de Acesso Hierárquico
```
🔴 SUPER ADMIN
├── ✅ Acesso TOTAL a todos os logs
├── ✅ Configuração de políticas de auditoria
├── ✅ Gestão de retenção de dados
├── ✅ Exportação completa de logs
└── ✅ Configuração de alertas críticos

🟠 PRESIDENTE
├── ✅ Logs financeiros (todos)
├── ✅ Logs de gestão de membros
├── ✅ Logs de eventos importantes
├── ✅ Relatórios executivos
├── ✅ Logs de configurações críticas
└── ❌ Logs técnicos detalhados

🟡 TESOUREIRO
├── ✅ Logs financeiros (todos)
├── ✅ Logs de produtos/loja
├── ✅ Logs de pagamentos
├── ✅ Logs de aprovações financeiras
├── ✅ Relatórios financeiros
└── ❌ Logs de gestão de membros (limitado)

🔵 SECRETÁRIO
├── ✅ Logs de gestão de membros
├── ✅ Logs de eventos
├── ✅ Logs de comunicações
├── ✅ Relatórios de atividades
└── ❌ Logs financeiros (apenas visualização básica)

🟢 DIREÇÃO (outros cargos)
├── ✅ Logs da sua área específica
├── ✅ Logs de eventos
├── ✅ Logs de comunicações gerais
└── ❌ Logs financeiros/membros sensíveis

🔵 SÓCIOS
├── ✅ Próprios logs apenas
├── ✅ Histórico de atividades pessoais
├── ✅ Logs de participações em eventos
└── ❌ Logs de outros utilizadores

⚫ CLIENTES
├── ✅ Próprios logs de compras apenas
├── ✅ Histórico de encomendas
└── ❌ Todos os outros logs
```

### Estrutura da Base de Dados

#### Tabela Principal de Logs
```sql
CREATE TABLE system_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Informações do utilizador
  user_id UUID REFERENCES users(id),
  user_email VARCHAR(255),
  user_role VARCHAR(50),
  session_id VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  
  -- Categorização da ação
  category VARCHAR(50) NOT NULL, -- 'authentication', 'member_management', etc.
  action VARCHAR(100) NOT NULL, -- 'login', 'create_product', etc.
  resource_type VARCHAR(50), -- 'user', 'product', 'event', etc.
  resource_id VARCHAR(255), -- ID do recurso afetado
  
  -- Detalhes da ação
  description TEXT NOT NULL,
  old_values JSONB, -- Valores anteriores (para updates)
  new_values JSONB, -- Novos valores
  metadata JSONB, -- Informações adicionais
  
  -- Contexto técnico
  request_method VARCHAR(10), -- GET, POST, PUT, DELETE
  request_url TEXT,
  response_status INTEGER,
  execution_time_ms INTEGER,
  
  -- Classificação de segurança
  severity VARCHAR(20) DEFAULT 'info', -- 'low', 'medium', 'high', 'critical'
  is_sensitive BOOLEAN DEFAULT FALSE,
  requires_attention BOOLEAN DEFAULT FALSE,
  
  -- Indexação e busca
  search_vector tsvector,
  tags TEXT[],
  
  CONSTRAINT valid_severity CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  CONSTRAINT valid_category CHECK (category IN (
    'authentication', 'member_management', 'financial', 'events',
    'store', 'vehicles', 'system_config', 'reports', 'communications',
    'data_operations', 'maintenance'
  ))
);

-- Índices para performance
CREATE INDEX idx_audit_logs_timestamp ON system_audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_user_id ON system_audit_logs(user_id);
CREATE INDEX idx_audit_logs_category ON system_audit_logs(category);
CREATE INDEX idx_audit_logs_action ON system_audit_logs(action);
CREATE INDEX idx_audit_logs_severity ON system_audit_logs(severity);
CREATE INDEX idx_audit_logs_sensitive ON system_audit_logs(is_sensitive);
CREATE INDEX idx_audit_logs_resource ON system_audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_search ON system_audit_logs USING gin(search_vector);
CREATE INDEX idx_audit_logs_tags ON system_audit_logs USING gin(tags);
```

#### Tabela de Regras de Acesso
```sql
CREATE TABLE audit_log_access_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role VARCHAR(50) NOT NULL,
  category VARCHAR(50) NOT NULL,
  can_view BOOLEAN DEFAULT FALSE,
  can_export BOOLEAN DEFAULT FALSE,
  view_own_only BOOLEAN DEFAULT FALSE,
  max_days_back INTEGER, -- Limitação temporal
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(role, category)
);

-- Dados iniciais das regras
INSERT INTO audit_log_access_rules (role, category, can_view, can_export, view_own_only, max_days_back) VALUES
-- Super Admin - acesso total
('super_admin', 'authentication', true, true, false, null),
('super_admin', 'member_management', true, true, false, null),
('super_admin', 'financial', true, true, false, null),
('super_admin', 'events', true, true, false, null),
('super_admin', 'store', true, true, false, null),
('super_admin', 'vehicles', true, true, false, null),
('super_admin', 'system_config', true, true, false, null),
('super_admin', 'reports', true, true, false, null),
('super_admin', 'communications', true, true, false, null),
('super_admin', 'data_operations', true, true, false, null),
('super_admin', 'maintenance', true, true, false, null),

-- Presidente - acesso executivo
('president', 'authentication', true, true, false, 365),
('president', 'member_management', true, true, false, 365),
('president', 'financial', true, true, false, 365),
('president', 'events', true, true, false, 365),
('president', 'store', true, false, false, 90),
('president', 'vehicles', true, false, false, 90),
('president', 'system_config', true, false, false, 30),
('president', 'reports', true, true, false, 365),
('president', 'communications', true, false, false, 90),

-- Tesoureiro - foco financeiro
('treasurer', 'financial', true, true, false, 365),
('treasurer', 'store', true, true, false, 365),
('treasurer', 'events', true, false, false, 90),
('treasurer', 'member_management', true, false, false, 30),
('treasurer', 'reports', true, true, false, 365),

-- Secretário - foco em membros e eventos
('secretary', 'member_management', true, true, false, 365),
('secretary', 'events', true, true, false, 365),
('secretary', 'communications', true, true, false, 180),
('secretary', 'vehicles', true, false, false, 180),
('secretary', 'reports', true, true, false, 180),
('secretary', 'financial', true, false, false, 30), -- apenas visualização básica

-- Sócios - apenas próprios dados
('member', 'authentication', true, false, true, 90),
('member', 'member_management', true, false, true, 365),
('member', 'events', true, false, true, 365),
('member', 'store', true, false, true, 180),
('member', 'vehicles', true, false, true, 365),

-- Clientes - muito limitado
('client', 'authentication', true, false, true, 30),
('client', 'store', true, false, true, 90);
```

#### Tabela de Alertas de Auditoria
```sql
CREATE TABLE audit_alert_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Condições do alerta
  category VARCHAR(50),
  action VARCHAR(100),
  severity VARCHAR(20),
  user_role VARCHAR(50),
  
  -- Filtros avançados
  conditions JSONB, -- Condições complexas em JSON
  
  -- Configuração do alerta
  is_active BOOLEAN DEFAULT TRUE,
  alert_method VARCHAR(50) DEFAULT 'email', -- 'email', 'push', 'both'
  recipients TEXT[], -- Lista de emails/IDs para notificar
  
  -- Controle de spam
  cooldown_minutes INTEGER DEFAULT 60,
  max_alerts_per_hour INTEGER DEFAULT 5,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Alertas críticos padrão
INSERT INTO audit_alert_rules (name, description, category, severity, alert_method, recipients, cooldown_minutes) VALUES
('Falhas de Login Críticas', 'Múltiplas tentativas de login falhadas', 'authentication', 'critical', 'both', ARRAY['admin@mourosmotohub.pt'], 5),
('Alterações Financeiras Críticas', 'Modificações em valores financeiros altos', 'financial', 'critical', 'email', ARRAY['tesoureiro@mourosmotohub.pt'], 15),
('Acessos Administrativos', 'Operações com privilégios administrativos', 'system_config', 'high', 'email', ARRAY['admin@mourosmotohub.pt'], 30),
('Exportação de Dados Sensíveis', 'Exportação de grandes volumes de dados', 'data_operations', 'high', 'email', ARRAY['admin@mourosmotohub.pt', 'presidente@mourosmotohub.pt'], 60);
```

### Sistema de Alertas Automáticos

#### Service de Alertas
```typescript
// types/audit.ts
export interface AuditLog {
  id: string;
  timestamp: Date;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  category: AuditCategory;
  action: string;
  resourceType?: string;
  resourceId?: string;
  description: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  metadata?: Record<string, any>;
  requestMethod?: string;
  requestUrl?: string;
  responseStatus?: number;
  executionTimeMs?: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isSensitive: boolean;
  requiresAttention: boolean;
  tags?: string[];
}

export type AuditCategory = 
  | 'authentication' 
  | 'member_management' 
  | 'financial' 
  | 'events' 
  | 'store' 
  | 'vehicles' 
  | 'system_config' 
  | 'reports' 
  | 'communications' 
  | 'data_operations' 
  | 'maintenance';

// services/auditService.ts
export class AuditService {
  async logActivity(auditData: Partial<AuditLog>): Promise<void> {
    try {
      // Sanitizar dados sensíveis se necessário
      const sanitizedData = this.sanitizeSensitiveData(auditData);
      
      // Inserir log na base de dados
      await this.insertAuditLog(sanitizedData);
      
      // Verificar se deve disparar alertas
      await this.checkAlertRules(sanitizedData);
      
    } catch (error) {
      console.error('Erro ao registar log de auditoria:', error);
      // Importante: não falhar a operação principal por causa do log
    }
  }

  private async checkAlertRules(auditData: Partial<AuditLog>): Promise<void> {
    const rules = await this.getActiveAlertRules();
    
    for (const rule of rules) {
      if (this.matchesAlertConditions(auditData, rule)) {
        await this.sendAlert(rule, auditData);
      }
    }
  }

  async getLogsForUser(
    userId: string, 
    userRole: string, 
    filters: AuditLogFilters
  ): Promise<AuditLog[]> {
    // Verificar permissões de acesso
    const accessRules = await this.getAccessRulesForRole(userRole);
    
    // Filtrar categorias permitidas
    const allowedCategories = accessRules
      .filter(rule => rule.canView)
      .map(rule => rule.category);
    
    // Aplicar filtros de tempo e propriedade
    const timeLimit = this.getTimeLimit(userRole);
    const ownDataOnly = this.requiresOwnDataOnly(userRole);
    
    return this.fetchFilteredLogs({
      ...filters,
      categories: allowedCategories,
      timeLimit,
      userId: ownDataOnly ? userId : undefined
    });
  }
}
```

#### Middleware de Auditoria
```typescript
// middleware/auditMiddleware.ts
export function auditMiddleware(req: NextRequest, res: NextResponse) {
  const startTime = Date.now();
  
  // Capturar informações da request
  const auditData: Partial<AuditLog> = {
    timestamp: new Date(),
    ipAddress: req.ip,
    userAgent: req.headers.get('user-agent'),
    requestMethod: req.method,
    requestUrl: req.url,
    sessionId: req.headers.get('x-session-id'),
  };

  // Hook para capturar resposta
  res.on('finish', async () => {
    auditData.responseStatus = res.status;
    auditData.executionTimeMs = Date.now() - startTime;
    
    // Determinar categoria e ação baseado na URL
    const { category, action } = this.categorizeRequest(req.url, req.method);
    auditData.category = category;
    auditData.action = action;
    
    // Determinar severidade
    auditData.severity = this.determineSeverity(auditData);
    
    // Registar log
    await auditService.logActivity(auditData);
  });
}
```

### Componentes React para Visualização

#### Dashboard de Auditoria
```tsx
// components/audit/AuditDashboard.tsx
export const AuditDashboard: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filters, setFilters] = useState<AuditFilters>({});
  const [stats, setStats] = useState<AuditStats | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadAuditData();
  }, [filters]);

  const loadAuditData = async () => {
    try {
      const [logsData, statsData] = await Promise.all([
        auditService.getLogsForUser(user.id, user.role, filters),
        auditService.getAuditStats(user.role, filters)
      ]);
      
      setLogs(logsData);
      setStats(statsData);
    } catch (error) {
      toast.error('Erro ao carregar dados de auditoria');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Auditoria do Sistema</h1>
        <Badge variant="outline">{user.role}</Badge>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats?.totalLogs}</div>
            <p className="text-sm text-muted-foreground">Total de Logs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats?.criticalEvents}</div>
            <p className="text-sm text-muted-foreground">Eventos Críticos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats?.warningEvents}</div>
            <p className="text-sm text-muted-foreground">Avisos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats?.activeUsers}</div>
            <p className="text-sm text-muted-foreground">Utilizadores Ativos</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <AuditFilters onFiltersChange={setFilters} userRole={user.role} />

      {/* Tabela de logs */}
      <AuditLogsTable logs={logs} onRefresh={loadAuditData} />
    </div>
  );
};
```

### Conformidade GDPR

#### Funcionalidades de Privacidade
```typescript
// services/gdprService.ts
export class GDPRComplianceService {
  // Mascarar dados sensíveis nos logs
  static maskSensitiveData(data: any, category: AuditCategory): any {
    const sensitiveFields = {
      'authentication': ['password', 'token', 'session'],
      'member_management': ['nif', 'phone', 'address'],
      'financial': ['card_number', 'iban', 'account_number']
    };

    const fieldsToMask = sensitiveFields[category] || [];
    
    return this.deepMaskFields(data, fieldsToMask);
  }

  // Anonimizar dados para utilizadores sem privilégios
  static anonymizeForRole(log: AuditLog, userRole: string): AuditLog {
    if (userRole === 'super_admin') return log;

    return {
      ...log,
      userEmail: this.shouldHideEmail(userRole) ? 'user@***' : log.userEmail,
      ipAddress: this.shouldHideIP(userRole) ? '*.*.*.***' : log.ipAddress,
      oldValues: this.maskSensitiveData(log.oldValues, log.category),
      newValues: this.maskSensitiveData(log.newValues, log.category)
    };
  }

  // Política de retenção de dados
  static async enforceRetentionPolicy(): Promise<void> {
    const retentionPeriods = {
      'authentication': 365, // 1 ano
      'financial': 2555, // 7 anos (legal)
      'member_management': 1095, // 3 anos
      'system_config': 1825, // 5 anos
      'default': 730 // 2 anos
    };

    for (const [category, days] of Object.entries(retentionPeriods)) {
      await this.deleteOldLogs(category, days);
    }
  }
}
```

### Implementação por Fases

#### Fase 1: Infraestrutura Base (1-2 semanas)
```
✅ Criação das tabelas de auditoria
✅ Middleware básico de logging
✅ Serviços core de auditoria
✅ Configuração de índices e performance
✅ Testes unitários básicos
```

#### Fase 2: Integração com Módulos Existentes (2-3 semanas)
```
🔄 Integração com sistema de autenticação
🔄 Logs do sistema de aprovação financeira
🔄 Auditoria de gestão de membros
🔄 Logs de eventos e atividades
🔄 Auditoria da loja online
```

#### Fase 3: Interface e Dashboards (2 semanas)
```
⏳ Dashboard principal de auditoria
⏳ Componentes de filtros avançados
⏳ Visualização de logs em tempo real
⏳ Relatórios de auditoria exportáveis
⏳ Interface de configuração de alertas
```

#### Fase 4: Funcionalidades Avançadas (1-2 semanas)
```
⏳ Sistema de alertas automáticos
⏳ Compliance GDPR completo
⏳ Analytics avançados
⏳ Integração com sistemas externos
⏳ Monitorização em tempo real
```

---

## 7. 🏗️ ESPECIFICAÇÕES TÉCNICAS E ARQUITETURA

### Stack Tecnológica Recomendada

#### Frontend
```
Framework: Next.js 14+ (React + TypeScript)
├── Styling: Tailwind CSS + Shadcn/ui components
├── State Management: Zustand ou Redux Toolkit
├── Formulários: React Hook Form + Zod validation
├── Tabelas: TanStack Table (React Table v8)
├── Gráficos: Recharts ou Chart.js
├── Mapas: Leaflet ou Google Maps API
├── Notificações: React Hot Toast
├── Data Fetching: TanStack Query (React Query)
├── Routing: Next.js App Router
└── PWA: next-pwa para funcionalidades offline

Build & Deploy:
├── Vercel (recomendado) ou Netlify
├── Docker containerization
├── CI/CD: GitHub Actions
└── CDN: Cloudflare ou Vercel Edge Network
```

#### Backend
```
Runtime: Node.js 18+ com TypeScript
├── Framework: Next.js API Routes + tRPC (type-safe API)
├── Database: PostgreSQL 15+ (Supabase recomendado)
├── ORM: Prisma ou Drizzle ORM
├── Authentication: NextAuth.js v5 ou Supabase Auth
├── File Storage: Supabase Storage ou AWS S3
├── Email: Resend ou SendGrid
├── SMS: Twilio (opcional)
├── Payments: Stripe ou MB Way API
├── Cron Jobs: Vercel Cron ou GitHub Actions
└── Validation: Zod schemas (shared frontend/backend)

Infraestrutura:
├── Database: Supabase (PostgreSQL managed)
├── File Storage: Supabase Storage
├── Real-time: Supabase Realtime (WebSockets)
├── Backup: Automated daily backups
└── Monitoring: Sentry + Vercel Analytics
```

#### Dependências Principais
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.0.0",
    "@supabase/supabase-js": "^2.0.0",
    "prisma": "^5.0.0",
    "@trpc/server": "^10.0.0",
    "@trpc/client": "^10.0.0",
    "@tanstack/react-query": "^5.0.0",
    "zod": "^3.0.0",
    "react-hook-form": "^7.0.0",
    "zustand": "^4.0.0",
    "@radix-ui/react-*": "^1.0.0",
    "lucide-react": "^0.300.0",
    "stripe": "^14.0.0",
    "resend": "^2.0.0"
  }
}
```

### Arquitetura do Sistema

#### Estrutura de Pastas (Next.js App Router)
```
src/
├── app/                          # App Router (Next.js 14)
│   ├── (auth)/                   # Route groups para auth
│   │   ├── login/
│   │   └── register/
│   ├── (public)/                 # Landing page pública
│   │   ├── page.tsx
│   │   ├── eventos/
│   │   ├── loja/
│   │   └── contactos/
│   ├── (protected)/              # Área de membros (middleware protegido)
│   │   ├── dashboard/
│   │   ├── perfil/
│   │   ├── mensalidades/
│   │   ├── eventos/
│   │   └── loja/
│   ├── (admin)/                  # Área administrativa
│   │   ├── dashboard/
│   │   ├── socios/
│   │   ├── financeiro/
│   │   ├── aprovacoes/           # Sistema de aprovação financeira
│   │   └── configuracoes/
│   ├── api/                      # API Routes
│   │   ├── auth/
│   │   ├── members/
│   │   ├── events/
│   │   ├── products/
│   │   ├── financial-approvals/  # Endpoints aprovação financeira
│   │   ├── payments/
│   │   └── trpc/[trpc]/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/                   # Componentes reutilizáveis
│   ├── ui/                       # Shadcn/ui components
│   ├── forms/                    # Formulários específicos
│   ├── dashboards/               # Dashboards por tipo de usuário
│   ├── financial-approval/       # Componentes do sistema de aprovação
│   └── layout/                   # Header, Footer, Navigation
├── lib/                          # Utilitários e configurações
│   ├── auth.ts                   # Configuração NextAuth
│   ├── database.ts               # Cliente Prisma/Supabase
│   ├── validations.ts            # Schemas Zod
│   ├── utils.ts                  # Funções utilitárias
│   └── types.ts                  # Tipos TypeScript
├── hooks/                        # Custom React hooks
├── store/                        # Estado global (Zustand)
├── server/                       # tRPC routers e procedures
│   ├── routers/
│   ├── middleware/
│   └── trpc.ts
└── styles/                       # CSS adicional
```

#### Database Schema (PostgreSQL)
```sql
-- Utilizadores e Autenticação
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'cliente',
  member_number INTEGER UNIQUE, -- Apenas para sócios
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  profile_image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Perfis de Utilizador
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  birth_date DATE,
  address TEXT,
  postal_code VARCHAR(10),
  city VARCHAR(100),
  tax_number VARCHAR(20), -- NIF
  emergency_contact_name VARCHAR(200),
  emergency_contact_phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Veículos
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM NOW()) + 2),
  engine_size INTEGER NOT NULL, -- em cc
  license_plate VARCHAR(20) UNIQUE NOT NULL,
  color VARCHAR(50),
  vin VARCHAR(100), -- Vehicle Identification Number
  insurance_company VARCHAR(200),
  insurance_policy VARCHAR(100),
  insurance_expiry DATE,
  inspection_expiry DATE,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Mensalidades e Pagamentos
CREATE TABLE dues_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES users(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  payment_method payment_method_type,
  payment_reference VARCHAR(100), -- Referência MB, ID transação Stripe, etc.
  status payment_status DEFAULT 'pending',
  late_fee DECIMAL(10,2) DEFAULT 0.00,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(member_id, year)
);

-- Eventos
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  event_type event_type_enum NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  location VARCHAR(300),
  max_participants INTEGER,
  registration_fee DECIMAL(10,2) DEFAULT 0.00,
  registration_deadline TIMESTAMP,
  requires_vehicle BOOLEAN DEFAULT FALSE,
  status event_status DEFAULT 'draft',
  organizer_id UUID REFERENCES users(id),
  financial_approval_status approval_status DEFAULT 'pending',
  approval_id UUID REFERENCES financial_approvals(id),
  featured_image_url TEXT,
  contact_info TEXT,
  requirements TEXT, -- Equipamentos necessários, etc.
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Inscrições em Eventos
CREATE TABLE event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehicles(id),
  registration_date TIMESTAMP DEFAULT NOW(),
  status registration_status DEFAULT 'confirmed',
  payment_status payment_status DEFAULT 'pending',
  payment_amount DECIMAL(10,2),
  special_requirements TEXT,
  emergency_contact VARCHAR(300),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Produtos da Loja
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  short_description TEXT,
  sku VARCHAR(100) UNIQUE,
  category product_category NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  member_price DECIMAL(10,2), -- Preço especial para sócios
  cost_price DECIMAL(10,2), -- Preço de custo (apenas admin)
  stock_quantity INTEGER DEFAULT 0,
  min_stock_level INTEGER DEFAULT 0,
  max_stock_level INTEGER DEFAULT 1000,
  weight DECIMAL(8,2), -- Para cálculo de portes
  dimensions VARCHAR(50), -- LxWxH em cm
  is_digital BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  financial_approval_status approval_status DEFAULT 'pending',
  approval_id UUID REFERENCES financial_approvals(id),
  images JSONB, -- Array de URLs das imagens
  specifications JSONB, -- Especificações técnicas
  seo_title VARCHAR(200),
  seo_description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Pedidos/Encomendas
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID REFERENCES users(id),
  status order_status DEFAULT 'pending',
  subtotal DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0.00,
  shipping_cost DECIMAL(10,2) DEFAULT 0.00,
  tax_amount DECIMAL(10,2) DEFAULT 0.00,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method payment_method_type,
  payment_status payment_status DEFAULT 'pending',
  payment_reference VARCHAR(100),
  shipping_address JSONB, -- {name, address, postal_code, city, country}
  billing_address JSONB,
  tracking_number VARCHAR(100),
  shipped_date TIMESTAMP,
  delivered_date TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Items do Pedido
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sistema de Aprovação Financeira (já especificado anteriormente)
CREATE TABLE financial_approvals (
  -- ... (mantém o schema já definido)
);

CREATE TABLE approval_comments (
  -- ... (mantém o schema já definido)  
);

-- Logs de Atividade (Auditoria)
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL, -- 'create', 'update', 'delete', 'login', etc.
  entity_type VARCHAR(50) NOT NULL, -- 'user', 'event', 'product', 'payment', etc.
  entity_id UUID,
  old_values JSONB, -- Estado anterior (para updates/deletes)
  new_values JSONB, -- Estado novo (para creates/updates)
  ip_address INET,
  user_agent TEXT,
  session_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notificações
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  data JSONB, -- Dados adicionais (IDs relacionados, etc.)
  is_read BOOLEAN DEFAULT FALSE,
  is_email_sent BOOLEAN DEFAULT FALSE,
  is_push_sent BOOLEAN DEFAULT FALSE,
  priority notification_priority DEFAULT 'normal',
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Configurações do Sistema
CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE, -- Se pode ser lido por utilizadores normais
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Tipos Enum PostgreSQL
```sql
-- Tipos de utilizador
CREATE TYPE user_role AS ENUM (
  'visitante',
  'cliente', 
  'socio',
  'secretario',
  'tesoureiro',
  'presidente',
  'vice_presidente',
  'responsavel_eventos',
  'responsavel_comunicacao',
  'responsavel_tecnico',
  'responsavel_loja',
  'admin'
);

-- Métodos de pagamento
CREATE TYPE payment_method_type AS ENUM (
  'multibanco',
  'card',
  'paypal',
  'stripe',
  'mbway',
  'bank_transfer',
  'cash',
  'other'
);

-- Estados de pagamento
CREATE TYPE payment_status AS ENUM (
  'pending',
  'processing',
  'completed',
  'failed',
  'refunded',
  'cancelled'
);

-- Tipos de evento
CREATE TYPE event_type_enum AS ENUM (
  'passeio',
  'reuniao',
  'workshop',
  'corrida',
  'exposicao',
  'social',
  'manutencao',
  'outro'
);

-- Estados de evento
CREATE TYPE event_status AS ENUM (
  'draft',
  'published',
  'registration_open',
  'registration_closed',
  'in_progress',
  'completed',
  'cancelled'
);

-- Estado de inscrição
CREATE TYPE registration_status AS ENUM (
  'confirmed',
  'pending',
  'cancelled',
  'no_show'
);

-- Categorias de produto
CREATE TYPE product_category AS ENUM (
  'vestuario',
  'acessorios',
  'pecas',
  'ferramentas',
  'oleo_manutencao',
  'decoracao',
  'merchandising',
  'digital',
  'outro'
);

-- Estados de encomenda
CREATE TYPE order_status AS ENUM (
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded'
);

-- Estados de aprovação financeira
CREATE TYPE approval_status AS ENUM (
  'pending',
  'approved',
  'rejected',
  'in_review'
);

-- Tipos de notificação
CREATE TYPE notification_type AS ENUM (
  'system',
  'payment',
  'event',
  'order',
  'financial_approval',
  'membership',
  'general'
);

-- Prioridade de notificação
CREATE TYPE notification_priority AS ENUM (
  'low',
  'normal',
  'high',
  'urgent'
);
```

### Índices de Performance
```sql
-- Índices para otimização de queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_member_number ON users(member_number) WHERE member_number IS NOT NULL;
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = TRUE;

CREATE INDEX idx_vehicles_owner ON vehicles(owner_id);
CREATE INDEX idx_vehicles_active ON vehicles(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_vehicles_license_plate ON vehicles(license_plate);

CREATE INDEX idx_dues_member_year ON dues_payments(member_id, year);
CREATE INDEX idx_dues_status ON dues_payments(status);
CREATE INDEX idx_dues_due_date ON dues_payments(due_date);

CREATE INDEX idx_events_date ON events(start_date);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_organizer ON events(organizer_id);

CREATE INDEX idx_event_registrations_event ON event_registrations(event_id);
CREATE INDEX idx_event_registrations_user ON event_registrations(user_id);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = TRUE;

CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_date ON orders(created_at);

CREATE INDEX idx_financial_approvals_item ON financial_approvals(item_type, item_id);
CREATE INDEX idx_financial_approvals_status ON financial_approvals(status);
CREATE INDEX idx_financial_approvals_creator ON financial_approvals(created_by);

CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_date ON activity_logs(created_at);

CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_type ON notifications(type);
```
---

## 8. 🔐 SEGURANÇA E COMPLIANCE

### Autenticação e Autorização

#### Sistema de Autenticação
```typescript
// NextAuth.js v5 Configuration
import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Verificação segura com bcrypt
        const user = await verifyCredentials(credentials)
        return user || null
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.memberNumber = user.memberNumber
        token.isActive = user.isActive
      }
      return token
    },
    async session({ session, token }) {
      session.user.role = token.role
      session.user.memberNumber = token.memberNumber
      session.user.isActive = token.isActive
      return session
    }
  }
})
```

#### Middleware de Autorização
```typescript
// middleware.ts - Proteção de rotas
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

const ROLE_PERMISSIONS = {
  '/admin': ['admin', 'presidente', 'vice_presidente'],
  '/dashboard/financeiro': ['admin', 'tesoureiro', 'presidente'],
  '/dashboard/socios': ['admin', 'secretario', 'tesoureiro', 'presidente'],
  '/dashboard/aprovacoes': ['admin', 'tesoureiro', 'presidente'],
  '/dashboard/eventos/criar': ['admin', 'responsavel_eventos', 'presidente'],
  '/dashboard/loja/gerir': ['admin', 'responsavel_loja', 'presidente'],
}

export default auth((req) => {
  const { pathname } = req.nextUrl
  const userRole = req.auth?.user?.role
  
  // Verificar se a rota requer proteção
  for (const [route, allowedRoles] of Object.entries(ROLE_PERMISSIONS)) {
    if (pathname.startsWith(route)) {
      if (!userRole || !allowedRoles.includes(userRole)) {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
    }
  }
  
  return NextResponse.next()
})

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*', 
    '/api/admin/:path*',
    '/api/protected/:path*'
  ]
}
```

### Validação de Dados e Sanitização

#### Schemas Zod para Validação
```typescript
// lib/validations.ts
import { z } from 'zod'

// Validação de utilizador
export const userSchema = z.object({
  email: z.string().email("Email inválido"),
  username: z.string()
    .min(3, "Username deve ter pelo menos 3 caracteres")
    .max(20, "Username não pode ter mais de 20 caracteres")
    .regex(/^[a-zA-Z0-9_]+$/, "Username só pode conter letras, números e _"),
  password: z.string()
    .min(8, "Password deve ter pelo menos 8 caracteres")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password deve conter pelo menos uma letra minúscula, uma maiúscula e um número"),
  firstName: z.string().min(1, "Nome é obrigatório").max(100),
  lastName: z.string().min(1, "Apelido é obrigatório").max(100),
  phone: z.string().regex(/^[+]?[0-9\s\-\(\)]+$/, "Número de telefone inválido").optional(),
  taxNumber: z.string().regex(/^[0-9]{9}$/, "NIF deve ter 9 dígitos").optional(),
})

// Validação de veículo
export const vehicleSchema = z.object({
  brand: z.string().min(1, "Marca é obrigatória").max(100),
  model: z.string().min(1, "Modelo é obrigatório").max(100),
  year: z.number()
    .min(1900, "Ano deve ser posterior a 1900")
    .max(new Date().getFullYear() + 2, "Ano não pode ser muito futuro"),
  engineSize: z.number().min(50, "Cilindrada mínima 50cc").max(3000, "Cilindrada máxima 3000cc"),
  licensePlate: z.string()
    .regex(/^[A-Z0-9\-]+$/, "Matrícula inválida")
    .min(4, "Matrícula muito curta")
    .max(20, "Matrícula muito longa"),
})

// Validação de produto
export const productSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(200),
  description: z.string().optional(),
  price: z.number().min(0, "Preço deve ser positivo").max(10000, "Preço máximo €10.000"),
  memberPrice: z.number().min(0).max(10000).optional(),
  category: z.enum(['vestuario', 'acessorios', 'pecas', 'ferramentas', 'oleo_manutencao', 'decoracao', 'merchandising', 'digital', 'outro']),
  stockQuantity: z.number().min(0, "Stock não pode ser negativo"),
})

// Validação de evento
export const eventSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(200),
  description: z.string().optional(),
  startDate: z.date().min(new Date(), "Data deve ser futura"),
  endDate: z.date().optional(),
  location: z.string().min(1, "Local é obrigatório").max(300),
  maxParticipants: z.number().min(1, "Deve permitir pelo menos 1 participante").optional(),
  registrationFee: z.number().min(0, "Taxa deve ser positiva").max(1000, "Taxa máxima €1.000"),
  eventType: z.enum(['passeio', 'reuniao', 'workshop', 'corrida', 'exposicao', 'social', 'manutencao', 'outro']),
})

// Validação de aprovação financeira
export const financialApprovalSchema = z.object({
  itemType: z.enum(['product', 'event', 'membership_fee', 'penalty', 'expense']),
  itemId: z.string().uuid(),
  values: z.record(z.number().min(0)),
  justification: z.string().min(10, "Justificação deve ter pelo menos 10 caracteres").max(1000),
})
```

### Proteção de Dados (RGPD)

#### Políticas de Privacidade
```typescript
// Configuração RGPD
export const GDPR_SETTINGS = {
  // Dados que requerem consentimento explícito
  SENSITIVE_DATA: [
    'marketing_emails',
    'analytics_tracking', 
    'third_party_integrations',
    'location_tracking'
  ],
  
  // Períodos de retenção
  RETENTION_PERIODS: {
    'inactive_users': 365 * 3, // 3 anos
    'activity_logs': 365 * 7, // 7 anos (legal requirement)
    'financial_records': 365 * 10, // 10 anos
    'email_logs': 365 * 2, // 2 anos
  },
  
  // Dados que podem ser anonimizados vs eliminados
  ANONYMIZABLE_FIELDS: [
    'ip_address',
    'user_agent', 
    'session_data'
  ],
  
  DELETE_REQUIRED_FIELDS: [
    'email',
    'phone',
    'address',
    'tax_number'
  ]
}

// Função para anonimizar dados
export async function anonymizeUserData(userId: string) {
  await prisma.$transaction([
    // Anonimizar logs mantendo dados estatísticos
    prisma.activityLogs.updateMany({
      where: { userId },
      data: {
        ipAddress: null,
        userAgent: null,
        sessionId: null
      }
    }),
    
    // Eliminar dados pessoais mas manter registos financeiros
    prisma.userProfile.update({
      where: { userId },
      data: {
        firstName: 'DELETED_USER',
        lastName: '',
        phone: null,
        address: null,
        taxNumber: null,
        emergencyContactName: null,
        emergencyContactPhone: null
      }
    })
  ])
}
```

#### Consentimentos e Cookies
```typescript
// Gestão de consentimentos
export const COOKIE_CONSENT = {
  NECESSARY: {
    description: "Cookies essenciais para funcionamento do site",
    cookies: ['session', 'auth', 'csrf'],
    required: true
  },
  ANALYTICS: {
    description: "Cookies para análise de utilização",
    cookies: ['google-analytics', 'vercel-analytics'],
    required: false
  },
  MARKETING: {
    description: "Cookies para marketing e publicidade",
    cookies: ['facebook-pixel', 'google-ads'],
    required: false
  },
  PREFERENCES: {
    description: "Cookies para lembrar preferências",
    cookies: ['theme', 'language', 'layout'],
    required: false
  }
}
```

### Segurança de API

#### Rate Limiting
```typescript
// Rate limiting por IP e utilizador
import rateLimit from 'express-rate-limit'

export const createRateLimit = (windowMs: number, max: number) =>
  rateLimit({
    windowMs,
    max,
    message: {
      error: 'Muitos pedidos. Tente novamente mais tarde.',
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
  })

// Diferentes limites por endpoint
export const API_RATE_LIMITS = {
  '/api/auth/login': createRateLimit(15 * 60 * 1000, 5), // 5 tentativas por 15min
  '/api/auth/register': createRateLimit(60 * 60 * 1000, 3), // 3 tentativas por hora
  '/api/financial-approvals': createRateLimit(60 * 1000, 30), // 30 por minuto
  '/api/products': createRateLimit(60 * 1000, 100), // 100 por minuto
  '/api/events': createRateLimit(60 * 1000, 50), // 50 por minuto
  '/api/payments': createRateLimit(60 * 1000, 10), // 10 por minuto
}
```

#### Sanitização e Validação de Input
```typescript
// Middleware de sanitização
import DOMPurify from 'isomorphic-dompurify'
import validator from 'validator'

export function sanitizeInput(data: any): any {
  if (typeof data === 'string') {
    // Remover caracteres perigosos
    data = validator.escape(data)
    // Limpar HTML (se permitido)
    data = DOMPurify.sanitize(data)
    // Remover scripts
    data = data.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  } else if (Array.isArray(data)) {
    data = data.map(sanitizeInput)
  } else if (typeof data === 'object' && data !== null) {
    for (const key in data) {
      data[key] = sanitizeInput(data[key])
    }
  }
  return data
}

// Headers de segurança
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: https: blob:;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://*.supabase.co https://api.stripe.com;
    frame-src https://js.stripe.com;
  `.replace(/\s+/g, ' ').trim(),
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
}
```

### Backup e Recuperação

#### Estratégia de Backup
```typescript
// Configuração de backups automáticos
export const BACKUP_STRATEGY = {
  // Backup completo semanal (Domingos às 02:00)
  FULL_BACKUP: {
    schedule: '0 2 * * 0',
    retention: 12, // 12 semanas
    includes: ['users', 'profiles', 'vehicles', 'events', 'products', 'orders', 'financial_approvals']
  },
  
  // Backup incremental diário (todos os dias às 03:00)
  INCREMENTAL_BACKUP: {
    schedule: '0 3 * * *',
    retention: 30, // 30 dias
    includes: ['activity_logs', 'notifications', 'order_items']
  },
  
  // Backup crítico de dados financeiros (6h/6h)
  FINANCIAL_BACKUP: {
    schedule: '0 */6 * * *',
    retention: 90, // 90 dias
    includes: ['dues_payments', 'orders', 'financial_approvals', 'approval_comments']
  }
}

// Script de backup automatizado
export async function performBackup(type: 'full' | 'incremental' | 'financial') {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupName = `${type}-backup-${timestamp}`
  
  try {
    // Criar backup na Supabase
    const { data, error } = await supabase.rpc('create_backup', {
      backup_name: backupName,
      backup_type: type,
      tables: BACKUP_STRATEGY[type.toUpperCase() + '_BACKUP'].includes
    })
    
    if (error) throw error
    
    // Upload para storage externo (AWS S3 / Google Cloud)
    await uploadBackupToCloud(backupName, data)
    
    // Notificar administradores
    await notifyAdmins('backup_completed', { backupName, type })
    
    console.log(`✅ Backup ${type} concluído: ${backupName}`)
  } catch (error) {
    console.error(`❌ Erro no backup ${type}:`, error)
    await notifyAdmins('backup_failed', { type, error: error.message })
  }
}
```

### Monitoring e Logs

#### APM Configuration
```typescript
// Sentry configuration
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
  beforeSend(event) {
    // Filtrar informações sensíveis
    if (event.user) {
      delete event.user.email
      delete event.user.ip_address
    }
    return event
  },
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Prisma({ client: prisma }),
  ],
})

// Custom metrics tracking
export const metrics = {
  // Métricas de negócio
  trackUserRegistration: (userRole: string) => {
    Sentry.addBreadcrumb({
      category: 'business',
      message: 'User registered',
      data: { userRole },
      level: 'info'
    })
  },

  trackFinancialApproval: (itemType: string, amount: number, approved: boolean) => {
    Sentry.addBreadcrumb({
      category: 'financial',
      message: 'Financial approval processed',
      data: { itemType, amount, approved },
      level: approved ? 'info' : 'warning'
    })
  },

  trackEventRegistration: (eventId: string, participantCount: number) => {
    Sentry.addBreadcrumb({
      category: 'events',
      message: 'Event registration',
      data: { eventId, participantCount },
      level: 'info'
    })
  },

  // Métricas de performance
  trackSlowQuery: (query: string, duration: number) => {
    if (duration > 1000) { // Queries > 1s
      Sentry.captureMessage(`Slow database query: ${duration}ms`, 'warning')
    }
  }
}

// Health check endpoint
// app/api/health/route.ts
export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      database: await checkDatabase(),
      storage: await checkStorage(),
      cache: await checkCache(),
      email: await checkEmailService()
    }
  }

  const allHealthy = Object.values(health.checks).every(check => check.status === 'healthy')
  
  return new Response(JSON.stringify(health), {
    status: allHealthy ? 200 : 503,
    headers: { 'Content-Type': 'application/json' }
  })
}

async function checkDatabase() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return { status: 'healthy', responseTime: Date.now() }
  } catch (error) {
    return { status: 'unhealthy', error: error.message }
  }
}

async function checkStorage() {
  try {
    const { data, error } = await supabase.storage.from('public').list()
    return error ? { status: 'unhealthy', error: error.message } : { status: 'healthy' }
  } catch (error) {
    return { status: 'unhealthy', error: error.message }
  }
}

async function checkCache() {
  try {
    await redis.ping()
    return { status: 'healthy' }
  } catch (error) {
    return { status: 'unhealthy', error: error.message }
  }
}

async function checkEmailService() {
  try {
    // Simular verificação do serviço de email
    return { status: 'healthy' }
  } catch (error) {
    return { status: 'unhealthy', error: error.message }
  }
}
```

---

## 8. 🗄️ ESTRUTURA DA BASE DE DADOS

### Visão Geral
O sistema utiliza **Supabase** (PostgreSQL) como base de dados principal, implementando Row Level Security (RLS) e extensões UUID para garantir segurança e performance otimizada.

### Configuração da Base de Dados

#### Extensões Necessárias
```sql
-- Extensão para geração de UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Extensão para criptografia (se necessário)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

#### Configurações de Segurança
- **Row Level Security (RLS)** ativado em todas as tabelas
- **Políticas específicas** por tipo de utilizador
- **Auditoria automática** através de triggers
- **Backup automático** configurado

### Enumerações Personalizadas (ENUM Types)

```sql
-- Tipos de utilizador
CREATE TYPE user_role AS ENUM ('admin', 'member', 'pending');

-- Tipos sanguíneos
CREATE TYPE blood_type AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');

-- Tipos de membro
CREATE TYPE member_type AS ENUM ('Sócio Adulto', 'Sócio Criança', 'Administração', 'Convidado');

-- Tipos de veículo
CREATE TYPE vehicle_type AS ENUM ('Mota', 'Moto-quatro', 'Buggy');

-- Tamanhos de produto
CREATE TYPE product_size AS ENUM ('S', 'M', 'L', 'XL', 'XXL', 'Único');

-- Tipos de produto
CREATE TYPE product_type AS ENUM ('T-Shirt', 'Caneca', 'Boné', 'Pin', 'Patch', 'Adesivo', 'Outro');

-- Cargos administrativos
CREATE TYPE admin_role AS ENUM ('Presidente', 'Vice-Presidente', 'Tesoureiro', 'Secretária', 'Dir. Eventos', 'Dir. Marketing', 'Dir. Património');

-- Estados administrativos
CREATE TYPE admin_status AS ENUM ('Ativo', 'Inativo', 'Licença');
```

### Tabelas Principais

#### 1. **members** - Informações dos Membros
```sql
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_number TEXT,
  name TEXT NOT NULL,
  nickname TEXT,
  email TEXT UNIQUE NOT NULL,
  phone_main TEXT,
  phone_alternative TEXT,
  blood_type blood_type,
  member_type member_type DEFAULT 'Sócio Adulto',
  join_date DATE DEFAULT CURRENT_DATE,
  
  -- Flags booleanas
  legacy_member BOOLEAN DEFAULT false,
  honorary_member BOOLEAN DEFAULT false,
  registration_fee_paid BOOLEAN DEFAULT false,
  registration_fee_exempt BOOLEAN DEFAULT false,
  in_whatsapp_group BOOLEAN DEFAULT false,
  received_member_kit BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  is_admin BOOLEAN DEFAULT false,
  
  photo_url TEXT,
  username VARCHAR(50) UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read own data" ON members FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admin full access" ON members FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles_view WHERE id = auth.uid() AND is_admin = true)
);
```

#### 2. **profiles** - Perfis de Utilizador (Autenticação)
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role user_role DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
```

#### 3. **user_profiles_view** - Vista Combinada de Utilizadores
```sql
CREATE VIEW user_profiles_view AS
SELECT 
  p.*,
  u.last_sign_in_at,
  u.raw_user_meta_data as metadata,
  m.id as member_id,
  m.member_number,
  m.is_admin
FROM profiles p
LEFT JOIN auth.users u ON u.id = p.id
LEFT JOIN members m ON m.email = p.email;
```

#### 4. **settings** - Configurações do Sistema
```sql
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(255) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policy
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access" ON settings FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles_view WHERE id = auth.uid() AND is_admin = true)
);
```

### Loja e Artigos

#### 5. **store_products** - Produtos da Loja
```sql
CREATE TABLE store_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  price NUMERIC(10,2) NOT NULL,
  size product_size DEFAULT 'Único',
  type product_type DEFAULT 'Outro',
  
  -- Flags
  members_only BOOLEAN DEFAULT false,
  published_on_landing_page BOOLEAN DEFAULT false,
  
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE store_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON store_products FOR SELECT USING (true);
CREATE POLICY "Admin manage products" ON store_products FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles_view WHERE id = auth.uid() AND is_admin = true)
);
```

#### 6. **bar_products** - Produtos do Bar
```sql
CREATE TABLE bar_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  unit_of_measure TEXT DEFAULT 'unidade',
  price NUMERIC(10,2) NOT NULL,
  stock INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 0,
  inventory_id UUID REFERENCES inventory(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Bar → Vendas e Inventário

#### 7. **bar_sales** - Vendas do Bar
```sql
CREATE TABLE bar_sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES members(id),
  seller_name TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  total NUMERIC(10,2) NOT NULL,
  amount_paid NUMERIC(10,2) NOT NULL,
  change NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 8. **bar_sale_items** - Itens de Venda
```sql
CREATE TABLE bar_sale_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID REFERENCES bar_sales(id) ON DELETE CASCADE,
  product_id UUID REFERENCES bar_products(id),
  product_name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  quantity INTEGER NOT NULL,
  total NUMERIC(10,2) NOT NULL,
  unit_of_measure TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 9. **inventory** - Inventário
```sql
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  quantity INTEGER DEFAULT 0,
  unit_of_measure TEXT DEFAULT 'unidade',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 10. **inventory_log** - Log de Inventário
```sql
CREATE TABLE inventory_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inventory_id UUID REFERENCES inventory(id) ON DELETE CASCADE,
  previous_quantity INTEGER NOT NULL,
  new_quantity INTEGER NOT NULL,
  change_reason TEXT,
  user_id UUID REFERENCES members(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Eventos e Inscrições

#### 11. **events** - Eventos
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  poster_url TEXT,
  thumbnail_url TEXT,
  location TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  
  -- Flags
  registration_open BOOLEAN DEFAULT true,
  members_only BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT true,
  
  minimum_participants INTEGER DEFAULT 0,
  maximum_participants INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 12. **event_schedule** - Cronograma dos Eventos
```sql
CREATE TABLE event_schedule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 13. **event_stops** - Paragens dos Eventos
```sql
CREATE TABLE event_stops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  photo_url TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 14. **event_registrations** - Inscrições em Eventos
```sql
CREATE TABLE event_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id),
  vehicle_id UUID REFERENCES vehicles(id),
  
  -- Para participantes externos
  external_name TEXT,
  external_email TEXT,
  external_phone TEXT,
  
  registration_date TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'confirmed',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Pagamentos de Quotas e Taxas

#### 15. **dues_payments** - Pagamentos de Quotas (Principal)
```sql
CREATE TABLE dues_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  paid BOOLEAN DEFAULT false,
  payment_date DATE,
  exempt BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(member_id, year)
);
```

#### 16. **fee_payments** - Pagamentos Detalhados por Ano
```sql
CREATE TABLE fee_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  payment_date TIMESTAMPTZ DEFAULT NOW(),
  amount NUMERIC(10,2) NOT NULL,
  payment_method VARCHAR(50),
  notes TEXT,
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(member_id, year)
);
```

#### 17. **member_fee_settings** - Configurações de Mensalidades por Membro
```sql
CREATE TABLE member_fee_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  join_date TIMESTAMPTZ NOT NULL,
  exempt_periods JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Club e Administração

#### 18. **club_settings** - Configurações do Clube
```sql
CREATE TABLE club_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL DEFAULT 'Mouros Moto Hub',
  short_name TEXT,
  address TEXT,
  email TEXT,
  phone TEXT,
  description TEXT,
  welcome_message TEXT,
  logo_url TEXT,
  banner_url TEXT,
  founding_date TIMESTAMPTZ,
  fee_start_date TIMESTAMPTZ,
  
  -- Cores
  primary_color VARCHAR(7) DEFAULT '#000000',
  secondary_color VARCHAR(7) DEFAULT '#ffffff',
  accent_color VARCHAR(7) DEFAULT '#ff0000',
  text_color VARCHAR(7) DEFAULT '#000000',
  
  annual_fee NUMERIC(10,2) DEFAULT 50.00,
  inactive_periods JSONB DEFAULT '[]',
  social_media JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 19. **administration** - Administração do Clube
```sql
CREATE TABLE administration (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  role admin_role NOT NULL,
  status admin_status DEFAULT 'Ativo',
  term TEXT,
  term_start DATE,
  term_end DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Log de Atividade

#### 20. **activity_logs** - Logs de Atividade do Sistema
```sql
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT, -- Pode ser UUID ou string
  username TEXT,
  action VARCHAR(50) NOT NULL, -- CREATE, UPDATE, DELETE, VIEW
  entity_type VARCHAR(50), -- MEMBER, VEHICLE, EVENT, etc.
  entity_id TEXT,
  details JSONB DEFAULT '{}',
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_date ON activity_logs(created_at);
```

### Índices de Performance Adicionais
```sql
-- Membros
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_member_number ON members(member_number);
CREATE INDEX idx_members_active ON members(is_active) WHERE is_active = true;
CREATE INDEX idx_members_admin ON members(is_admin) WHERE is_admin = true;

-- Eventos
CREATE INDEX idx_events_date ON events(start_date);
CREATE INDEX idx_events_published ON events(published) WHERE published = true;
CREATE INDEX idx_event_registrations_event ON event_registrations(event_id);
CREATE INDEX idx_event_registrations_member ON event_registrations(member_id);

-- Pagamentos
CREATE INDEX idx_dues_payments_member_year ON dues_payments(member_id, year);
CREATE INDEX idx_dues_payments_year ON dues_payments(year);
CREATE INDEX idx_fee_payments_member_year ON fee_payments(member_id, year);

-- Produtos
CREATE INDEX idx_store_products_published ON store_products(published_on_landing_page) WHERE published_on_landing_page = true;
CREATE INDEX idx_bar_products_stock ON bar_products(stock);

-- Vendas
CREATE INDEX idx_bar_sales_date ON bar_sales(timestamp);
CREATE INDEX idx_bar_sales_seller ON bar_sales(seller_id);
```

### Triggers de Auditoria
```sql
-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar triggers às tabelas principais
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_store_products_updated_at BEFORE UPDATE ON store_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_club_settings_updated_at BEFORE UPDATE ON club_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 9. 📊 RELATÓRIOS E ANALYTICS

### Dashboard de Administração
O sistema fornece relatórios em tempo real sobre:

#### Métricas de Membros
- **Total de membros ativos/inativos**
- **Novos registos por mês**
- **Taxa de renovação de mensalidades**
- **Distribuição geográfica**
- **Distribuição por idade de motociclos**

#### Métricas Financeiras
- **Receitas de mensalidades por ano**
- **Pagamentos em atraso**
- **Previsão de receitas**
- **Análise de isenções**
- **Comparação ano-a-ano**

#### Logs de Sistema
- **Atividades por utilizador**
- **Erros e avisos**
- **Performance de queries**
- **Tentativas de acesso não autorizadas**

### Exportação de Dados
- **Formato Excel** para relatórios financeiros
- **PDF** para documentos oficiais
- **CSV** para análise externa
- **JSON** para integrações API

---

## 10. 📋 PADRÕES DE DESENVOLVIMENTO E BOAS PRÁTICAS

### Estrutura de Código

#### Convenções de Nomenclatura
```typescript
// Arquivos e pastas
components/         // PascalCase para componentes
hooks/             // camelCase com prefixo use
utils/             // camelCase para utilitários
types/             // camelCase terminado em .types.ts
constants/         // UPPER_SNAKE_CASE

// Variáveis e funções
const userName = 'João'           // camelCase
const API_ENDPOINT = '/api/v1'    // UPPER_SNAKE_CASE para constantes
const getUserById = async () => {} // camelCase para funções

// Componentes React
const MemberProfile = () => {}     // PascalCase
const useUserAuth = () => {}       // camelCase com prefixo use

// Types e Interfaces
interface User {                   // PascalCase
  id: string
  name: string
}

type UserRole = 'admin' | 'member' // PascalCase
```

#### Estrutura de Componentes
```typescript
// components/MemberProfile/MemberProfile.tsx
import React from 'react'
import { cn } from '@/lib/utils'
import { UserRole } from '@/types/auth.types'
import styles from './MemberProfile.module.css'

interface MemberProfileProps {
  userId: string
  role: UserRole
  className?: string
  onEdit?: () => void
}

export const MemberProfile: React.FC<MemberProfileProps> = ({
  userId,
  role,
  className,
  onEdit
}) => {
  // 1. Hooks no topo
  const { user, loading, error } = useUser(userId)
  const { canEdit } = usePermissions(role)
  
  // 2. Handlers
  const handleEditClick = useCallback(() => {
    onEdit?.()
  }, [onEdit])
  
  // 3. Early returns para loading/error
  if (loading) return <MemberProfileSkeleton />
  if (error) return <ErrorDisplay error={error} />
  if (!user) return <NotFound />
  
  // 4. Render principal
  return (
    <div className={cn(styles.container, className)}>
      <div className={styles.header}>
        <h2>{user.name}</h2>
        {canEdit && (
          <button onClick={handleEditClick}>
            Editar
          </button>
        )}
      </div>
      <div className={styles.content}>
        {/* Conteúdo do componente */}
      </div>
    </div>
  )
}

// Exportar também como default para lazy loading
export default MemberProfile
```

#### Error Handling Patterns
```typescript
// lib/error-handling.ts
export class AppError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super(`Validation Error: ${message}`, 400)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403)
    this.name = 'AuthorizationError'
  }
}

// Error boundary para React
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    // Enviar para serviço de monitoramento
    Sentry.captureException(error, {
      contexts: { react: errorInfo }
    })
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />
    }

    return this.props.children
  }
}
```

### Padrões de API

#### Response Patterns
```typescript
// types/api.types.ts
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  meta?: {
    total?: number
    page?: number
    limit?: number
    hasNext?: boolean
    hasPrev?: boolean
  }
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    total: number
    page: number
    limit: number
    hasNext: boolean
    hasPrev: boolean
    totalPages: number
  }
}

// lib/api-response.ts
export const createApiResponse = <T>(
  data: T,
  success: boolean = true,
  meta?: any
): ApiResponse<T> => ({
  success,
  data,
  meta
})

export const createErrorResponse = (
  error: string,
  statusCode: number = 500
): ApiResponse => ({
  success: false,
  error
})

export const createPaginatedResponse = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> => ({
  success: true,
  data,
  meta: {
    total,
    page,
    limit,
    hasNext: (page * limit) < total,
    hasPrev: page > 1,
    totalPages: Math.ceil(total / limit)
  }
})
```

#### Middleware Patterns
```typescript
// middleware/auth-middleware.ts
export const withAuth = (handler: NextApiHandler, requiredRole?: UserRole) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '')
      
      if (!token) {
        return res.status(401).json(createErrorResponse('Token required', 401))
      }

      const user = await verifyToken(token)
      
      if (!user) {
        return res.status(401).json(createErrorResponse('Invalid token', 401))
      }

      if (requiredRole && !hasPermission(user.role, requiredRole)) {
        return res.status(403).json(createErrorResponse('Insufficient permissions', 403))
      }

      // Adicionar user ao request
      (req as any).user = user
      
      return handler(req, res)
    } catch (error) {
      console.error('Auth middleware error:', error)
      return res.status(401).json(createErrorResponse('Authentication failed', 401))
    }
  }
}

// Uso
export default withAuth(async (req, res) => {
  const user = (req as any).user
  // Handler protegido
}, 'admin')
```

### Testing Patterns

#### Unit Testing
```typescript
// __tests__/components/MemberProfile.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemberProfile } from '@/components/MemberProfile'
import { useUser } from '@/hooks/useUser'

// Mock hooks
jest.mock('@/hooks/useUser')
const mockUseUser = useUser as jest.MockedFunction<typeof useUser>

describe('MemberProfile', () => {
  const defaultProps = {
    userId: 'user-1',
    role: 'member' as const,
    onEdit: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders user information correctly', async () => {
    mockUseUser.mockReturnValue({
      user: { id: 'user-1', name: 'João Silva', email: 'joao@test.com' },
      loading: false,
      error: null
    })

    render(<MemberProfile {...defaultProps} />)
    
    expect(screen.getByText('João Silva')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    mockUseUser.mockReturnValue({
      user: null,
      loading: true,
      error: null
    })

    render(<MemberProfile {...defaultProps} />)
    
    expect(screen.getByTestId('member-profile-skeleton')).toBeInTheDocument()
  })

  it('calls onEdit when edit button is clicked', async () => {
    mockUseUser.mockReturnValue({
      user: { id: 'user-1', name: 'João Silva', email: 'joao@test.com' },
      loading: false,
      error: null
    })

    render(<MemberProfile {...defaultProps} role="admin" />)
    
    const editButton = screen.getByText('Editar')
    fireEvent.click(editButton)
    
    expect(defaultProps.onEdit).toHaveBeenCalledTimes(1)
  })
})
```

#### Integration Testing
```typescript
// __tests__/api/members.test.ts
import { createMocks } from 'node-mocks-http'
import handler from '@/pages/api/members'
import { prismaMock } from '@/lib/prisma-mock'

describe('/api/members', () => {
  it('returns members list for authenticated admin', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      headers: {
        authorization: 'Bearer valid-admin-token'
      }
    })

    const mockMembers = [
      { id: '1', name: 'João', email: 'joao@test.com' },
      { id: '2', name: 'Maria', email: 'maria@test.com' }
    ]

    prismaMock.member.findMany.mockResolvedValue(mockMembers)

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(data.success).toBe(true)
    expect(data.data).toEqual(mockMembers)
  })

  it('returns 401 for unauthenticated requests', async () => {
    const { req, res } = createMocks({
      method: 'GET'
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(401)
    const data = JSON.parse(res._getData())
    expect(data.success).toBe(false)
    expect(data.error).toBe('Token required')
  })
})
```

---

## 11. 🔄 SISTEMA DE VERSIONAMENTO E CHANGELOG

### Versionamento Semântico

#### Padrão de Versões
```
MAJOR.MINOR.PATCH-PRERELEASE+BUILD

Exemplos:
1.0.0          # Release estável
1.1.0          # Nova funcionalidade
1.1.1          # Bug fix
2.0.0          # Breaking change
1.2.0-beta.1   # Pre-release
1.2.0+20241201 # Build metadata
```

#### Automatização de Versões
```json
// package.json
{
  "scripts": {
    "version:patch": "npm version patch",
    "version:minor": "npm version minor", 
    "version:major": "npm version major",
    "version:pre": "npm version prerelease --preid=beta",
    "release": "standard-version",
    "release:first": "standard-version --first-release",
    "release:dry": "standard-version --dry-run"
  },
  "devDependencies": {
    "standard-version": "^9.5.0",
    "conventional-changelog-cli": "^2.2.2"
  }
}
```

#### Conventional Commits
```bash
# Tipos de commits
feat:     # Nova funcionalidade
fix:      # Correção de bug
docs:     # Documentação
style:    # Formatação (não altera lógica)
refactor: # Refatoração (não adiciona funcionalidade nem corrige bug)
test:     # Testes
chore:    # Tarefas de manutenção

# Exemplos
feat(auth): add username-based authentication
fix(payments): resolve monthly dues calculation error
docs(api): update member endpoints documentation
refactor(components): extract reusable form components
test(e2e): add event creation workflow tests
chore(deps): update dependencies to latest versions

# Breaking changes
feat!: change member role system structure
feat(api)!: restructure authentication endpoints
```

### Changelog Automation
```markdown
<!-- CHANGELOG.md template -->
# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-br/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Não Lançado]

### Adicionado
### Alterado
### Depreciado
### Removido
### Corrigido
### Segurança

## [1.2.0] - 2024-12-01

### Adicionado
- Sistema de notificações em tempo real
- Dashboard financeiro para administradores
- Integração com gateway de pagamento
- Sistema de backup automático

### Alterado
- Interface do calendário de eventos melhorada
- Performance das consultas de membros otimizada
- Validação de formulários aprimorada

### Corrigido
- Erro de autorização em endpoints de pagamento
- Bug na criação de eventos recorrentes
- Problema de cache em dados de membros

### Segurança
- Implementação de rate limiting
- Atualização de dependências com vulnerabilidades
- Melhoria na validação de entrada de dados

## [1.1.0] - 2024-11-15

### Adicionado
- Sistema de mensagens entre membros
- Relatórios financeiros mensais
- Backup automático da base de dados

### Corrigido
- Problema de autenticação com username
- Erro na listagem de eventos públicos
```

---

## 12. 📊 MÉTRICAS E KPIS DO SISTEMA

### Métricas de Negócio

#### Dashboard de Administração
```typescript
// types/metrics.types.ts
export interface BusinessMetrics {
  // Membros
  totalMembers: number
  activeMembers: number
  newMembersThisMonth: number
  memberRetentionRate: number
  
  // Financeiro
  monthlyRevenue: number
  outstandingDues: number
  paymentCompletionRate: number
  averagePaymentTime: number
  
  // Eventos
  totalEvents: number
  eventsThisMonth: number
  averageAttendance: number
  eventSatisfactionScore: number
  
  // Sistema
  systemUptime: number
  averageResponseTime: number
  errorRate: number
  userSatisfactionScore: number
}

// lib/metrics.ts
export class MetricsCollector {
  async getBusinessMetrics(period: 'month' | 'quarter' | 'year'): Promise<BusinessMetrics> {
    const [
      memberStats,
      financialStats,
      eventStats,
      systemStats
    ] = await Promise.all([
      this.getMemberMetrics(period),
      this.getFinancialMetrics(period),
      this.getEventMetrics(period),
      this.getSystemMetrics(period)
    ])

    return {
      ...memberStats,
      ...financialStats,
      ...eventStats,
      ...systemStats
    }
  }

  private async getMemberMetrics(period: string) {
    const endDate = new Date()
    const startDate = this.getStartDate(period, endDate)
    
    const [total, active, newMembers] = await Promise.all([
      prisma.member.count(),
      prisma.member.count({
        where: {
          lastActivityAt: { gte: startDate }
        }
      }),
      prisma.member.count({
        where: {
          createdAt: { gte: startDate }
        }
      })
    ])

    const retention = total > 0 ? (active / total) * 100 : 0

    return {
      totalMembers: total,
      activeMembers: active,
      newMembersThisMonth: newMembers,
      memberRetentionRate: Math.round(retention * 100) / 100
    }
  }

  private async getFinancialMetrics(period: string) {
    const endDate = new Date()
    const startDate = this.getStartDate(period, endDate)
    
    const payments = await prisma.payment.aggregate({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: 'COMPLETED'
      },
      _sum: { amount: true },
      _count: { id: true }
    })

    const outstanding = await prisma.dues.aggregate({
      where: {
        status: 'PENDING',
        dueDate: { lte: new Date() }
      },
      _sum: { amount: true }
    })

    return {
      monthlyRevenue: payments._sum.amount || 0,
      outstandingDues: outstanding._sum.amount || 0,
      paymentCompletionRate: this.calculateCompletionRate(period),
      averagePaymentTime: await this.calculateAveragePaymentTime(period)
    }
  }
}
```

#### Alertas e Notificações
```typescript
// lib/alerts.ts
export class AlertSystem {
  private readonly thresholds = {
    systemUptime: 99.5,      // %
    responseTime: 2000,      // ms
    errorRate: 5,            // %
    outstandingDues: 10000,  // €
    memberActivity: 30       // days
  }

  async checkSystemHealth(): Promise<Alert[]> {
    const alerts: Alert[] = []
    const metrics = await this.getSystemMetrics()

    // Verificar uptime
    if (metrics.uptime < this.thresholds.systemUptime) {
      alerts.push({
        type: 'CRITICAL',
        category: 'SYSTEM',
        message: `Sistema com uptime baixo: ${metrics.uptime}%`,
        threshold: this.thresholds.systemUptime,
        current: metrics.uptime
      })
    }

    // Verificar tempo de resposta
    if (metrics.avgResponseTime > this.thresholds.responseTime) {
      alerts.push({
        type: 'WARNING',
        category: 'PERFORMANCE',
        message: `Tempo de resposta elevado: ${metrics.avgResponseTime}ms`,
        threshold: this.thresholds.responseTime,
        current: metrics.avgResponseTime
      })
    }

    // Verificar quotas em atraso
    const outstandingAmount = await this.getOutstandingDues()
    if (outstandingAmount > this.thresholds.outstandingDues) {
      alerts.push({
        type: 'WARNING',
        category: 'FINANCIAL',
        message: `Quotas em atraso: €${outstandingAmount}`,
        threshold: this.thresholds.outstandingDues,
        current: outstandingAmount
      })
    }

    return alerts
  }

  async sendAlert(alert: Alert) {
    // Enviar para administradores
    const admins = await prisma.member.findMany({
      where: { role: 'ADMIN' },
      select: { email: true, notificationPreferences: true }
    })

    for (const admin of admins) {
      if (this.shouldNotifyAdmin(admin, alert)) {
        await this.sendNotification(admin.email, alert)
      }
    }

    // Log do alerta
    await prisma.systemAlert.create({
      data: {
        type: alert.type,
        category: alert.category,
        message: alert.message,
        threshold: alert.threshold,
        currentValue: alert.current,
        resolvedAt: null
      }
    })
  }
}
```

### Relatórios Automatizados

#### Relatório Mensal
```typescript
// lib/reports.ts
export class ReportGenerator {
  async generateMonthlyReport(month: number, year: number): Promise<MonthlyReport> {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0)

    const [
      memberStats,
      financialStats,
      eventStats,
      activityStats
    ] = await Promise.all([
      this.getMemberStatistics(startDate, endDate),
      this.getFinancialStatistics(startDate, endDate),
      this.getEventStatistics(startDate, endDate),
      this.getActivityStatistics(startDate, endDate)
    ])

    const report: MonthlyReport = {
      period: { month, year, startDate, endDate },
      summary: {
        totalRevenue: financialStats.totalRevenue,
        newMembers: memberStats.newMembers,
        eventsHeld: eventStats.totalEvents,
        systemUptime: activityStats.uptime
      },
      members: memberStats,
      financial: financialStats,
      events: eventStats,
      system: activityStats,
      recommendations: this.generateRecommendations({
        memberStats,
        financialStats,
        eventStats,
        activityStats
      })
    }

    // Salvar relatório
    await prisma.monthlyReport.create({
      data: {
        month,
        year,
        reportData: report,
        generatedAt: new Date()
      }
    })

    // Enviar para administradores
    await this.sendReportToAdmins(report)

    return report
  }

  private generateRecommendations(stats: any): string[] {
    const recommendations: string[] = []

    // Análise de membros
    if (stats.memberStats.retentionRate < 90) {
      recommendations.push(
        'Taxa de retenção baixa. Considere implementar programa de fidelização.'
      )
    }

    // Análise financeira
    if (stats.financialStats.outstandingPercentage > 20) {
      recommendations.push(
        'Muitas quotas em atraso. Implemente lembretes automáticos.'
      )
    }

    // Análise de eventos
    if (stats.eventStats.averageAttendance < 50) {
      recommendations.push(
        'Baixa participação em eventos. Revise estratégia de engajamento.'
      )
    }

    return recommendations
  }
}

// Agendamento de relatórios
// lib/cron-jobs.ts
import cron from 'node-cron'

export function setupReportSchedule() {
  // Relatório mensal - primeiro dia do mês às 9h
  cron.schedule('0 9 1 * *', async () => {
    const now = new Date()
    const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1
    const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
    
    const reporter = new ReportGenerator()
    await reporter.generateMonthlyReport(lastMonth + 1, year)
  }, {
    timezone: "Europe/Lisbon"
  })

  // Relatório semanal de alertas - segundas-feiras às 8h
  cron.schedule('0 8 * * 1', async () => {
    const alertSystem = new AlertSystem()
    const alerts = await alertSystem.checkSystemHealth()
    
    if (alerts.length > 0) {
      await alertSystem.sendWeeklyAlertSummary(alerts)
    }
  }, {
    timezone: "Europe/Lisbon"
  })
}
```

---

## 13. 🎯 ROADMAP E FASES DE IMPLEMENTAÇÃO

### Fase 1: MVP (Minimum Viable Product) - 4-6 semanas

#### Sprint 1-2: Infraestrutura Base
- ✅ Configuração do ambiente de desenvolvimento
- ✅ Setup da base de dados (Supabase)
- ✅ Autenticação básica (username/password)
- ✅ Estrutura base do projeto (Next.js + TypeScript)
- ✅ Componentes UI fundamentais

#### Sprint 3-4: Funcionalidades Core
- 🔄 Sistema de membros (CRUD básico)
- 🔄 Dashboard de administração simples
- 🔄 Landing page pública
- 🔄 Sistema de roles e permissões
- 🔄 Deploy inicial em ambiente de teste

#### Sprint 5-6: Refinamentos MVP
- ⏳ Testes básicos e correções de bugs
- ⏳ Validações de formulários
- ⏳ Feedback de utilizadores e ajustes
- ⏳ Documentação básica de utilização
- ⏳ Deploy em produção

### Fase 2: Funcionalidades Essenciais - 6-8 semanas

#### Sprint 7-8: Sistema Financeiro
- ⏳ Gestão de quotas mensais
- ⏳ Sistema de pagamentos básico
- ⏳ Relatórios financeiros simples
- ⏳ Notificações de pagamento

#### Sprint 9-10: Sistema de Eventos
- ⏳ Criação e gestão de eventos
- ⏳ Sistema de inscrições
- ⏳ Calendário de eventos
- ⏳ Galeria de fotos

#### Sprint 11-12: Comunicação
- ⏳ Sistema de notificações
- ⏳ Mensagens entre membros
- ⏳ Newsletter por email
- ⏳ Integração com redes sociais

#### Sprint 13-14: Loja Online
- ⏳ Catálogo de produtos
- ⏳ Carrinho de compras
- ⏳ Sistema de checkout
- ⏳ Gestão de inventory

### Fase 3: Funcionalidades Avançadas - 6-8 semanas

#### Sprint 15-16: Analytics e Relatórios
- ⏳ Dashboard de métricas avançado
- ⏳ Relatórios automatizados
- ⏳ Análise de comportamento de utilizadores
- ⏳ Exportação de dados

#### Sprint 17-18: Automação
- ⏳ Workflows automatizados
- ⏳ Sistema de lembretes inteligente
- ⏳ Integração com serviços externos
- ⏳ APIs para parceiros

#### Sprint 19-20: Mobile Experience
- ⏳ Progressive Web App (PWA)
- ⏳ Notificações push
- ⏳ Otimização para dispositivos móveis
- ⏳ App móvel nativa (opcional)

#### Sprint 21-22: Segurança e Performance
- ⏳ Auditoria de segurança completa
- ⏳ Otimização de performance
- ⏳ Backup e recovery avançados
- ⏳ Monitoring e alertas

### Fase 4: Expansão e Inovação - Contínua

#### Funcionalidades Futuras
- 🔮 Integração com IoT (sensores de moto)
- 🔮 Sistema de gamificação
- 🔮 IA para recomendações personalizadas
- 🔮 Marketplace de serviços
- 🔮 Integração com seguradoras
- 🔮 Sistema de mentoria entre membros
- 🔮 Realidade aumentada para eventos
- 🔮 Blockchain para certificados digitais

#### Métricas de Sucesso por Fase

**Fase 1 (MVP)**
- [ ] 100% dos membros conseguem fazer login
- [ ] 95% de uptime do sistema
- [ ] Tempo de carregamento < 3 segundos
- [ ] 0 bugs críticos em produção

**Fase 2 (Essenciais)**
- [ ] 80% dos membros usam o sistema regularmente
- [ ] 90% dos pagamentos processados digitalmente
- [ ] 75% de participação em eventos através da plataforma
- [ ] Satisfação do utilizador > 4.0/5.0

**Fase 3 (Avançadas)**
- [ ] 50% aumento na eficiência administrativa
- [ ] 30% redução no tempo de gestão manual
- [ ] 95% dos processos totalmente automatizados
- [ ] ROI positivo comprovado

**Fase 4 (Expansão)**
- [ ] Integração com outras organizações
- [ ] Receita adicional através de novos serviços
- [ ] Reconhecimento como referência no setor
- [ ] Expansão para outros moto clubes

### Fatores Críticos de Sucesso

#### Técnicos
1. **Qualidade da Implementação**: Seguir rigorosamente os padrões definidos
2. **Testes Abrangentes**: Cobertura de testes > 80% em todas as funcionalidades
3. **Performance**: Manter tempos de resposta < 2 segundos
4. **Segurança**: Zero vulnerabilidades críticas em produção

#### Organizacionais
1. **Formação de Utilizadores**: Programa de onboarding estruturado
2. **Suporte Contínuo**: Equipe disponível para resolução de problemas
3. **Feedback Iterativo**: Processo contínuo de melhoria baseado no uso real
4. **Manutenção Preventiva**: Atualizações regulares e monitoramento proativo

### Riscos e Mitigações

#### Riscos Técnicos
- **Perda de Dados**: Mitigado com backup automático triplo
- **Indisponibilidade**: Mitigado com infraestrutura redundante
- **Bugs Críticos**: Mitigado com testes automatizados extensivos
- **Performance**: Mitigado com monitoring contínuo e alertas

#### Riscos de Adoção
- **Resistência à Mudança**: Mitigado com formação e suporte dedicado
- **Curva de Aprendizagem**: Mitigado com interface intuitiva e documentação clara
- **Dependência Tecnológica**: Mitigado com código open-source e documentação completa

### Plano de Continuidade

#### Manutenção a Longo Prazo
- **Atualizações Regulares**: Ciclo mensal de atualizações de segurança
- **Novas Funcionalidades**: Roadmap trimestral baseado em feedback
- **Suporte Técnico**: SLA definido para resolução de problemas
- **Evolução Tecnológica**: Avaliação anual de stack tecnológico

#### Sustentabilidade Financeira
- **Modelo de Custos**: Estrutura transparente e previsível
- **Economias Geradas**: Redução de custos administrativos comprovada
- **Valor Agregado**: Novas oportunidades de receita através da plataforma

### Considerações Finais

Este documento serve como um guia abrangente para o desenvolvimento, implementação e manutenção do sistema **Mouros Moto Hub**. Através do seguimento rigoroso destas especificações e padrões, garantimos a entrega de uma solução robusta, segura e alinhada com as necessidades do Moto Clube Os Mouros.

A colaboração contínua entre as equipas técnica e administrativa será crucial para o sucesso deste projeto. Reuniões regulares de acompanhamento, revisões de progresso e sessões de feedback são recomendadas para assegurar que o projeto se mantém no caminho certo e que todas as partes interessadas estão alinhadas.

Estamos confiantes de que, com a dedicação e o esforço de todos os envolvidos, o **Mouros Moto Hub** será um marco na modernização da gestão de moto clubes, servindo como um exemplo a ser seguido por outras organizações no futuro.

---

## 15. 📞 CONTACTOS E SUPORTE

### Equipe de Desenvolvimento
- **Email Principal**: dev@mouros-moto-hub.com
- **Documentação**: https://docs.mouros-moto-hub.com
- **Status do Sistema**: https://status.mouros-moto-hub.com
- **Repositório**: https://github.com/mouros-moto-club/moto-hub

### Suporte Técnico
- **Horário**: Segunda a Sexta, 9h-18h
- **Urgências**: 24/7 para problemas críticos
- **SLA**: Resposta inicial em 2h para problemas críticos

---

*Documento versão 2.0 - Última atualização: Dezembro 2024*
*Este documento é mantido sob controle de versão e atualizado continuamente conforme a evolução do projeto.*

**Total: 2.800+ linhas de especificações técnicas completas**
