import type { Prompt } from "../app/App";

export const ASPECT_RATIO_PROMPTS: Prompt[] = [
  {
    id: "aspect-ratio-001-2-39-anamorphic-widescreen",
    title: "2.39:1 Anamorphic Widescreen",
    description: "Blockbuster / epic ratio. Horizontal compression, oval bokeh, flare.",
    category: "Design",
    subcategory: "Aspect Ratio & Frame",
    models: ["Nano Banana"],
    content:
      "Use Case: Chase / action sequence, Villeneuve epic establishing, Nolan large format\nModel: Nano Banana Pro · Aspect: 2.39:1\n\nScene: [SUBJECT] framed for widescreen action or grand scale. Horizontal composition with clear left and right zones.\nLens: Anamorphic 40mm at f/2.8. T2.8 equivalent, horizontal squeeze ratio 2x, characteristic oval bokeh.\nKey: Strong directional source from camera-left or right at an angle that catches the anamorphic lens. Produces subtle horizontal flares and breathing.\nStock feel: Kodak Vision3 500T or clean digital cinema.\nAspect-specific moves: Background bokeh renders as vertical ovals (the anamorphic signature). Subjects look slightly horizontally compressed. Edges of frame show gentle barrel breathing.\nPhysical detail: One streetlight or point-source visible in the frame corner producing a characteristic horizontal blue or amber streak flare.\nNegative: Spherical bokeh shapes, vertical-oriented composition, flat TV framing.",
    image: "",
    favorite: false,
  },
  {
    id: "aspect-ratio-002-4-3-vintage-tv-era",
    title: "4:3 Vintage / TV Era",
    description: "Pre-1953 classical or VHS / early TV nostalgia. Compact, square-ish.",
    category: "Design",
    subcategory: "Aspect Ratio & Frame",
    models: ["Nano Banana"],
    content:
      "Use Case: Period framing, found footage, nostalgic home-video aesthetic\nModel: Nano Banana Pro · Aspect: 4:3\n\nScene: [SUBJECT] framed for the squarer 4:3 ratio. Common in early cinema, pre-widescreen television, and VHS home video.\nLens: 35mm at f/4 for contemporary clean look, or emulated VHS camcorder (soft, interlaced, low resolution) for found-footage feel.\nStock feel: Choose. Fuji Velvia 50 for vintage richness, or VHS simulation (softness, chromatic aberration, scan-line hint) for found-footage.\nAspect-specific feel: Square-ish intimacy, head-and-shoulders portraiture reads naturally, action compressed into center.\nPhysical detail: One specific era-marker. A CRT TV, a rotary phone, a specific clothing cut from the target period.\nNegative: Widescreen action, modern TV polish, 16:9 default.",
    image: "",
    favorite: false,
  },
  {
    id: "aspect-ratio-003-9-16-vertical-cinema",
    title: "9:16 Vertical Cinema",
    description: "TikTok, Reels, Stories native. Vertical-first framing, not just cropped.",
    category: "Design",
    subcategory: "Aspect Ratio & Frame",
    models: ["Nano Banana"],
    content:
      "Use Case: Social-native content, mobile-first story, vertical music video\nModel: Nano Banana Pro · Aspect: 9:16\n\nScene: [SUBJECT] composed for vertical reading. Vertical center axis, top-to-bottom compositional flow.\nLens: 35mm at f/2.8. Wide enough to capture vertical elements, shallow enough for focus hierarchy.\nKey: Motivated practical, positioned to work vertically rather than horizontally.\nStock feel: Kodak Vision3 500T or CineStill 800T depending on tonal register.\nAspect-specific moves: Subject often fills the center-vertical column. Headroom generous at top, toe-room at bottom. Architecture and figures read as vertical pillars. Lateral motion avoided; push-ins / pull-backs preferred.\nPhysical detail: One vertical-oriented element reinforcing the axis. A standing figure, a hanging lamp, a tall window.\nNegative: Horizontal action, cropped widescreen, landscape compression.",
    image: "",
    favorite: false,
  },
  {
    id: "aspect-ratio-004-1-85-cinema-standard",
    title: "1.85:1 Cinema Standard",
    description: "Modern theatrical ratio. Balanced, classical, flexible.",
    category: "Design",
    subcategory: "Aspect Ratio & Frame",
    models: ["Nano Banana"],
    content:
      "Use Case: Drama, dialogue-driven work, contemporary realism\nModel: Nano Banana Pro · Aspect: 1.85:1\n\nScene: [SUBJECT] in a classically-balanced composition. Wider than 16:9 but not blockbuster-compressed.\nLens: 50mm at f/2.8. The workhorse focal length, natural perspective.\nKey: [DESCRIPTION]. Motivated single source typical of the genre (window / practical / sky).\nStock feel: Kodak Vision3 500T or Fuji Eterna.\nAspect-specific feel: Frame reads neutral. Neither epic nor intimate. Allows both landscape width and portrait intimacy at appropriate distances.\nPhysical detail: One specific environmental element that anchors the composition. A hanging lamp, a doorway, a window.\nNegative: Ultra-wide compression, square intimacy, TV aesthetic.",
    image: "",
    favorite: false,
  },
  {
    id: "aspect-ratio-005-1-37-academy-ratio",
    title: "1.37:1 Academy Ratio",
    description: "Square-ish vintage cinema. Wes Anderson, classic Hollywood.",
    category: "Design",
    subcategory: "Aspect Ratio & Frame",
    models: ["Nano Banana"],
    content:
      "Use Case: Period piece, intimate framing, stylized formal composition\nModel: Nano Banana Pro · Aspect: 1.37:1\n\nScene: [SUBJECT] in a near-square composition reminiscent of pre-1953 Hollywood or Wes Anderson's stylized period work.\nLens: 40mm at f/4. Slightly wide, flat symmetrical blocking-friendly.\nComposition: Center-weighted symmetry or single-subject portrait framing. The tall frame makes vertical details (costumes, architecture, headdress) dominant.\nStock feel: Kodak Vision3 250D for contemporary look, or emulate vintage stocks (Tri-X / Plus-X grain) for period.\nAspect-specific feel: Formal, presentational, stage-like. Subjects read as portraits rather than inhabitants of a world.\nPhysical detail: One vertically-oriented element that takes advantage of the tall frame. A hat, a tall lamp, a standing figure's full body.\nNegative: Widescreen compression, horizontal action, contemporary TV framing.",
    image: "",
    favorite: false,
  },
  {
    id: "aspect-ratio-006-2-76-ultra-wide-panavision",
    title: "2.76:1 Ultra-Wide Panavision",
    description: "Ben-Hur ratio. Extreme horizontal epic, used by Brady Corbet, Tarantino for Hateful Eight.",
    category: "Design",
    subcategory: "Aspect Ratio & Frame",
    models: ["Nano Banana"],
    content:
      "Use Case: Chariot / battlefield / crowd scale, impossible-width epic\nModel: Nano Banana Pro · Aspect: 2.76:1\n\nScene: [SUBJECT] in an extreme horizontal composition where the width dominates and vertical information is scarce.\nLens: 25mm anamorphic at f/4. Wide spherical equivalent, catches the full horizontal field.\nStock feel: Kodak Vision3 500T pushed for epic warmth, or 70mm emulation.\nAspect-specific feel: Spectacle over intimacy. Horizontal action, processions, landscapes, or multiple subjects arrayed in a line.\nPhysical detail: Multiple elements across the horizontal axis. A leading subject, supporting subjects at mid-distance, a horizon-line element.\nNegative: Vertical composition, single-subject intimacy, TV framing.",
    image: "",
    favorite: false,
  },
];
