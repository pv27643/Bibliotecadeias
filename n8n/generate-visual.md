# W3 — Gerar Visual

**Webhook path:** `generate-visual`  
**Método:** POST `application/json`

## Request payload
```json
{
  "brand_id": "uuid",
  "brand_style": { ...BrandStyleProfile },
  "concept": "Produto sobre fundo branco com sombra suave",
  "text_overlay": "50% OFF este fim de semana",
  "aspect_ratio": "1:1 (Feed)"
}
```

## Nós n8n
1. **Webhook**
2. **Code: Montar prompt de imagem** — combina `imagery_style` + `palette` + `concept`
3. **OpenAI GPT-4o** (texto) — refina e expande o prompt de imagem
4. **HTTP Request: OpenAI Images API** — `POST /v1/images/generations` com `gpt-image-1`
5. **Code: Extrair URL** — pega `data[0].url` ou converte b64
6. **Google Drive: Upload** (opcional) — guarda ficheiro
7. **Respond to Webhook**

## Prompt de imagem (construído no nó Code)
```
Create a social media image for {{brand_name}}.

Brand visual identity:
- Color palette: primary={{palette.primary}}, secondary={{palette.secondary}}, accent={{palette.accent}}, background={{palette.background}}
- Imagery style: {{imagery_style.description}}
- Composition rules: {{imagery_style.composition_rules | join(', ')}}
- Filters/treatment: {{imagery_style.filters}}
- Layout: {{layout_patterns.grid}}, spacing={{layout_patterns.spacing}}, alignment={{layout_patterns.alignment}}

Post concept: {{concept}}
{{#if text_overlay}}Include text overlay: "{{text_overlay}}" — use the brand's typography style ({{typography.heading_font}}, weight {{typography.weights[0]}}){{/if}}

Aspect ratio: {{aspect_ratio_px}} ({{aspect_ratio}})
Output: clean, professional, brand-consistent. No watermarks.
```

## Mapeamento de aspect ratio
| Input | Tamanho DALL-E |
|---|---|
| 1:1 (Feed) | 1024x1024 |
| 9:16 (Story/Reel) | 1024x1792 |
| 16:9 (Landscape) | 1792x1024 |
| 4:5 (Feed vertical) | 1024x1280 |

## Response
```json
{
  "image_url": "https://...",
  "alt_text": "description",
  "viewLink": "google drive link (se uploadado)",
  "downloadLink": "google drive download link"
}
```
