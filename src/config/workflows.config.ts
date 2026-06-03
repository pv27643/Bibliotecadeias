/**
 * Configuração dos Workflows disponíveis
 * Baseia-se na estrutura que viste no Celeuma IA
 */

export interface WorkflowConfig {
  id: string;
  name: string;
  description: string;
  category: 'Marketing' | 'Operações' | 'Vendas' | 'Criativo';
  icon: string;
  color: string;
  inputs: WorkflowInput[];
  webhookUrl: string;
}

export interface WorkflowInput {
  name: string;
  type: 'text' | 'textarea' | 'select' | 'image' | 'email';
  label: string;
  required?: boolean;
  options?: string[];
  placeholder?: string;
}

export interface ExecuteWorkflowPayload {
  workflowId: string;
  [key: string]: any;
}

/**
 * Workflows disponíveis
 * Copia aqui os teus workflows do Celeuma IA
 */
export const WORKFLOWS: WorkflowConfig[] = [
  {
    id: 'brand-dna-extractor',
    name: 'Extrair Brand DNA',
    description: 'Analisa imagens de marca e extrai identidade visual completa',
    category: 'Criativo',
    icon: '🎨',
    color: 'from-purple-500 to-pink-500',
    webhookUrl: 'https://ivannnnnn.app.n8n.cloud/webhook/execute-workflow',
    inputs: [
      {
        name: 'images',
        type: 'image',
        label: 'Imagens de Referência',
        required: true,
        placeholder: 'Carregar 3-5 imagens da marca'
      },
      {
        name: 'brandName',
        type: 'text',
        label: 'Nome da Marca',
        required: true,
        placeholder: 'ex: TechBrand'
      }
    ]
  },
  {
    id: 'generate-social-posts',
    name: 'Gerar Posts Sociais',
    description: 'Cria posts de redes sociais personalizados (1:1, 9:16, 16:9)',
    category: 'Marketing',
    icon: '📱',
    color: 'from-blue-500 to-cyan-500',
    webhookUrl: 'https://ivannnnnn.app.n8n.cloud/webhook/execute-workflow',
    inputs: [
      {
        name: 'topic',
        type: 'text',
        label: 'Tópico/Tema',
        required: true,
        placeholder: 'ex: Lançamento de novo produto'
      },
      {
        name: 'headline',
        type: 'text',
        label: 'Headline Principal',
        required: true,
        placeholder: 'Título do post'
      },
      {
        name: 'format',
        type: 'select',
        label: 'Formato',
        required: true,
        options: ['1:1 (Square)', '9:16 (Story)', '16:9 (Landscape)']
      },
      {
        name: 'prompt',
        type: 'textarea',
        label: 'Instruções Adicionais',
        required: false,
        placeholder: 'Detalha como queres que fique...'
      }
    ]
  },
  {
    id: 'ai-chat-agent',
    name: 'Chat com IA',
    description: 'Conversa interativa com agente IA inteligente',
    category: 'Criativo',
    icon: '🤖',
    color: 'from-green-500 to-emerald-500',
    webhookUrl: 'https://ivannnnnn.app.n8n.cloud/webhook/execute-workflow',
    inputs: [
      {
        name: 'message',
        type: 'textarea',
        label: 'Mensagem',
        required: true,
        placeholder: 'Fala com a IA...'
      }
    ]
  },
  {
    id: 'scrape-ads-library',
    name: 'Análise de Ads (Facebook)',
    description: 'Scrape e análise de anúncios do Facebook por palavra-chave',
    category: 'Marketing',
    icon: '📊',
    color: 'from-indigo-500 to-blue-500',
    webhookUrl: 'https://ivannnnnn.app.n8n.cloud/webhook/execute-workflow',
    inputs: [
      {
        name: 'keyword',
        type: 'text',
        label: 'Palavra-chave',
        required: true,
        placeholder: 'ex: AI tools, SaaS'
      },
      {
        name: 'maxResults',
        type: 'text',
        label: 'Máximo de Resultados',
        required: false,
        placeholder: '10'
      }
    ]
  },
  {
    id: 'generate-newsletter',
    name: 'Gerar Newsletter',
    description: 'Cria newsletter com notícias de IA e conteúdo curado',
    category: 'Marketing',
    icon: '📰',
    color: 'from-orange-500 to-red-500',
    webhookUrl: 'https://ivannnnnn.app.n8n.cloud/webhook/execute-workflow',
    inputs: [
      {
        name: 'topic',
        type: 'text',
        label: 'Tópico Principal',
        required: true,
        placeholder: 'ex: AI Trends, Web3'
      },
      {
        name: 'recipients',
        type: 'email',
        label: 'Email (opcional)',
        required: false,
        placeholder: 'Para quem enviar'
      }
    ]
  },
  {
    id: 'bulk-photo-generation',
    name: 'Bulk Photo Generator',
    description: 'Gera fotos de produtos em bulk a partir de imagens',
    category: 'Operações',
    icon: '📸',
    color: 'from-rose-500 to-pink-500',
    webhookUrl: 'https://ivannnnnn.app.n8n.cloud/webhook/execute-workflow',
    inputs: [
      {
        name: 'images',
        type: 'image',
        label: 'Imagens dos Produtos',
        required: true,
        placeholder: 'Carregar fotos dos produtos'
      },
      {
        name: 'style',
        type: 'select',
        label: 'Estilo Fotográfico',
        required: true,
        options: ['Professional', 'Lifestyle', 'Product', 'Minimalist']
      }
    ]
  }
];

export const getWorkflowById = (id: string): WorkflowConfig | undefined => {
  return WORKFLOWS.find(w => w.id === id);
};

export const getWorkflowsByCategory = (category: string): WorkflowConfig[] => {
  return WORKFLOWS.filter(w => w.category === category);
};

export const getCategories = (): string[] => {
  return ['Marketing', 'Operações', 'Vendas', 'Criativo'];
};
