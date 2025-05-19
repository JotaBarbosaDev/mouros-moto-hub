# Guia de Uso - Sistema de Configurações

Este guia fornece instruções sobre como utilizar o sistema de configurações (Settings) do Mouros Moto Hub, tanto no backend quanto no frontend.

## 🗄️ Estrutura do Banco de Dados

As configurações do sistema são armazenadas na tabela `settings` no Supabase, usando um formato chave-valor:

- **key**: Identificador único da configuração (string)
- **value**: Valor da configuração em formato JSON

As principais chaves de configuração são:

| Chave | Descrição | Exemplo |
|-------|-----------|---------|
| `club_info` | Informações básicas do clube | `{ name: "Mouros Moto Hub", ... }` |
| `fees` | Configurações de mensalidades | `{ annualFee: 60, ... }` |
| `scale` | Configurações de escala | `{ rolesOrder: [...], ... }` |
| `defaults` | Configurações padrão do sistema | `{ allowGuests: true, ... }` |

## 📡 Endpoints da API

### 1. Obter Configurações

```http
GET /api/admin/config
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "club_info": { ... },
  "fees": { ... },
  "scale": { ... },
  "defaults": { ... }
}
```

### 2. Atualizar Configurações

```http
PUT /api/admin/config
Authorization: Bearer {token}
Content-Type: application/json

{
  "club_info": {
    "welcomeMessage": "Nova mensagem de boas-vindas"
  }
}
```

**Resposta:**
```json
{
  "club_info": {
    "welcomeMessage": "Nova mensagem de boas-vindas"
  }
}
```

> **Nota:** A atualização é parcial - apenas as chaves fornecidas serão atualizadas.

## 💻 Uso no Frontend

### 1. Hook useSystemSettings

Para configurações gerais do sistema:

```typescript
import { useSystemSettings } from '@/hooks/use-system-settings';

function MyComponent() {
  const { 
    clubSettings, 
    isLoadingClubSettings,
    updateClubSettings
  } = useSystemSettings();
  
  // Acesso às configurações
  console.log(clubSettings?.name);
  
  // Atualização das configurações
  const handleUpdate = () => {
    updateClubSettings({
      welcomeMessage: "Nova mensagem"
    });
  };
  
  return (
    // ...
  );
}
```

### 2. Hook useAdmin

Para administradores gerenciarem configurações:

```typescript
import { useAdmin } from '@/hooks/use-admin';

function AdminSettingsPage() {
  const {
    config,
    configLoading,
    updateConfig
  } = useAdmin();
  
  // Atualizar configuração
  const handleUpdateConfig = () => {
    updateConfig({
      club_info: {
        welcomeMessage: "Nova mensagem de administrador"
      }
    });
  };
  
  return (
    // ...
  );
}
```

## 🧪 Testes via cURL

1. **Obter configurações:**

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/admin/config
```

2. **Atualizar configurações:**

```bash
curl -X PUT \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"club_info": {"welcomeMessage": "Nova mensagem"}}' \
  http://localhost:3001/api/admin/config
```

## ⚙️ Boas Práticas

1. **Atualização parcial**: Sempre envie apenas as chaves que você deseja atualizar.
2. **Validação**: Valide os dados no frontend antes de enviá-los para a API.
3. **Tipagem**: Use as interfaces TypeScript definidas em `src/types/settings.ts`.
4. **Acompanhamento de logs**: Verifique os logs de atividade para auditar alterações nas configurações.

## 🚨 Resolução de Problemas

1. **Erro 401**: Verifique se o token de autenticação é válido.
2. **Erro 403**: O usuário não tem permissões de administrador.
3. **Erro 500 ao obter configurações**: Verifique se a tabela `settings` existe no Supabase.
4. **Erro 500 ao atualizar**: Verifique se o JSON enviado é válido.
