import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
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
app.get("/make-server-d8505aef/health", (c) => {
  return c.json({ status: "ok" });
});

// Get all data
app.get("/make-server-d8505aef/data", async (c) => {
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
    return c.json({ error: error.message }, 500);
  }
});

// Save tools
app.post("/make-server-d8505aef/tools", async (c) => {
  try {
    const tools = await c.req.json();
    await kv.set("tools", tools);
    return c.json({ success: true });
  } catch (error) {
    console.log('Error saving tools:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Save prompts
app.post("/make-server-d8505aef/prompts", async (c) => {
  try {
    const prompts = await c.req.json();
    await kv.set("prompts", prompts);
    return c.json({ success: true });
  } catch (error) {
    console.log('Error saving prompts:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Save workflows
app.post("/make-server-d8505aef/workflows", async (c) => {
  try {
    const workflows = await c.req.json();
    await kv.set("workflows", workflows);
    return c.json({ success: true });
  } catch (error) {
    console.log('Error saving workflows:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Save categories
app.post("/make-server-d8505aef/categories", async (c) => {
  try {
    const { type, categories } = await c.req.json();
    const key = type === 'tool' ? 'toolCategories' : type === 'prompt' ? 'promptCategories' : 'workflowCategories';
    await kv.set(key, categories);
    return c.json({ success: true });
  } catch (error) {
    console.log('Error saving categories:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Save subcategories
app.post("/make-server-d8505aef/subcategories", async (c) => {
  try {
    const { subcategories } = await c.req.json();
    await kv.set("subcategories", subcategories);
    return c.json({ success: true });
  } catch (error) {
    console.log('Error saving subcategories:', error);
    return c.json({ error: error.message }, 500);
  }
});

Deno.serve(app.fetch);