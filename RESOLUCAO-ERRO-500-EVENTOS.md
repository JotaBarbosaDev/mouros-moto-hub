# Resolução do Erro 500 (Internal Server Error) na Criação de Eventos

## Problema Identificado

Ao tentar criar um novo evento no sistema através da requisição POST para `/api/events`, o servidor retornava um erro 500 (Internal Server Error). O problema foi identificado no console:

```
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
use-events.ts:122 Erro ao criar evento: Error: HTTP error! Status: 500
```

## Causas do Problema

Após análise detalhada, identificamos duas causas principais:

1. **Falta de importação do serviço de logs de atividades**: O controlador `events.js` não importava o módulo `activity-log-service.js`, mas o middleware de logs tentava usá-lo durante a criação de eventos.

2. **Mapeamento incompleto de campos**: Alguns campos enviados pelo frontend não estavam sendo corretamente mapeados para o formato esperado pelo backend (especialmente `is_featured` e `registration_open`).

## Soluções Implementadas

### 1. Adição da Importação do Serviço de Logs

Foi adicionada a importação do serviço de logs de atividades no controlador de eventos:

```javascript
// filepath: /Users/joaobarbosa/Desktop/projetos/mouros-moto-hub/backend/src/controllers/events.js
// Controlador para gerenciamento de eventos
const { supabase } = require('../config/supabase');
const activityLogService = require('../services/activity-log-service');
```

### 2. Mapeamento Completo dos Campos do Frontend

Foi aprimorado o mapeamento de campos na função de criação de eventos para contemplar todos os campos enviados pelo frontend:

```javascript
const eventData = {
  title: req.body.title,
  description: req.body.description,
  location: req.body.location,
  start_date: req.body.start_date || req.body.startDate,
  end_date: req.body.end_date || req.body.endDate,
  type: req.body.type || 'encontro',
  image_url: req.body.image_url || req.body.imageUrl || req.body.image,
  created_by: req.body.creator_id || req.body.creatorId || req.user?.id,
  capacity: req.body.capacity || req.body.max_participants,
  price: req.body.price || 0,
  registration_deadline: req.body.registration_deadline || req.body.registrationDeadline,
  is_public: req.body.is_public !== undefined ? req.body.is_public : (req.body.isPublic !== false),
  is_featured: req.body.is_featured !== undefined ? req.body.is_featured : req.body.isFeatured || false,
  registration_open: req.body.registration_open !== undefined ? req.body.registration_open : req.body.registrationOpen || false
};
```

## Impacto da Correção

Estas alterações permitem que:

1. O sistema crie eventos corretamente sem gerar erros 500
2. Os eventos sejam criados com todos os campos enviados pelo frontend, incluindo características como "destaque" (is_featured) e "inscrições abertas" (registration_open)
3. As atividades de criação de eventos sejam registradas corretamente no sistema de logs

## Recomendações Futuras

1. **Validação de Dados**: Implementar um sistema de validação de dados mais robusto usando bibliotecas como Joi ou Zod para validar os dados recebidos antes do processamento.

2. **Manutenção da Consistência**: Manter uma documentação atualizada da API para garantir que frontend e backend permaneçam sincronizados quanto ao formato e nome dos campos.

3. **Testes Automatizados**: Criar testes automatizados para verificar se as rotas respondem corretamente a diferentes formatos de dados.
