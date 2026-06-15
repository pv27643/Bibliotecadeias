# 🗄️ Guia de Implementação - Opção A (Supabase Single Source of Truth)

## 📋 Passo 1: Criar as Tabelas no Supabase

1. **Aceda ao Dashboard do Supabase**
   - URL: https://app.supabase.com
   - Projeto: Biblioteca de Ideias

2. **Vá para SQL Editor**
   - Clique em "SQL Editor" no menu lateral
   - Clique em "+ New Query"

3. **Copie todo o conteúdo do arquivo:**
   ```
   supabase/SETUP.sql
   ```

4. **Cole no SQL Editor do Supabase e execute**
   - Deve criar 6 tabelas: tools, prompts, workflows, favorites, categories, subcategories

---

## 🔄 Passo 2: Integrar no App.tsx

A integração será feita automaticamente:

1. **Na inicialização do App**, o código vai:
   - Tentar carregar dados do Supabase
   - Se estiver vazio, migra do localStorage automaticamente
   - Sincroniza tudo quando você adiciona/edita/deleta

2. **Os favoritos ficarão:**
   - localStorage (cache local)
   - Supabase (backup)

---

## 📦 Estrutura de Dados

### Tools
```javascript
{
  id: "uuid",
  name: "Nome da ferramenta",
  description: "Descrição",
  category: "Texto",
  subcategory: "Copywriting",
  badges: ["Free", "Freemium"],
  tags: ["IA", "Escrita"],
  icon: "sparkles",
  link: "https://...",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z"
}
```

### Prompts
```javascript
{
  id: "uuid",
  title: "Título do prompt",
  description: "Descrição",
  category: "Marketing",
  models: ["ChatGPT", "Claude"],
  content: "Conteúdo do prompt",
  image: "url-da-imagem",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z"
}
```

### Workflows
```javascript
{
  id: "uuid",
  title: "Nome do workflow",
  description: "Descrição",
  category: "Marketing",
  steps: [
    { tool: "ChatGPT", status: "pending", icon: "message-square" },
    { tool: "DALL-E", status: "pending", icon: "image" }
  ],
  image: "url-da-imagem",
  webhook_url: "https://...",
  inputs: [
    { name: "topic", label: "Tópico", type: "text", required: true }
  ],
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z"
}
```

### Favoritos
```javascript
{
  id: "uuid",
  item_type: "tool", // ou "prompt", "workflow"
  item_id: "uuid",
  item_name: "Nome do item",
  created_at: "2024-01-01T00:00:00Z"
}
```

---

## 🚀 Funções Disponíveis

### Carregar Dados
```typescript
import {
  loadToolsFromSupabase,
  loadPromptsFromSupabase,
  loadWorkflowsFromSupabase,
  loadCategoriesFromSupabase,
  loadFavoritesFromSupabase
} from '@/utils/supabase/sync';

const tools = await loadToolsFromSupabase();
```

### Sincronizar Dados
```typescript
import {
  syncToolsToSupabase,
  syncPromptsToSupabase,
  syncWorkflowsToSupabase,
  syncCategoriesToSupabase
} from '@/utils/supabase/sync';

await syncToolsToSupabase(tools);
```

### Gerenciar Favoritos
```typescript
import {
  addFavoriteToSupabase,
  removeFavoriteFromSupabase
} from '@/utils/supabase/sync';

await addFavoriteToSupabase('tool', 'uuid-do-tool', 'Nome da Tool');
await removeFavoriteFromSupabase('tool', 'uuid-do-tool');
```

### Migração Inicial
```typescript
import { migrateLocalStorageToSupabase } from '@/utils/supabase/sync';

await migrateLocalStorageToSupabase();
```

---

## 📝 Checklist

- [ ] Executou o SQL em supabase/SETUP.sql no dashboard Supabase
- [ ] Verificou se as 6 tabelas foram criadas
- [ ] Testou a migração (carregar app e verificar console)
- [ ] Adicionou um novo tool/prompt/workflow e verificou se foi para Supabase
- [ ] Testou marcar como favorito
- [ ] Testou editar/apagar e verificar sincronização

---

## ⚙️ Variáveis de Ambiente

Certifique-se que tem no `.env.local`:
```
VITE_SUPABASE_PROJECT_ID=seu-project-id
VITE_SUPABASE_PUBLIC_ANON_KEY=sua-anon-key
```

---

## 🐛 Troubleshooting

**Erro: "Table doesn't exist"**
- ✅ Verifique se executou todo o SQL no Supabase
- ✅ Abra o SQL Editor novamente e veja as tabelas criadas

**Dados não sincronizam**
- ✅ Abra o console do browser (F12)
- ✅ Veja se há erros de conexão
- ✅ Verifique as chaves do Supabase em `.env.local`

**Favoritos não funcionam**
- ✅ Verifique se a tabela `favorites` foi criada
- ✅ Veja se há erros no console

---

## 📚 Próximos Passos

1. **Autenticação**: Adicionar login de utilizadores (quando precisar)
2. **Compartilhamento**: Permitir compartilhar tools/prompts entre utilizadores
3. **Histórico**: Manter registro de alterações (audit trail)
4. **Real-time**: Sincronização em tempo real entre múltiplos tabs

