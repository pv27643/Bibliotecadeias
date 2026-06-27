import { useContext } from 'react';
import { AppContext } from '@/context/AppContext';

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp() deve ser utilizado dentro de <AppProvider>');
  return context;
};

export const useIsLoading = () => useApp().isLoading;

export const useTools = () => {
  const { tools, setTools, saveTools, toggleFavorite, getFavoritesCount } = useApp();
  return { tools, setTools, saveTools, toggleFavorite, favoritesCount: getFavoritesCount('tool') };
};

export const usePrompts = () => {
  const { prompts, setPrompts, savePrompts, toggleFavorite, getFavoritesCount } = useApp();
  return { prompts, setPrompts, savePrompts, toggleFavorite, favoritesCount: getFavoritesCount('prompt') };
};

export const useWorkflows = () => {
  const { workflows, setWorkflows, saveWorkflows, toggleFavorite, getFavoritesCount } = useApp();
  return { workflows, setWorkflows, saveWorkflows, toggleFavorite, favoritesCount: getFavoritesCount('workflow') };
};

export const useCategories = () => {
  const {
    toolCategories, setToolCategories,
    promptCategories, setPromptCategories,
    workflowCategories, setWorkflowCategories,
    subcategoriesMap, setSubcategoriesMap,
    saveCategories, saveSubcategories
  } = useApp();

  return {
    toolCategories, setToolCategories,
    promptCategories, setPromptCategories,
    workflowCategories, setWorkflowCategories,
    subcategoriesMap, setSubcategoriesMap,
    saveCategories, saveSubcategories
  };
};
