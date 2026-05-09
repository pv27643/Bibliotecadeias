# Celeuma IA - Instruções de Instalação

## 📦 Conteúdo do Download

Este arquivo contém todo o código-fonte da aplicação **Celeuma IA** - uma plataforma completa para gestão de ferramentas de IA, prompts e workflows.

## 🚀 Como Instalar e Executar

### 1. Extrair o arquivo
```bash
tar -xzf celeuma-ia-site.tar.gz
cd code
```

### 2. Instalar dependências
```bash
# Certifica-te que tens Node.js 18+ instalado
pnpm install

# Se não tiveres pnpm, instala primeiro:
npm install -g pnpm
```

### 3. Executar em desenvolvimento
```bash
pnpm dev
```

A aplicação estará disponível em `http://localhost:5173`

## 📁 Estrutura do Projeto

```
├── src/
│   ├── app/
│   │   ├── App.tsx              # Aplicação principal
│   │   └── components/          # Componentes React
│   └── styles/                  # Estilos e temas CSS
├── supabase/
│   └── functions/
│       └── server/              # Edge Function do Supabase
│           ├── index.tsx        # API endpoints
│           └── kv_store.tsx     # Armazenamento de dados
├── utils/
│   └── supabase/
│       └── info.tsx             # Configurações do Supabase
└── package.json                 # Dependências do projeto
```

## 🔧 Funcionalidades Principais

### ✅ Biblioteca de IAs (78 ferramentas)
- Categorias: Texto, Imagem, Vídeo, 3D, Audio, Código, Negócios, Outros
- Sistema de subcategorias hierárquico
- Filtros por badge (Free, Freemium, Pago)
- Sistema de favoritos
- Pesquisa em tempo real

### ✅ Biblioteca de Prompts
- Prompts otimizados para diferentes IAs
- Categorias: Marketing, Desenvolvimento, Design, Produtividade
- Sistema de cópia rápida
- Gestão completa (adicionar/editar/eliminar)

### ✅ Workflows
- Automações multi-ferramenta
- Categorias: Marketing, Operações, Vendas
- **Novo:** Gerador de Conteúdo Multi-Formato
  - Cria posts para Instagram, Facebook, LinkedIn, Twitter
  - 3 templates diferentes
  - Export em PNG para todas as redes sociais

### ✅ Gestão Dinâmica
- Adicionar/eliminar categorias e subcategorias
- Importar dados do Supabase
- Persistência automática

## 🗄️ Configuração do Supabase (Opcional)

Para persistir dados entre sessões:

1. Cria uma conta em [supabase.com](https://supabase.com)
2. Cria um novo projeto
3. Atualiza o ficheiro `utils/supabase/info.tsx`:
   ```typescript
   export const projectId = "SEU_PROJECT_ID";
   export const publicAnonKey = "SUA_ANON_KEY";
   ```

4. Faz deploy da Edge Function:
   ```bash
   npm install -g supabase
   supabase login
   supabase functions deploy server --project-ref SEU_PROJECT_ID
   ```

**Nota:** A aplicação funciona completamente offline sem Supabase. Os dados ficam guardados apenas no browser.

## 🛠️ Tecnologias Utilizadas

- **React 18.3** - Framework UI
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Estilização
- **Vite** - Build tool
- **Lucide React** - Ícones
- **Supabase** - Backend (opcional)
- **Hono** - Edge Functions API
- **Canvas API** - Geração de imagens

## 📝 Comandos Úteis

```bash
# Desenvolvimento
pnpm dev

# Build para produção
pnpm build

# Preview da build
pnpm preview

# Limpar node_modules e reinstalar
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## 🎨 Personalização

### Cores do Tema
Edita `src/styles/theme.css` para personalizar as cores principais.

### Adicionar Ferramentas
Usa a interface para adicionar novas ferramentas, ou edita diretamente o estado inicial em `src/app/App.tsx`.

## 📄 Licença

Este projeto foi desenvolvido com Claude Code (Anthropic).

## 🆘 Suporte

Se tiveres problemas:
1. Certifica-te que tens Node.js 18+ instalado
2. Apaga `node_modules` e executa `pnpm install` novamente
3. Verifica se a porta 5173 está livre

---

**Desenvolvido com ❤️ usando Claude Code**
