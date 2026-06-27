# W4 — Gerar Carrossel

**Webhook path:** `generate-carousel`  
**Método:** POST `application/json`

## Request payload
```json
{
  "brand_id": "uuid",
  "brand_style": { ...BrandStyleProfile },
  "topic": "5 dicas para melhorar o teu branding",
  "num_slides": "5",
  "platform": "Instagram"
}
```

## Nós n8n
1. **Webhook**
2. **Code: Montar prompt** — injeta BSP + inputs
3. **OpenAI GPT-4o** — `response_format: json_object`
4. **Code: Parsear slides**
5. **Respond to Webhook**

## System prompt
```
You are a carousel content creator. Create a {{num_slides}}-slide carousel for {{platform}}.

BRAND TONE: {{brand_style.tone_of_voice.adjectives | join(', ')}}
DO: {{brand_style.tone_of_voice.do | join('; ')}}
DONT: {{brand_style.tone_of_voice.dont | join('; ')}}

Topic: {{topic}}

Rules:
- Slide 1 = hook/cover (strong headline, makes people swipe)
- Middle slides = value/content (one idea per slide)
- Last slide = CTA

Respond ONLY with valid JSON:
{
  "slides": [
    {
      "slide_number": 1,
      "title": "hook headline",
      "body": "2-3 lines of supporting text",
      "visual_concept": "brief image description for this slide"
    }
  ],
  "caption": "Instagram caption to accompany the carousel",
  "hashtags": ["#tag1"]
}
```

## Response
```json
{
  "slides": [{ "slide_number": 1, "title": "...", "body": "...", "visual_concept": "..." }],
  "caption": "string",
  "hashtags": ["string"]
}
```
