import type { Prompt } from "../app/App";

export const DIRECTOR_SIGNATURES_PROMPTS: Prompt[] = [
  {
    id: "director-signatures-001-zhao-xiaoding-color-block",
    title: "Zhao Xiaoding · Color Block",
    description: "Zhang Yimou chromatic scene lock. One dominant hue owns 90% of the frame.",
    category: "Design",
    subcategory: "Director Signatures",
    models: ["Nano Banana"],
    content:
      "Use Case: Hero / House of Flying Daggers sequence, chromatic scene lock\nModel: Nano Banana Pro · Aspect: 2.39:1\n\nScene: [SUBJECT] in an environment where ONE chromatic hue dominates ~90% of the frame. Costume, set, fabric, light, all bent to the single color.\nChoose the dominant: [RED / BLUE / GREEN / WHITE / BLACK / GOLD]. Inspired by Zhang Yimou's Hero sequences (red library, blue desert, green bamboo forest, white snow, black ink).\nLens: 85mm at f/4.\nKey: Warm or cool source matching the dominant hue. E.g. 3200K warm for red sequence, 6500K cool for blue sequence.\nFill: Environmental bounce from the dominant-color surroundings.\nStock feel: Kodak Vision3 250D or 500T depending on temperature direction.\nAtmospheric: Subtle haze to soften any edge that would break the monochromatic discipline.\nMotion implied: Fabric / hair / sand can be in motion within the block. Kinetic counterpoint to the static color.\nPhysical detail: One high-contrast detail. A specific weapon glint, a silver stitch, a white flower against red. That punctures the block without breaking it.\nNegative: Multi-color scene, background neutrality, Western color grading.",
    image: "",
    favorite: false,
  },
  {
    id: "director-signatures-002-sciamma-mathon-candle-portrait",
    title: "Sciamma · Mathon Candle Portrait",
    description: "Painterly candlelit two-shot, Dutch Masters lineage, female-gaze blocking.",
    category: "Design",
    subcategory: "Director Signatures",
    models: ["Nano Banana"],
    content:
      "Use Case: Portrait of a Lady on Fire, period interior, intimate conversation\nModel: Nano Banana Pro · Aspect: 4:3\n\nScene: Two figures ([SUBJECT_A] and [SUBJECT_B]) in interior lit ONLY by a single candle or fireplace. Equal-height composition. Neither dominates.\nLens: 50mm at f/2. Shallow enough for romance, deep enough for two faces.\nKey: Candle/firelight at 1800K deep amber, positioned naturally in the scene (a table, a mantel).\nFill: None. Darkness beyond the candle glow is the painting.\nStock feel: Kodak Vision3 500T. Tungsten-warm with organic grain visible in the blacks.\nComposition: Dutch Masters / Vermeer. Subjects positioned with quiet dignity, shoulders relatively parallel to the camera, eyes on each other or on a middle-distance subject.\nTexture emphasis: Skin with visible pore detail, fabric with visible weave (linen, silk, wool), wall surface with painterly variation.\nPhysical detail: One candlewick flame captured in a specific posture. About to flicker, just lit, or guttering.\nNegative: Studio lighting, sharp digital clean, rainbow spectra, electronic fill.",
    image: "",
    favorite: false,
  },
  {
    id: "director-signatures-003-lynch-red-room",
    title: "Lynch Red Room",
    description: "Deep crimson interior, chevron floor, figure slightly temporally off.",
    category: "Design",
    subcategory: "Director Signatures",
    models: ["Nano Banana"],
    content:
      "Use Case: Twin Peaks style dream, surreal beat, oneiric reveal\nModel: Nano Banana Pro · Aspect: 16:9\n\nScene: [SUBJECT] in a deep crimson interior with red velvet curtains on all visible walls. Black-and-white chevron pattern on the floor.\nLens: 35mm at f/4. Wide enough to capture the surrounding curtains, deep enough to keep the subject readable.\nKey: Warm practical 2800K tungsten, positioned above or behind. Subject slightly under-lit, curtains catch the warm glow.\nFill: Red velvet bounce. The walls themselves saturate the subject's skin with a red cast.\nStock feel: Kodak Vision3 500T for the tungsten-warm palette with halation in the brightest spots.\nPalette: Dominant crimson (walls, curtains) + black-and-white chevron floor + one pale skin tone.\nAtmospheric: Subtle smoke / haze density, almost imperceptible but present.\nTemporal uncanniness: [SUBJECT]'s pose or expression should feel slightly off. A frozen gesture mid-motion, eyes averted in an unexpected direction, stillness that reads as pause rather than rest.\nPhysical detail: One specific object in the room that doesn't belong. A ringing phone with no cord, a cup with contents the wrong color, a single out-of-scale element.\nNegative: Clean / neutral room, contemporary setting, no crimson dominance.",
    image: "",
    favorite: false,
  },
  {
    id: "director-signatures-004-storaro-symbolic-color",
    title: "Storaro · Symbolic Color",
    description: "Scene dominated by ONE psychologically-loaded color. Apocalypse Now lineage.",
    category: "Design",
    subcategory: "Director Signatures",
    models: ["Nano Banana"],
    content:
      "Use Case: Emotional beat anchoring, chromatic storytelling, Last Emperor interior\nModel: Nano Banana Pro · Aspect: 2.39:1\n\nScene: [SUBJECT] in an environment where ONE psychologically-loaded color dominates the lighting. NOT the costume/set primarily, but the LIGHT itself painting everything in that hue.\nPick the emotional color: [AMBER = nostalgia / EMERALD = envy / CRIMSON = violence / COBALT = isolation / VIOLET = transcendence].\nLens: 50mm at f/2.8.\nKey: Colored gel on the primary source, tinting all lit surfaces. At full saturation, 80-100% color wash.\nFill: None, or a cooler counter-temperature at 20% just to preserve facial readability without breaking the color philosophy.\nStock feel: Kodak Vision3 500T. Tungsten palette holds the chromatic saturation best.\nAtmospheric: Subtle haze to soften the color's edge transition across the scene.\nPhysical detail: One high-contrast white or flesh-tone that stubbornly resists the color wash. A piece of paper, a quarter of the subject's face. Keeping the saturation readable as deliberate.\nNegative: Multi-color scene, balanced white, cold digital neutrality.",
    image: "",
    favorite: false,
  },
];
