/**
 * Hook customizado para sync com Supabase + localStorage fallback
 */

import { useEffect, useState, useCallback } from 'react';
import {
  loadToolsFromSupabase,
  loadPromptsFromSupabase,
  loadWorkflowsFromSupabase,
  loadCategoriesFromSupabase,
  loadFavoritesFromSupabase,
  migrateLocalStorageToSupabase,
} from '@/utils/supabase/sync';

interface SyncState {
  isLoading: boolean;
  isSynced: boolean;
  error: string | null;
}

/**
 * Hook para sincronizar dados com Supabase
 * Carrega do Supabase, com fallback para localStorage
 */
export const useSupabaseSync = () => {
  const [state, setState] = useState<SyncState>({
    isLoading: true,
    isSynced: false,
    error: null,
  });

  const syncData = useCallback(async () => {
    setState({ isLoading: true, isSynced: false, error: null });

    try {
      // Tentar carregar do Supabase
      const toolsFromDB = await loadToolsFromSupabase();
      const promptsFromDB = await loadPromptsFromSupabase();
      const workflowsFromDB = await loadWorkflowsFromSupabase();
      const toolCategoriesFromDB = await loadCategoriesFromSupabase('tool');
      const promptCategoriesFromDB = await loadCategoriesFromSupabase('prompt');
      const workflowCategoriesFromDB = await loadCategoriesFromSupabase('workflow');
      const favoritesFromDB = await loadFavoritesFromSupabase();

      // Se tudo vem vazio do Supabase, fazer migração do localStorage
      const hasData = (toolsFromDB && toolsFromDB.length > 0) ||
                     (promptsFromDB && promptsFromDB.length > 0) ||
                     (workflowsFromDB && workflowsFromDB.length > 0);

      if (!hasData) {
        console.log('📦 Banco de dados vazio. Iniciando migração do localStorage...');
        await migrateLocalStorageToSupabase();
      }

      setState({
        isLoading: false,
        isSynced: true,
        error: null,
      });

      return {
        tools: toolsFromDB,
        prompts: promptsFromDB,
        workflows: workflowsFromDB,
        toolCategories: toolCategoriesFromDB,
        promptCategories: promptCategoriesFromDB,
        workflowCategories: workflowCategoriesFromDB,
        favorites: favoritesFromDB,
      };
    } catch (err: any) {
      const errorMsg = err?.message || 'Erro ao sincronizar dados';
      setState({
        isLoading: false,
        isSynced: false,
        error: errorMsg,
      });
      console.error('❌ Erro durante sync:', err);
      return null;
    }
  }, []);

  return { ...state, syncData };
};
