# W3 — Gerar Visual (IMPROVED v2)

**Webhook path:** `generate-visual`  
**Método:** POST `application/json`

## Arquitetura (nova)
```
Webhook → Extrair Input → Buscar BSP → Construir Style Anchor → Montar Enhancer Payload → GPT-4o Enhancer → Montar Request Imagem → gpt-image-1 → Extrair Resultado
```

**Mudança chave:** GPT-4o gera um prompt de 500+ palavras antes de chamar gpt-image-1. Separação entre inteligência criativa e execução visual.

## Request payload
```json
{
  "brand_id": "uuid",
  "concept": "Produto sobre fundo branco com sombra suave",
  "text_overlay": "50% OFF este fim de semana",
  "aspect_ratio": "1:1"
}
```

## Nó 1 — Extrair Input (Code)
```javascript
const body = $input.first().json.body || $input.first().json;
const brandId = body.brand_id || '';
if (!brandId) throw new Error('brand_id required');
const concept = body.concept || body.visual_concept || 'product hero shot';
const textOverlay = body.text_overlay || '';
const aspectRatio = body.aspect_ratio || '1:1';
return [{ json: { brandId, concept, textOverlay, aspectRatio } }];
```

## Nó 2 — Buscar BSP Supabase (HTTP Request)
GET `https://rgbszdjyubbxhzhspuqv.supabase.co/rest/v1/brand_profiles?id=eq.{{brandId}}&select=*`

## Nó 3 — Construir Style Anchor (Code)
```javascript
const rawBsp = $input.first().json;
const bsp = Array.isArray(rawBsp) ? rawBsp[0] : rawBsp;
if (!bsp || !bsp.brand_name) throw new Error('Brand not found in Supabase');
const p = bsp.palette || {};
const img = bsp.imagery_style || {};
const lay = bsp.layout_patterns || {};
const typ = bsp.typography || {};
const tov = bsp.tone_of_voice || {};
const inputs = $('Extrair Input').first().json;
const extraColors = (p.extra || []).map((c, i) => `Extra${i+1}: ${c}`).join(', ');
const paletteStr = `Primary: ${p.primary||'N/A'} | Secondary: ${p.secondary||'N/A'} | Accent: ${p.accent||'N/A'} | Background: ${p.background||'N/A'} | Neutral: ${p.neutral||'N/A'} | Text: ${p.text||'N/A'}${extraColors ? ' | '+extraColors : ''}`;
const styleAnchor = `BRAND: ${bsp.brand_name}
COLOR PALETTE (ONLY THESE — NO EXCEPTIONS): ${paletteStr}
IMAGERY: ${img.description||'clean professional commercial photography'}
COMPOSITION RULES: ${(img.composition_rules||[]).join(' | ')||'professional composition'}
VISUAL TREATMENT: ${img.filters||'clean, sharp, professional'}
LAYOUT: ${lay.grid||'flexible'} | spacing: ${lay.spacing||'generous'} | alignment: ${lay.alignment||'left'}
TYPOGRAPHY: ${typ.heading_font||'sans-serif'} (${(typ.weights||['400','700']).join('/')})
TONE ADJECTIVES: ${(tov.adjectives||[]).join(', ')}`;
return [{ json: { bsp, styleAnchor, ...inputs } }];
```

## Nó 4 — Montar Enhancer Payload (Code)
```javascript
const { styleAnchor, concept, textOverlay, aspectRatio, bsp } = $input.first().json;
const brandName = bsp?.brand_name || 'the brand';

const systemPrompt = `You are an elite art director and prompt engineer specializing in brand-consistent commercial photography for social media.

Your task: expand a brief visual concept into an ultra-detailed image generation prompt (MINIMUM 500 words) that guarantees photographic precision and brand consistency.

STRUCTURE YOUR PROMPT IN THIS EXACT ORDER:

1. PHOTOGRAPHIC GENRE — State the exact photography style (commercial product photography / lifestyle editorial / beauty campaign / food photography / fashion editorial, etc.)

2. SUBJECT — Describe the main subject with material specificity: finish (matte/gloss/satin), texture, scale relationship to frame, exact position in the composition

3. LIGHTING SETUP — Be technically precise:
   - Key light: direction (e.g., upper-left at 45°), type (large softbox / diffused natural window / beauty dish / LED panel), color temperature in Kelvin, output intensity (dominant)
   - Fill light: source, ratio to key (e.g., 3:1 key-to-fill), which side
   - Rim/separation light if relevant: color temp difference from key, placement
   - Shadow quality: hard/soft, direction, density, ground shadow description

4. LENS & CAMERA — Specify precisely:
   - Focal length (e.g., 85mm for flattering product compression, 50mm for lifestyle, 35mm for environmental context)
   - Aperture (e.g., f/1.8 for strong background separation, f/8 for full product sharpness edge-to-edge)
   - Resulting depth of field in plain language
   - Camera angle (eye level / 15° above / product-level / overhead)

5. COMPOSITION — Be specific:
   - Subject placement (rule of thirds / dead center / lower-left anchor)
   - Negative space: exact percentage and its location
   - Leading lines if present
   - Foreground / midground / background depth layers

6. COLOR ENFORCEMENT — NON-NEGOTIABLE:
   "The ONLY colors present in this image are the brand palette colors listed above. Each palette color has a specific role: assign each hex to background, subject color, accent highlight, shadow tone. The lighting color temperature reinforces these hues. Do NOT introduce ANY color outside this palette. No competing tones, no accidental color casts."

7. SURFACE & ENVIRONMENT — What is the subject placed on? Material, color, texture? What is behind it? Any props?

8. COLOR GRADING — Post-processing style:
   - Overall temperature: warm or cool grade
   - Saturation level (e.g., "slightly desaturated, film-like" / "vivid and saturated" / "muted pastel")
   - Contrast: low-key moody / high-key clean / cinematic mid-contrast
   - Highlight and shadow treatment

9. BRAND CONSISTENCY ANCHOR — End with:
   "This image belongs to a visual content series for ${brandName}. Every element — the lighting direction, the color palette, the composition approach, the post-processing treatment, the depth of field choice — must be identical in approach to every other image in this series. Visual drift is not acceptable."

10. NEGATIVE PROMPT — Explicitly list prohibited elements:
    "Do NOT include: any color outside the defined brand palette, watermarks, logos or text unless explicitly specified, cluttered backgrounds, harsh unflattering shadows, stock-photo aesthetic, unrealistic lighting, oversaturation, HDR effect, heavy vignette, lens distortion, motion blur, low resolution appearance."

OUTPUT RULE: Return ONLY the prompt text. No headers, no section labels, no JSON, no markdown. Pure flowing descriptive text, minimum 500 words.`;

const userMessage = `BRAND VISUAL IDENTITY:
${styleAnchor}

VISUAL CONCEPT TO EXPAND: ${concept}${textOverlay ? `\nTEXT TO RENDER IN THE IMAGE: "${textOverlay}" — use brand typography, ensure legibility against background` : ''}
TARGET FORMAT: ${aspectRatio}

Expand into 500+ word ultra-detailed image prompt.`;

const payload = {
  model: 'gpt-4o',
  max_tokens: 1800,
  temperature: 0.7,
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage }
  ]
};
return [{ json: { payload } }];
```

## Nó 5 — GPT-4o Enhancer (HTTP Request)
POST `https://api.openai.com/v1/chat/completions`  
Body: `={{ JSON.stringify($json.payload) }}`  
Timeout: 90000ms

## Nó 6 — Montar Request Imagem (Code)
```javascript
const enhancedPrompt = $input.first().json.choices?.[0]?.message?.content || '';
if (!enhancedPrompt) throw new Error('Enhancer returned empty');
const inputs = $('Extrair Input').first().json;
const sizeMap = {
  '1:1': '1024x1024',
  '9:16': '1024x1792',
  '16:9': '1792x1024',
  '4:5': '1024x1280'
};
const ar = (inputs.aspectRatio || '1:1').split(' ')[0].trim();
const size = sizeMap[ar] || '1024x1024';
const imagePayload = { model: 'gpt-image-1', prompt: enhancedPrompt, n: 1, size, quality: 'high' };
return [{ json: { imagePayload, enhancedPrompt } }];
```

## Nó 7 — gpt-image-1 (HTTP Request)
POST `https://api.openai.com/v1/images/generations`  
Body: `={{ JSON.stringify($json.imagePayload) }}`  
Timeout: 180000ms

## Nó 8 — Extrair Resultado (Code)
```javascript
const imgData = $input.first().json?.data?.[0];
if (!imgData) throw new Error('No image data returned');
const { enhancedPrompt } = $('Montar Request Imagem').first().json;
const image_url = imgData.url || (imgData.b64_json ? `data:image/png;base64,${imgData.b64_json}` : '');
if (!image_url) throw new Error('No URL or b64 in image response');
return [{ json: { image_url, prompt_used: enhancedPrompt } }];
```

## Response
```json
{
  "image_url": "https://... or data:image/png;base64,...",
  "prompt_used": "full 500-word enhanced prompt that was sent to gpt-image-1"
}
```

## Mapeamento aspect ratio
| Input | Tamanho |
|---|---|
| 1:1 | 1024x1024 |
| 9:16 | 1024x1792 |
| 16:9 | 1792x1024 |
| 4:5 | 1024x1280 |
