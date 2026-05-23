import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

// Criar cliente Supabase único (singleton)
export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey,
  {
    auth: {
      persistSession: false // Desativar sessão de autenticação (não necessária para Storage)
    }
  }
);
