# Workflows n8n — Bibliotecadeias

Documentação técnica de todos os workflows n8n integrados na aplicação.

## Tabela de Workflows

| # | ID | Nome | Endpoint | Marca | Descrição |
|---|---|---|---|---|---|
| 01 | extract-brand-style | Extrair Estilo de Marca | `POST /extract-brand-style` | Não | Extrai paleta, tipografia e tom de voz de um website ou imagens |
| 02 | generate-post | Gerar Post (Texto) | `POST /generate-post` | Sim | Gera legenda, hashtags e CTA adaptados à plataforma |
| 03 | generate-visual | Gerar Visual | `POST /generate-visual` | Sim | Cria imagem com gpt-image-1 a partir de um conceito visual |
| 04 | generate-carousel | Gerar Carrossel | `POST /generate-carousel` | Sim | Gera slides com título, corpo e conceito visual |
| 05 | repurpose-content | Repurpose de Conteúdo | `POST /repurpose-content` | Sim | Adapta conteúdo existente para várias plataformas |
| 06 | weekly-batch | Batch Semanal | `POST /weekly-batch` | Sim | Calendário editorial de 7 dias pronto a publicar |
| 07 | generate-bio | Gerar Bio | `POST /generate-bio` | Sim | Bio otimizada por plataforma |
| 08 | design-agent | Design Agent (Chat) | `POST /design-agent` | Não | Agente de chat para design e branding |

## Configuração

O base URL do n8n é configurado via:
1. `localStorage` (`n8nBaseUrl`)
2. Variável de ambiente `VITE_N8N_WEBHOOK`
3. Fallback: `http://localhost:5678/webhook`

## Estrutura de ficheiros

Cada ficheiro `NN-workflow-id.json` contém:
- `id` — identificador único
- `name` — nome legível
- `description` — o que o workflow faz
- `webhook_path` — path do endpoint n8n
- `requires_brand` — se requer uma marca activa
- `inputs` — campos do formulário
- `output` — estrutura da resposta
- `n8n_steps` — lista de nós n8n
