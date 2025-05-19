# Correção do Erro 404 na API de Pagamentos de Mensalidades

## Problema Identificado

Ao tentar acessar informações de pagamentos de mensalidades dos membros através do endpoint `/api/dues-payments/member/:memberId`, o sistema estava retornando um erro 404 (Not Found), mesmo após a correção da URL base no frontend.

## Causa do Problema

Após análise detalhada, identificamos que o problema estava relacionado à **ordem das rotas** no arquivo `backend/src/routes/dues-payments.js`. A rota específica `/member/:memberId` estava declarada após a rota genérica `/:id`, o que fazia com que o Express interpretasse "member" como um ID em vez de um caminho específico.

Em Express.js, a ordem de definição das rotas é crucial, pois as rotas são avaliadas na ordem em que são declaradas. Quando uma solicitação chega ao caminho `/dues-payments/member/123`, o Express tentava primeiro corresponder isso ao padrão `/:id` (que corresponde a qualquer string após a barra), então interpretava "member" como um ID e nunca chegava à rota `/member/:memberId`.

## Solução Implementada

Reordenamos as rotas no arquivo `backend/src/routes/dues-payments.js` para garantir que a rota específica seja avaliada antes da rota genérica:

**Antes:**
```javascript
// Obter pagamento de quota específico por ID
router.get('/:id', 
  logActivity({ entityType: 'DUES_PAYMENT', getEntityId: (req) => req.params.id }),
  duesPaymentsController.getDuesPaymentById
);

// Obter pagamentos de quotas de um membro específico
router.get('/member/:memberId', 
  logActivity({ entityType: 'MEMBER', getEntityId: (req) => req.params.memberId }),
  duesPaymentsController.getDuesPaymentsByMemberId
);
```

**Depois:**
```javascript
// Obter pagamentos de quotas de um membro específico
// IMPORTANTE: Rotas mais específicas devem vir antes das rotas mais genéricas
router.get('/member/:memberId', 
  logActivity({ entityType: 'MEMBER', getEntityId: (req) => req.params.memberId }),
  duesPaymentsController.getDuesPaymentsByMemberId
);

// Obter pagamento de quota específico por ID
router.get('/:id', 
  logActivity({ entityType: 'DUES_PAYMENT', getEntityId: (req) => req.params.id }),
  duesPaymentsController.getDuesPaymentById
);
```

## Recomendações para Evitar Problemas Similares

1. **Ordenação de rotas**: Sempre declare rotas mais específicas antes das rotas mais genéricas. Uma boa prática é colocar rotas com caminhos fixos antes das rotas com parâmetros dinâmicos.

2. **Testes automatizados**: Implementar testes de integração que validem todos os endpoints da API para detectar problemas de roteamento antecipadamente.

3. **Documentação de API**: Manter uma documentação atualizada dos endpoints disponíveis (por exemplo, com Swagger/OpenAPI) para facilitar a identificação de problemas de roteamento.

4. **Logs de debug**: Usar logs detalhados no roteador Express para depurar problemas semelhantes no futuro.
