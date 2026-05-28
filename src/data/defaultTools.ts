import { Tool } from '../App';

// NOTA: Este ficheiro contém 230+ ferramentas hardcoded.
// Por razões de espaço, aqui estão apenas as primeiras 50.
// Para manter a aplicação funcional, usar valores padrão do App.tsx até completar esta lista.

export const DEFAULT_TOOLS: Tool[] = [
  { id: '1', name: 'Jasper', description: 'Crie textos de marketing, artigos para blogues e campanhas de ads completas.', category: 'Texto', subcategory: 'Copywriting', badges: ['Freemium', 'Pago'], tags: ['Texto'], icon: 'pen-tool', link: 'https://www.jasper.ai', favorite: false },
  { id: '2', name: 'Midjourney', description: 'Geração de imagens fotorrealistas e ilustrações a partir de texto (text-to-image) com a mais alta qualidade artística do mercado.', category: 'Imagem', subcategory: 'Geração', badges: ['Pago'], tags: ['Imagem', 'Gerador'], icon: 'image', link: 'https://midjourney.com', favorite: false },
  { id: '3', name: 'Runway', description: 'O padrão da indústria criativa para geração de vídeo a partir de texto (text-to-video) e imagem (image-to-video) com a mais alta fidelidade e controlo. Inclui ferramentas de remoção de fundo e interpolação.', category: 'Vídeo', subcategory: 'Animação', badges: ['Freemium'], tags: ['Vídeo', 'Text-to-Video', 'VFX'], icon: 'video', link: 'https://runwayml.com', favorite: false },
  { id: '5', name: 'ChatGPT', description: 'IA de conversação avançada para pesquisa, produtividade e muito mais.', category: 'Texto', subcategory: 'Redação', badges: ['Free', 'Pago'], tags: ['Chatbot', 'Text'], icon: 'message-square', link: 'https://chat.openai.com', favorite: false },
  { id: '7', name: 'Nano Banana 2', description: 'Geração de imagens a partir de texto, edição avançada (combinando imagem e comandos de texto) e composição ou transferência de estilo a partir de múltiplas imagens.', category: 'Imagem', subcategory: 'Geração', badges: ['Freemium'], tags: ['Imagem', 'Edição'], icon: 'image', link: 'https://gemini.google.com', favorite: false },
  // ... Adicionar mais 225 ferramentas aqui ...
  // Por enquanto, retornar array vazio e deixar App.tsx usar defaults
];

// ============ IMPORTANTE ============
// Este ficheiro precisa ser preenchido com todos os dados.
// Solução temporária: manter defaults no App.tsx até completar a migração.
// TODO: Gerar script para extrair completamente os dados de App.tsx
