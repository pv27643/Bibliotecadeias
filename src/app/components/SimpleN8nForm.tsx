import { useState } from 'react';
import { useN8nWebhook } from '@/hooks/useN8nWebhook';
import { Loader, AlertCircle, CheckCircle } from 'lucide-react';

interface SimpleN8nFormProps {
  webhookUrl?: string;
  title?: string;
  fields?: {
    name: string;
    type: 'text' | 'textarea' | 'select';
    label: string;
    required?: boolean;
    options?: string[];
  }[];
}

export default function SimpleN8nForm({
  webhookUrl = 'https://ivannnnnn.app.n8n.cloud/webhook/execute-workflow',
  title = 'Enviar para N8N',
  fields = [
    { name: 'message', type: 'textarea', label: 'Mensagem', required: true }
  ]
}: SimpleN8nFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { isLoading, error, sendData, clearError } = useN8nWebhook({
    webhookUrl,
    onSuccess: (data) => {
      console.log('✅ Sucesso:', data);
      setSuccessMessage(data.message || 'Enviado com sucesso!');
      setFormData({});
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    onError: (errorMsg) => {
      console.error('❌ Erro:', errorMsg);
    }
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      // Validar campos obrigatórios
      for (const field of fields) {
        if (field.required && !formData[field.name]?.trim()) {
          throw new Error(`${field.label} é obrigatório`);
        }
      }

      await sendData(formData);
    } catch (err) {
      console.error('Erro na submissão:', err);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">{title}</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex gap-2">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-sm text-green-600">{successMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map(field => (
          <div key={field.name}>
            <label className="block text-sm font-medium mb-2">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>

            {field.type === 'textarea' && (
              <textarea
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                rows={4}
                disabled={isLoading}
              />
            )}

            {field.type === 'text' && (
              <input
                type="text"
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                disabled={isLoading}
              />
            )}

            {field.type === 'select' && (
              <select
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                disabled={isLoading}
              >
                <option value="">-- Seleciona --</option>
                {field.options?.map(opt => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
        >
          {isLoading && <Loader className="w-4 h-4 animate-spin" />}
          {isLoading ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
    </div>
  );
}
