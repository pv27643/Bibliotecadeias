import type { Prompt } from "../app/App";

export const LIGHTING_SETUPS_PROMPTS: Prompt[] = [
  {
    id: "lighting-setups-001-three-point-softbox",
    title: "Three-Point Softbox",
    description: "Classic commercial three-point. Ecommerce hero, professional portrait, character lighting.",
    category: "Design",
    subcategory: "Lighting Setups",
    models: ["Nano Banana"],
    content:
      "Use Case: E-commerce hero, catalog work, professional portrait, character lighting, multi-subject grids\nModel: Nano Banana Pro · Aspect: 4:5\n\nLighting setup: Classic three-point softbox. E-commerce catalog standard.\nKey: Large 4x6ft softbox camera-left at 45° elevation, 5500K daylight, 100% power. Primary shape-definer.\nFill: Medium 2x3ft softbox camera-right at 45°, 50% power. Lifts shadow side to 2:1 contrast, no collapse.\nRim: Narrow strip softbox behind subject at 30° offset, 30% key. Pulls edge separation from backdrop.\nLens: 85mm at f/8.\nStock feel: Fujifilm Eterna. Neutral, slightly cool, precise material rendering.\nShadow: Soft gradient contact shadow directly beneath, fading in ~3in. No hard cast.\nBackdrop: Seamless #FFFFFF paper or neutral gray sweep.\nPhysical detail: Gentle halation bloom on the brightest specular highlight. Tells the viewer this is real glass / metal / ceramic.\nFinish: Tack sharp with very fine film grain in the background only.\nMood: Premium presentation. Precise material rendering, not generic stock.",
    image: "",
    favorite: false,
  },
  {
    id: "lighting-setups-002-natural-window-light",
    title: "Natural Window Light",
    description: "Authentic natural light from window.",
    category: "Design",
    subcategory: "Lighting Setups",
    models: ["Nano Banana"],
    content:
      "Use Case: Lifestyle shots, authentic feel, home settings\nModel: Nano Banana Pro · Aspect: 3:4\n\nLighting: Single window as the only source. Motivated, not studio.\nDirection: Light enters from [DIRECTION] at ~35° from camera axis.\nQuality: Diffused through a sheer curtain or frosted pane. Soft directional, not hard.\nColor: [TIME_OF_DAY] temperature. Morning 5600K cool-neutral, noon 5500K balanced, afternoon 3800K warm.\nFill: Natural bounce from a white wall opposite the window. No artificial source.\nLens: 50mm at f/2.8.\nStock feel: Kodak Portra 400. Warm lifestyle, skin-safe palette.\nShadow: Soft directional cast shadow on the ground plane. Edge is soft but direction is committed.\nContrast: ~4:1 ratio. Key side clearly brighter, shadow side still readable.\nPhysical detail: One dust mote floating in the window light beam. Confirms the light is real.\nFinish: Gentle halation on the brightest window-facing edge; fine film grain throughout; slight natural vignette on the shadow side.\nMood: Someone left for coffee; the light just happens to be perfect.",
    image: "",
    favorite: false,
  },
  {
    id: "lighting-setups-003-golden-hour-warmth",
    title: "Golden Hour Warmth",
    description: "Warm sunset/sunrise golden light.",
    category: "Design",
    subcategory: "Lighting Setups",
    models: ["Nano Banana"],
    content:
      "Use Case: Warm lifestyle, summer campaigns, cozy vibes\nModel: Nano Banana Pro · Aspect: 3:2\n\nLighting: Low-angle sunset / sunrise directional sun. The most cinematic hour.\nDirection: Raking horizontal from camera-right at 15° elevation.\nColor: 3400-3800K rich golden. Amber highlights, warm shadow tone.\nQuality: Slightly diffused by low atmosphere. Soft edge but committed direction.\nAccent: A small subtle lens flare bleeding in from the sun direction into upper-right frame.\nFill: No artificial fill. Let the warm ambient do the shadow work; 5:1 contrast ratio is part of the look.\nLens: 50mm at f/2.8.\nStock feel: CineStill 800T for halation bloom on the warm highlights.\nShadow: Long elongated cast shadows, warm-tinted not neutral.\nRim: Golden hair / rim light on the subject's back edge from the low sun.\nPhysical detail: A single airborne particle. Dust, a seed, a bug. Caught in the key beam.\nFinish: Warm highlight bloom on specular edges; film grain throughout, heavier in the warm shadows.\nMood: The last warm hour before the day ends. Aspirational without being staged.",
    image: "",
    favorite: false,
  },
  {
    id: "lighting-setups-004-dramatic-side-light",
    title: "Dramatic Side Light",
    description: "Bold single-source dramatic lighting.",
    category: "Design",
    subcategory: "Lighting Setups",
    models: ["Nano Banana"],
    content:
      "Use Case: Premium hero, artistic frames, character isolation, moody portrait, dramatic still life\nModel: Nano Banana Pro · Aspect: 4:5\n\nLighting: Single hard directional source from [LEFT/RIGHT] at exactly 90° to camera axis. Uncompromising side light.\nKey: Hard-edged fresnel or small softbox, 4200K neutral-warm, 100% power.\nFill: Minimal. 10-15% bounce only. The deep opposite-side shadow is the point.\nRim: Optional 6500K cool hair light behind at 20%. Temperature separation between bright and dark sides.\nLens: 85mm at f/4.\nStock feel: Kodak Vision3 500T (color, halation) or Double-X 5222 (for B&W).\nContrast: 6:1. The shadow side collapses into structural darkness.\nShadow: Graphic, hard-edged cast shadow on the surface.\nTexture: The raking side light reveals every micro-texture on the key side. Material becomes the subject.\nPhysical detail: One fine scratch, pore, brushed-metal grain, or thread visible on the lit side catching the rake.\nFinish: Specular highlights with subtle halation; film grain heavy in the deep shadow side.\nMood: Noir product or object portraiture. Deakins single-source discipline applied to a physical subject.",
    image: "",
    favorite: false,
  },
  {
    id: "lighting-setups-005-clinical-clean-white",
    title: "Clinical Clean White",
    description: "Bright even clinical lighting.",
    category: "Design",
    subcategory: "Lighting Setups",
    models: ["Nano Banana"],
    content:
      "Use Case: Medical and clinical detail, supplements, lab-clean character portrait, sterile scene\nModel: Nano Banana Pro · Aspect: 1:1\n\nLighting setup: High-key clinical. Maximum fill, minimum contrast, shadowless precision.\nKey: Two large overhead softboxes at 30° left/right of camera axis, 6500K cool daylight, matched power.\nFill: Underfill from below via white bounce at 70%. Kills chin / base shadow completely.\nRim: None. The high-key field removes edge definition anyway.\nLens: 85mm at f/8.\nStock feel: Fujifilm Velvia 50 (vivid precision) or Eterna (restraint). Pick per brand tone.\nContrast: 1.5:1. Nearly flat, very low key-to-fill differential.\nBackdrop: Pure white #FFFFFF seamless, no gradient.\nShadow: Barely present. Faint ghost of contact shadow directly below, 90% transparency.\nPhysical detail: Packaging label or embossed text rendered in crisp legible focus. The \"you can trust this\" cue.\nFinish: Razor sharp; very fine sensor noise floor only in the 10% gray zones.\nMood: Pharmacy shelf meets Apple Store. Precise, trustworthy, unambiguous.",
    image: "",
    favorite: false,
  },
  {
    id: "lighting-setups-006-moody-atmospheric",
    title: "Moody Atmospheric",
    description: "Dark moody ambient lighting.",
    category: "Design",
    subcategory: "Lighting Setups",
    models: ["Nano Banana"],
    content:
      "Use Case: Fragrance, luxury goods, evening character portrait, low-key still life, moody hero\nModel: Nano Banana Pro · Aspect: 4:5\n\nLighting setup: Low-key atmospheric. Product emerging from shadow.\nKey: Small soft narrow source from upper-right at 35° elevation, 3200K tungsten-warm, 30% power. Single practical's worth of light.\nFill: None. The darkness is the composition.\nAccent: Hidden 2800K tungsten practical frame-left, just out of view, kissing the opposite edge with a warm glow.\nRim: Subtle 4500K daylight rim from behind at 20% key. Separates silhouette from deep charcoal backdrop.\nLens: 85mm at f/2.8.\nStock feel: Kodak Vision3 500T. Warm cinema tungsten with organic highlight halation.\nContrast: 8:1. Deep enveloping shadows.\nBackdrop: Matte charcoal #1A1A1C to black gradient.\nAtmospheric: Subtle haze or soft fog in the mid-ground. Light has texture.\nPhysical detail: One glint on a metal edge or a single reflection catching the rim. Confirms the subject is physically present.\nFinish: Significant halation on the brightest highlights bleeding into the blacks; heavy film grain in the shadow areas.\nMood: After-hours fragrance campaign. Villeneuve atmospheric discipline applied to a luxury object.",
    image: "",
    favorite: false,
  },
];
