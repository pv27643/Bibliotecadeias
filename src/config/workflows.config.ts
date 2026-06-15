/**
 * Configuração dos Workflows disponíveis
 * Inclui os workflows do N8N configurados em testtt.json
 */

// URL base do N8N - pode ser configurada dinamicamente
export let N8N_BASE_URL = localStorage.getItem('n8nBaseUrl') || 'https://ivannnnnn.app.n8n.cloud/webhook';

export const setN8nBaseUrl = (url: string) => {
  N8N_BASE_URL = url;
  localStorage.setItem('n8nBaseUrl', url);
};

export interface WorkflowConfig {
  id: string;
  name: string;
  description: string;
  category: 'Marketing' | 'Operações' | 'Vendas' | 'Criativo' | 'N8N';
  icon: string;
  color: string;
  inputs: WorkflowInput[];
  webhookPath: string; // caminho do webhook sem a URL base
  isN8nWorkflow?: boolean;
}

export interface WorkflowInput {
  name: string;
  type: 'text' | 'textarea' | 'select' | 'image' | 'email';
  label: string;
  required?: boolean;
  options?: string[];
  placeholder?: string;
  maxImages?: number;
}

export interface ExecuteWorkflowPayload {
  workflowId: string;
  [key: string]: any;
}

/**
 * Workflows disponíveis
 * Inclui workflows placeholder + os 3 workflows do N8N
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
  },
  // ===== N8N WORKFLOWS =====
  {
    id: 'n8n-brand-posts',
    name: '🎨 Gerador de Posts com Identidade Visual',
    description: 'Analisa imagem de marca e gera novos posts mantendo identidade visual',
    category: 'N8N',
    icon: '🎨',
    color: 'from-purple-500 to-pink-500',
    webhookPath: 'identidadevisual18',
    isN8nWorkflow: true,
    inputs: [
      {
        name: 'file',
        type: 'image',
        label: 'Imagem de Referência',
        required: true,
        placeholder: 'Carregar imagem com identidade visual'
      },
      {
        name: 'post_type',
        type: 'select',
        label: 'Tipo de Post',
        required: true,
        options: ['quote post', 'story post', 'carousel post', 'reel cover'],
        placeholder: 'Selecciona o tipo'
      },
      {
        name: 'topic',
        type: 'text',
        label: 'Tema/Tópico',
        required: true,
        placeholder: 'ex: Lançamento de novo produto'
      },
      {
        name: 'main_message',
        type: 'textarea',
        label: 'Mensagem Principal',
        required: true,
        placeholder: 'Texto principal do post'
      },
      {
        name: 'format',
        type: 'select',
        label: 'Formato da Imagem',
        required: true,
        options: ['1:1', '9:16', '16:9'],
        placeholder: 'ex: 1:1'
      },
      {
        name: 'headline',
        type: 'text',
        label: 'Headline',
        required: false,
        placeholder: 'Título em destaque'
      },
      {
        name: 'secondary_text',
        type: 'text',
        label: 'Texto Secundário',
        required: false,
        placeholder: 'Texto de suporte'
      }
    ]
  },
  {
    id: 'n8n-product-photo',
    name: '📸 Fotografia de Produto',
    description: 'Transforma foto do produto em fotografia profissional com modelo',
    category: 'N8N',
    icon: '📸',
    color: 'from-blue-500 to-cyan-500',
    webhookPath: 'generate-product-photo1',
    isN8nWorkflow: true,
    inputs: [
      {
        name: 'file',
        type: 'image',
        label: 'Foto do Produto',
        required: true,
        placeholder: 'Carregar foto do produto'
      }
    ]
  },
  {
    id: 'n8n-remove-background',
    name: '✨ Remover Fundo',
    description: 'Remove o fundo de uma imagem e retorna PNG com transparência',
    category: 'N8N',
    icon: '✨',
    color: 'from-green-500 to-emerald-500',
    webhookPath: 'removerfundo',
    isN8nWorkflow: true,
    inputs: [
      {
        name: 'file',
        type: 'image',
        label: 'Imagem',
        required: true,
        placeholder: 'Carregar imagem para remover fundo'
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
  return ['Marketing', 'Operações', 'Vendas', 'Criativo', 'N8N'];
};

/**
 * Obter URL completa do webhook para um workflow
 */
export const getWebhookUrl = (workflow: WorkflowConfig): string => {
  if (workflow.isN8nWorkflow) {
    return `${N8N_BASE_URL}/${workflow.webhookPath}`;
  }
  // Para workflows antigos que têm webhookUrl (backwards compatibility)
  return (workflow as any).webhookUrl || N8N_BASE_URL;
};
