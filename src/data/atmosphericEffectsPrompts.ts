import type { Prompt } from "../app/App";

export const ATMOSPHERIC_EFFECTS_PROMPTS: Prompt[] = [
  {
    id: "atmospheric-effects-001-dense-fog-layer",
    title: "Dense Fog Layer",
    description: "Villeneuve-grade volumetric fog that swallows silhouettes.",
    category: "Design",
    subcategory: "Atmospheric Effects",
    models: ["Nano Banana"],
    content:
      "Use Case: Arrakis establishing, mystery reveals, moody exteriors\nModel: Nano Banana Pro · Aspect: 2.39:1\n\nScene: [SUBJECT] as a small silhouette against vast dense fog bank, 70% negative space above.\nLens: 50mm at f/4.\nKey: Single hard hidden sun behind the fog at 20° elevation, 4800K neutral daylight cutting through density as a diffuse soft glow.\nFill: None. The fog IS the fill. Omnidirectional bounce from the particulate.\nStock feel: Kodak Vision3 250D. Daylight neutral, holds the whites without blowing.\nAtmospheric: Fog density is textural. You can see layers at 10m, 50m, 100m. Closer fog has visible particulate drift; farther fog reads as graduated gray.\nPhysical detail: One bird-sized shape barely visible in the mid-ground fog, ambiguous.\nFinish: Fine grain in the lighter gray zones; subtle halation where the hidden sun is most direct.\nNegative: Clear atmosphere, flat gray wash, obvious cartoon fog edges.",
    image: "",
    favorite: false,
  },
  {
    id: "atmospheric-effects-002-rain-sheet",
    title: "Rain Sheet",
    description: "Blade Runner 2049 rain. Sheets you can see in the key light.",
    category: "Design",
    subcategory: "Atmospheric Effects",
    models: ["Nano Banana"],
    content:
      "Use Case: Neo-noir exterior, dramatic reveal, chase scene rain\nModel: Nano Banana Pro · Aspect: 2.39:1\n\nScene: [SUBJECT] in wet exterior at night, rain falling in visible sheets.\nLens: 35mm at f/2.8.\nKey: Single hard overhead streetlight, 2800K sodium-vapor amber, positioned so the rain falls THROUGH the beam and catches it.\nFill: Wet asphalt acts as bounce. Warm amber reflections in the foreground puddles.\nRim: Optional cool 6500K practical from opposite side at 25%. Separates the subject from the dark.\nStock feel: CineStill 800T. Halation on the amber highlights, chromatic aberration at the streetlamp edge.\nAtmospheric: Rain sheet density 2/10 of frame, diagonal fall at 15° off vertical from wind. Individual droplets only visible in the key-light cone.\nPhysical detail: One splash pattern frozen mid-air where a droplet just hit the asphalt near [SUBJECT]'s feet.\nNegative: Disney rain, zero ground interaction, uniform cartoon drops.",
    image: "",
    favorite: false,
  },
  {
    id: "atmospheric-effects-003-dust-motes-in-key-light",
    title: "Dust Motes in Key Light",
    description: "Floor-shaft sunlight catching suspended dust. Classical cinematography.",
    category: "Design",
    subcategory: "Atmospheric Effects",
    models: ["Nano Banana"],
    content:
      "Use Case: Interior reveal, contemplative beat, Tarkovsky / Malick lineage\nModel: Nano Banana Pro · Aspect: 4:3\n\nScene: [SUBJECT] in a large interior with a single window source creating a visible light shaft across the space. Dust suspended in the air catches the beam.\nLens: 50mm at f/2.8.\nKey: One window source camera-right at 3800K warm afternoon, raking across the room at 25° off horizontal.\nFill: Cool 5500K ambient from an unseen second window at 20%. Just enough shadow-side separation.\nStock feel: Kodak Vision3 500T. Tungsten-warm, grain visible in the darker zones.\nAtmospheric: Dust particulate at roughly 1 mote per cubic foot, drifting slowly. Motes only visible INSIDE the shaft. Outside it they disappear.\nPhysical detail: One specific mote catching a hot reflection on [SUBJECT]'s sleeve where the shaft hits it.\nNegative: Fog simulation, saturated particulate, fake \"God ray\" Photoshop cliche.",
    image: "",
    favorite: false,
  },
  {
    id: "atmospheric-effects-004-volumetric-smoke-shafts",
    title: "Volumetric Smoke Shafts",
    description: "Smoke catching hard backlight. Ridley Scott battlefield or concert stage.",
    category: "Design",
    subcategory: "Atmospheric Effects",
    models: ["Nano Banana"],
    content:
      "Use Case: Heavy atmosphere reveal, silhouette work, scale compression\nModel: Nano Banana Pro · Aspect: 2.39:1\n\nScene: [SUBJECT] silhouetted against heavy smoke with visible shafts of backlight cutting through.\nLens: 85mm at f/4.\nKey: Single hard backlight source behind the smoke at 30° elevation, 5200K (or 3200K for warmer / more Ridley Scott era).\nFill: None. Silhouette is the point.\nRim: The key itself wraps the silhouette edges as it cuts through smoke, producing a natural haloed outline.\nStock feel: Kodak Vision3 500T or Fuji Eterna for more muted restraint.\nAtmospheric: Smoke density heavy enough that light shafts are visible as discrete beams, not diffuse wash. 3-5 visible beams at varying angles.\nPhysical detail: One beam clipping a specific edge of [SUBJECT]. A shoulder, a weapon, a raised hand. Hot-rimmed.\nNegative: Light fog (too thin), uniform smoke (no shaft structure), neon-color smoke (wrong era).",
    image: "",
    favorite: false,
  },
  {
    id: "atmospheric-effects-005-golden-hour-haze",
    title: "Golden Hour Haze",
    description: "Soft atmospheric density in late magic hour. Warmth saturated.",
    category: "Design",
    subcategory: "Atmospheric Effects",
    models: ["Nano Banana"],
    content:
      "Use Case: Lubezki / Malick landscapes, romantic reveals, nostalgic exteriors\nModel: Nano Banana Pro · Aspect: 3:2\n\nScene: [SUBJECT] in open exterior at late golden hour, atmospheric haze compressing the background.\nLens: 85mm at f/2.8 (compression reads as \"long lens golden hour\". Subject pops from the flattened distance).\nKey: Low-angle sun camera-right at 10° elevation, 3400K deep amber.\nFill: Sky-dome cool ambient at 20%. Cools the shadow side just enough to keep subject readable.\nStock feel: Kodak Portra 400. Warm pastel rendering, skin-safe, organic highlight rolloff.\nAtmospheric: Soft haze density. Mid-ground at 30m softened, far-ground at 100m+ dissolved into golden-amber wash. Not fog; pure atmospheric compression.\nPhysical detail: One backlit strand of hair or grass at [SUBJECT]'s silhouette edge catching the sun as a filament.\nNegative: High-noon neutrality, overcast flatness, oversaturated \"instagram golden hour\" cliche.",
    image: "",
    favorite: false,
  },
  {
    id: "atmospheric-effects-006-ambient-snowfall",
    title: "Ambient Snowfall",
    description: "Soft falling snow. Silent, diffused, readable against dark.",
    category: "Design",
    subcategory: "Atmospheric Effects",
    models: ["Nano Banana"],
    content:
      "Use Case: Winter narrative, intimate exterior, period piece mood\nModel: Nano Banana Pro · Aspect: 4:5\n\nScene: [SUBJECT] standing in falling snow at dusk. Quiet density.\nLens: 50mm at f/2.\nKey: Single warm practical camera-left. Could be a window, a streetlamp, a porch light. 2800K tungsten, soft on the subject.\nFill: Snow itself is a massive soft bounce; no artificial fill needed.\nStock feel: Fuji Eterna for muted pastel restraint, or Kodak Portra 400 for warmer narrative tone.\nAtmospheric: Snow density 1/4 of frame, drifting at 10° off vertical in still air. Individual flakes visible within 3m of camera, blurring into a softer wash at distance.\nPhysical detail: One snowflake caught on [SUBJECT]'s eyelash or shoulder, still crystalline.\nNegative: Cartoon snowflake shapes, blizzard density, digital over-precision.",
    image: "",
    favorite: false,
  },
];
