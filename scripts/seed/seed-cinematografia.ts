/**
 * Seed idempotente — Cinematografia Prompts
 *
 * Uso: npx tsx seed-cinematografia.ts
 *
 * Lê os prompts actuais do KV, faz merge por id (sem duplicar),
 * reescreve, e imprime: total antes / adicionados / total final.
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { CINEMATOGRAFIA_PROMPTS } from '../../src/data/cinematografiaPrompts.ts';

// ── credenciais via .env.local ──────────────────────────────────────────────
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

// ── seed ────────────────────────────────────────────────────────────────────
async function main() {
  // 1. ler estado actual
  const readRes = await fetch(`${API_BASE}/data`, { headers: { 'Authorization': `Bearer ${anonKey}` } });
  if (!readRes.ok) {
    console.error(`Erro ao ler dados: ${readRes.status} ${await readRes.text()}`);
    process.exit(1);
  }
  const data = await readRes.json() as { prompts?: { id: string }[] };
  const existing: { id: string }[] = data.prompts ?? [];
  const totalBefore = existing.length;

  // 2. merge por id
  const existingIds = new Set(existing.map(p => p.id));
  const toAdd = CINEMATOGRAFIA_PROMPTS.filter(p => !existingIds.has(p.id));
  const merged = [...existing, ...toAdd];

  // 3. reescrever
  const writeRes = await fetch(`${API_BASE}/prompts`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify(merged),
  });
  if (!writeRes.ok) {
    console.error(`Erro ao escrever prompts: ${writeRes.status} ${await writeRes.text()}`);
    process.exit(1);
  }

  // 4. relatório
  console.log(`Total antes  : ${totalBefore}`);
  console.log(`Adicionados  : ${toAdd.length}`);
  console.log(`Total final  : ${merged.length}`);
  if (toAdd.length === 0) console.log('(já estava tudo presente — nada foi duplicado)');
}

main().catch(err => { console.error(err); process.exit(1); });
