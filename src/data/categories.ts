export const PROMPT_ROOT_CATEGORY = 'Prompts';

export const DEFAULT_PROMPT_SUBCATEGORIES: string[] = [];

export const PROTECTED_TOOL_CATEGORIES = ['Todas'];
export const PROTECTED_PROMPT_CATEGORIES = ['Todos'];
export const PROTECTED_WORKFLOW_CATEGORIES = ['Todos'];

// Categorias de ferramentas
export const DEFAULT_TOOL_CATEGORIES = [
  'Todas',
  'General AI',
  'UX & Product',
  'Visual Design',
  'Image Generation',
  'Video & Motion',
  'Audio & Voice',
  'Branding & Content',
  'Research & Insights',
  '3D & Spatial',
  'Code & Handoff',
  'Automation & Productivity'
];

// Categorias de prompts
export const DEFAULT_PROMPT_CATEGORIES = [
  'Todos',
  'Design'
];

// Categorias de workflows
export const DEFAULT_WORKFLOW_CATEGORIES = [
  'Todos',
  'N8N'
];

// Subcategorias por categoria
export const DEFAULT_SUBCATEGORIES_MAP: Record<string, string[]> = {
  'General AI': ['Chatbots', 'Productivity'],
  'UX & Product': ['UI Generation', 'Design Collaboration'],
  'Visual Design': ['Design Assistants', 'Logos & Icons'],
  'Image Generation': ['Text-to-Image', 'Image Editing', 'Upscaling', 'Avatars & Characters', 'Product Photography'],
  'Video & Motion': ['Text-to-Video', 'Video Editing', 'Subtitles & Dubbing', 'Personalized Video'],
  'Audio & Voice': ['Voice Generation', 'Music Generation', 'Audio Editing'],
  'Branding & Content': ['Copywriting', 'Campaigns', 'Social Content', 'Presentations'],
  'Research & Insights': ['Web Research', 'UX Research', 'Meeting Notes', 'Insight Repository'],
  '3D & Spatial': ['3D Generation', 'Motion Capture', 'Spatial Design'],
  'Code & Handoff': ['Code Generation', 'Frontend Builder'],
  'Automation & Productivity': ['Workflow Automation', 'Project Management', 'Knowledge Base'],
  'Design': [
    'Identidade Visual & Branding',
    'Fotografia de Produto',
    'Publicidade & Anúncios',
    'Poster & Design Editorial',
    'Redes Sociais',
    'UX & Web Design',
    'Vídeo & Motion',
    'Direção Criativa',
    'Revisão & Qualidade',
    'Copy & Marketing',
    'Cinematografia',
    'Backgrounds & Surfaces',
    'Camera Profiles',
    'Lighting Setups',
    'UGC Poses & Scenes',
    'Hands & Models',
    'Atmospheric Effects',
    'Director Signatures',
    'Aspect Ratio & Frame',
    'Motion & Camera Verbs'
  ]
};
