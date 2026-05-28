// Categorias de ferramentas
export const DEFAULT_TOOL_CATEGORIES = [
  'Todas',
  'Texto',
  'Negócios',
  '3D',
  'Audio',
  'Outros',
  'Vídeo',
  'Código',
  'Imagem',
  'Prompts'
];

// Categorias de prompts
export const DEFAULT_PROMPT_CATEGORIES = [
  'Todos',
  'Engenharia de Prompts',
  'Aspect Ratio & Frame',
  'Backgrounds & Surfaces',
  'Camera Profiles',
  'Lighting Setups',
  'UGC Poses & Scenes',
  'Hands & Models',
  'Atmospheric Effects',
  'Director Signatures',
  'Motion & Camera Verbs'
];

// Categorias de workflows
export const DEFAULT_WORKFLOW_CATEGORIES = [
  'Todos',
  'Marketing',
  'Operações',
  'Vendas'
];

// Subcategorias por categoria
export const DEFAULT_SUBCATEGORIES_MAP: Record<string, string[]> = {
  'Texto': ['Copywriting', 'SEO', 'Tradução', 'Resumo', 'Redação'],
  'Negócios': ['CRM', 'Analytics', 'Automação', 'Produtividade', 'Finanças'],
  '3D': ['Geração de Modelos 3D & WebGL', 'Fotogrametria & Ambientes 360º', 'Captura de Movimento & Animação', 'Texturas & Materiais'],
  'Audio': ['Geração de Voz', 'Música', 'Edição', 'Transcrição'],
  'Outros': ['Geral', 'Educação', 'Saúde', 'Lifestyle'],
  'Vídeo': ['Geração', 'Edição', 'Animação', 'Legendas', 'Personalização'],
  'Código': ['Geração', 'Revisão', 'Debugging', 'Documentação', 'SQL', 'Planilhas', 'Assistente de Código', 'Low-Code & Integrações', 'Desenvolvimento Elite'],
  'Imagem': ['Geração', 'Edição', 'Upscaling', 'Avatar', 'Logo', 'Assistente Design'],
  'Prompts': ['Gestão & Produção', 'Biblioteca & Pesquisa', 'Observabilidade']
};
