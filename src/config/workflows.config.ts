const getN8nBaseUrl = (): string =>
  localStorage.getItem('n8nBaseUrl') || import.meta.env.VITE_N8N_WEBHOOK || 'http://localhost:5678/webhook';

export const setN8nBaseUrl = (url: string) => {
  localStorage.setItem('n8nBaseUrl', url);
};

import type { WorkflowConfig, WorkflowInput } from '@/types/workflow';
export type { WorkflowConfig, WorkflowInput };

export interface ExecuteWorkflowPayload {
  workflowId: string;
  [key: string]: unknown;
}

export const WORKFLOWS: WorkflowConfig[] = [
  {
    id: 'extract-brand-style',
    name: 'Extrair Estilo de Marca',
    description: 'Analisa um website ou imagens e extrai a identidade visual completa da marca (paleta, tipografia, tom de voz).',
    category: 'N8N',
    icon: 'palette',
    color: 'from-violet-500 to-purple-600',
    webhookPath: import.meta.env.VITE_N8N_PATH_EXTRACT_BRAND || 'extract-brand-style',
    isN8nWorkflow: true,
    requiresBrand: false,
    inputs: [
      {
        name: 'source_type',
        type: 'select',
        label: 'Fonte',
        required: true,
        options: ['url', 'images'],
        placeholder: 'Escolhe a fonte'
      },
      {
        name: 'url',
        type: 'text',
        label: 'URL do Website',
        required: false,
        placeholder: 'https://exemplo.com'
      },
      {
        name: 'brand_name',
        type: 'text',
        label: 'Nome da Marca',
        required: true,
        placeholder: 'ex: Nike, Minha Marca'
      },
      {
        name: 'images',
        type: 'image',
        label: 'Imagens de Referência (se fonte = images)',
        required: false,
        maxImages: 6
      }
    ]
  },
  {
    id: 'generate-post',
    name: 'Gerar Post (Texto)',
    description: 'Gera legenda, hashtags e CTA para um post nas redes sociais, respeitando o tom de voz da marca.',
    category: 'N8N',
    icon: 'message-square',
    color: 'from-blue-500 to-cyan-500',
    webhookPath: import.meta.env.VITE_N8N_PATH_GENERATE_POST || 'generate-post',
    isN8nWorkflow: true,
    requiresBrand: true,
    inputs: [
      {
        name: 'theme',
        type: 'text',
        label: 'Tema do Post',
        required: true,
        placeholder: 'ex: Lançamento de produto, Promoção de verão'
      },
      {
        name: 'platform',
        type: 'select',
        label: 'Plataforma',
        required: true,
        options: ['Instagram', 'LinkedIn', 'Facebook', 'TikTok', 'Twitter/X']
      },
      {
        name: 'goal',
        type: 'select',
        label: 'Objetivo',
        required: true,
        options: ['Engagement', 'Awareness', 'Conversão', 'Educação', 'Entretenimento']
      },
      {
        name: 'format',
        type: 'select',
        label: 'Formato',
        required: true,
        options: ['Post simples', 'Carrossel', 'Story', 'Reel', 'Artigo']
      },
      {
        name: 'extra_context',
        type: 'textarea',
        label: 'Contexto adicional (opcional)',
        required: false,
        placeholder: 'Detalhes extras, produto específico, CTA desejado...'
      }
    ]
  },
  {
    id: 'generate-visual',
    name: 'Gerar Visual',
    description: 'Cria uma imagem para post usando a identidade visual da marca via IA (gpt-image).',
    category: 'N8N',
    icon: 'image',
    color: 'from-pink-500 to-rose-500',
    webhookPath: import.meta.env.VITE_N8N_PATH_GENERATE_VISUAL || 'generate-visual',
    isN8nWorkflow: true,
    requiresBrand: true,
    inputs: [
      {
        name: 'concept',
        type: 'textarea',
        label: 'Conceito Visual',
        required: true,
        placeholder: 'Descreve o que deves ver na imagem...'
      },
      {
        name: 'text_overlay',
        type: 'text',
        label: 'Texto na Imagem (opcional)',
        required: false,
        placeholder: 'ex: "50% OFF este fim de semana"'
      },
      {
        name: 'aspect_ratio',
        type: 'select',
        label: 'Formato',
        required: true,
        options: ['1:1 (Feed)', '9:16 (Story/Reel)', '16:9 (Landscape)', '4:5 (Feed vertical)']
      }
    ]
  },
  {
    id: 'generate-carousel',
    name: 'Gerar Carrossel',
    description: 'Cria os slides de um carrossel com título, corpo e conceito visual para cada slide.',
    category: 'N8N',
    icon: 'layout',
    color: 'from-amber-500 to-orange-500',
    webhookPath: import.meta.env.VITE_N8N_PATH_GENERATE_CAROUSEL || 'generate-carousel',
    isN8nWorkflow: true,
    requiresBrand: true,
    inputs: [
      {
        name: 'topic',
        type: 'text',
        label: 'Tópico do Carrossel',
        required: true,
        placeholder: 'ex: 5 dicas para melhorar o teu branding'
      },
      {
        name: 'num_slides',
        type: 'select',
        label: 'Número de Slides',
        required: true,
        options: ['3', '5', '7', '10']
      },
      {
        name: 'platform',
        type: 'select',
        label: 'Plataforma',
        required: true,
        options: ['Instagram', 'LinkedIn', 'Facebook']
      }
    ]
  },
  {
    id: 'repurpose-content',
    name: 'Repurpose de Conteúdo',
    description: 'Transforma conteúdo existente (URL ou texto) em posts adaptados para várias plataformas.',
    category: 'N8N',
    icon: 'refresh-cw',
    color: 'from-teal-500 to-green-500',
    webhookPath: import.meta.env.VITE_N8N_PATH_REPURPOSE || 'repurpose-content',
    isN8nWorkflow: true,
    requiresBrand: true,
    inputs: [
      {
        name: 'source_url',
        type: 'text',
        label: 'URL do Conteúdo (opcional)',
        required: false,
        placeholder: 'https://blog.exemplo.com/artigo'
      },
      {
        name: 'source_text',
        type: 'textarea',
        label: 'Texto de Origem (se não tiveres URL)',
        required: false,
        placeholder: 'Cola aqui o texto original...'
      },
      {
        name: 'platforms',
        type: 'select',
        label: 'Plataformas Alvo',
        required: true,
        options: ['Instagram + LinkedIn', 'Instagram + TikTok', 'LinkedIn + Twitter/X', 'Todas (Instagram, LinkedIn, TikTok, Twitter/X)']
      },
      {
        name: 'num_posts',
        type: 'select',
        label: 'Posts por Plataforma',
        required: true,
        options: ['1', '2', '3']
      }
    ]
  },
  {
    id: 'weekly-batch',
    name: 'Batch Semanal',
    description: 'Gera um calendário de conteúdo para 7 dias com legendas e conceitos visuais prontos a agendar.',
    category: 'N8N',
    icon: 'calendar',
    color: 'from-indigo-500 to-blue-600',
    webhookPath: import.meta.env.VITE_N8N_PATH_WEEKLY_BATCH || 'weekly-batch',
    isN8nWorkflow: true,
    requiresBrand: true,
    inputs: [
      {
        name: 'themes',
        type: 'textarea',
        label: 'Temas da Semana (um por linha)',
        required: true,
        placeholder: 'Produto novo\nDica da semana\nTestemunho de cliente\n...'
      },
      {
        name: 'platform',
        type: 'select',
        label: 'Plataforma Principal',
        required: true,
        options: ['Instagram', 'LinkedIn', 'Facebook', 'TikTok']
      },
      {
        name: 'post_frequency',
        type: 'select',
        label: 'Frequência',
        required: true,
        options: ['1 post/dia (7 posts)', 'Dias úteis (5 posts)', '3 posts/semana']
      }
    ]
  },
  {
    id: 'generate-bio',
    name: 'Gerar Bio',
    description: 'Gera uma bio otimizada para redes sociais com base no perfil de marca e plataforma alvo.',
    category: 'N8N',
    icon: 'pen-tool',
    color: 'from-cyan-500 to-blue-500',
    webhookPath: import.meta.env.VITE_N8N_PATH_GENERATE_BIO || 'generate-bio',
    isN8nWorkflow: true,
    requiresBrand: true,
    inputs: [
      {
        name: 'platform',
        type: 'select',
        label: 'Plataforma',
        required: true,
        options: ['Instagram', 'LinkedIn', 'TikTok', 'Twitter/X', 'YouTube']
      },
      {
        name: 'tone_extra',
        type: 'text',
        label: 'Tom adicional (opcional)',
        required: false,
        placeholder: 'ex: mais descontraído, foco em humor'
      }
    ]
  }
];

export const getWorkflowById = (id: string): WorkflowConfig | undefined =>
  WORKFLOWS.find(w => w.id === id);

export const getWorkflowsByCategory = (category: string): WorkflowConfig[] =>
  WORKFLOWS.filter(w => w.category === category);

export const getCategories = (): string[] => ['N8N'];

export const getWebhookUrl = (workflow: { webhookPath?: string }): string =>
  `${getN8nBaseUrl()}/${workflow.webhookPath ?? ''}`;
