import { Hono, type Context } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

// ============ KV Store Functions ============
const kvClient = () => createClient(
  Deno.env.get("SUPABASE_URL") || "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
);

const kv = {
  set: async (key: string, value: unknown): Promise<void> => {
    const supabase = kvClient();
    const { error } = await supabase.from("kv_store_d8505aef").upsert({
      key,
      value
    });
    if (error) throw new Error(error.message);
  },
  
  get: async (key: string): Promise<unknown> => {
    const supabase = kvClient();
    const { data, error } = await supabase.from("kv_store_d8505aef").select("value").eq("key", key).maybeSingle();
    if (error) throw new Error(error.message);
    return data?.value;
  },
  
  del: async (key: string): Promise<void> => {
    const supabase = kvClient();
    const { error } = await supabase.from("kv_store_d8505aef").delete().eq("key", key);
    if (error) throw new Error(error.message);
  },
};

// ============ Hono App ============
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/health", (c: Context) => {
  return c.json({ status: "ok" });
});

// Get all data
app.get("/data", async (c: Context) => {
  try {
    const [tools, prompts, workflows, toolCategories, promptCategories, workflowCategories, subcategories] = await Promise.all([
      kv.get("tools"),
      kv.get("prompts"),
      kv.get("workflows"),
      kv.get("toolCategories"),
      kv.get("promptCategories"),
      kv.get("workflowCategories"),
      kv.get("subcategories"),
    ]);

    return c.json({
      tools: tools || [],
      prompts: prompts || [],
      workflows: workflows || [],
      toolCategories: toolCategories || ['Todas', 'Texto', 'Negócios', '3D', 'Audio', 'Outros', 'Vídeo', 'Código', 'Imagem'],
      promptCategories: promptCategories || ['Todos', 'Marketing', 'Desenvolvimento', 'Design', 'Produtividade'],
      workflowCategories: workflowCategories || ['Todos', 'Marketing', 'Operações', 'Vendas'],
      subcategories: subcategories || {},
    });
  } catch (error) {
    console.log('Error fetching data:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return c.json({ error: errorMessage }, 500);
  }
});

// Save tools
app.post("/tools", async (c: Context) => {
  try {
    const tools = await c.req.json();
    await kv.set("tools", tools);
    return c.json({ success: true });
  } catch (error) {
    console.log('Error saving tools:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return c.json({ error: errorMessage }, 500);
  }
});

// Save prompts
app.post("/prompts", async (c: Context) => {
  try {
    const prompts = await c.req.json();
    await kv.set("prompts", prompts);
    return c.json({ success: true });
  } catch (error) {
    console.log('Error saving prompts:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return c.json({ error: errorMessage }, 500);
  }
});

// Save workflows
app.post("/workflows", async (c: Context) => {
  try {
    const workflows = await c.req.json();
    await kv.set("workflows", workflows);
    return c.json({ success: true });
  } catch (error) {
    console.log('Error saving workflows:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return c.json({ error: errorMessage }, 500);
  }
});

// Save categories
app.post("/categories", async (c: Context) => {
  try {
    const { type, categories } = await c.req.json();
    const key = type === 'tool' ? 'toolCategories' : type === 'prompt' ? 'promptCategories' : 'workflowCategories';
    await kv.set(key, categories);
    return c.json({ success: true });
  } catch (error) {
    console.log('Error saving categories:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return c.json({ error: errorMessage }, 500);
  }
});

// Save subcategories
app.post("/subcategories", async (c: Context) => {
  try {
    const { subcategories } = await c.req.json();
    await kv.set("subcategories", subcategories);
    return c.json({ success: true });
  } catch (error) {
    console.log('Error saving subcategories:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return c.json({ error: errorMessage }, 500);
  }
});

Deno.serve(app.fetch);
