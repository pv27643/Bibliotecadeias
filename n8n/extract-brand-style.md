# W1 — Extrair Estilo de Marca

**Webhook path:** `extract-brand-style`  
**Método:** POST  
**Content-Type:** `multipart/form-data` (quando há imagens) ou `application/json`

## Request payload
```json
{
  "source_type": "url | images",
  "url": "https://exemplo.com",
  "brand_name": "Nome da Marca",
  "images": "(ficheiros binários quando source_type=images)"
}
```

## Nós n8n (ordem)
1. **Webhook** — path `extract-brand-style`, responde ao último nó
2. **Code: Preparar input** — lê `source_type`, extrai `url` ou binários das imagens
3. **If: source_type = url** → **HTTP Request: Fetch HTML** (GET à URL) + **Screenshot** (serviço ou Puppeteer)
4. **OpenAI GPT-4o Vision** — analisa screenshot/imagens com o system prompt abaixo
5. **Code: Parsear JSON** — extrai o JSON do campo `brand_style` da resposta
6. **HTTP Request: Guardar no Supabase** — POST para `brand_profiles` com a anon key
7. **Respond to Webhook** — devolve `{ brand: <BrandStyleProfile> }`

## System prompt (OpenAI)
```
You are a brand identity extraction specialist. Analyze the provided reference images or webpage screenshot and extract a complete Brand Style Profile (BSP).

Output ONLY valid JSON matching this schema — no markdown, no explanation:

{
  "brand_name": "string",
  "source": { "type": "url|images", "ref": "optional url" },
  "palette": {
    "primary": "#hex", "secondary": "#hex", "accent": "#hex",
    "neutral": "#hex", "background": "#hex", "text": "#hex",
    "extra": ["#hex"]
  },
  "typography": {
    "heading_font": "font name or category",
    "body_font": "font name or category",
    "weights": ["400","700"],
    "scale": "modular scale if detectable"
  },
  "logo": { "url": null, "variants": [], "clear_space": "description" },
  "tone_of_voice": {
    "adjectives": ["confident","minimal"],
    "do": ["Use short sentences","Focus on outcomes"],
    "dont": ["Avoid jargon","No emojis"],
    "sample_phrases": ["Example headline 1","Example headline 2"]
  },
  "imagery_style": {
    "description": "mood and photographic palette",
    "composition_rules": ["rule1","rule2"],
    "filters": "warm, high contrast, etc."
  },
  "layout_patterns": {
    "grid": "12-col / asymmetric / etc.",
    "spacing": "generous / tight",
    "alignment": "left / center",
    "recurring_elements": ["badge","card","divider line"]
  },
  "platforms": {
    "instagram": { "aspect_ratios": ["1:1","9:16"], "post_types": ["quote","product"] },
    "linkedin": { "aspect_ratios": ["1.91:1"], "post_types": ["article","announcement"] }
  }
}
```

## Response esperada pelo frontend
```json
{
  "brand": { ...BrandStyleProfile }
}
```
