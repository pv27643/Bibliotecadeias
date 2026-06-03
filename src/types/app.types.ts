/**
 * Tipos centralizados da aplicação
 * Evita duplicação e mantém consistência
 */

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  badges: string[]; // ['Free', 'Freemium', 'Pago']
  tags: string[];
  icon: string;
  link: string;
  favorite?: boolean;
}

export interface Prompt {
  id: string;
  title: string;
  description: string;
  category: string;
  models?: string[]; // Ex: ['Midjourney', 'Stable Diffusion']
  content?: string;
  favorite?: boolean;
}

export interface WorkflowType {
  id: string;
  name: string;
  description: string;
  category: string;
  tags?: string[];
  webhookUrl?: string;
  icon?: string;
  favorite?: boolean;
}

// Estado da aplicação
export interface AppState {
  tools: Tool[];
  prompts: Prompt[];
  workflows: WorkflowType[];
  toolCategories: string[];
  promptCategories: string[];
  workflowCategories: string[];
  subcategoriesMap: Record<string, string[]>;
}

// Tipos de filtros
export interface FilterState {
  category: string | null;
  subcategory: string | null;
  badge: string | null;
  searchTerm: string;
}

// Status de API
export type RequestStatus = 'idle' | 'loading' | 'success' | 'error';

export interface ApiState {
  status: RequestStatus;
  error?: string;
  lastUpdated?: Date;
}
