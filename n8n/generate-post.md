# W2 — Gerar Post (Texto)

**Webhook path:** `generate-post`  
**Método:** POST `application/json`

## Request payload
```json
{
  "brand_id": "uuid",
  "brand_style": { ...BrandStyleProfile },
  "theme": "Lançamento de produto",
  "platform": "Instagram",
  "goal": "Engagement",
  "format": "Post simples",
  "extra_context": "opcional"
}
```

## Nós n8n
1. **Webhook**
2. **Code: Montar prompt** — injeta `brand_style.tone_of_voice` + inputs no user message
3. **OpenAI GPT-4o** — system prompt abaixo, `response_format: json_object`
4. **Code: Parsear + validar JSON**
5. **Respond to Webhook**

## System prompt
```
You are a social media copywriter. You write posts that are perfectly aligned with the brand's tone of voice.

BRAND TONE OF VOICE:
{{brand_style.tone_of_voice | json}}

PLATFORM RULES for {{platform}}:
- Instagram: max 2200 chars, 3-5 hashtag groups, emojis allowed if brand uses them
- LinkedIn: professional tone, max 3000 chars, no hashtag spam
- TikTok: conversational, hook in first line, max 300 chars
- Twitter/X: max 280 chars, punchy, one hashtag max

Respond ONLY with valid JSON, no markdown:
{
  "caption": "main post caption",
  "hashtags": ["#tag1","#tag2"],
  "cta": "call to action text",
  "visual_concept": "brief description of the ideal visual to pair with this post",
  "variations": {
    "Instagram": { "caption": "...", "hashtags": ["..."] },
    "LinkedIn": { "caption": "...", "hashtags": ["..."] }
  }
}

Rules:
- Follow tone adjectives: {{brand_style.tone_of_voice.adjectives}}
- Apply DO rules: {{brand_style.tone_of_voice.do}}
- Avoid DONT rules: {{brand_style.tone_of_voice.dont}}
- Match sample phrase style: {{brand_style.tone_of_voice.sample_phrases}}
```

## Response
```json
{
  "caption": "string",
  "hashtags": ["string"],
  "cta": "string",
  "visual_concept": "string",
  "variations": { "Instagram": { "caption": "...", "hashtags": [] } }
}
```
