// src/data/cinematografiaPrompts.ts
//
// 29 briefs visuais cinematográficos para a subcategoria "Cinematografia" (Design).
// Escritos para Nano Banana Pro / Nano Banana 2 (geração de imagem).
// Descrição em PT-PT; conteúdo do prompt em inglês (melhor desempenho em modelos de imagem).
//
// Estrutura de content: cabeçalho de parâmetros (Camera/Lens/Focal/Aperture) + brief completo.

import type { Prompt } from "../app/App"; // ajustar o caminho do import se necessário

export const CINEMATOGRAFIA_PROMPTS: Prompt[] = [
  {
    id: "cinematografia-001-villeneuve-monolith",
    title: "Villeneuve Monolith",
    description:
      "Silhueta minúscula contra arquitetura geométrica colossal, lavagem monocromática e neblina volumétrica. Escala épica à Villeneuve.",
    category: "Design",
    subcategory: "Cinematografia",
    models: ["Nano Banana"],
    content:
      "Camera: Cinema Digital 70mm · Lens: Anamorphic Classic · Focal: 50mm · Aperture: f/5.6\n\nModel: Nano Banana Pro · Aspect: 2.39:1\nA lone silhouetted figure stands at the base of a colossal Brutalist monolith carved into a cliff face, occupying only 3% of the frame height in the lower right third. Shot on large-format 70mm digital cinema through anamorphic classic glass at 50mm f/5.6. The upper 70% of the frame is dominated by the monolith's ochre-amber surface, slightly softened by heavy atmospheric dust. A hidden sun behind the structure at 20° elevation casts the monolith into graphic silhouette with a warm rim of glow at its edge. Deep crushed shadows on the cliff face opposite. Colors sit in monochromatic amber tonal wash. No competing hues. Subtle horizontal anamorphic flare across the upper frame. One lit window or carved aperture visible halfway up the monolith as a tiny point of warm practical. Grain structure fine. 70mm negative scale. Kodak Vision3 250D palette for daylight-neutral clean. Villeneuve scale discipline. The landscape is the antagonist, the figure is the stakes.",
    image: "",
    favorite: false,
  },
  {
    id: "cinematografia-002-deakins-single-practical",
    title: "Deakins Single Practical",
    description:
      "Uma só fonte de luz motivada, sem fill, contenção clássica. Cada fonte justificada diegeticamente na cena.",
    category: "Design",
    subcategory: "Cinematografia",
    models: ["Nano Banana"],
    content:
      "Camera: Clean Cinema Pro · Lens: Prime · Focal: 50mm · Aperture: f/2\n\nModel: Nano Banana Pro · Aspect: 2.39:1\nA solitary figure seated at a wooden table in a dim interior, lit by exactly ONE practical source. A single tungsten desk lamp on the table at 2800K, positioned roughly 30cm from the figure's face. The lamp's warm pool illuminates half the face crisply; the opposite side falls into deep rich shadow with a natural falloff. No fill card, no secret bounce. The background dissolves into near-black, punctuated only by one barely-readable element. A shelf edge catching 2% of the lamp's spill. Shot at 50mm f/2 on clean full-frame digital cinema. ARRI Alexa-like sharpness, classical color science. Contrast ratio 8:1. Subtle natural halation around the lamp bulb itself. Skin texture preserved. Pore detail, slight sweat highlight on the brow. Fujifilm Eterna muted neutrality, no chromatic push. Deakins discipline. Light logic first, drama second.",
    image: "",
    favorite: false,
  },
  {
    id: "cinematografia-003-park-chan-wook-handmaiden-frame",
    title: "Park Chan-wook Handmaiden Frame",
    description:
      "Enquadramento simétrico por portal, paleta esmeralda/carmim/dourado, obsessão por texturas de seda.",
    category: "Design",
    subcategory: "Cinematografia",
    models: ["Nano Banana"],
    content:
      "Camera: Cinema Digital 35mm · Lens: Prime · Focal: 35mm · Aperture: f/2.8\n\nModel: Nano Banana Pro · Aspect: 16:9\nA figure in traditional Korean hanbok silk stands centered in an ornate doorway, the doorway itself filling exactly 50% of the frame's horizontal axis. Dark emerald-green wallpaper with gold embossed motifs frames the outer walls on either side. The interior visible through the doorway is warmer. A crimson-red upholstered chair, a brass lantern on a small lacquered table. Lit by a 3200K practical hanging lantern inside. Outer walls (camera side) sit in quiet shadow; warm bounce from the emerald wallpaper carries a green tint into the shadow side. Shot at 35mm f/2.8 on Super 35mm digital cinema. Holds the doorway edges crisp while the interior softens subtly. Perfect central symmetry. Textural fidelity on silk (hanbok embroidery), lacquered wood (lantern base), brass (lantern frame). One embroidered gold thread catches the interior practical's warmth in a bright glint. Kodak Vision3 500T palette. Tungsten-warm with organic grain. Chung Chung-hoon discipline. Frame within frame, jewel tones, silk obsession.",
    image: "",
    favorite: false,
  },
  {
    id: "cinematografia-004-zhao-xiaoding-color-block",
    title: "Zhao Xiaoding Color Block",
    description:
      "Bloco ambiental de uma só cor — figurino, cenário e luz dobrados ao mesmo tom.",
    category: "Design",
    subcategory: "Cinematografia",
    models: ["Nano Banana"],
    content:
      "Camera: Cinema Digital 35mm · Lens: Anamorphic Classic · Focal: 85mm · Aperture: f/4\n\nModel: Nano Banana Pro · Aspect: 2.39:1\nTwo figures in red silk robes mid-motion in a chamber where EVERYTHING is dominated by crimson red. Red lacquered walls, red silk drapes, red ambient light from an unseen source, red dust particulate suspended in the air. The two figures' robes flow in kinetic counterpoint. One arm raised, silk rippling against still-air space. A single high-contrast detail punctures the color block: a silver sword or white fan held by one figure, reading as sharp chromatic relief against the saturated red. Shot at 85mm f/4 on Super 35mm digital cinema with anamorphic classic glass. Horizontal compression reads as mythic widescreen. Warm 3200K key from above-frame at 45° raking across the scene, catching the particulate and fabric. Fill is entirely red-wall bounce. Fabric weave visible on silk. Kodak Vision3 500T grade, pushed slightly for saturation. Zhang Yimou / Zhao Xiaoding Hero-sequence discipline. A world one hue at a time.",
    image: "",
    favorite: false,
  },
  {
    id: "cinematografia-005-sciamma-mathon-candle",
    title: "Sciamma · Mathon Candle",
    description:
      "Dois-planos pictórico à luz de vela, linhagem dos Mestres Holandeses, composição de olhar feminino.",
    category: "Design",
    subcategory: "Cinematografia",
    models: ["Nano Banana"],
    content:
      "Camera: 35mm Film · Lens: Classic Planar · Focal: 50mm · Aperture: f/2\n\nModel: Nano Banana Pro · Aspect: 4:3\nTwo women in 18th century linen dress sit at a wooden table in an interior lit ONLY by a single candle placed between them. Equal-height composition, shoulders parallel to camera, both looking at a small object held between them (a letter, a piece of fabric). The candlelight at 1800K deep amber illuminates only the immediate foreground. Faces, hands, a small zone of table. With warm wrapping shadow falloff. Beyond the candle's reach, the interior dissolves into velvety darkness. Dutch Masters painterly composition. The quietude of Vermeer, the intimate scale of Rembrandt. Shot at 50mm f/2 on 35mm film stock (emulated). Kodak Vision3 500T palette with organic grain visible in the shadow zones. Skin texture with pore detail, fabric weave visible on linen sleeves, wood grain on the table. One candlewick flame captured mid-flicker, about to gutter. No electronic fill, no digital clean. Only the candle and the darkness.",
    image: "",
    favorite: false,
  },
  {
    id: "cinematografia-006-lynch-red-room",
    title: "Lynch Red Room",
    description:
      "Cortinas de veludo carmesim, chão em chevron, figura ligeiramente fora do tempo.",
    category: "Design",
    subcategory: "Cinematografia",
    models: ["Nano Banana"],
    content:
      "Camera: Cinema Digital 35mm · Lens: Prime Classic · Focal: 35mm · Aperture: f/4\n\nModel: Nano Banana Pro · Aspect: 16:9\nA figure stands in an ornate interior surrounded by floor-to-ceiling deep crimson velvet curtains on all visible walls. The floor is black-and-white chevron pattern, receding toward the figure. The figure is dressed in a 1950s-era dark suit or evening dress, facing camera in an almost-but-not-quite natural pose. One hand held at an unexpected angle, head tilted fractionally off symmetry. Warm 2800K tungsten practical from above casts a soft glow that the crimson walls amplify by bounce, saturating skin with a red cast. Faint smoke particulate visible in the air, almost imperceptible. A single object in the scene shouldn't be there. A ringing corded telephone with no visible cord, or a coffee cup with black liquid, or a lamp with no shade. Shot at 35mm f/4 on Super 35mm digital cinema with classic prime glass. Kodak Vision3 500T palette with subtle halation on the brightest specular highlights. David Lynch oneiric discipline. Stillness that reads as pause, not rest.",
    image: "",
    favorite: false,
  },
  {
    id: "cinematografia-007-bong-joon-ho-vertical",
    title: "Bong Joon-ho Vertical",
    description:
      "Composição de escadaria à Parasite, luz de contraste de classe, lógica de enquadramento vertical.",
    category: "Design",
    subcategory: "Cinematografia",
    models: ["Nano Banana"],
    content:
      "Camera: Cinema Digital 35mm · Lens: Prime · Focal: 35mm · Aperture: f/2.8\n\nModel: Nano Banana Pro · Aspect: 4:3\nA figure on a narrow interior staircase rising from a lower semi-basement to a brighter upper level. The composition reads vertically. Staircase diagonal cutting from lower left to upper right, walls tight on both sides. Lower zone (semi-basement) lit by cold 4200K fluorescent with subtle green cast. Claustrophobic, medical. Upper zone (visible at top of stairs) lit by warm 5500K daylight pouring from an unseen window. Aspirational, bright. The figure stands at the midpoint, half-lit by each, the transition line painted across their face. Shot at 35mm f/2.8 on Super 35mm digital cinema, modern prime. Bong's preferred look. Kodak Vision3 500T palette with subtle push on the green fluorescent cast in the lower zone. Korean domestic interior texture. The specific grain of concrete stair treads, the hardware of the handrail, the water-stain character on the lower walls. One specific element reinforces the class-contrast: a piece of clothing, a magazine, a worn shoe at the figure's feet. Bong Joon-ho Parasite discipline. Staircase as class metaphor.",
    image: "",
    favorite: false,
  },
  {
    id: "cinematografia-008-storaro-symbolic-color",
    title: "Storaro Symbolic Color",
    description:
      "Cena pintada numa só cor psicologicamente carregada, linhagem Apocalypse Now.",
    category: "Design",
    subcategory: "Cinematografia",
    models: ["Nano Banana"],
    content:
      "Camera: Cinema Digital 35mm · Lens: Prime · Focal: 50mm · Aperture: f/2.8\n\nModel: Nano Banana Pro · Aspect: 2.39:1\nA figure stands in a generic interior environment that is entirely washed in saturated emerald green light. Walls, ceiling, face, hands, clothing all tinted by the colored source. The green is psychological, not realistic. It signals envy, sickness, decay, or supernatural presence depending on context. A single cool 6500K counter-practical at 20% intensity from an unseen secondary source preserves facial legibility without breaking the chromatic wash. Shot at 50mm f/2.8 on Super 35mm digital cinema. Colored gel effect dominates. The LIGHT is green, not merely the walls. One high-contrast element (a white shirt, a piece of paper, a specific quarter of the face) stubbornly resists the green saturation, reading as cream/flesh-tone amid the wash. This makes the saturation feel deliberate rather than a grading mistake. Kodak Vision3 500T palette, pushed for chromatic saturation. Vittorio Storaro discipline. Color as emotional philosophy, one hue per scene.",
    image: "",
    favorite: false,
  },
  {
    id: "cinematografia-009-editorial-fashion-film-frame",
    title: "Editorial Fashion Film Frame",
    description:
      "Gramática de filme de moda (Glazer/Gavras), conceito narrativo acima do destaque de produto.",
    category: "Design",
    subcategory: "Cinematografia",
    models: ["Nano Banana"],
    content:
      "Camera: Clean Cinema Pro · Lens: Anamorphic Classic · Focal: 50mm · Aperture: f/2.8\n\nModel: Nano Banana Pro · Aspect: 2.39:1\nA figure in an architecturally-striking garment walks into a desert salt flat at dusk. Horizon dominates the lower third of frame; figure small but readable, walking toward camera. The garment (the product) reads from its silhouette and fabric motion. No close-up on details, no label visible. Shot at 50mm f/2.8 on full-frame digital cinema with anamorphic classic glass. Horizontal flare visible from low sun, oval bokeh on distant salt crystals. Low-angle 3600K sun camera-right at 5° elevation rakes across the salt, backlit figure with amber rim. Sky transitions from warm amber at horizon to deep cool cobalt at zenith. Atmospheric haze density 2/10, softens the far distance. Fabric motion (hem, sleeve, scarf) caught mid-walk. Kodak Vision3 500T palette with warm amber push. Jonathan Glazer / Romain Gavras discipline. Narrative conceit over product spotlight.",
    image: "",
    favorite: false,
  },
  {
    id: "cinematografia-010-perfume-campaign-macro",
    title: "Perfume Campaign Macro",
    description:
      "Macro sensual abstrato, o olfativo traduzido em visual, linguagem Mondino/Sorrentino.",
    category: "Design",
    subcategory: "Cinematografia",
    models: ["Nano Banana"],
    content:
      "Camera: Clean Cinema Pro · Lens: Vintage Aspherical · Focal: 85mm · Aperture: f/2\n\nModel: Nano Banana Pro · Aspect: 1:1\nAn extreme macro close-up of a woman's collarbone and nape. Skin with natural texture, pores visible, a single fine hair lit against the light, the curve of a clavicle in soft focus. The camera is positioned so we see only the abstraction of the body. No face, no product. A single drop of perfume (or implied liquid) beading on the skin catches the key light in a hot specular highlight. Shot at 85mm macro at f/2 on full-frame digital cinema with vintage aspherical glass. Swirly bokeh on the out-of-focus background space. Soft warm 3400K key from upper-left wraps the skin. No hard shadow, no specular on the product itself. The product is absent from this frame, implied by the sensual abstraction. Kodak Portra 400 palette. Warm pastel skin tones, organic film grain in the shadow zones. Mondino / Sorrentino discipline. The product is perfume, not a bottle; the image is sensation, not demonstration.",
    image: "",
    favorite: false,
  },
  {
    id: "cinematografia-011-michael-mann-blue-hour",
    title: "Michael Mann Blue Hour",
    description:
      "Textura de vídeo digital primitivo, hora-azul em LA, acentos de sódio, urgência à mão.",
    category: "Design",
    subcategory: "Cinematografia",
    models: ["Nano Banana"],
    content:
      "Camera: Standard · Lens: Standard · Focal: 35mm · Aperture: f/2.8\n\nModel: Nano Banana Pro · Aspect: 2.39:1\nA figure in a dark coat stands on a downtown LA rooftop at deep blue hour, city skyline visible behind. Sky in the cool cobalt-blue phase just after sunset. Amber sodium-vapor streetlights dot the cityscape in warm counterpoint to the cool sky. Shot at 35mm f/2.8 with a clean standard-zoom lens on a neutral digital camera. Simulates the early Sony CineAlta digital video texture Mann pioneered. Slight digital noise in the shadow zones (NOT film grain. Different texture: electronic, fine, slightly green-tinted in the shadows). Handheld-adjacent framing. The figure is slightly off-center, frame not perfectly level. Cool 6500K sky ambient as the dominant source; sodium 2200K practical amber as counter-accent. Subtle motion blur on moving cars in the mid-ground. No film halation. Clean digital highlights that clip slightly. Michael Mann discipline. Urgent urban cinematography, digital-native not film-trying-digital.",
    image: "",
    favorite: false,
  },
  {
    id: "cinematografia-012-classic-film-close-up",
    title: "Classic Film Close-Up",
    description:
      "Grande plano íntimo de personagem, mood New Hollywood dos anos 70.",
    category: "Design",
    subcategory: "Cinematografia",
    models: ["Nano Banana"],
    content:
      "Camera: 35mm Film · Lens: Prime Classic · Focal: 85mm · Aperture: f/2\n\nModel: Nano Banana Pro · Aspect: 16:9\nA tight close-up of a middle-aged man's face, shot on Kodak Vision3 500T 35mm film. His face fills the frame from chin to forehead, lit by a single warm practical lamp (2800K) from camera-left. Motivated single source, casting deep amber shadows across the opposite half of his face. Visible organic film grain across the image, heaviest in the shadow side. Background is a dimly lit bar interior, completely melted into a creamy wash of warm out-of-focus tones at f/2. Skin has a warm golden cast from the tungsten practical and the film stock's native response; the 85mm focal length gently compresses his features in a flattering way. Fine sweat beads on his brow catch the key; one is about to fall. The classic prime lens adds gentle softness and forgiving skin texture rendering. Highlight edges bloom softly with subtle halation. 1970s New Hollywood mood. Scorsese / Coppola lineage.",
    image: "",
    favorite: false,
  },
  {
    id: "cinematografia-013-imax-establishing-shot",
    title: "IMAX Establishing Shot",
    description:
      "Plano de estabelecimento amplo e grandioso de paisagem, escala IMAX.",
    category: "Design",
    subcategory: "Cinematografia",
    models: ["Nano Banana"],
    content:
      "Camera: Cinema 70mm Film · Lens: Standard · Focal: 14mm · Aperture: f/11\n\nModel: Nano Banana Pro · Aspect: 2.39:1\nA sweeping ultra-wide 14mm vista of a dramatic mountain valley at golden hour. Shot on large-format 70mm film (fine structured grain). Foreground: a rocky cliff edge with a single stem of wild alpine poppy catching the sun. Tack sharp. Mid-ground: a glacial turquoise river winding through deep green valley floor. Background: snow-capped peaks under a sky layered in orange, pink, and deep slate-blue clouds. Everything tack sharp from foreground to infinity at f/11. Fine structured film grain visible on close inspection only. Color carries the rich photochemical quality of 70mm. Warm golden tones in the highlights, cool blue in the shadows. Atmospheric haze adds depth in the far valley. The ultra-wide 14mm creates a panoramic wraparound. Villeneuve / Nolan IMAX scale discipline. The landscape is the subject.",
    image: "",
    favorite: false,
  },
  {
    id: "cinematografia-014-nolan-style-dialogue-scene",
    title: "Nolan-Style Dialogue Scene",
    description:
      "Cobertura de diálogo em grande formato, nitidez extrema à Nolan.",
    category: "Design",
    subcategory: "Cinematografia",
    models: ["Nano Banana"],
    content:
      "Camera: Cinema Digital 70mm · Lens: Prime · Focal: 50mm · Aperture: f/2.8\n\nModel: Nano Banana Pro · Aspect: 16:9\nA medium close-up of a serious woman in a dark charcoal suit, shot at 50mm on a large-format digital sensor at f/2.8. She sits in a minimalist modern office with floor-to-ceiling windows behind her. Background is slightly soft but readable. City skyline at dusk, first warm city lights beginning to glow at 2800K. Razor-sharp rendering on her face and the subtle weave of the wool suit. The large-format sensor produces gradual, subtle focus falloff (not the abrupt falloff of smaller sensors). Colors neutral and precise, slightly cool. Ambient daylight at 5200K mixes with a warm key from an off-frame interior practical on her face. Motivated two-source. Monumental deliberate composition, clean negative space on her right. One subtle catchlight in each eye. Fine digital sensor detail on the fabric texture. Nolan large-format discipline.",
    image: "",
    favorite: false,
  },
  {
    id: "cinematografia-015-anamorphic-action-wide",
    title: "Anamorphic Action Wide",
    description:
      "Visual anamórfico panorâmico para perseguições, lutas e sequências de ação.",
    category: "Design",
    subcategory: "Cinematografia",
    models: ["Nano Banana"],
    content:
      "Camera: Cinema Digital 35mm · Lens: Anamorphic Classic · Focal: 24mm · Aperture: f/4\n\nModel: Nano Banana Pro · Aspect: 2.39:1\nA 24mm wide anamorphic shot of a car chase through a rain-soaked city street at night. A black sports car slides through a turn toward the camera; wet asphalt reflects streaks of neon signs and traffic lights. Prominent horizontal blue (4800K) and amber (2400K) anamorphic flares streak across the frame from streetlights entering the lens. Out-of-focus background lights render as elliptical oval bokeh. The signature anamorphic characteristic. Frame edges show gentle barrel curvature and softness. Captured on Super 35mm digital with good dynamic range. Detail held in both dark shadows and bright neon highlights. Motion blur at the car's edges suggests speed. f/4 keeps car and road sharp; buildings layer behind with moderate depth separation. One water spray droplet suspended mid-air in the car's wake, catching a neon glint. Atmospheric haze from rain. Blockbuster action discipline.",
    image: "",
    favorite: false,
  },
  {
    id: "cinematografia-016-dreamy-music-video",
    title: "Dreamy Music Video",
    description:
      "Visual etéreo e luminoso popular em videoclipes de R&B e indie.",
    category: "Design",
    subcategory: "Cinematografia",
    models: ["Nano Banana"],
    content:
      "Camera: Clean Cinema Pro · Lens: Vintage Aspherical · Focal: 50mm · Aperture: f/1.2\n\nModel: Nano Banana Pro · Aspect: 16:9\nA close-up portrait of a young woman bathed in soft diffused golden light, shot at 50mm f/1.2 on a full-frame digital cinema camera through a vintage aspherical lens. Her face is tack sharp; everything beyond her dissolves into a swirling wash of out-of-focus light. Background contains many small warm practical lights. Fairy lights, candles. That bloom into large swirly bokeh orbs with visible aspherical rendering. The f/1.2 aperture creates paper-thin depth. One eyelash plane sharp, the other soft. Warm halation blooms at the brightest highlight edges. Gentle lens haze across the highlights. Warm golden and amber tones dominate; skin carries a soft warm glow. One stray hair catches the rim of the back-light, lit like filament. Organic feel. Film-grain simulation applied lightly. Frank Ocean / SZA music video aesthetic.",
    image: "",
    favorite: false,
  },
  {
    id: "cinematografia-017-documentary-street",
    title: "Documentary Street",
    description:
      "Sensação natural e à mão de cinema documental observacional.",
    category: "Design",
    subcategory: "Cinematografia",
    models: ["Nano Banana"],
    content:
      "Camera: Cinema Digital 35mm · Lens: Standard · Focal: 35mm · Aperture: f/2.8\n\nModel: Nano Banana Pro · Aspect: 16:9\nA candid 35mm shot of a street vendor preparing food at a busy outdoor market. Shot on Super 35mm digital cinema with a neutral standard lens at f/2.8. The vendor is in focus center-frame, hands in motion with slight natural motion blur. Market behind: other stalls, colorful awnings at a slightly defocused f/2.8, passing shoppers softened but clearly recognizable. Natural overhead daylight at 5500K with warm bounce from the vendor's amber awning above her. Motivated two-source. Colors warm and true. Natural skin tone rendering, no stylistic push. One splash of oil visible in the hot pan catching the key light. Slight handheld implied framing (2-3° off-level). Atmospheric haze from cooking steam rising mid-frame. Observational, unposed. Bourdain Parts Unknown / Nat Geo documentary discipline.",
    image: "",
    favorite: false,
  },
  {
    id: "cinematografia-018-indie-film-handheld",
    title: "Indie Film Handheld",
    description:
      "Textura crua de cinema independente, estilo A24.",
    category: "Design",
    subcategory: "Cinematografia",
    models: ["Nano Banana"],
    content:
      "Camera: 35mm Film · Lens: Prime Classic · Focal: 35mm · Aperture: f/2\n\nModel: Nano Banana Pro · Aspect: 16:9\nA 35mm Kodak Portra 400 film shot of a young man walking down a quiet residential sidewalk in late afternoon light. 35mm focal length, f/2, camera handheld walking alongside him. Natural gentle motion implied in the slight frame drift. Visible organic film grain gives the image tactile analog quality. Modest houses and trees in background, softened by f/2 but still present and contextual. Warm 3800K golden late-afternoon sunlight raking his face and shoulders from camera-right. Natural bounce from the opposite sidewalk fills the shadow side at 4:1 ratio. Colors sit in warm earthy tones. Portra's characteristic subtle yellow warmth. Expression contemplative, caught between thoughts. Not posed. A single dry leaf tumbles across the pavement at his feet. Classic prime lens adds gentle warmth and slight softness. A24 / Moonlight / Lady Bird visual texture.",
    image: "",
    favorite: false,
  },
  {
    id: "cinematografia-019-telephoto-surveillance",
    title: "Telephoto Surveillance",
    description:
      "Teleobjetiva achatada e voyeurística usada em thrillers e filmes de espionagem.",
    category: "Design",
    subcategory: "Cinematografia",
    models: ["Nano Banana"],
    content:
      "Camera: Clean Cinema Pro · Lens: Anamorphic · Focal: 200mm · Aperture: f/2.8\n\nModel: Nano Banana Pro · Aspect: 2.39:1\nA 200mm telephoto shot of a man in a dark coat walking through a crowded urban sidewalk. Extreme compression stacks pedestrians, signage, and buildings into flattened overlapping layers. Subject mid-frame at ~55% right, identifiable but surrounded by layers of blurred figures fore and aft at f/2.8. Widescreen anamorphic frame adds subtle horizontal weight. Background densely compressed but out of focus. A sea of coats and movement. Mood cold, clinical, voyeuristic. As if surveilled from across the street. Colors slightly desaturated, cool blue-gray grade. Full-frame digital sensor delivers extremely clean high-resolution detail on the subject's face. Sharp enough to identify. One passing pedestrian in the foreground catches the key light briefly at a specular button. Confirms distance, confirms witness. Modern anamorphic flare control. The Conversation / Tinker Tailor / Bourne discipline.",
    image: "",
    favorite: false,
  },
  {
    id: "cinematografia-020-vhs-home-video",
    title: "VHS Home Video",
    description:
      "Visual nostálgico de câmara de vídeo doméstica, para flashbacks e found-footage.",
    category: "Design",
    subcategory: "Cinematografia",
    models: ["Nano Banana"],
    content:
      "Camera: Camcorder · Lens: Standard · Focal: 35mm · Aperture: f/5.6\n\nModel: Nano Banana 2 · Aspect: 4:3\nAn image captured on a late-1990s consumer camcorder: a family birthday party in a living room. Unmistakable interlaced video texture. Slightly soft overall, visible electronic noise in shadow areas, oversaturated colors with a blue-green cast. Everything in the room in focus from the tiny sensor at f/5.6 (deep depth of field, edge to edge). Wide 35mm-equivalent angle captures the whole room. Child in a pointed party hat sits at the table with a birthday cake, surrounded by four adults mid-laugh. Room lit by harsh overhead fluorescent at 4200K mixed with warm 3000K afternoon window light. Mismatched white balance baked in, auto-WB can't decide. Date-stamp overlay '07·14·1998' in the corner. One balloon sags slightly off-camera top-right. A piece of cake frosting smeared on a plastic plate in foreground. Pure 1990s nostalgia. Home video, not cinema.",
    image: "",
    favorite: false,
  },
  {
    id: "cinematografia-021-super-8-memory",
    title: "Super 8 Memory",
    description:
      "Imagem 8mm crua e tremida para sequências de memória e montagens.",
    category: "Design",
    subcategory: "Cinematografia",
    models: ["Nano Banana"],
    content:
      "Camera: 8mm Film · Lens: Vintage Aspherical · Focal: 50mm · Aperture: f/2\n\nModel: Nano Banana 2 · Aspect: 4:3\nA 50mm shot on Super 8mm film of a couple walking hand-in-hand along a sunlit beach, seen from behind. Extreme heavy grain dances across every pixel, overwhelming fine detail. Colors warm and heavily faded. Washed-out yellows, pale oranges, muted pale blue ocean. Vintage aspherical lens renders the ocean waves behind them into swirly bokeh at f/2. Visible mechanical imperfection. Slight gate weave making the frame edges gently unstable, as if the projector is wobbling. Sunlight creates blown-out blooming highlights with warm halation around the brightest areas. A single hand-held flag or a piece of beach grass caught in the wind at frame-left. Everything feels like a memory slowly being forgotten. Tree of Life / family Super 8 reel discipline. Warmth and loss baked in.",
    image: "",
    favorite: false,
  },
  {
    id: "cinematografia-022-product-or-subject-hero",
    title: "Product or Subject Hero",
    description:
      "Produto ou sujeito isolado premium, nítido e tonalmente acolhido sobre fundo limpo.",
    category: "Design",
    subcategory: "Cinematografia",
    models: ["Nano Banana"],
    content:
      "Camera: Clean Cinema Pro · Lens: Prime · Focal: 85mm · Aperture: f/2.8\n\nModel: Nano Banana Pro · Aspect: 1:1\nA premium isolated product hero of a matte black wireless headphone floating at a slight 15° angle against a seamless dark charcoal #1A1A1C to #0A0A0A gradient backdrop. Shot at 85mm on a full-frame digital cinema sensor with a modern prime lens at f/2.8. Product tack sharp. Every material rendered precisely: soft leather earcup with visible grain, brushed aluminum hinges catching the key, woven cable texture, precise stitching on the headband. Background dissolves into a clean non-distracting dark gradient. Hard rim light camera-right at 4500K cool-neutral sculpts the top edge; soft fill from below at 30% opens shadow side without collapsing drama. Fujifilm Eterna neutral color rendering. One subtle reflection of the rim light in the polished hinge pivot. Confirms real metal. Zero grain, zero noise. Maximum resolution for inspection. Apple / Bang & Olufsen campaign discipline.",
    image: "",
    favorite: false,
  },
  {
    id: "cinematografia-023-subject-in-lifestyle-context",
    title: "Subject in Lifestyle Context",
    description:
      "Sujeito a viver dentro de um ambiente real, aspiracional mas credível.",
    category: "Design",
    subcategory: "Cinematografia",
    models: ["Nano Banana"],
    content:
      "Camera: Cinema Digital 35mm · Lens: Classic Planar · Focal: 35mm · Aperture: f/2\n\nModel: Nano Banana Pro · Aspect: 4:5\nA 35mm shot of a minimalist stoneware coffee mug (matte oat-cream glaze) sitting on an unfilled oak kitchen table in a sunlit Scandinavian-style kitchen. Shot on Super 35mm digital with a classic Zeiss Planar-type prime at f/2. Mug tack sharp in center-left of frame. Background: white subway tile, green potted basil on the sill, morning light flooding through sheer linen curtains. Softened by f/2 but clearly recognizable and aspirational. One thin ribbon of steam rising from the mug. Zeiss coating character renders colors warm and slightly filmic. Kodak Portra 400 palette. Natural 5200K window light from camera-right; natural bounce from the tile wall fills the shadow side at 3:1. A single coffee ring stained into the oak near the mug base. Someone set this cup down and picked it up again. Premium DTC Instagram discipline.",
    image: "",
    favorite: false,
  },
  {
    id: "cinematografia-024-fashion-editorial-portrait",
    title: "Fashion Editorial Portrait",
    description:
      "Retrato editorial com pele lisonjeira e profundidade de médio formato.",
    category: "Design",
    subcategory: "Cinematografia",
    models: ["Nano Banana"],
    content:
      "Camera: Medium Format Film · Lens: MF Planar · Focal: 135mm · Aperture: f/2\n\nModel: Nano Banana Pro · Aspect: 3:4\nA 135mm portrait of a female model wearing a structured camel overcoat, shot on medium format film with a Hasselblad Planar-type lens at f/2. She stands in a neutral softly-lit studio; warm gray backdrop dissolves into a silky three-dimensional wash of bokeh from the medium format's ultra-shallow depth. Her face and the coat's twill texture tack sharp with the characteristic medium format tonal rendering. Skin carries the unmistakable medium format smoothness. Real pore texture preserved, fine refined film grain like sifted sand. 135mm compression flatters her features and pulls the coat's architectural lines together beautifully. Colors rich and photochemically deep. Kodak Portra 800. Single large softbox camera-left at 5500K; subtle 6500K cool rim behind separates her from the backdrop. One stray hair caught by the rim. Kept, not retouched. Vogue editorial / Burberry campaign discipline.",
    image: "",
    favorite: false,
  },
  {
    id: "cinematografia-025-flat-lay-detail-grid",
    title: "Flat Lay Detail Grid",
    description:
      "Arranjo visto de cima, tudo nítido de canto a canto. Para grelhas, catálogos e conjuntos EDC.",
    category: "Design",
    subcategory: "Cinematografia",
    models: ["Nano Banana"],
    content:
      "Camera: Clean Cinema Pro · Lens: DSLR Full Frame · Focal: 50mm · Aperture: f/8\n\nModel: Nano Banana Pro · Aspect: 1:1\nAbsolute 90° top-down shot of a neatly arranged collection of everyday carry items on a dark slate surface: a leather wallet, a field watch at 10:10, a brass fountain pen, a folding pocket knife, tortoiseshell sunglasses, a keyring with three keys. Shot at 50mm on a full-frame digital cinema with a sharp DSLR-type lens at f/8. Every item tack sharp from center to corners. 50mm gives zero distortion. Rectangular objects have perfectly straight edges. Large overhead 4x6ft softbox centered at 5500K; twin white bounce cards at frame edges at 60%. Soft even light, subtle dimensional shadows only. Kodak Ektar 100 clean vivid palette. One item. The knife. Sits 5° off the grid angle, keeping the composition hand-placed not algorithmic. A single scratch on the slate near the wallet catches the key. Geometric precision, GQ-review aesthetic.",
    image: "",
    favorite: false,
  },
  {
    id: "cinematografia-026-ugc-phone-camera-style",
    title: "UGC Phone-Camera Style",
    description:
      "Captura autêntica de câmara de telemóvel, o look não-encenado que as redes confiam.",
    category: "Design",
    subcategory: "Cinematografia",
    models: ["Nano Banana"],
    content:
      "Camera: Standard · Lens: Standard · Focal: 24mm · Aperture: f/4\n\nModel: Nano Banana 2 · Aspect: 9:16\nA casual 24mm shot of a person's hand holding a skincare bottle in front of their bathroom mirror. iPhone camera character. Clean digital quality with moderately deep depth at f/4, bathroom environment visible and recognizable. Wide 24mm angle slightly distorted at edges (phone lens default). Lighting: harsh overhead LED (~4000K) mixed with warm natural window light (3800K) from frame-right. Uncontrolled mixed WB typical of genuine user content. Composition off-center, subject at 60% right of frame, as if held with one hand. Slight 2° tilt. A hair tie on the counter, toothbrush visible in a cup, a towel slightly rumpled at frame edge. Lived-in, not staged. Fingers holding the bottle show real skin with pore texture; one thumbnail slightly shorter than the others. Phone camera slight grain in shadow zones. A splash of water on the mirror near subject's hand. Authentic, unproduced. TikTok / Reels review discipline.",
    image: "",
    favorite: false,
  },
  {
    id: "cinematografia-027-luxury-editorial-hero",
    title: "Luxury Editorial Hero",
    description:
      "Hero editorial premium com isolamento extremo e profundidade tonal rica, linhagem Avedon/Leibovitz.",
    category: "Design",
    subcategory: "Cinematografia",
    models: ["Nano Banana"],
    content:
      "Camera: Medium Format Film · Lens: MF 67 · Focal: 85mm · Aperture: f/1.4\n\nModel: Nano Banana Pro · Aspect: 3:4\nAn 85mm portrait of a male model wearing a diamond-encrusted wristwatch, his hand resting on a dark mahogany desk. Shot on medium format film with a Pentax 67-style lens at f/1.4. Extraordinarily thin depth. Watch face in razor-sharp detail while the model's face and room dissolve into a rich creamy backdrop of large round bokeh orbs from distant warm 2800K practicals. The large negative produces that signature three-dimensional separation between the watch-bearing wrist and everything else. Fine film grain adds tactile texture. Colors deep, saturated, luxurious. Warm amber highlights, cool shadow undertone. Single directional warm key camera-right, hard enough to reveal musculature in the hand; no artificial fill (the darkness is the composition). Kodak Vision3 500T palette. One small diamond catches the rim light with a tight star pattern. The mahogany shows visible grain under the hand. Avedon / Leibovitz campaign discipline. Cartier / Omega.",
    image: "",
    favorite: false,
  },
  {
    id: "cinematografia-028-culinary-close-up",
    title: "Culinary Close-Up",
    description:
      "Comida e bebida apetitosas em foco raso, rendering Bon Appétit/Michelin.",
    category: "Design",
    subcategory: "Cinematografia",
    models: ["Nano Banana"],
    content:
      "Camera: Clean Cinema Pro · Lens: Classic Planar · Focal: 85mm · Aperture: f/2\n\nModel: Nano Banana Pro · Aspect: 4:5\nAn 85mm shot of a plated pasta dish on a matte-black ceramic plate at a restaurant table. Full-frame digital cinema with a classic Zeiss Planar-type prime at f/2. Pasta tack sharp. Every noodle, fresh basil leaf, and glistening olive oil droplet rendered with mouthwatering clarity. Table setting in foreground (wine glass rim, linen napkin edge) and rustic walnut table in background softly out of focus at f/2. All attention on the dish. Zeiss rendering pops the food colors: deep red San Marzano tomato sauce, vivid green basil, golden pasta. Warm moody restaurant key from camera-right at 2800K. Dramatic shadow on the left half of the plate, glossy sauce highlights catching halation bloom. 85mm compresses the composition into a compact appetizing read. One thin curl of steam rising from the pasta. A single grain of parmesan still un-melted on top. Texture cue. Bon Appétit cover / Michelin menu discipline.",
    image: "",
    favorite: false,
  },
  {
    id: "cinematografia-029-architectural-interior-wide",
    title: "Architectural Interior Wide",
    description:
      "Interior amplo e luminoso, nítido de canto a canto. Para listagens e showcases de arquitetura.",
    category: "Design",
    subcategory: "Cinematografia",
    models: ["Nano Banana"],
    content:
      "Camera: Clean Cinema Pro · Lens: DSLR Full Frame · Focal: 14mm · Aperture: f/8\n\nModel: Nano Banana Pro · Aspect: 3:2\nAn ultra-wide 14mm interior shot of a modern luxury living room. Full-frame digital cinema with a sharp DSLR-type lens at f/8. Entire room captured corner to corner. A large sectional sofa in the foreground, marble coffee table in the center, floor-to-ceiling windows revealing a sunset city skyline in the background. Everything razor sharp from the nearest throw pillow to the farthest building. Dynamic range balances bright window view and darker interior corners without blowing or losing detail. Colors bright, clean, true-to-life. Wide angle makes the room read spacious and inviting. Vertical lines straight and corrected. No keystone. Warm 2800K evening light floods from the windows; cool 4200K overhead recessed fills the interior. Motivated two-source. One coffee table book half-open on the marble, a throw blanket casually draped on the sofa arm. Lived-in, not staged. Fujifilm Eterna neutral rendering. Architectural Digest / luxury Zillow discipline.",
    image: "",
    favorite: false,
  },
];
