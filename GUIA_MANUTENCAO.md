# Guia de Manutenção do Sistema de Login e Gerenciamento de Membros

## Visão Geral da Arquitetura

A solução implementada resolve os problemas de permissões no Supabase utilizando uma combinação de:

1. **Funções Edge (Serverless)**
   - Executam com permissões elevadas (SERVICE_ROLE) de forma segura
   - Implementam verificação de autenticação e autorização
   - Permitem operações que o frontend não conseguiria realizar diretamente

2. **Views e Funções SQL**
   - Facilitam consultas complexas, como busca por username
   - Consolidam dados de tabelas separadas (auth e public)
   - Otimizam o desempenho com índices apropriados

3. **Serviços TypeScript**
   - Encapsulam a chamada das funções Edge
   - Garantem tipagem e tratamento de erros
   - Seguem padrões de projeto para fácil manutenção

## Ciclo de Vida de Autenticação

1. **Login (useAuth.tsx)**
   - Tenta login direto com email
   - Se falha e parece username, busca o email correspondente
   - Utiliza o email encontrado para autenticação

2. **Gerenciamento de Membros (EditMemberDialog.tsx)**
   - Atualiza metadados do usuário para username
   - Atualiza senha através da função Edge
   - Mantém dados separados entre auth e public

## Manutenção

### Atualização das Funções Edge

Para atualizar as funções após alterações:

```bash
cd /Users/joaobarbosa/Desktop/projetos/mouros-moto-hub
supabase functions deploy [nome-da-função] --project-ref jugfkacnlgdjdosstiks
```

### Verificação de Logs e Erros

Para monitorar erros das funções Edge:

1. Acesse o dashboard do Supabase: https://supabase.com/dashboard/project/jugfkacnlgdjdosstiks
2. Navegue até Database → Edge Functions → Logs

### Testes Locais

Para testar localmente antes de implantar:

```bash
cd /Users/joaobarbosa/Desktop/projetos/mouros-moto-hub
./test-edge-functions.sh
```

## Troubleshooting

### Problema: Função Edge retorna erro 500

**Verificações**:
1. Checar logs no dashboard do Supabase
2. Verificar se as variáveis de ambiente estão configuradas
3. Testar a função localmente com `supabase functions serve`

### Problema: Login com username falha

**Verificações**:
1. Verificar se a função `get_user_by_username` existe no banco
2. Confirmar se o username está salvo nos metadados do usuário
3. Checar logs de frontend para erros específicos

### Problema: Atualização de senha falha

**Verificações**:
1. Verificar se o token JWT está sendo enviado corretamente
2. Confirmar que a função Edge tem as permissões corretas
3. Verificar se o usuário tem autorização para a operação

### Problema: Erro de CORS ao acessar funções Edge

**Verificações**:
1. Abrir o console do navegador e verificar a mensagem de erro exata
2. Confirmar que os cabeçalhos CORS estão configurados em todas as respostas da função Edge (inclusive respostas de erro)
3. Verificar se a função Edge está configurada para aceitar solicitações da origem correta (`Access-Control-Allow-Origin`)
4. Reimplantar a função Edge após quaisquer alterações nos cabeçalhos CORS

## Segurança e Boas Práticas

1. **Tokens JWT**: Nunca exponha tokens em código client-side ou repositórios
2. **Funções Edge**: Use verificação de autenticação e autorização
3. **SERVICE_ROLE**: Use apenas dentro das funções Edge, nunca no frontend
4. **Logs**: Monitore regularmente para identificar problemas

## Configuração CORS

As funções Edge foram configuradas com cabeçalhos CORS adequados para permitir chamadas do frontend, tanto em ambiente de desenvolvimento (localhost) quanto em produção. Os cabeçalhos CORS são adicionados em:

1. **Respostas OPTIONS** (preflight requests)
2. **Respostas bem-sucedidas** (status 200)
3. **Respostas de erro** (status 400, 401, 403, 500, etc.)

Se você encontrar problemas de CORS ao fazer chamadas para as funções Edge, verifique:

- Se os cabeçalhos CORS estão presentes em todos os pontos de retorno (`return new Response(...)`).
- Se a origem da aplicação está permitida (atualmente configurada como `'*'` para permitir qualquer origem).
- Se todos os métodos necessários estão incluídos (GET, POST, PUT, DELETE, OPTIONS).

Para ambientes de produção, considere limitar o cabeçalho `Access-Control-Allow-Origin` para apenas domínios específicos por questões de segurança.

## Planos Futuros

1. Implementar autenticação MFA para maior segurança
2. Criar funcionalidade de recuperação de senha self-service
3. Expandir funcionalidades administrativas via funções Edge
4. Restringir as origens CORS permitidas para maior segurança em produção

---

Data de Atualização: 11 de maio de 2025  
Autor: João Barbosa  
Versão: 1.0.0
