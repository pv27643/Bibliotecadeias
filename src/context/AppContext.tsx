import { createContext, ReactNode, useState, useEffect, useContext } from 'react';
import { Tool, Prompt, WorkflowType } from '@/app/App';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import {
  DEFAULT_TOOL_CATEGORIES,
  DEFAULT_PROMPT_CATEGORIES,
  DEFAULT_WORKFLOW_CATEGORIES,
  DEFAULT_SUBCATEGORIES_MAP
} from '@/data/categories';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-d8505aef`;
const ACTIVE_WORKFLOW_PATHS = ['identidadevisual18', 'brand-post-generator', 'execute-workflow'];

const ACTIVE_WORKFLOW_FALLBACKS: WorkflowType[] = [
  {
    id: 'n8n-brand-posts',
    title: 'Gerador de Posts com Identidade Visual',
    description: 'Analisa uma imagem de referencia e gera novos posts mantendo a identidade visual.',
    category: 'N8N',
    steps: [
      { tool: 'Analisar identidade visual', status: 'pending' },
      { tool: 'Gerar prompt visual', status: 'pending' },
      { tool: 'Gerar imagem final', status: 'pending' }
    ],
    webhookPath: 'identidadevisual18',
    isN8nWorkflow: true,
    inputs: [
      { name: 'file', type: 'image', label: 'Imagem de Referencia', required: true, placeholder: 'Carregar imagem com identidade visual' },
      { name: 'post_type', type: 'select', label: 'Tipo de Post', required: true, options: ['quote post', 'story post', 'carousel post', 'reel cover'], placeholder: 'Seleciona o tipo' },
      { name: 'topic', type: 'text', label: 'Tema/Topico', required: true, placeholder: 'ex: Lancamento de novo produto' },
      { name: 'main_message', type: 'textarea', label: 'Mensagem Principal', required: true, placeholder: 'Texto principal do post' },
      { name: 'format', type: 'select', label: 'Formato da Imagem', required: true, options: ['1:1', '9:16', '16:9'], placeholder: 'ex: 1:1' },
      { name: 'headline', type: 'text', label: 'Headline', required: false, placeholder: 'Titulo em destaque' },
      { name: 'secondary_text', type: 'text', label: 'Texto Secundario', required: false, placeholder: 'Texto de suporte' }
    ],
    favorite: false
  },
  {
    id: 'n8n-brand-posts-url',
    title: 'Gerador de Posts por URL',
    description: 'Gera posts de marca a partir de URLs publicas de imagens de referencia.',
    category: 'N8N',
    steps: [
      { tool: 'Validar URLs', status: 'pending' },
      { tool: 'Extrair identidade visual', status: 'pending' },
      { tool: 'Gerar post', status: 'pending' }
    ],
    webhookPath: 'brand-post-generator',
    isN8nWorkflow: true,
    inputs: [
      { name: 'imageUrls', type: 'textarea', label: 'URLs das Imagens', required: true, placeholder: 'Cola uma ou mais URLs publicas, uma por linha' },
      { name: 'brandName', type: 'text', label: 'Nome da Marca', required: false, placeholder: 'ex: MinhaMarca' },
      { name: 'postType', type: 'select', label: 'Tipo de Post', required: true, options: ['quote post', 'story post', 'carousel post', 'reel cover'], placeholder: 'Seleciona o tipo' },
      { name: 'topic', type: 'text', label: 'Tema/Topico', required: true, placeholder: 'ex: Lancamento de novo produto' },
      { name: 'mainMessage', type: 'textarea', label: 'Mensagem Principal', required: true, placeholder: 'Texto principal do post' },
      { name: 'format', type: 'select', label: 'Formato da Imagem', required: true, options: ['1:1', '4:5', '9:16', '16:9'], placeholder: 'ex: 1:1' },
      { name: 'headline', type: 'text', label: 'Headline', required: false, placeholder: 'Titulo em destaque' },
      { name: 'secondaryText', type: 'text', label: 'Texto Secundario', required: false, placeholder: 'Texto de suporte' }
    ],
    favorite: false
  },
  {
    id: 'n8n-execute-workflow',
    title: 'Agente n8n Geral',
    description: 'Chama o webhook geral execute-workflow para automacoes importadas no n8n.',
    category: 'N8N',
    steps: [
      { tool: 'Enviar pedido', status: 'pending' },
      { tool: 'Executar automacao', status: 'pending' },
      { tool: 'Devolver resultado', status: 'pending' }
    ],
    webhookPath: 'execute-workflow',
    isN8nWorkflow: true,
    inputs: [
      { name: 'message', type: 'textarea', label: 'Pedido', required: true, placeholder: 'Descreve o que queres que o workflow faca...' },
      { name: 'sessionId', type: 'text', label: 'Sessao', required: false, placeholder: 'opcional' },
      { name: 'productImageUrl', type: 'text', label: 'URL de Produto/Imagem', required: false, placeholder: 'https://...' }
    ],
    favorite: false
  }
];

const getActiveWorkflows = (workflows: WorkflowType[]) => (
  workflows
    .map(workflow => {
      if (workflow.id === 'n8n-brand-posts' && !workflow.webhookPath)
        return { ...workflow, webhookPath: 'identidadevisual18', isN8nWorkflow: true };
      if (workflow.id === 'n8n-brand-posts-url' && !workflow.webhookPath)
        return { ...workflow, webhookPath: 'brand-post-generator', isN8nWorkflow: true };
      if (workflow.id === 'n8n-execute-workflow' && !workflow.webhookPath)
        return { ...workflow, webhookPath: 'execute-workflow', isN8nWorkflow: true };
      return workflow;
    })
    .filter(workflow => workflow.webhookPath ? ACTIVE_WORKFLOW_PATHS.includes(workflow.webhookPath) : false)
);

const withWorkflowFallback = (workflows: WorkflowType[]) => {
  const existingPaths = new Set(workflows.map(w => w.webhookPath || w.id));
  return [...workflows, ...ACTIVE_WORKFLOW_FALLBACKS.filter(w => !existingPaths.has(w.webhookPath || w.id))];
};

interface AppContextType {
  tools: Tool[];
  setTools: (tools: Tool[]) => void;
  prompts: Prompt[];
  setPrompts: (prompts: Prompt[]) => void;
  workflows: WorkflowType[];
  setWorkflows: (workflows: WorkflowType[]) => void;
  toolCategories: string[];
  setToolCategories: (categories: string[]) => void;
  promptCategories: string[];
  setPromptCategories: (categories: string[]) => void;
  workflowCategories: string[];
  setWorkflowCategories: (categories: string[]) => void;
  subcategoriesMap: Record<string, string[]>;
  setSubcategoriesMap: (map: Record<string, string[]>) => void;
  isLoading: boolean;
  saveTools: (newTools: Tool[]) => Promise<void>;
  savePrompts: (newPrompts: Prompt[]) => Promise<void>;
  saveWorkflows: (newWorkflows: WorkflowType[]) => Promise<void>;
  saveCategories: (type: 'tool' | 'prompt' | 'workflow', categories: string[]) => Promise<void>;
  saveSubcategories: (subcategories: Record<string, string[]>) => Promise<void>;
  toggleFavorite: (type: 'tool' | 'prompt' | 'workflow', id: string) => void;
  getFavoritesCount: (type: 'tool' | 'prompt' | 'workflow') => number;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [tools, setTools] = useState<Tool[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowType[]>([]);
  const [toolCategories, setToolCategories] = useState<string[]>(DEFAULT_TOOL_CATEGORIES);
  const [promptCategories, setPromptCategories] = useState<string[]>(DEFAULT_PROMPT_CATEGORIES);
  const [workflowCategories, setWorkflowCategories] = useState<string[]>(DEFAULT_WORKFLOW_CATEGORIES);
  const [subcategoriesMap, setSubcategoriesMap] = useState<Record<string, string[]>>(DEFAULT_SUBCATEGORIES_MAP);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE}/data`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.tools?.length > 0) setTools(data.tools);
          if (data.prompts?.length > 0) setPrompts(data.prompts);
          setWorkflows(withWorkflowFallback(data.workflows?.length > 0 ? getActiveWorkflows(data.workflows) : []));
          if (data.toolCategories?.length > 0) setToolCategories(data.toolCategories);
          if (data.promptCategories?.length > 0) setPromptCategories(data.promptCategories);
          if (data.workflowCategories?.length > 0) setWorkflowCategories(data.workflowCategories);
          if (data.subcategories && Object.keys(data.subcategories).length > 0) {
            setSubcategoriesMap(data.subcategories);
          }
        }
      } catch (error) {
        console.warn('Erro ao carregar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadAllData();
  }, []);

  const saveTools = async (newTools: Tool[]) => {
    setTools(newTools);
    try {
      await fetch(`${API_BASE}/tools`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` },
        body: JSON.stringify(newTools)
      });
    } catch (err) {
      console.warn('Erro ao sincronizar tools:', err);
    }
  };

  const savePrompts = async (newPrompts: Prompt[]) => {
    setPrompts(newPrompts);
    try {
      await fetch(`${API_BASE}/prompts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` },
        body: JSON.stringify(newPrompts)
      });
    } catch (err) {
      console.warn('Erro ao sincronizar prompts:', err);
    }
  };

  const saveWorkflows = async (newWorkflows: WorkflowType[]) => {
    setWorkflows(newWorkflows);
    try {
      await fetch(`${API_BASE}/workflows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` },
        body: JSON.stringify(newWorkflows)
      });
    } catch (err) {
      console.warn('Erro ao sincronizar workflows:', err);
    }
  };

  const saveCategories = async (type: 'tool' | 'prompt' | 'workflow', categories: string[]) => {
    try {
      await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` },
        body: JSON.stringify({ type, categories })
      });
    } catch (err) {
      console.warn(`Erro ao salvar categorias ${type}:`, err);
    }
  };

  const saveSubcategories = async (subcategories: Record<string, string[]>) => {
    try {
      await fetch(`${API_BASE}/subcategories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${publicAnonKey}` },
        body: JSON.stringify({ subcategories })
      });
    } catch (err) {
      console.warn('Erro ao salvar subcategorias:', err);
    }
  };

  const toggleFavorite = (type: 'tool' | 'prompt' | 'workflow', id: string) => {
    const toggle = <T extends { id: string; favorite?: boolean }>(item: T) =>
      item.id === id ? { ...item, favorite: !item.favorite } : item;

    if (type === 'tool') saveTools(tools.map(toggle));
    else if (type === 'prompt') savePrompts(prompts.map(toggle));
    else saveWorkflows(workflows.map(toggle));
  };

  const getFavoritesCount = (type: 'tool' | 'prompt' | 'workflow'): number => {
    if (type === 'tool') return tools.filter(t => t.favorite === true).length;
    if (type === 'prompt') return prompts.filter(p => p.favorite === true).length;
    return workflows.filter(w => w.favorite === true).length;
  };

  const value: AppContextType = {
    tools, setTools,
    prompts, setPrompts,
    workflows, setWorkflows,
    toolCategories, setToolCategories,
    promptCategories, setPromptCategories,
    workflowCategories, setWorkflowCategories,
    subcategoriesMap, setSubcategoriesMap,
    isLoading,
    saveTools, savePrompts, saveWorkflows,
    saveCategories, saveSubcategories,
    toggleFavorite, getFavoritesCount
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext deve ser usado dentro de AppProvider');
  return context;
}
