import type { Prompt } from "../app/App";

export const MOTION_CAMERA_PROMPTS: Prompt[] = [
  {
    id: "motion-camera-001-slow-push-in",
    title: "Slow Push-In",
    description: "Camera moves directly toward subject. Revelation, tension, focus.",
    category: "Design",
    subcategory: "Motion & Camera Verbs",
    models: ["Seedance 2.0"],
    content:
      "Use Case: Character realization beat, revealing detail, narrative push\nModel: Seedance 2.0 · Aspect: 2.39:1 · Duration: 6s\n\nScene: [SUBJECT] in foreground or mid-ground, environment visible behind.\nCamera move: Slow push-in on a direct linear axis toward [SUBJECT]. Travel distance ~2 meters over 6 seconds. Ends with [SUBJECT] filling ~60% of frame height (medium close-up).\nSpeed: Constant, unhurried. No acceleration, no deceleration.\nLens: 50mm at f/2.8.\nLighting continuity: Source stays constant throughout the move. Same key angle, same temperature.\nStock feel: Kodak Vision3 500T with subtle organic grain.\nMotion emphasis: [SUBJECT] remains largely still. The MOTION is the camera's. It's the audience's attention closing in.\nAudio: Ambient room tone, subtle breath or fabric-rustle from [SUBJECT], no score.\nPhysical detail: One environmental element that moves through the frame at the same rate as the push. Wallpaper pattern, shelf edge, door frame. Reinforcing the forward motion.\nNegative: Zoom (keeps camera static, changes focal length. Different feel), erratic pacing, cutaway during move.",
    image: "",
    favorite: false,
  },
  {
    id: "motion-camera-002-locked-off-static-hold",
    title: "Locked-Off Static Hold",
    description: "Tripod-locked camera, no movement. Kubrick / Fincher precision.",
    category: "Design",
    subcategory: "Motion & Camera Verbs",
    models: ["Seedance 2.0"],
    content:
      "Use Case: Observational beat, interview, symmetry composition, tension through stillness\nModel: Seedance 2.0 · Aspect: 2.39:1 · Duration: 8s\n\nScene: [SUBJECT] in a composed frame. Camera locked on a tripod. ZERO movement throughout the duration.\nCamera: Static, stable, no drift, no wobble.\nLens: 50mm at f/2.8.\nStock feel: Kodak Vision3 500T or clean digital cinema.\nLighting: Precisely motivated, unchanged throughout the shot.\nMotion within the shot: [SUBJECT]'s movement is the entire motion budget. Breath, micro-gesture, eye movement, or a specific controlled action. Environment is still.\nAudio: Ambient, minimal. Silence can be the point.\nPhysical detail: One element of the subject or environment that does SOMETHING. A candle flickers, a drop of water falls, a hand trembles. To remind us this isn't a photograph.\nNegative: Any camera movement, handheld breathing, pan / tilt / zoom, Steadicam drift.",
    image: "",
    favorite: false,
  },
  {
    id: "motion-camera-003-lateral-dolly-track",
    title: "Lateral Dolly Track",
    description: "Camera glides sideways past subject. Elegant observation.",
    category: "Design",
    subcategory: "Motion & Camera Verbs",
    models: ["Seedance 2.0"],
    content:
      "Use Case: Establishing spatial relationship, tracking dialogue across two subjects, elegant reveal\nModel: Seedance 2.0 · Aspect: 2.39:1 · Duration: 8s\n\nScene: [SUBJECT] in fixed position, camera tracks laterally past them (right-to-left or left-to-right).\nCamera move: Linear lateral dolly, constant speed, distance ~3 meters over 8 seconds. Camera stays at the same distance from [SUBJECT] throughout.\nSpeed: Smooth, constant, slightly slower than walking pace.\nLens: 50mm at f/2.8.\nParallax: Foreground and background elements move at different rates relative to the camera. Strong parallax effect reveals spatial depth.\nStock feel: Kodak Vision3 500T.\nLighting continuity: Source stays constant. If the camera passes a practical light source, natural shift in key can happen motivated by that pass.\nAudio: Ambient location tone, subtle mechanical whir of the dolly if period-appropriate, no score.\nPhysical detail: As the camera passes, ONE specific environmental element slides into clear view for a moment. A window, a painting, a doorway. That rewards attention.\nNegative: Pan (camera rotates from a fixed point. Flat parallax, different feel), handheld sway, uneven tracking.",
    image: "",
    favorite: false,
  },
  {
    id: "motion-camera-004-rack-focus-pull",
    title: "Rack Focus Pull",
    description: "Focus shifts from one subject to another within a held frame. Attention transfer.",
    category: "Design",
    subcategory: "Motion & Camera Verbs",
    models: ["Seedance 2.0"],
    content:
      "Use Case: Revealing significance of a background element, conversation focus shift\nModel: Seedance 2.0 · Aspect: 16:9 · Duration: 5s\n\nScene: Two focal planes in the same shot. [SUBJECT_FOREGROUND] in foreground (closer plane), [SUBJECT_BACKGROUND] in background (farther plane). Distance between them: ~2-3 meters.\nCamera: Static tripod lock-off, no movement.\nLens: 85mm at f/2. Shallow enough for crisp focal separation.\nFocus move: First 2 seconds. Focus locked on [SUBJECT_FOREGROUND], background blurred. Seconds 2-3. Rack focus transitions smoothly to [SUBJECT_BACKGROUND], foreground falls into bokeh. Seconds 3-5. Focus locked on [SUBJECT_BACKGROUND].\nSpeed: Rack pull should be fast enough to feel decisive (under 1 second) but smooth, not snap.\nStock feel: Kodak Vision3 500T.\nLighting: Even across both planes, motivated source.\nAudio: Dialogue or ambient that justifies the shift of attention.\nPhysical detail: The bokeh character on each falling-out subject. Is it creamy (Zeiss), swirly (vintage aspherical), oval (anamorphic)?\nNegative: Both planes in focus simultaneously (no shift), zoom instead of focus, jittery rack.",
    image: "",
    favorite: false,
  },
  {
    id: "motion-camera-005-whip-pan-transition",
    title: "Whip Pan Transition",
    description: "Rapid camera rotation creating motion-blur transition between scenes or subjects.",
    category: "Design",
    subcategory: "Motion & Camera Verbs",
    models: ["Seedance 2.0"],
    content:
      "Use Case: Energy peak, scene transition, comedic timing, chaos reveal\nModel: Seedance 2.0 · Aspect: 2.39:1 · Duration: 4s\n\nScene: First ~1.5s. [SUBJECT_A] in static frame. 1.5-2s. Camera whips rapidly right or left (motion blur dominates the frame). 2-4s. [SUBJECT_B] or [LOCATION_B] in static frame.\nCamera move: Whip pan rotation. Rapid rotation of the camera axis at ~180°/second peak speed during the whip portion.\nLens: 35mm at f/2.8.\nMotion blur: Heavy during the whip phase. The frame becomes a horizontal streak of color for 0.3-0.5s.\nStock feel: Kodak Vision3 500T.\nLighting: Each endpoint (A and B) lit independently; the middle whip blurs both together.\nAudio: Whoosh / woosh. Motion-synchronized whip sound effect.\nPhysical detail: The whip blur carries a visible chromatic streak from a bright element in scene A to scene B. A red element that tails through the blur.\nNegative: Cut instead of whip, slow pan, indistinct endpoints.",
    image: "",
    favorite: false,
  },
  {
    id: "motion-camera-006-steadicam-drift-follow",
    title: "Steadicam Drift Follow",
    description: "Camera glides with the subject as they move through a space. Immersive, Malick-esque.",
    category: "Design",
    subcategory: "Motion & Camera Verbs",
    models: ["Seedance 2.0"],
    content:
      "Use Case: Walking character introduction, Lubezki-style long take, Chivo tracking\nModel: Seedance 2.0 · Aspect: 2.39:1 · Duration: 10s\n\nScene: [SUBJECT] walking through a location. Camera at chest-to-head height, approximately 2 meters from subject, following them.\nCamera move: Steadicam-smooth glide, matching subject's pace. Can be behind-follow, side-follow, or front-follow.\nSpeed: Matches subject walking pace. Neither gains nor loses distance.\nLens: 35mm at f/2.8. Wide enough to include environmental context.\nStock feel: Kodak Vision3 500T for naturalism, or pushed 800T for night.\nLighting: Location practicals only (natural / diegetic), shifting with the environment as [SUBJECT] passes through different zones.\nParallax: Rich. Foreground elements and background move at different rates as the subject walks past.\nAudio: Footsteps, breath, ambient location tone. No score.\nPhysical detail: [SUBJECT]'s body language through the walk. A specific hand gesture, a head turn triggered by passing something, a posture shift.\nNegative: Tripod lock, handheld sway (jittery), perfect straight-line track (too mechanical).",
    image: "",
    favorite: false,
  },
  {
    id: "motion-camera-007-crane-reveal",
    title: "Crane Reveal",
    description: "Camera descends / ascends / arcs to reveal a larger context.",
    category: "Design",
    subcategory: "Motion & Camera Verbs",
    models: ["Seedance 2.0"],
    content:
      "Use Case: Scale shift, context reveal, establishing pullback\nModel: Seedance 2.0 · Aspect: 2.39:1 · Duration: 10s\n\nScene: First 2s. [SUBJECT] in tight or medium framing. 2-8s. Camera rises / descends / arcs outward in a smooth continuous move. 8-10s. [SUBJECT] now small in a much larger frame showing surrounding context / scale / environment.\nCamera move: Smooth crane or aerial arc. Rising, descending, or circular.\nSpeed: Starts slow, maintains steady pace throughout the reveal. No acceleration shock.\nLens: 35mm (wider for reveal scope) at f/4.\nStock feel: Kodak Vision3 500T.\nLighting: Natural or architectural. The reveal exposes the light source or the scale of the illuminated area.\nAudio: Quiet at the start, builds with the reveal. A single musical swell can be motivated by the scale-reveal moment.\nPhysical detail: As the camera moves, a previously-hidden environmental element enters the frame and becomes the new focal point of interest.\nNegative: Zoom-out (static camera with lens length change. Different feel), jerky crane, erratic pacing.",
    image: "",
    favorite: false,
  },
];
