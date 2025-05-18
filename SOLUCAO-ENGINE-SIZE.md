# Solução para o Problema da Coluna Engine_Size

Este documento explica a solução implementada para resolver o erro 500 (Internal Server Error) ao adicionar veículos no sistema Mouros Moto Hub.

## O Problema

O sistema apresentava um erro 500 (Internal Server Error) ao tentar adicionar veículos através da API endpoint `http://localhost:3001/api/vehicles`. Especificamente, o erro estava relacionado à coluna `engine_size` que não era encontrada no esquema do banco de dados.

Mensagem de erro típica:
```
Could not find the 'engine_size' column of 'vehicles' in the schema cache
```

## Soluções Implementadas

### 1. Correções no Backend

1. **Simplificação do modelo de veículo**:
   - Modificado o modelo `vehicle.js` para não depender da coluna `engine_size`.
   - Removida a lógica que tentava usar tanto `engine_size` quanto `displacement`.
   - Implementada solução para usar apenas `displacement` como único campo para cilindrada.

2. **Criação de utilitário de verificação/correção**:
   - Criado o módulo `fix-columns.js` que verifica se a tabela `vehicles` tem as colunas necessárias.
   - Integrado com o servidor para executar automaticamente na inicialização.

3. **Tratamento de erros aprimorado**:
   - Melhorado o tratamento de erros no controlador `vehicles.js` para lidar com problemas de esquema.
   - Removidas as chamadas à função inexistente `exec_sql` que causavam erros adicionais.

### 2. Melhorias no Frontend

1. **Detector de campos de cilindrada**:
   - Implementado o módulo `displacement-field-detector.ts` que testa qual campo de cilindrada é aceito pelo backend.
   - Adicionado mecanismo de cache para evitar múltiplas requisições de teste.

2. **Estratégias de fallback na criação de veículos**:
   - Implementadas múltiplas estratégias para envio de dados ao criar veículos:
     - Estratégia 1: Todos os campos possíveis de cilindrada
     - Estratégia 2: Sem nenhum campo de cilindrada
     - Estratégia 3: Apenas com displacement
     - Estratégia 4: Apenas com engine_size

3. **Mensagens de erro mais descritivas**:
   - Melhoradas as mensagens de erro para orientar o usuário sobre como resolver o problema.
   - Incluída referência ao script `fix-engine-size.sh` para facilitar a correção.

### 3. Scripts de Correção

1. **Script fix-engine-size.sh**:
   - Criado script que verifica e corrige problemas com a coluna engine_size.
   - Tenta criar um veículo de teste para confirmar que o problema foi resolvido.

2. **Integração com inicialização do servidor**:
   - Adicionada verificação automática do banco de dados na inicialização do servidor.
   - O servidor inicia mesmo com erros na verificação das tabelas para permitir correções manuais.

## Como Utilizar a Solução

### Para resolver problemas de coluna engine_size:

1. Execute o script de correção:
   ```bash
   ./fix-engine-size.sh
   ```

2. Se o problema persistir, reinicie o servidor backend:
   ```bash
   ./start-backend.sh
   ```

### Se você está desenvolvendo código que trabalha com veículos:

1. **No backend**: Use apenas o campo `displacement` para armazenar a cilindrada.

2. **No frontend**: 
   - O sistema agora detecta automaticamente qual campo de cilindrada funciona.
   - Utilize o serviço `vehicle-service.ts` que implementa as estratégias de fallback.

## Detalhes Técnicos

- O método `create()` em `vehicle-service.ts` agora utiliza o detector de campos para determinar o nome correto a ser usado.
- O servidor (`index.js`) executa `ensureVehicleColumns()` na inicialização para verificar e tentar corrigir problemas de esquema.
- Os controllers e models foram atualizados para usar apenas `displacement` e remover toda dependência de `engine_size`.

---

Caso tenha problemas adicionais, entre em contato com o desenvolvedor ou consulte a documentação completa de resolução de problemas.
