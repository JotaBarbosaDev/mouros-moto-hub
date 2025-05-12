# Orientações de Segurança para o Projeto Mouros Moto Hub

## Aviso de Segurança Importante

Recentemente, o GitGuardian detectou que algumas chaves secretas foram expostas no repositório. Estas chaves foram removidas do controle de versão e agora estão protegidas. É extremamente importante seguir as orientações abaixo para evitar futuras exposições de dados sensíveis.

## Chaves Sensíveis Nunca Devem Ser Commitadas

### Tipos de chaves sensíveis:
- Chaves de serviço do Supabase (`SUPABASE_SERVICE_ROLE_KEY`)
- Segredos JWT (`JWT_SECRET`, `VITE_SUPABASE_JWT_SECRET`)
- Senhas de banco de dados
- Tokens de API de serviços
- Informações de credenciais em geral

## Como Configurar o Ambiente de Desenvolvimento

1. **Crie arquivos .env locais**:
   - Copie o arquivo `.env.example` para `.env` nos diretórios raiz, `/frontend` e `/backend`
   - Substitua os valores de exemplo pelas chaves reais

   ```bash
   # Na raiz do projeto
   cp .env.example .env
   
   # Na pasta frontend
   cp frontend/.env.example frontend/.env
   
   # Na pasta backend
   cp backend/.env.example backend/.env
   ```

2. **Nunca comite arquivos .env**:
   - O arquivo `.gitignore` já está configurado para ignorar arquivos `.env`
   - Sempre use `.env.example` para documentar quais variáveis são necessárias, mas sem valores reais

3. **Obtenha as chaves seguras**:
   - Contate o administrador do projeto para obter as chaves reais
   - Não compartilhe essas chaves em emails, mensagens não criptografadas ou repositórios públicos

## Em Caso de Exposição de Segredos

Se você acidentalmente comitar ou compartilhar chaves secretas:

1. **Revogue imediatamente as chaves expostas**
   - Acesse o painel do Supabase e gere novas chaves
   
2. **Atualize todos os ambientes com as novas chaves**
   - Atualize os arquivos `.env` em todos os ambientes (desenvolvimento, produção)
   
3. **Notifique a equipe de segurança**
   - Informe o que foi exposto e quais medidas foram tomadas

## Melhores Práticas

- **Use variáveis de ambiente** para todas as chaves e segredos
- **Nunca hardcode chaves** diretamente no código
- **Revise seus commits** antes de enviá-los para evitar vazamento de dados
- **Configure alertas de segurança** como o GitGuardian para detectar vazamentos rapidamente
- **Use diferentes chaves** para ambientes de desenvolvimento e produção

## Implementação Atual

O projeto agora usa:

- Arquivos `.env` separados para frontend e backend
- Arquivos `.env.example` para documentação das variáveis necessárias
- Configuração de `.gitignore` para proteger arquivos sensíveis

## Recursos Úteis

- [Documentação do Supabase sobre segurança](https://supabase.com/docs/guides/security)
- [Boas práticas para variáveis de ambiente no Node.js](https://github.com/motdotla/dotenv#readme)
- [Guia do GitHub sobre remoção de dados sensíveis](https://docs.github.com/pt/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
