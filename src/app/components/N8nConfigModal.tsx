import { useState } from 'react';
import { X, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { N8N_BASE_URL, setN8nBaseUrl } from '@/config/workflows.config';

interface N8nConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function N8nConfigModal({ isOpen, onClose }: N8nConfigModalProps) {
  const [url, setUrl] = useState(N8N_BASE_URL);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    if (!url.trim()) {
      setMessage('URL não pode estar vazia');
      return;
    }

    // Validação básica de URL
    try {
      new URL(url);
    } catch {
      setMessage('URL inválida. Deve começar com http:// ou https://');
      return;
    }

    setN8nBaseUrl(url);
    setMessage('Configuração guardada!');
    setTimeout(() => {
      setMessage('');
      onClose();
    }, 1500);
  };

  const handleTest = async () => {
    setTestStatus('testing');
    setMessage('');

    try {
      const testUrl = `${url}/identidadevisual18?test=1`;
      const response = await fetch(testUrl, { method: 'HEAD' });

      if (response.ok || response.status === 405) {
        // 405 é OK - significa que o GET/HEAD não é permitido, mas o webhook existe
        setTestStatus('success');
        setMessage('✓ Webhook acessível!');
      } else {
        setTestStatus('error');
        setMessage(`✗ Erro ${response.status}. Webhook não respondeu corretamente.`);
      }
    } catch (error) {
      setTestStatus('error');
      setMessage('✗ Não foi possível contactar o servidor N8N. Verifica a URL e a conexão.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1f2e] border border-gray-800/50 rounded-xl p-6 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Configurar N8N</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              URL Base do N8N Webhook
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setTestStatus('idle');
                setMessage('');
              }}
              placeholder="https://seu-n8n.app/webhook"
              className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
            />
            <p className="text-xs text-gray-500 mt-2">
              Ex: https://ivannnnnn.app.n8n.cloud/webhook
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-3">
            <p className="text-xs text-blue-300">
              <strong>ℹ️ Nota:</strong> Os 3 workflows N8N esperam ter webhooks nos seguintes paths:
            </p>
            <ul className="text-xs text-blue-300 mt-2 space-y-1 ml-4">
              <li>• identidadevisual18</li>
              <li>• generate-product-photo1</li>
              <li>• removerfundo</li>
            </ul>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                testStatus === 'success'
                  ? 'bg-green-900/20 border border-green-800/30 text-green-300'
                  : testStatus === 'error'
                    ? 'bg-red-900/20 border border-red-800/30 text-red-300'
                    : 'bg-gray-900/20 border border-gray-800/30 text-gray-300'
              }`}
            >
              {testStatus === 'success' && <CheckCircle className="w-4 h-4 flex-shrink-0" />}
              {testStatus === 'error' && <AlertCircle className="w-4 h-4 flex-shrink-0" />}
              {message}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleTest}
              disabled={testStatus === 'testing' || !url.trim()}
              className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800/50 disabled:text-gray-500 text-gray-300 rounded-lg font-medium transition flex items-center justify-center gap-2"
            >
              {testStatus === 'testing' && (
                <div className="w-4 h-4 border-2 border-gray-500 border-t-blue-500 rounded-full animate-spin" />
              )}
              Testar Conexão
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
