# Bibliotecadeias

Plataforma de gestão de ferramentas de IA, prompts e workflows n8n para criação de conteúdo com identidade de marca.

## Stack

- **Frontend**: React 18 + TypeScript + Vite 6
- **Estilos**: Tailwind CSS 4
- **Base de dados**: Supabase (PostgreSQL)
- **IA/Automação**: n8n (webhooks) + OpenAI GPT-4o + gpt-image-1
- **Deploy**: Vercel

## Instalação

```bash
npm install
```

## Desenvolvimento

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Variáveis de ambiente

Cria um ficheiro `.env.local` na raiz com:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_N8N_WEBHOOK=
VITE_N8N_PATH_EXTRACT_BRAND=
VITE_N8N_PATH_GENERATE_POST=
VITE_N8N_PATH_GENERATE_VISUAL=
VITE_N8N_PATH_GENERATE_CAROUSEL=
VITE_N8N_PATH_REPURPOSE=
VITE_N8N_PATH_WEEKLY_BATCH=
VITE_N8N_PATH_GENERATE_BIO=
```

## Estrutura de pastas

```
src/
├── app/                    # Aplicação principal
│   ├── App.tsx             # Layout + routing
│   ├── views/              # Páginas (Biblioteca, Prompts, Workflows)
│   ├── modals/             # Modais (Tool, Prompt, Category)
│   └── components/         # Componentes reutilizáveis
├── config/                 # Configuração de workflows
├── context/                # Estado global (AppContext)
├── data/                   # Dados estáticos (categorias)
├── hooks/                  # Custom hooks
├── types/                  # Interfaces TypeScript
└── utils/                  # Utilitários (Supabase, ícones, prompts)

docs/workflows-n8n/         # Documentação dos workflows n8n
scripts/seed/               # Scripts de seed da base de dados
```

## Workflows n8n

Consulta [docs/workflows-n8n/README.md](docs/workflows-n8n/README.md) para a documentação completa de todos os workflows.
