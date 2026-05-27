# Biblioteca de Ideias

Painel de gestão e inspiração de ideias. Construído com React, TypeScript, Tailwind CSS e Supabase.

## Stack
- React 18 + TypeScript
- Vite
- Tailwind CSS 4
- Supabase (auth + base de dados)
- shadcn/ui

## Correr localmente

```bash
# Copia variáveis de ambiente
cp .env.example .env

# Instala dependências
npm install

# Corre o servidor de desenvolvimento
npm run dev
```

## Deploy

Ligado ao Vercel via GitHub Actions — push para `main` faz deploy automático.

## Scripts disponíveis

- `npm run dev` — Inicia servidor de desenvolvimento (Vite + Supabase local)
- `npm run build` — Build para produção
- `npm run preview` — Preview do build local
- `npm run lint` — Executa ESLint

## Estrutura do projeto

```
src/
├── app/          # Componentes principais da aplicação
│   └── components/
│       ├── BrandPostGenerator.tsx
│       ├── ImageUpload.tsx
│       └── MultiImageUpload.tsx
├── styles/       # Ficheiros CSS globais e tema
└── main.tsx      # Entry point

supabase/         # Funções serverless Supabase
utils/            # Utilities e clientes
```

## Variáveis de Ambiente

Cria um ficheiro `.env` baseado em `.env.example`:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

## Licença

MIT
