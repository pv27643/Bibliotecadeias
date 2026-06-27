# W5 — Repurpose de Conteúdo

**Webhook path:** `repurpose-content`  
**Método:** POST `application/json`

## Request payload
```json
{
  "brand_id": "uuid",
  "brand_style": { ...BrandStyleProfile },
  "source_url": "https://blog.exemplo.com/artigo",
  "source_text": "ou texto direto se não houver URL",
  "platforms": "Instagram + LinkedIn",
  "num_posts": "2"
}
```

## Nós n8n
1. **Webhook**
2. **If: tem source_url** → **HTTP Request: Jina Reader** (`https://r.jina.ai/{{source_url}}`) para extrair texto limpo
3. **Code: Combinar texto** — usa `source_text` se não houver URL, ou o texto extraído
4. **OpenAI GPT-4o** — `response_format: json_object`
5. **Respond to Webhook**

## System prompt
```
You are a content repurposing specialist. Transform the source content into {{num_posts}} post(s) for each of these platforms: {{platforms}}.

BRAND TONE: {{brand_style.tone_of_voice.adjectives | join(', ')}}
DO: {{brand_style.tone_of_voice.do | join('; ')}}
DONT: {{brand_style.tone_of_voice.dont | join('; ')}}
SAMPLE PHRASES FOR STYLE REFERENCE: {{brand_style.tone_of_voice.sample_phrases | join(' | ')}}

Source content:
---
{{source_text}}
---

Adapt the core message for each platform's format and audience. Each post must feel native to that platform.

Respond ONLY with valid JSON:
{
  "posts": [
    {
      "platform": "Instagram",
      "caption": "...",
      "hashtags": ["#tag"],
      "visual_concept": "brief image description"
    }
  ]
}
```

## Response
```json
{
  "posts": [
    { "platform": "string", "caption": "string", "hashtags": ["string"], "visual_concept": "string" }
  ]
}
```
