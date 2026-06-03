import { useState } from 'react';
import { useN8nWebhook } from '@/hooks/useN8nWebhook';
import { Loader, Send, AlertCircle, CheckCircle } from 'lucide-react';

/**
 * Componente de teste para a integração n8n
 * 
 * Este é um componente simples para testar se o webhook está funcionando
 * Envia mensagens para o workflow n8n e mostra a resposta em tempo real
 */

export default function N8nTestChat() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'bot'; content: string }>>([]);
  const [inputValue, setInputValue] = useState('');

  const buildReadableResponse = (data: any) => {
    if (!data || typeof data !== 'object') {
      return String(data ?? 'Resposta recebida');
    }

    return data.message
      || data.output
      || data.text
      || data.caption
      || data.title
      || data.summary
      || data.fileName
      || data.viewLink
      || data.downloadLink
      || 'Resposta recebida com sucesso';
  };

  const { isLoading, error, sendData, clearError } = useN8nWebhook({
    webhookUrl: 'https://ivannnnnn.app.n8n.cloud/webhook/execute-workflow',
    onSuccess: (data) => {
      console.log('✅ Resposta recebida:', data);
      // Adicionar resposta do bot
      setMessages(prev => [
        ...prev,
        {
          role: 'bot',
          content: buildReadableResponse(data)
        }
      ]);
    },
    onError: (errorMsg) => {
      console.error('❌ Erro:', errorMsg);
    }
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    clearError();

    // Adicionar mensagem do utilizador
    const userMessage = inputValue;
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInputValue('');

    try {
      // Enviar para n8n
      await sendData({
        chatInput: userMessage,
        sessionId: 'test-session-' + Date.now()
      });
    } catch (err) {
      console.error('Erro ao enviar:', err);
      setMessages(prev => [
        ...prev,
        {
          role: 'bot',
          content: '❌ Erro ao processar a mensagem. Tenta novamente.'
        }
      ]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">🤖 Teste do N8N</h1>
        <p className="text-gray-600 text-sm">
          Webhook: <code className="bg-gray-100 px-2 py-1 rounded">
            https://ivannnnnn.app.n8n.cloud/webhook/execute-workflow
          </code>
        </p>
      </div>

      {/* Mensagens */}
      <div className="mb-4 h-96 overflow-y-auto bg-gray-50 rounded-lg p-4 space-y-4 border border-gray-200">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 h-full flex items-center justify-center">
            <p>Enviar uma mensagem para começar...</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${msg.role === 'user'
                ? 'bg-blue-600 text-white rounded-br-none'
                : 'bg-gray-200 text-gray-900 rounded-bl-none'
                }`}
            >
              <p className="text-sm">{msg.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg rounded-bl-none flex gap-2">
              <Loader className="w-4 h-4 animate-spin" />
              <span className="text-sm">Processando...</span>
            </div>
          </div>
        )}
      </div>

      {/* Erros */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-600">Erro:</p>
            <p className="text-xs text-red-500">{error}</p>
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSendMessage} className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Escreve uma mensagem..."
            disabled={isLoading}
            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            {isLoading ? 'Enviando...' : 'Enviar'}
          </button>
        </div>

        {/* Debug Info */}
        <details className="text-xs text-gray-500">
          <summary>Debug Info</summary>
          <div className="mt-2 p-2 bg-gray-100 rounded font-mono text-xs overflow-auto max-h-32">
            <p>Webhook: https://ivannnnnn.app.n8n.cloud/webhook/execute-workflow</p>
            <p>Loading: {isLoading ? 'true' : 'false'}</p>
            <p>Mensagens: {messages.length}</p>
          </div>
        </details>
      </form>

      {/* Botões de teste */}
      <div className="mt-4 pt-4 border-t space-y-2">
        <p className="text-xs font-medium text-gray-600">💡 Mensagens de teste:</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            'Olá!',
            'Como estás?',
            'Faz-me um post',
            'Cria uma imagem'
          ].map((msg) => (
            <button
              key={msg}
              onClick={() => {
                setInputValue(msg);
              }}
              disabled={isLoading}
              className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded disabled:bg-gray-100"
            >
              {msg}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
