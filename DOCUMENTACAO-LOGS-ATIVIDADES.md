# Sistema de Logs de Atividades - Implementação

## Resumo da Implementação

O sistema de logs de atividades foi implementado com sucesso para rastrear todas as ações dos usuários no Mouros Moto Hub. Esta documentação fornece uma visão geral do que foi implementado e como o sistema de logs funciona.

## Componentes Implementados

### 1. Tabela no Banco de Dados

Foi criada a tabela `activity_logs` no banco de dados Supabase com a seguinte estrutura:

```sql
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT,
    username TEXT,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id TEXT,
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### 2. Middleware de Logging

Foram implementados dois middlewares principais para capturar automaticamente as atividades:

- **activity-logger.js**: Middleware genérico para registrar operações CRUD em entidades
- **auth-logger.js**: Middleware específico para registrar atividades de autenticação (login, registro, logout)

### 3. Serviço de Logs

O `activity-log-service` foi implementado no frontend e backend para:

- Registrar novas atividades
- Consultar atividades existentes com filtros diversos
- Obter histórico de uma entidade específica

## Rotas Implementadas com Logs

O sistema agora registra logs nas seguintes áreas:

### Gestão de Membros
- Listagem de membros
- Visualização de membro específico
- Criação de membro
- Atualização de membro
- Exclusão de membro

### Gestão de Veículos
- Listagem de veículos
- Visualização de veículo específico
- Criação de veículo
- Atualização de veículo
- Exclusão de veículo

### Eventos
- Listagem de eventos
- Visualização de evento específico
- Criação de evento
- Atualização de evento
- Exclusão de evento
- Gerenciamento de participantes

### Bar (Produtos e Vendas)
- Listagem de produtos
- Visualização de produto específico
- Criação de produto
- Atualização de produto
- Exclusão de produto
- Atualização de estoque
- Listagem de vendas
- Visualização de venda específica
- Criação de venda
- Atualização de venda
- Exclusão de venda

### Inventário
- Listagem de itens
- Visualização de item específico
- Criação de item
- Atualização de item
- Exclusão de item
- Adição de quantidade
- Remoção de quantidade
- Visualização de histórico

### Autenticação
- Login
- Registro
- Logout

### Administração
- Acesso ao painel administrativo

## Como os Logs São Estruturados

Cada registro de log contém:

- **user_id**: ID do usuário que realizou a ação
- **username**: Nome do usuário para facilitar a leitura
- **action**: Tipo de ação (CREATE, READ, UPDATE, DELETE)
- **entity_type**: Tipo de entidade (MEMBER, VEHICLE, EVENT, etc.)
- **entity_id**: ID da entidade afetada (quando aplicável)
- **details**: Detalhes adicionais em formato JSON
- **ip_address**: Endereço IP de onde a ação foi realizada
- **created_at**: Data e hora da ação

## Exemplo de Log

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "auth0|123456789",
  "username": "joao.silva@email.com",
  "action": "UPDATE",
  "entity_type": "MEMBER",
  "entity_id": "b4f8-8d89-4c32-9c14-f78a8e4a",
  "details": {
    "memberName": "João Silva",
    "changedFields": ["phoneMain", "address"],
    "previousState": {
      "phoneMain": "123456789"
    },
    "currentState": {
      "phoneMain": "987654321"
    }
  },
  "ip_address": "192.168.1.1",
  "created_at": "2023-05-18T14:30:00Z"
}
```

## Visualização dos Logs

Os logs podem ser visualizados através da página de histórico de atividades no sistema. Essa página permite:

- Filtrar logs por tipo de entidade
- Filtrar logs por tipo de ação
- Filtrar logs por período
- Buscar logs relacionados a um membro ou entidade específica

## Criação da Tabela de Logs

Consulte o arquivo `INSTRUCOES-CRIAR-TABELA-LOGS.md` para instruções detalhadas sobre como criar a tabela de logs no Supabase.
