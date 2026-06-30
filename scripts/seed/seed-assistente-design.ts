import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { ASSISTENTE_DESIGN_PROMPTS } from '../../src/data/assistenteDesignPrompts.ts';

const __dir = dirname(fileURLToPath(import.meta.url));
const envRaw = readFileSync(resolve(__dir, '../../.env.local'), 'utf-8');
const env: Record<string, string> = {};
for (const line of envRaw.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eq = trimmed.indexOf('=');
  if (eq === -1) continue;
  env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
}

const projectId = env['VITE_SUPABASE_PROJECT_ID'];
const anonKey = env['VITE_SUPABASE_PUBLIC_ANON_KEY'];

if (!projectId || !anonKey) {
  console.error('VITE_SUPABASE_PROJECT_ID ou VITE_SUPABASE_PUBLIC_ANON_KEY não encontrados em .env.local');
  process.exit(1);
}

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-d8505aef`;
const HEADERS = { 'Authorization': `Bearer ${anonKey}`, 'Content-Type': 'application/json' };

async function main() {
  const readRes = await fetch(`${API_BASE}/data`, { headers: { 'Authorization': `Bearer ${anonKey}` } });
  if (!readRes.ok) {
    console.error(`Erro ao ler dados: ${readRes.status} ${await readRes.text()}`);
    process.exit(1);
  }
  const data = await readRes.json() as { prompts?: { id: string }[] };
  const existing: { id: string }[] = data.prompts ?? [];
  const totalBefore = existing.length;

  const seedIds = new Set(ASSISTENTE_DESIGN_PROMPTS.map(p => p.id));
  const toAdd = ASSISTENTE_DESIGN_PROMPTS.filter(p => !existing.some((e: any) => e.id === p.id));
  const merged = [
    ...existing.map((e: any) => seedIds.has(e.id) ? ASSISTENTE_DESIGN_PROMPTS.find(p => p.id === e.id)! : e),
    ...toAdd,
  ];

  const writeRes = await fetch(`${API_BASE}/prompts`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify(merged),
  });
  if (!writeRes.ok) {
    console.error(`Erro ao escrever prompts: ${writeRes.status} ${await writeRes.text()}`);
    process.exit(1);
  }

  console.log(`Total antes   : ${totalBefore}`);
  console.log(`Adicionados   : ${toAdd.length}`);
  console.log(`Actualizados  : ${ASSISTENTE_DESIGN_PROMPTS.length - toAdd.length}`);
  console.log(`Total final   : ${merged.length}`);
}

main().catch(err => { console.error(err); process.exit(1); });
