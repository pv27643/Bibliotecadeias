import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// URL do webhook do n8n
const N8N_WEBHOOK_URL = 'http://localhost:5678/webhook-test/f1aed25d-a41d-4a30-841b-dc499936c94f';

// Proxy para o webhook do n8n
app.post('/api/generate-post', async (req, res) => {
  try {
    console.log('📨 Recebido request:', JSON.stringify(req.body, null, 2));
    
    // Enviar para o n8n
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    console.log('📤 Status n8n:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro n8n:', errorText);
      return res.status(response.status).json({
        success: false,
        error: `N8n error: ${response.status} - ${errorText}`
      });
    }

    const data = await response.json();
    console.log('✅ Resposta n8n:', JSON.stringify(data, null, 2));
    
    res.json(data);
  } catch (error) {
    console.error('❌ Erro no servidor:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', n8n_url: N8N_WEBHOOK_URL });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Servidor proxy a correr em http://localhost:${PORT}`);
  console.log(`📡 Reencaminhando para n8n: ${N8N_WEBHOOK_URL}\n`);
});
