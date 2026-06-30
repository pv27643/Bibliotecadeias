import type { Prompt } from "../app/App";

export const HANDS_MODELS_PROMPTS: Prompt[] = [
  {
    id: "hands-models-001-feminine-hand-hold",
    title: "Feminine Hand Hold",
    description: "Elegant feminine hands holding a product, prop, or object.",
    category: "Design",
    subcategory: "Hands & Models",
    models: ["Nano Banana"],
    content:
      "Use Case: Beauty products, skincare, elegant presentation, character close-ups, hand-prop interactions\nModel: Nano Banana Pro · Aspect: 4:5\n\nSubject: Feminine hands, [SKIN_TONE] skin with real pore texture, fine natural lines at the knuckles, slight vein definition on the back of the hand.\nNails: [NAIL_STYLE]. Clean, well-groomed, not too-perfect. One nail with a slight asymmetry or a shorter cuticle. Believable.\nPose: Relaxed elegant grip. Product held at ~35° toward camera, weight balanced on the fingertips, not squeezed.\nPosition: Hands enter from lower-right at 15° angle; the arm continues out of frame.\nProduct or object: [PRODUCT] held naturally so its most important face reads camera-front. Not forced into perfect parallel.\nBackground: Softly defocused [BACKGROUND_COLOR] at f/2.8.\nLighting: Large softbox camera-left at 5500K, 45° elevation. Motivated daylight. Bounce card camera-right at 60% fills the shadow side.\nLens: 85mm at f/2.8.\nStock feel: Kodak Portra 400. Skin-safe warm palette, organic rendering of pore and vein detail.\nAnatomy: Five fingers, correct anatomical proportion, thumb in a natural curl. Not flat against the product or object.\nPhysical detail: One fine vein visible on the back of the hand, catching a subtle highlight from the key.\nFinish: Soft catchlight on the product or object's glossiest surface, fine film grain in the background defocus.\nNegative: No waxy plastic skin, no six fingers, no perfectly airbrushed surface, no CGI cleanness.",
    image: "",
    favorite: false,
  },
  {
    id: "hands-models-002-masculine-hand-hold",
    title: "Masculine Hand Hold",
    description: "Strong masculine hands holding a product, tool, or object.",
    category: "Design",
    subcategory: "Hands & Models",
    models: ["Nano Banana"],
    content:
      "Use Case: Men's grooming, tools, tech products, props, objects\nModel: Nano Banana Pro · Aspect: 4:5\n\nSubject: Masculine hands, [SKIN_TONE] skin with visible knuckle definition, subtle vein structure, short natural hair on the back of the hand at correct anatomical density.\nNails: Short, clean, unpolished. One slightly shorter than the others. Real.\nPose: Confident secure grip. Product held firmly but not squeezed, thumb and forefinger doing the work.\nPosition: One hand or both, entering from lower-right or from side-right. Arm leaves frame.\nProduct or object: [PRODUCT] angled so its most important face reads camera-front, held at natural ergonomic angle.\nBackground: Softly defocused [BACKGROUND_COLOR] at f/2.8, slightly darker than the feminine version for tonal masculine read.\nLighting: Harder key from camera-left at 5200K with a 4:1 contrast ratio. Shadow side retains form with less fill than the feminine equivalent. Harder light defines musculature and knuckle structure.\nLens: 85mm at f/2.8.\nStock feel: Kodak Vision3 500T. Tungsten-warm cinema palette, organic highlight bloom on the skin.\nAnatomy: Five fingers, correct proportion, thumb in a natural functional curl.\nPhysical detail: One small visible scar, callus, or shorter healing cut on a finger. Confirms the hand works for a living.\nFinish: Subtle halation bloom on the brightest specular highlight on the product or object; fine film grain across.\nNegative: No feminine-styled manicure, no soft beauty lighting, no airbrushed cleaned-up skin.",
    image: "",
    favorite: false,
  },
  {
    id: "hands-models-003-application-motion",
    title: "Application Motion",
    description: "Hands applying product or material. Serum, cream, paint, makeup, dough, anything tactile.",
    category: "Design",
    subcategory: "Hands & Models",
    models: ["Seedance 2.0"],
    content:
      "Use Case: Skincare application, how-to content, in-use shots, tutorial frames, ritual moments\nModel: Seedance 2.0 · Aspect: 4:5 · Duration: 4s\n\nSubject: Hands mid-motion applying [PRODUCT_TYPE]. Face, hand, surface, or application area in frame, fingers interacting with the material.\n\nAction: [APPLICATION_ACTION]. Mid-motion. The substance or tool has just made contact; fingers are beginning the spread / massage / stroke. Motion is deliberate, not frantic.\n\nHands: Natural, [SKIN_TONE], well-groomed with realistic pore and vein texture. Short clean nails.\n\nProduct or material: [PRODUCT] visible in frame. Held in the other hand or implied on the nearby surface.\n\nSkin (application area): Healthy glow with visible natural texture. Fine lines near the eyes, a subtle freckle, actual pore structure. NOT airbrushed beauty skin.\n\nMotion: Slight natural motion blur on the moving fingertips. 1/60s shutter equivalent. Not frozen, not smeared.\n\nCamera: Static close-up, 45° angled down onto the face or hand, tripod steady.\n\nLens: 50mm macro at f/2.8.\n\nLighting: Soft beauty-wrap. Large octa softbox camera-front slightly above eye level, 4800K. Beauty dish reflector below at 40% opens the under-eye area. One small hair-rim kicker at 6500K separates subject from background.\n\nStock feel: Kodak Portra 400. Skin-safe warm rendering.\n\nAudio: Gentle room tone, very soft skin-contact whisper, one slow breath.\n\nPhysical detail: A single small bead, smear, or trace of the material visible just before it blends in. Catches the key for a frame or two.\n\nNegative: No waxy plastic skin, no frozen lifeless fingers, no harsh shadow on the face.",
    image: "",
    favorite: false,
  },
  {
    id: "hands-models-004-unboxing-reveal-hands",
    title: "Unboxing Reveal Hands",
    description: "Hands lifting a product, prop, or object from packaging or wrapping.",
    category: "Design",
    subcategory: "Hands & Models",
    models: ["Nano Banana"],
    content:
      "Use Case: Unboxing content, premium reveals, gift moments\nModel: Nano Banana Pro · Aspect: 4:5\n\nScene: Hands mid-action lifting [PRODUCT] from a premium gift box.\nHands: Natural, [SKIN_TONE], gentle fingertip grip. The product or object cradled, not grabbed. Real skin texture, subtle vein definition.\nNails: Clean, [NAIL_STYLE], one marginally shorter than the others.\nPose: Product emerging from tissue paper, held between thumb and first two fingers at 35° from vertical, catching the key light.\nPackaging: Open cream or ivory gift box, branded interior, gold or blush tissue paper displaced at a natural angle (not neatly folded. The hands just moved it). A satin ribbon drapes off the box edge, touching the surface.\nSurface: Light unfilled oak or a linen tablecloth with one visible soft crease.\nAngle: 35° above the product or object, capturing both hands, packaging, and the surface in one read.\nLens: 50mm at f/2.8.\nLighting: Large window source camera-right at 5200K, diffused through sheer. Single motivated daylight. Warm bounce from the tissue paper fills the shadow side.\nStock feel: Kodak Portra 400. Warm lifestyle palette, organic skin and material rendering.\nAnatomy: Five fingers per hand, anatomically correct, natural knuckle curl.\nPhysical detail: One single strand of tissue paper catches on the product or object's surface as it lifts. Stays there, does not get removed.\nFinish: Gentle highlight bloom where the window hits the product or object's brightest specular face; fine grain in the shadow zones of the box interior.\nMood: Gift reveal on a quiet morning. Premium, warm, human. Not studio-staged.",
    image: "",
    favorite: false,
  },
];
