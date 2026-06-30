import type { Prompt } from "../app/App";

export const CAMERA_PROFILES_PROMPTS: Prompt[] = [
  {
    id: "camera-profiles-001-macro-texture-shot",
    title: "Macro Texture Shot",
    description: "Extreme close-up for texture details.",
    category: "Design",
    subcategory: "Camera Profiles",
    models: ["Nano Banana"],
    content:
      "Use Case: Fabric texture, ingredient close-ups, craftsmanship\nModel: Nano Banana Pro · Aspect: 1:1\n\nSubject: Extreme close-up on [FOCUS_SUBJECT]. Fills the entire frame, abstract composition.\nLens: Macro at f/2.8, 1:1 magnification.\nFocus: Tack sharp across a narrow focal plane; immediate falloff into creamy bokeh before and behind.\nKey: Raking side light from camera-left at 10° elevation. Skims the surface, reveals every micro-texture. 4500K neutral.\nFill: None. The shadows hold the texture.\nStock feel: Kodak Ektar 100. Vivid, precise material rendering.\nDepth: Plane of sharpness is 2-3mm; everything else falls into soft defocus.\nPhysical detail: One tiny imperfection. A loose thread, a pore, a micro-crack, a fingerprint ridge. Catching the raking light.\nFinish: Fine grain visible in the mid-values; no posterization in the gradients.\nMood: Texture worship. You want to touch it.",
    image: "",
    favorite: false,
  },
  {
    id: "camera-profiles-002-50mm-flatlay-standard",
    title: "50mm Flatlay Standard",
    description: "Overhead flatlay standard lens.",
    category: "Design",
    subcategory: "Camera Profiles",
    models: ["Nano Banana"],
    content:
      "Use Case: Object arrangements, gift sets, EDC layouts, prop arrays, evidence boards, multi-subject grids\nModel: Nano Banana Pro · Aspect: 1:1\n\nAngle: Perfect 90° top-down, camera plane parallel to surface. No distortion, no convergence.\nLens: 50mm at f/8.\nFocus: Deep. Every item tack sharp edge-to-edge.\nKey: Large 4ft overhead softbox centered, 5500K daylight. Soft shadowless fill.\nFill: White bounce cards camera-left and camera-right at 60%. Kills harsh shadows on the composition.\nStock feel: Kodak Ektar 100. Clean vivid palette.\nComposition: Products arranged with breathing room. 15-20% negative space around each piece. Never crowded.\nShadow: Minimal soft contact shadow under each object. Grounded but not heavy.\nPhysical detail: One element slightly off the symmetric grid. A leaf angled 8° off axis, a bottle turned 5°. Keeps it hand-styled, not CGI.\nFinish: Razor sharp across the frame; very subtle sensor noise in the whites.\nMood: Considered flatlay by a stylist with taste. Not social-feed clutter.",
    image: "",
    favorite: false,
  },
  {
    id: "camera-profiles-003-birds-eye-top-down",
    title: "Bird's Eye Top-Down",
    description: "Direct overhead flatlay perspective.",
    category: "Design",
    subcategory: "Camera Profiles",
    models: ["Nano Banana"],
    content:
      "Use Case: Instagram flatlays, food photography, arrangements\nModel: Nano Banana Pro · Aspect: 1:1\n\nAngle: Absolute 90° top-down, camera tethered to overhead rig, perfectly level.\nLens: 50mm at f/8.\nFocus: Everything in a razor-sharp single plane.\nComposition: [ARRANGEMENT_STYLE]. Considered asymmetry, rule-of-thirds anchor, generous negative space (25-30%).\nSurface: [SURFACE_TYPE] fills the frame as the ground plane.\nKey: Large 4ft overhead softbox, 5500K daylight, centered on composition.\nFill: Twin white bounce cards at frame edges, 60%. Kills hard cast shadows.\nStock feel: Kodak Ektar 100. Clean vivid palette.\nPhysical detail: One object sits 5-8° off the grid. A sprig angled, a fork slightly off parallel. Breaks CGI-perfect symmetry.\nShadow: Soft even contact shadow under each element, no harsh cast.\nFinish: Edge-to-edge sharpness; subtle film grain only in the deeper negative-space tones.\nMood: Stylist-composed, not algorithm-generated. The hand is visible.",
    image: "",
    favorite: false,
  },
  {
    id: "camera-profiles-004-85mm-hero-isolation",
    title: "85mm Hero Isolation",
    description: "Classic 85mm hero focal length. Flattering compression and clean subject isolation.",
    category: "Design",
    subcategory: "Camera Profiles",
    models: ["Nano Banana"],
    content:
      "Use Case: Hero shots, character close-ups, object detail, beauty portraits\nModel: Nano Banana Pro · Aspect: 4:5\n\nSubject: [SUBJECT] centered, fills ~70% of frame width.\nAngle: 3/4 front view, elevated 12° above subject.\nLens: 85mm at f/8.\nFocus: Deep. Entire subject crisp edge-to-edge; background falls into gentle defocus.\nKey: Large softbox camera-left at 45° elevation, 5500K daylight.\nFill: Silver reflector camera-right at 70%.\nRim: Small strip softbox behind at 25% key. Pulls edge from background.\nStock feel: Fujifilm Eterna. Neutral, precise color rendering.\nCompression: The 85mm flatters the subject silhouette. No wide-angle distortion, proportions feel intentional.\nShadow: Soft gradient contact shadow directly beneath, slight bias toward fill side.\nPhysical detail: Subtle halation bloom on the brightest specular highlight.\nFinish: Tack sharp; very fine film grain only in the background defocus.",
    image: "",
    favorite: false,
  },
  {
    id: "camera-profiles-005-35mm-environmental-wide",
    title: "35mm Environmental Wide",
    description: "Wide shot showing the subject inside its environment.",
    category: "Design",
    subcategory: "Camera Profiles",
    models: ["Nano Banana"],
    content:
      "Use Case: Lifestyle scenes, room settings, environment shots\nModel: Nano Banana Pro · Aspect: 3:2\n\nFrame: Wide environmental. [SUBJECT] occupies ~40% of the frame; the surrounding space tells the story.\nAngle: Eye level, tripod steady.\nLens: 35mm at f/4.\nFocus: Subject tack sharp; mid-ground and background progressively softer but still readable.\nKey: Natural daylight from a window or skylight, 5200K, falling at ~30° from upper-left. Trace the light source.\nFill: Room ambience does 60% of the fill. No artificial lighting.\nStock feel: Kodak Portra 400. Warm lifestyle, organic palette.\nPerspective: Mild wide-angle character without distortion. The room breathes but shapes don't stretch.\nPhysical detail: One element that suggests a person lives here. A jacket on a chair back, a half-drunk mug, a pair of shoes just visible.\nFinish: Fine film grain in the shadow areas; soft atmospheric haze in the deeper background.\nMood: A real room, a real moment. The subject belongs here. Nobody staged it.",
    image: "",
    favorite: false,
  },
  {
    id: "camera-profiles-006-low-angle-hero",
    title: "Low Angle Hero",
    description: "Powerful upward-looking hero shot.",
    category: "Design",
    subcategory: "Camera Profiles",
    models: ["Nano Banana"],
    content:
      "Use Case: Hero subjects, powerful branding, authority portrait, character introduction, low-angle reveal\nModel: Nano Banana Pro · Aspect: 4:5\n\nAngle: Low, 25° below subject center, looking up. Hero perspective.\nLens: 50mm at f/4.\nFocus: Subject tack sharp with gentle background separation.\nKey: Single hard directional source camera-right, 4200K, at subject height. Throws a bold graphic shadow to camera-left.\nFill: Dim 15% bounce. Enough to preserve shadow-side form, not enough to flatten the drama.\nRim: Cool 6500K rim light behind subject, separates from the dark gradient backdrop.\nStock feel: Kodak Vision3 500T. Cinematic tungsten-warm with organic highlight bloom.\nBackdrop: Dark gradient. Charcoal to black, or deep teal #0E3E40 to near-black.\nShadow: Long graphic cast shadow on the ground plane. Nearly architectural.\nPhysical detail: A single speck of dust or glint catching the rim light. Confirms real glass / real metal.\nFinish: Slight halation on the brightest specular highlights; film grain throughout, heavier in shadow.\nMood: Monument. The subject owns the one-point composition.",
    image: "",
    favorite: false,
  },
];
