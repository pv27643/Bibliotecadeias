// Usage: set VITE_SUPABASE_PROJECT_ID and VITE_SUPABASE_PUBLIC_ANON_KEY in env, then run:
// node scripts/seed-supabase.js

const fs = require('fs');
const path = require('path');

const projectId = process.env.VITE_SUPABASE_PROJECT_ID;
const publicAnonKey = process.env.VITE_SUPABASE_PUBLIC_ANON_KEY;

if (!projectId || !publicAnonKey) {
  console.error('Please set VITE_SUPABASE_PROJECT_ID and VITE_SUPABASE_PUBLIC_ANON_KEY in your environment.');
  process.exit(1);
}

const supabaseUrl = `https://${projectId}.supabase.co`;
const FUNCTION_BASE = `${supabaseUrl}/functions/v1/make-server-d8505aef`;
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${publicAnonKey}`,
};

function readSeedData() {
  const p = path.join(__dirname, 'seed-data.json');
  if (!fs.existsSync(p)) {
    console.error('Missing scripts/seed-data.json. Create it with keys: tools, prompts, workflows, categories, subcategories.');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

async function post(endpoint, body) {
  const res = await fetch(`${FUNCTION_BASE}/${endpoint}`, {
    method: 'POST',
    headers: DEFAULT_HEADERS,
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${endpoint} failed: ${res.status} ${text}`);
  }
  return text;
}

async function run() {
  const data = readSeedData();

  if ((!data.tools || data.tools.length === 0) && (!data.prompts || data.prompts.length === 0) && (!data.workflows || data.workflows.length === 0)) {
    console.error('seed-data.json appears empty. Paste your `tools`, `prompts`, and `workflows` arrays into it before running.');
    process.exit(1);
  }

  console.log('Seeding tools...');
  if (data.tools && data.tools.length) await post('tools', { tools: data.tools });

  console.log('Seeding prompts...');
  if (data.prompts && data.prompts.length) await post('prompts', { prompts: data.prompts });

  console.log('Seeding workflows...');
  if (data.workflows && data.workflows.length) await post('workflows', { workflows: data.workflows });

  if (data.categories) {
    console.log('Seeding categories...');
    for (const cat of ['toolCategories', 'promptCategories', 'workflowCategories']) {
      if (data.categories[cat] && data.categories[cat].length) {
        await post('categories', { type: cat, categories: data.categories[cat] });
      }
    }
  }

  if (data.subcategories) {
    console.log('Seeding subcategories...');
    await post('subcategories', { subcategories: data.subcategories });
  }

  console.log('Seed completed.');
}

run().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
