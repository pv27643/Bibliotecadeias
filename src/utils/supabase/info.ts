/**
 * Informações de Supabase
 * Variáveis de ambiente para conexão
 */

export const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || 'demo-project';
export const publicAnonKey = import.meta.env.VITE_SUPABASE_PUBLIC_ANON_KEY || 'demo-key';
export const supabaseUrl = `https://${projectId}.supabase.co`;
