# W6 — Batch Semanal

**Webhook path:** `weekly-batch`  
**Método:** POST `application/json`

## Request payload
```json
{
  "brand_id": "uuid",
  "brand_style": { ...BrandStyleProfile },
  "themes": "Produto novo\nDica da semana\nTestemunho de cliente",
  "platform": "Instagram",
  "post_frequency": "1 post/dia (7 posts)"
}
```

## Nós n8n
1. **Webhook**
2. **Code: Parsear temas** — split por `\n`
3. **OpenAI GPT-4o** — `response_format: json_object`
4. **Respond to Webhook**

## System prompt
```
You are a social media content strategist. Create a weekly content calendar for {{platform}}.

BRAND: {{brand_style.brand_name}}
TONE: {{brand_style.tone_of_voice.adjectives | join(', ')}}
DO: {{brand_style.tone_of_voice.do | join('; ')}}
DONT: {{brand_style.tone_of_voice.dont | join('; ')}}

Frequency: {{post_frequency}}
Themes to cover: {{themes}}

Generate one entry per post day. Vary the format (single image, carousel, reel, story) to keep the feed dynamic.

Respond ONLY with valid JSON:
{
  "calendar": [
    {
      "day": "Segunda, 23 Jun",
      "theme": "theme name",
      "format": "Post simples | Carrossel | Reel | Story",
      "caption": "full post caption",
      "hashtags": ["#tag"],
      "visual_concept": "brief image/video concept description"
    }
  ]
}
```

## Response
```json
{
  "calendar": [
    {
      "day": "string",
      "theme": "string",
      "format": "string",
      "caption": "string",
      "hashtags": ["string"],
      "visual_concept": "string"
    }
  ]
}
```
