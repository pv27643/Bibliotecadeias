# n8n Workflows — Documentação

Todos os workflows recebem dados via `POST` e devolvem JSON.
A chave da OpenAI vive **apenas nas credenciais do n8n** — nunca no payload.

## Variáveis de ambiente no n8n (config → credentials)
- `OPENAI_TEXT_MODEL` — ex: `gpt-4o`
- `OPENAI_IMAGE_MODEL` — ex: `gpt-image-1`

## Workflows
| Ficheiro | Webhook path | Propósito |
|---|---|---|
| [extract-brand-style.md](extract-brand-style.md) | `extract-brand-style` | Extrai BSP de URL ou imagens |
| [generate-post.md](generate-post.md) | `generate-post` | Legenda + hashtags + CTA |
| [generate-visual.md](generate-visual.md) | `generate-visual` | Gera imagem via gpt-image |
| [generate-carousel.md](generate-carousel.md) | `generate-carousel` | Slides de carrossel |
| [repurpose-content.md](repurpose-content.md) | `repurpose-content` | Adapta conteúdo para várias plataformas |
| [weekly-batch.md](weekly-batch.md) | `weekly-batch` | Calendário de 7 dias |
