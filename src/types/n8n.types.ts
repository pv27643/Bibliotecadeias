/**
 * Tipos TypeScript para integração com n8n webhooks
 */

// ============================================
// TIPOS DE REQUISIÇÃO
// ============================================

export interface N8nChatRequest {
  chatInput: string;
  sessionId: string;
  imageId?: string;
  files?: File[];
}

export interface N8nImageRequest {
  imageID: string; // Vazio se criar do zero
  prompt: string;
  format?: '1:1' | '9:16' | '16:9';
}

export interface N8nBrandRequest {
  brandName: string;
  postType: 'quote post' | 'announcement' | 'carousel cover' | 'feature post' | 'story post';
  topic: string;
  mainMessage: string;
  headline: string;
  secondaryText?: string;
  format?: '1:1' | '9:16' | '16:9';
}

// ============================================
// TIPOS DE RESPOSTA
// ============================================

export interface N8nBaseResponse {
  success: boolean;
  message?: string;
  error?: string;
  details?: string;
}

export interface N8nSuccessResponse<T = any> extends N8nBaseResponse {
  success: true;
  data?: T;
  fileName?: string;
  webViewLink?: string;
  imageUrl?: string;
  conversationHistory?: any[];
}

export interface N8nErrorResponse extends N8nBaseResponse {
  success: false;
  error: string;
}

export interface N8nChatResponse extends N8nSuccessResponse {
  sessionId?: string;
  botMessage: string;
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export interface N8nImageResponse extends N8nSuccessResponse {
  imageUrl: string;
  imageId?: string;
  format?: string;
}

export interface N8nBrandResponse extends N8nSuccessResponse {
  brandDNA?: BrandIdentity;
  generatedImages?: Array<{
    url: string;
    format: string;
  }>;
}

// ============================================
// TIPOS DE DOMÍNIO
// ============================================

export interface BrandIdentity {
  name: string;
  mood: string[];
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    highlight: string;
  };
  typography: {
    fontCategory: string;
    weight: string;
    caseStyle: string;
    hierarchy: string;
    textPlacement: string;
  };
  layout: {
    composition: string;
    alignment: string;
    spacing: string;
    graphicSystem: string;
  };
  imagery: {
    style: string;
    cameraOrRendering: string;
    subjectFraming: string;
    texture: string;
  };
  lighting: {
    direction: string;
    quality: string;
    shadowStyle: string;
    highlightStyle: string;
  };
  socialRules: {
    quotePost: string;
    announcementPost: string;
    carouselCover: string;
    featurePost: string;
    storyPost: string;
  };
  antiDriftRules: string[];
}

// ============================================
// TIPOS DO HOOK
// ============================================

export interface UseN8nWebhookOptions {
  webhookUrl: string;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export interface UseN8nWebhookReturn {
  isLoading: boolean;
  error: string | null;
  response: any;
  sendData: (data: FormData | Record<string, any>) => Promise<any>;
  clearError: () => void;
}

// ============================================
// TIPOS DE COMPONENTES
// ============================================

export interface BrandPostGeneratorProps {
  webhookUrl?: string;
  onSuccess?: (result: N8nBrandResponse) => void;
  onError?: (error: string) => void;
}

export interface SimpleN8nFormProps {
  webhookUrl: string;
  title?: string;
  fields?: FormField[];
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export interface FormField {
  name: string;
  type: 'text' | 'textarea' | 'select' | 'file' | 'email';
  label: string;
  required?: boolean;
  options?: string[];
  placeholder?: string;
  maxLength?: number;
  accept?: string; // para file inputs
}

// ============================================
// TIPOS DE ESTADO
// ============================================

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: File[];
}

export interface ChatSession {
  sessionId: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  format: '1:1' | '9:16' | '16:9';
  createdAt: Date;
  brandName?: string;
}

// ============================================
// TIPOS AUXILIARES
// ============================================

export type N8nResponse<T = any> = N8nSuccessResponse<T> | N8nErrorResponse;

export interface N8nWebhookConfig {
  url: string;
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
}

// ============================================
// CONSTANTES DE TIPOS
// ============================================

export const POST_TYPES = [
  'quote post',
  'announcement',
  'carousel cover',
  'feature post',
  'story post'
] as const;

export const IMAGE_FORMATS = ['1:1', '9:16', '16:9'] as const;

export const FORM_FIELD_TYPES = [
  'text',
  'textarea',
  'select',
  'file',
  'email'
] as const;
