import type { Prompt } from "../app/App";

export const UGC_POSES_PROMPTS: Prompt[] = [
  {
    id: "ugc-poses-001-testimonial-talking-head",
    title: "Testimonial Talking Head",
    description: "Direct-to-camera testimonial setup.",
    category: "Design",
    subcategory: "UGC Poses & Scenes",
    models: ["Seedance 2.0"],
    content:
      "Use Case: Video testimonials, reviews, TikTok content\nModel: Seedance 2.0 · Aspect: 9:16 · Duration: 6s\n\nSubject: Relatable [GENDER], [AGE_RANGE], natural appearance. Real skin, real hair, a shirt they'd actually wear. Slight imperfections: a loose hair, a faint scar, uneven brows.\n\nShot composition: Static shot, head-and-shoulders framing, eye level, 18° headroom. Subject at 55% right of frame, eyes on camera.\n\nAction: Subject speaks mid-sentence. Lips in motion, one hand gesturing lightly (enters frame from below around second 3). Natural weight shifting. Micro-movements, a blink, a small head tilt. Not motionless.\n\nSetting: Real home background. A bookshelf edge, a houseplant, a picture frame. Softly blurred at f/2.8-equivalent.\n\nLighting: Natural window light from camera-left at 5200K, optional ring-light fill from camera-front at 20% (visible as a small catchlight ring in the eyes. Embraced, not hidden).\n\nAudio: Room tone, mouth / breath sound, casual conversational cadence. No scripted read, no podcast cleanup. One HVAC hum, one faint street bleed.\n\nStock feel: Phone camera. Slight compression artifacts on high-contrast edges, limited dynamic range.\n\nPhysical detail: A small background object catches the light. A framed photo reflecting the window, a book spine catching the key. Confirms the room is real.\n\nNegative: No broadcast composition, no studio softbox halo, no stabilizer smoothness. Slight handheld or tripod-with-human-adjustment.",
    image: "",
    favorite: false,
  },
  {
    id: "ugc-poses-002-mirror-selfie",
    title: "Mirror Selfie",
    description: "Casual mirror selfie with a product, prop, or visible proof object.",
    category: "Design",
    subcategory: "UGC Poses & Scenes",
    models: ["Nano Banana 2"],
    content:
      "Use Case: Instagram stories, TikTok, authentic product content, proof posts\nModel: Nano Banana 2 · Aspect: 9:16\n\nScene: A person taking a mirror selfie in [LOCATION], holding [PRODUCT] up in the non-phone hand.\nSubject: [AGE_RANGE] [GENDER], real skin with visible pores, slight undereye tiredness, natural teeth if visible. Casual loungewear. A hoodie, a worn-in t-shirt, real clothes.\nExpression: Mid-action look at the phone screen, not a posed smile. Slightly asymmetrical mouth. Genuine.\nCamera: Shot through a front-facing iPhone lens. Slight wide-angle distortion visible, hand-framed not perfectly level (2-3° tilt).\nEnvironment: The [LOCATION] is real and messy at the edges. A hair tie on the counter, a crumpled towel, a charging cable visible. Lived-in, not staged.\nLighting: Natural afternoon window mixing with warm ~2800K bathroom/bedroom overhead. The mixed color temperature is the point, faint green or magenta shift visible in the mirror.\nImperfections: Slight motion blur on the phone-holding hand's edge; one smudge on the mirror; a stray hair.\nStock feel: iPhone camera. Noise in shadows, tight dynamic range, not cinema.\nNegative: No studio lighting, no professional poses, no perfect symmetry, no clean background.",
    image: "",
    favorite: false,
  },
  {
    id: "ugc-poses-003-in-use-reaction",
    title: "In-Use Reaction",
    description: "Genuine surprised or delighted reaction while using a product, tool, or offer proof.",
    category: "Design",
    subcategory: "UGC Poses & Scenes",
    models: ["Nano Banana 2"],
    content:
      "Use Case: Testimonial content, product reveal, reviews, reaction posts, character beats\nModel: Nano Banana 2 · Aspect: 9:16\n\nScene: A person using [PRODUCT] at the exact moment of genuine [EMOTION]. Caught mid-reaction, not posed.\nSubject: Relatable [GENDER], real skin with real texture. Pores, a small scar, maybe a visible under-eye line. Not model-level symmetry.\nExpression: Mid-reaction. Eyes slightly widened, mouth caught between words, not a held smile. Face musculature in motion.\nAction: Looking at the product, tool, or proof object with impressed / surprised expression, hand near face or holding it at chest level.\nEnvironment: Living room couch, a throw blanket half-kicked off, phone face-down on the cushion nearby, a coffee mug with one visible sip-line on the side table.\nCamera: Phone camera perspective, slight wide-angle, not perfectly centered. Subject at 55% right of frame.\nLighting: Late afternoon golden light 3800K from a window camera-right, mixed with cool 5500K ambient from a TV or lamp camera-left. Mixed color temperature is the truth of the scene.\nStock feel: Phone camera. Slightly crushed blacks, limited dynamic range, some grain in shadow.\nPhysical detail: One grounding detail. A pet hair on the blanket, a crumb on the subject's shirt, hair slightly out of place.\nNegative: No studio lighting, no symmetrical composition, no model poses, no softbox halos.",
    image: "",
    favorite: false,
  },
  {
    id: "ugc-poses-004-before-after-setup",
    title: "Before/After Setup",
    description: "Transformation comparison content.",
    category: "Design",
    subcategory: "UGC Poses & Scenes",
    models: ["Nano Banana 2"],
    content:
      "Use Case: Results content, testimonials, transformation\nModel: Nano Banana 2 · Aspect: 9:16\n\nComposition: Vertical split frame, clean center dividing line.\n\nLEFT (BEFORE):\n- Subject: Close-up on [AREA] with the stated visible concern.\n- Lighting: Flat bathroom overhead at 2800K. Slightly unflattering but believable.\n- Color: Desaturated slightly, neutral, not deliberately \"ugly.\"\n- Label: \"BEFORE\" in plain sans-serif overlay, bottom-left.\n\nRIGHT (AFTER):\n- Subject: Same person, same [AREA], visibly improved. Glow is subtle, not extreme. Healthy, not photoshopped.\n- Lighting: Same bathroom, same overhead, but with natural window daylight 5200K adding in from camera-right. Lifts the skin tone, warms it by ~200K.\n- Color: Slightly warmer, cleaner skin rendering. Still real.\n- Label: \"AFTER\" in plain sans-serif overlay, bottom-right.\n\nConsistency: Identical framing, same focal length (~35-50mm phone equivalent), same subject pose. What changes is ONLY the area in question.\nCredibility: 60-70% improvement. Noticeable at thumbnail, not extreme.\nStock feel: Phone camera, some grain in shadows, realistic dynamic range.\nPhysical detail: A strand of hair or an earring visible in both frames confirms it's the same person, same day.\nNegative: No studio lighting, no artificially-worse before, no extreme filter on after.",
    image: "",
    favorite: false,
  },
  {
    id: "ugc-poses-005-product-reveal-moment",
    title: "Product Reveal Moment",
    description: "Unboxing reveal excitement.",
    category: "Design",
    subcategory: "UGC Poses & Scenes",
    models: ["Seedance 2.0"],
    content:
      "Use Case: Unboxing content, first impressions, reveals\nModel: Seedance 2.0 · Aspect: 9:16 · Duration: 5s\n\nSubject: Hands only. The person's identity stays off-frame. This is about the product emerging.\n\nAction: Tissue paper being pushed aside with the fingertips; [PRODUCT] emerging from the packaging over 5 seconds. A slow deliberate pull, not a rip. The product catches the light as it lifts into frame.\n\nCamera: Static top-down at ~80° (not fully overhead. 10° off-axis for subtle 3D read). Fixed, no pan or zoom.\n\nFraming: Hands and packaging fill the lower 60%; emerging product fills upper center. Phone camera perspective.\n\nSubject details (hands): Natural skin, [SKIN_TONE], short-manicured or unpolished nails, one visible freckle or knuckle line. Real hands, not model hands.\n\nPackaging: Premium cream or ivory box, interior tissue paper with a subtle fold crease. A satin ribbon half-loose at frame edge.\n\nSetting: Light-wood table or linen surface underneath.\n\nLighting: Soft natural daylight from camera-right at 5200K, diffused through a sheer curtain. Single motivated source. Warm bounce from the tissue paper fills the shadow side.\n\nStock feel: Phone camera with slight grain in the tissue's shadow areas, natural color.\n\nAudio: Room tone, one soft paper rustle as the hands move, breath sound. No music. No voiceover.\n\nPhysical detail: A single thread from the tissue paper clings to the product's surface as it emerges. Stays through the whole shot, not removed.\n\nNegative: No studio lighting, no gloved hands, no staged model fingers, no perfect ribbon.",
    image: "",
    favorite: false,
  },
];
