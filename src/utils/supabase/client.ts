/**
 * Cliente Supabase
 * Configuração e inicialização
 */

import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey, supabaseUrl } from './info';

// Mock client se não houver credentials válidas
if (!projectId || !publicAnonKey || projectId === 'demo-project') {
  console.warn('⚠️ Supabase não está configurado. Use variáveis de ambiente VITE_SUPABASE_PROJECT_ID e VITE_SUPABASE_PUBLIC_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, publicAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
