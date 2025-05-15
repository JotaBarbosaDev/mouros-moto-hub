# Reorganização Implementada - Inicialização de Tabelas no Supabase

## Mudanças realizadas

1. **Eliminação de arquivos redundantes**:
   - Arquivos duplicados ou obsoletos foram movidos para `/frontend/backup-files/`
   - Mantido apenas o código funcional para evitar confusão

2. **Organização dos scripts de inicialização**:
   - `/frontend/src/components/system/SystemInitializer.tsx`: Componente React para inicialização automática das tabelas
   - `/frontend/src/init-tables.js`: Script Node.js para inicialização manual das tabelas
   - `/frontend/init-tables.sh`: Script shell para executar o script de inicialização

3. **Melhorias realizadas nos scripts**:
   - Verificação da extensão UUID do PostgreSQL antes da criação das tabelas
   - Tratamento adequado de erros em todas as operações
   - Verificação completa de todas as tabelas necessárias
   - Melhor sanitização dos valores SQL para evitar problemas de segurança

## Como inicializar as tabelas

### Método 1: Através da aplicação React

O componente `SystemInitializer.tsx` é carregado automaticamente ao iniciar a aplicação e se encarrega de:
1. Verificar se as tabelas necessárias existem
2. Criar as tabelas que estiverem faltando
3. Inicializar as tabelas com valores padrão

### Método 2: Usando o script de linha de comando

Para inicializar as tabelas manualmente (útil em ambientes de CI/CD ou para troubleshooting):

```bash
# Na pasta raiz do projeto frontend
cd /Users/joaobarbosa/Desktop/projetos/mouros-moto-hub/frontend
./init-tables.sh
```

Este script:
1. Verifica se o arquivo `.env.local` existe com as credenciais do Supabase
2. Executa o script `init-tables.js` para criar e inicializar as tabelas

## Tabelas criadas pelo sistema

1. `club_settings`: Configurações gerais do clube
2. `settings`: Configurações específicas do sistema
3. `member_fee_settings`: Configurações de mensalidades dos membros
4. `fee_payments`: Registros de pagamentos de mensalidades

## Solução de problemas

Se você encontrar erros relacionados às tabelas no Supabase:

1. Verifique se as credenciais do Supabase estão corretas no arquivo `.env.local`
2. Execute o script `init-tables.sh` para tentar criar as tabelas manualmente
3. Verifique no painel do Supabase se as tabelas foram criadas corretamente
4. Inspecione o console do navegador para ver mensagens de erro detalhadas
