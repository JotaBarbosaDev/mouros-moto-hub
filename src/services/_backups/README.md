# Arquivos de Backup

Esta pasta contém versões anteriores e variantes dos serviços que foram mantidas como referência.

## Arquivos de Serviço de Membros

- `member-service.ts` - Implementação original do serviço de membros
- `member-service-fixed.ts` - Primeira versão corrigida do serviço de membros
- `member-service.fixed.ts` - Outra versão corrigida com nomenclatura alternativa
- `member-service.new.ts` - Nova implementação que foi experimentada
- `member-service.temp.ts` - Versão temporária usada durante desenvolvimento
- `member-service-robust-fixed.ts` - Versão mais robusta com correções adicionais

A versão atual em uso é `member-service-robust.ts` que está no diretório principal de serviços.

## Quando usar estes arquivos

Estes arquivos são mantidos apenas como referência para casos em que seja necessário verificar implementações anteriores
ou recuperar código específico de uma versão anterior.

**Não importe diretamente destes arquivos**. Se precisar de funcionalidades que existem apenas aqui, considere integrá-las
na versão atual (`member-service-robust.ts`).

## Limpeza futura

Durante uma futura limpeza do código, estes arquivos podem ser removidos completamente quando não forem mais necessários
como referência.
