import { useContext } from 'react';
import { AppContext } from '@/context/AppContext';

/**
 * Hook customizado para aceder ao contexto da aplicação
 * Uso: const { tools, saveTools, toggleFavorite } = useApp();
 */
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp() deve ser utilizado dentro de <AppProvider>');
  }
  return context;
};

/**
 * Hook para obter apenas as ferramentas
 */
export const useTools = () => {
  const { tools, setTools, saveTools, toggleFavorite, getFavoritesCount } = useApp();
  return { tools, setTools, saveTools, toggleFavorite, favoritesCount: getFavoritesCount('tool') };
};

/**
 * Hook para obter apenas os prompts
 */
export const usePrompts = () => {
  const { prompts, setPrompts, savePrompts, toggleFavorite, getFavoritesCount } = useApp();
  return { prompts, setPrompts, savePrompts, toggleFavorite, favoritesCount: getFavoritesCount('prompt') };
};

/**
 * Hook para obter apenas os workflows
 */
export const useWorkflows = () => {
  const { workflows, setWorkflows, saveWorkflows, toggleFavorite, getFavoritesCount } = useApp();
  return { workflows, setWorkflows, saveWorkflows, toggleFavorite, favoritesCount: getFavoritesCount('workflow') };
};

/**
 * Hook para obter apenas as categorias
 */
export const useCategories = () => {
  const {
    toolCategories,
    setToolCategories,
    promptCategories,
    setPromptCategories,
    workflowCategories,
    setWorkflowCategories,
    subcategoriesMap,
    setSubcategoriesMap,
    saveCategories,
    saveSubcategories
  } = useApp();

  return {
    toolCategories,
    setToolCategories,
    promptCategories,
    setPromptCategories,
    workflowCategories,
    setWorkflowCategories,
    subcategoriesMap,
    setSubcategoriesMap,
    saveCategories,
    saveSubcategories
  };
};
