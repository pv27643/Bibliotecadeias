export interface WorkflowStep {
  tool: string;
  status?: 'pending' | 'completed' | 'failed' | string;
  icon?: string;
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

export interface WorkflowConfig {
  id: string;
  title?: string;
  name?: string;
  description?: string;
  category?: string;
  icon?: string;
  color?: string;
  steps?: WorkflowStep[];
  inputs?: WorkflowInput[];
  webhookUrl?: string;
  webhookPath?: string;
  isN8nWorkflow?: boolean;
  requiresBrand?: boolean;
  image?: string;
  favorite?: boolean;
}
