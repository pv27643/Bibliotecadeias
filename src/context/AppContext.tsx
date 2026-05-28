import { createContext, ReactNode, useState, useEffect } from 'react';
import { Tool, Prompt, WorkflowType } from '@/app/App';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import {
  DEFAULT_TOOL_CATEGORIES,
  DEFAULT_PROMPT_CATEGORIES,
  DEFAULT_WORKFLOW_CATEGORIES,
  DEFAULT_SUBCATEGORIES_MAP
} from '@/data/categories';

const API_BASE = `https://${projectId}.supabase.co/rest/v1`;

interface AppContextType {
  // Estado das ferramentas
  tools: Tool[];
  setTools: (tools: Tool[]) => void;
  
  // Estado dos prompts
  prompts: Prompt[];
  setPrompts: (prompts: Prompt[]) => void;
  
  // Estado dos workflows
  workflows: WorkflowType[];
  setWorkflows: (workflows: WorkflowType[]) => void;
  
  // Categorias
  toolCategories: string[];
  setToolCategories: (categories: string[]) => void;
  promptCategories: string[];
  setPromptCategories: (categories: string[]) => void;
  workflowCategories: string[];
  setWorkflowCategories: (categories: string[]) => void;
  
  // Subcategorias
  subcategoriesMap: Record<string, string[]>;
  setSubcategoriesMap: (map: Record<string, string[]>) => void;
  
  // Funções de persistência
  saveTools: (newTools: Tool[]) => Promise<void>;
  savePrompts: (newPrompts: Prompt[]) => Promise<void>;
  saveWorkflows: (newWorkflows: WorkflowType[]) => Promise<void>;
  saveCategories: (type: 'tool' | 'prompt' | 'workflow', categories: string[]) => Promise<void>;
  saveSubcategories: (subcategories: Record<string, string[]>) => Promise<void>;
  
  // Funções genéricas de favoritos
  toggleFavorite: (type: 'tool' | 'prompt' | 'workflow', id: string) => void;
  getFavoritesCount: (type: 'tool' | 'prompt' | 'workflow') => number;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // ============ ESTADO DE FERRAMENTAS ============
  const [tools, setTools] = useState<Tool[]>([]);
  
  // ============ ESTADO DE PROMPTS ============
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  
  // ============ ESTADO DE WORKFLOWS ============
  const [workflows, setWorkflows] = useState<WorkflowType[]>([]);
  
  // ============ ESTADO DE CATEGORIAS ============
  const [toolCategories, setToolCategories] = useState<string[]>(DEFAULT_TOOL_CATEGORIES);
  const [promptCategories, setPromptCategories] = useState<string[]>(DEFAULT_PROMPT_CATEGORIES);
  const [workflowCategories, setWorkflowCategories] = useState<string[]>(DEFAULT_WORKFLOW_CATEGORIES);
  const [subcategoriesMap, setSubcategoriesMap] = useState<Record<string, string[]>>(DEFAULT_SUBCATEGORIES_MAP);

  // Carregar dados ao inicializar
  useEffect(() => {
    const loadAllData = async () => {
      try {
        const response = await fetch(`${API_BASE}/data`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.tools?.length > 0) setTools(data.tools);
          if (data.prompts?.length > 0) setPrompts(data.prompts);
          if (data.workflows?.length > 0) setWorkflows(data.workflows);
          if (data.toolCategories?.length > 0) setToolCategories(data.toolCategories);
          if (data.promptCategories?.length > 0) setPromptCategories(data.promptCategories);
          if (data.workflowCategories?.length > 0) setWorkflowCategories(data.workflowCategories);
          if (data.subcategories) setSubcategoriesMap(data.subcategories);
        }
      } catch (error) {
        console.warn('Erro ao carregar dados:', error);
      }
    };
    loadAllData();
  }, []);

  // ============ FUNÇÕES DE PERSISTÊNCIA ============
  const saveTools = async (newTools: Tool[]) => {
    localStorage.setItem('tools', JSON.stringify(newTools));
    setTools(newTools);
    
    try {
      await fetch(`${API_BASE}/tools`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(newTools)
      });
    } catch (err) {
      console.warn('Erro ao sincronizar tools:', err);
    }
  };

  const savePrompts = async (newPrompts: Prompt[]) => {
    localStorage.setItem('prompts', JSON.stringify(newPrompts));
    setPrompts(newPrompts);
    
    try {
      await fetch(`${API_BASE}/prompts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(newPrompts)
      });
    } catch (err) {
      console.warn('Erro ao sincronizar prompts:', err);
    }
  };

  const saveWorkflows = async (newWorkflows: WorkflowType[]) => {
    localStorage.setItem('workflows', JSON.stringify(newWorkflows));
    setWorkflows(newWorkflows);
    
    try {
      await fetch(`${API_BASE}/workflows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
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
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
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
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ subcategories })
      });
    } catch (err) {
      console.warn('Erro ao salvar subcategorias:', err);
    }
  };

  // ============ FUNÇÕES DE FAVORITOS ============
  const toggleFavorite = (type: 'tool' | 'prompt' | 'workflow', id: string) => {
    const updateItem = <T extends { id: string; favorite?: boolean }>(item: T) =>
      item.id === id ? { ...item, favorite: !item.favorite } : item;

    if (type === 'tool') {
      setTools(tools.map(updateItem));
    } else if (type === 'prompt') {
      setPrompts(prompts.map(updateItem));
    } else {
      setWorkflows(workflows.map(updateItem));
    }
  };

  const getFavoritesCount = (type: 'tool' | 'prompt' | 'workflow'): number => {
    if (type === 'tool') return tools.filter(t => t.favorite === true).length;
    if (type === 'prompt') return prompts.filter(p => p.favorite === true).length;
    return workflows.filter(w => w.favorite === true).length;
  };

  const value: AppContextType = {
    tools,
    setTools,
    prompts,
    setPrompts,
    workflows,
    setWorkflows,
    toolCategories,
    setToolCategories,
    promptCategories,
    setPromptCategories,
    workflowCategories,
    setWorkflowCategories,
    subcategoriesMap,
    setSubcategoriesMap,
    saveTools,
    savePrompts,
    saveWorkflows,
    saveCategories,
    saveSubcategories,
    toggleFavorite,
    getFavoritesCount
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext deve ser usado dentro de AppProvider');
  }
  return context;
}

import { useContext } from 'react';
