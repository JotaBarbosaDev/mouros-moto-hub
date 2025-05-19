# Correção do Erro 500 na Criação de Eventos

## Problema Identificado

O sistema estava retornando erro 500 (Internal Server Error) ao tentar criar eventos através do endpoint POST `/api/events`. Após análise, foram identificados os seguintes problemas:

1. **Incompatibilidade no formato dos dados**: O frontend estava enviando dados em formato snake_case (`start_date`, `end_date`, etc.), enquanto o backend esperava dados em formato camelCase (`startDate`, `endDate`, etc.).

2. **Caminho incorreto para o middleware de logging**: O arquivo de rotas dos eventos estava importando o middleware `activity-logger` de um caminho incorreto (`../middleware/activity-logger` em vez de `../middlewares/activity-logger`).

## Soluções Implementadas

### 1. Compatibilidade de Formato de Dados

Foi implementada uma solução que permite ao backend aceitar tanto formatos snake_case quanto camelCase para os campos dos eventos, tornando a API mais flexível e robusta:

```javascript
const eventData = {
  title: req.body.title,
  description: req.body.description,
  location: req.body.location,
  start_date: req.body.start_date || req.body.startDate,
  end_date: req.body.end_date || req.body.endDate,
  type: req.body.type || 'encontro',
  image_url: req.body.image_url || req.body.imageUrl,
  created_by: req.body.creator_id || req.body.creatorId || req.user?.id,
  capacity: req.body.capacity || req.body.max_participants,
  price: req.body.price || 0,
  registration_deadline: req.body.registration_deadline || req.body.registrationDeadline,
  is_public: req.body.is_public !== undefined ? req.body.is_public : (req.body.isPublic !== false)
};
```

### 2. Correção do Caminho do Middleware

Confirmado que o caminho correto para o módulo de logging de atividades é `../middleware/activity-logger` (em pasta singular), não `../middlewares/activity-logger` (plural):

```javascript
// Caminho correto
const { logActivity } = require('../middleware/activity-logger');
```

O problema foi causado por uma inconsistência na nomenclatura de diretórios, pois o projeto tem tanto um diretório `middleware` quanto `middlewares`, mas o módulo `activity-logger.js` está apenas em `middleware`.

## Recomendações

1. **Padronização de Nomenclatura**: Considerar adotar um padrão único de nomenclatura (camelCase ou snake_case) em toda a aplicação para evitar inconsistências.

2. **Validação de Dados**: Implementar uma camada de validação de dados usando bibliotecas como Joi ou express-validator para garantir que os dados recebidos estejam no formato correto antes de processá-los.

3. **Tratamento de Erros**: Melhorar o tratamento de erros para fornecer mensagens mais descritivas que ajudem a identificar a causa raiz dos problemas.
