/**
 * Funções para sincronização com Supabase
 * Importar e usar no App.tsx
 */

import { supabase } from './client';
import { publicAnonKey, supabaseUrl } from './info';
import {
  DEFAULT_TOOL_CATEGORIES,
  DEFAULT_PROMPT_CATEGORIES,
  DEFAULT_WORKFLOW_CATEGORIES,
  DEFAULT_SUBCATEGORIES_MAP
} from '../../data/categories';

const FUNCTION_API_BASE = `${supabaseUrl}/functions/v1/make-server-d8505aef`;
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${publicAnonKey}`,
};

interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  badges: string[];
  tags: string[];
  icon: string;
  link?: string;
}

interface Prompt {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  models: string[];
  content: string;
  image?: string;
}

interface Workflow {
  id: string;
  title: string;
  description: string;
  category: string;
  steps: any[];
  image?: string;
  webhookUrl?: string;
  inputs?: any[];
}

// ===== FERRAMENTAS =====
const fetchFunction = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const response = await fetch(`${FUNCTION_API_BASE}${path}`, {
    ...options,
    headers: {
      ...DEFAULT_HEADERS,
      ...(options.headers as Record<string, string> | undefined),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Function ${path} failed: ${response.status} ${errorText}`);
  }

  return response.json();
};

export const syncToolsToSupabase = async (tools: Tool[]) => {
  try {
    await fetchFunction('/tools', {
      method: 'POST',
      body: JSON.stringify(tools),
    });

    console.log('✅ Tools sincronizadas para Supabase');
    return true;
  } catch (err) {
    console.error('❌ Erro ao sincronizar tools:', err);
    return false;
  }
};

export const loadToolsFromSupabase = async (): Promise<Tool[] | null> => {
  try {
    const data = await fetchFunction<{ tools?: Tool[] }>('/data');
    console.log('✅ Tools carregadas do Supabase');
    return data.tools || [];
  } catch (err) {
    console.error('❌ Erro ao carregar tools:', err);
    return null;
  }
};

// ===== PROMPTS =====
export const syncPromptsToSupabase = async (prompts: Prompt[]) => {
  try {
    await fetchFunction('/prompts', {
      method: 'POST',
      body: JSON.stringify(prompts),
    });

    console.log('✅ Prompts sincronizados para Supabase');
    return true;
  } catch (err) {
    console.error('❌ Erro ao sincronizar prompts:', err);
    return false;
  }
};

export const loadPromptsFromSupabase = async (): Promise<Prompt[] | null> => {
  try {
    const data = await fetchFunction<{ prompts?: Prompt[] }>('/data');
    console.log('✅ Prompts carregados do Supabase');
    return data.prompts || [];
  } catch (err) {
    console.error('❌ Erro ao carregar prompts:', err);
    return null;
  }
};

// ===== WORKFLOWS =====
export const syncWorkflowsToSupabase = async (workflows: Workflow[]) => {
  try {
    await fetchFunction('/workflows', {
      method: 'POST',
      body: JSON.stringify(workflows),
    });

    console.log('✅ Workflows sincronizados para Supabase');
    return true;
  } catch (err) {
    console.error('❌ Erro ao sincronizar workflows:', err);
    return false;
  }
};

export const loadWorkflowsFromSupabase = async (): Promise<Workflow[] | null> => {
  try {
    const data = await fetchFunction<{ workflows?: Workflow[] }>('/data');
    console.log('✅ Workflows carregados do Supabase');
    return (data.workflows || []).map(w => ({
      ...w,
      webhookUrl: w.webhookUrl,
    }));
  } catch (err) {
    console.error('❌ Erro ao carregar workflows:', err);
    return null;
  }
};

// ===== CATEGORIAS =====
export const syncCategoriesToSupabase = async (type: string, categories: string[]) => {
  try {
    await fetchFunction('/categories', {
      method: 'POST',
      body: JSON.stringify({ type, categories }),
    });

    console.log(`✅ Categorias (${type}) sincronizadas para Supabase`);
    return true;
  } catch (err) {
    console.error(`❌ Erro ao sincronizar categorias:`, err);
    return false;
  }
};

export const loadCategoriesFromSupabase = async (type: string): Promise<string[] | null> => {
  try {
    const data = await fetchFunction<{
      toolCategories?: string[];
      promptCategories?: string[];
      workflowCategories?: string[];
    }>('/data');

    const categories =
      type === 'tool' ? data.toolCategories :
      type === 'prompt' ? data.promptCategories :
      type === 'workflow' ? data.workflowCategories :
      [];

    console.log(`✅ Categorias (${type}) carregadas do Supabase`);
    return categories || [];
  } catch (err) {
    console.error(`❌ Erro ao carregar categorias:`, err);
    return null;
  }
};

// ===== FAVORITOS =====
export const addFavoriteToSupabase = async (itemType: string, itemId: string, itemName: string) => {
  try {
    const { error } = await supabase.from('favorites').insert({
      item_type: itemType,
      item_id: itemId,
      item_name: itemName,
    });

    if (error) throw error;
    console.log(`✅ Favorito adicionado: ${itemType}/${itemId}`);
    return true;
  } catch (err) {
    console.error('❌ Erro ao adicionar favorito:', err);
    return false;
  }
};

export const removeFavoriteFromSupabase = async (itemType: string, itemId: string) => {
  try {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('item_type', itemType)
      .eq('item_id', itemId);

    if (error) throw error;
    console.log(`✅ Favorito removido: ${itemType}/${itemId}`);
    return true;
  } catch (err) {
    console.error('❌ Erro ao remover favorito:', err);
    return false;
  }
};

export const loadFavoritesFromSupabase = async (): Promise<{ type: string; id: string }[] | null> => {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('item_type, item_id')
      .order('created_at', { ascending: false });

    if (error) throw error;
    console.log('✅ Favoritos carregados do Supabase');
    return data?.map(f => ({ type: f.item_type, id: f.item_id })) || [];
  } catch (err) {
    console.error('❌ Erro ao carregar favoritos:', err);
    return null;
  }
};

// ===== SUBCATEGORIAS =====
interface SubcategoryMap {
  [category: string]: string[];
}

export const syncSubcategoriesToSupabase = async (subcategoriesMap: SubcategoryMap) => {
  try {
    // Limpar subcategorias existentes
    await supabase.from('subcategories').delete().neq('id', 'null');

    // Inserir novas
    const records = [];
    for (const [category, subcategories] of Object.entries(subcategoriesMap)) {
      for (let position = 0; position < subcategories.length; position++) {
        records.push({
          category,
          name: subcategories[position],
          position,
        });
      }
    }

    if (records.length > 0) {
      const { error } = await supabase.from('subcategories').insert(records);
      if (error) throw error;
    }

    console.log('✅ Subcategorias sincronizadas para Supabase');
    return true;
  } catch (err) {
    console.error('❌ Erro ao sincronizar subcategorias:', err);
    return false;
  }
};

export const loadSubcategoriesFromSupabase = async (): Promise<SubcategoryMap | null> => {
  try {
    const { data, error } = await supabase
      .from('subcategories')
      .select('category, name')
      .order('position', { ascending: true });

    if (error) throw error;

    const subcategoriesMap: SubcategoryMap = {};
    data?.forEach((row: any) => {
      if (!subcategoriesMap[row.category]) {
        subcategoriesMap[row.category] = [];
      }
      subcategoriesMap[row.category].push(row.name);
    });

    console.log('✅ Subcategorias carregadas do Supabase');
    return Object.keys(subcategoriesMap).length > 0 ? subcategoriesMap : null;
  } catch (err) {
    console.error('❌ Erro ao carregar subcategorias:', err);
    return null;
  }
};

// ===== MIGRAÇÃO INICIAL (localStorage → Supabase) =====
const MIGRATION_KEYS = [
  'tools',
  'prompts',
  'workflows',
  'toolCategories',
  'promptCategories',
  'workflowCategories',
  'subcategoriesMap',
];

const clearMigratedLocalStorage = (keys: string[]) => {
  keys.forEach(key => {
    localStorage.removeItem(key);
    console.log(`🗑️ LocalStorage limpo após migração: ${key}`);
  });
};

// ===== FUNÇÕES COM DEFAULTS =====
export const loadToolCategoriesWithDefaults = async (): Promise<string[]> => {
  const fromDB = await loadCategoriesFromSupabase('tool');
  return (fromDB && fromDB.length > 0) ? fromDB : DEFAULT_TOOL_CATEGORIES;
};

export const loadPromptCategoriesWithDefaults = async (): Promise<string[]> => {
  const fromDB = await loadCategoriesFromSupabase('prompt');
  return (fromDB && fromDB.length > 0) ? fromDB : DEFAULT_PROMPT_CATEGORIES;
};

export const loadWorkflowCategoriesWithDefaults = async (): Promise<string[]> => {
  const fromDB = await loadCategoriesFromSupabase('workflow');
  return (fromDB && fromDB.length > 0) ? fromDB : DEFAULT_WORKFLOW_CATEGORIES;
};

export const loadSubcategoriesWithDefaults = async (): Promise<SubcategoryMap> => {
  const fromDB = await loadSubcategoriesFromSupabase();
  return (fromDB && Object.keys(fromDB).length > 0) ? fromDB : DEFAULT_SUBCATEGORIES_MAP;
};

export const migrateLocalStorageToSupabase = async () => {
  console.log('🚀 Iniciando migração de localStorage para Supabase...');

  const toolsData = localStorage.getItem('tools');
  const promptsData = localStorage.getItem('prompts');
  const workflowsData = localStorage.getItem('workflows');
  const toolCategoriesData = localStorage.getItem('toolCategories');
  const promptCategoriesData = localStorage.getItem('promptCategories');
  const workflowCategoriesData = localStorage.getItem('workflowCategories');
  const subcategoriesData = localStorage.getItem('subcategoriesMap');

  const migratedKeys: string[] = [];

  const trySync = async <T>(key: string, data: T | null, syncFn: (value: T) => Promise<void>) => {
    if (!data) return;
    try {
      await syncFn(data);
      migratedKeys.push(key);
    } catch (err) {
      console.warn(`⚠️ Falha ao migrar ${key} para Supabase:`, err);
    }
  };

  try {
    if (toolsData) {
      const tools = JSON.parse(toolsData);
      await trySync('tools', tools, syncToolsToSupabase);
    }

    if (promptsData) {
      const prompts = JSON.parse(promptsData);
      await trySync('prompts', prompts, syncPromptsToSupabase);
    }

    if (workflowsData) {
      const workflows = JSON.parse(workflowsData);
      await trySync('workflows', workflows, syncWorkflowsToSupabase);
    }

    if (toolCategoriesData) {
      const categories = JSON.parse(toolCategoriesData);
      await trySync('toolCategories', categories, async value => await syncCategoriesToSupabase('tool', value));
    }

    if (promptCategoriesData) {
      const categories = JSON.parse(promptCategoriesData);
      await trySync('promptCategories', categories, async value => await syncCategoriesToSupabase('prompt', value));
    }

    if (workflowCategoriesData) {
      const categories = JSON.parse(workflowCategoriesData);
      await trySync('workflowCategories', categories, async value => await syncCategoriesToSupabase('workflow', value));
    }

    if (subcategoriesData) {
      const subcategories = JSON.parse(subcategoriesData);
      await trySync('subcategoriesMap', subcategories, syncSubcategoriesToSupabase);
    }

    if (migratedKeys.length > 0) {
      clearMigratedLocalStorage(migratedKeys);
      console.log('✅ Migração parcial/concluída e localStorage limpo para as chaves sincronizadas:', migratedKeys);
    } else {
      console.warn('⚠️ Nenhuma chave migrada para o Supabase. O localStorage não foi limpo.');
    }

    return migratedKeys.length > 0;
  } catch (err) {
    console.error('❌ Erro inesperado durante migração:', err);
    return false;
  }
};

/**
 * 🗑️ LIMPAR TODO O LOCALSTORAGE - Força usar apenas Supabase
 */
export const clearLocalStorageForSupabase = () => {
  const keysToRemove = [
    'tools',
    'prompts',
    'workflows',
    'toolCategories',
    'promptCategories',
    'workflowCategories',
    'subcategoriesMap',
    'favorites',
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`🗑️ Removido do localStorage: ${key}`);
  });
  
  console.log('✅ localStorage limpo. Usando apenas Supabase como source of truth!');
  
  // Recarregar página para forçar recarga dos dados do Supabase
  window.location.reload();
};
