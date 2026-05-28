import { useState } from 'react';
import { useN8nWebhook } from '@/hooks/useN8nWebhook';
import { WorkflowConfig } from '@/config/workflows.config';
import { ArrowLeft, Send, Loader, AlertCircle, CheckCircle } from 'lucide-react';

interface WorkflowExecutorProps {
  workflow: WorkflowConfig;
  onBack: () => void;
}

export default function WorkflowExecutor({ workflow, onBack }: WorkflowExecutorProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [result, setResult] = useState<any>(null);

  const { isLoading, error, sendData, clearError } = useN8nWebhook({
    webhookUrl: workflow.webhookUrl,
    onSuccess: (data) => {
      console.log('✅ Workflow executado:', data);
      setResult(data);
    }
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    clearError();
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles(files);
    setFormData(prev => ({ ...prev, files }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      // Validar campos obrigatórios
      for (const input of workflow.inputs) {
        if (input.required && !formData[input.name]?.toString().trim()) {
          throw new Error(`${input.label} é obrigatório`);
        }
      }

      // Montar payload
      const payload: any = {
        workflowId: workflow.id,
        ...formData
      };

      // Se tem arquivos, usar FormData
      if (uploadedFiles.length > 0) {
        const body = new FormData();
        body.append('workflowId', workflow.id);
        uploadedFiles.forEach((file, idx) => {
          body.append(`file_${idx}`, file);
        });
        Object.entries(formData).forEach(([key, value]) => {
          if (key !== 'files' && value !== undefined) {
            body.append(key, String(value));
          }
        });
        await sendData(body);
      } else {
        await sendData(payload);
      }
    } catch (err) {
      console.error('Erro:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header com botão voltar */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar aos workflows
        </button>

        {/* Título do workflow */}
        <div className="mb-8">
          <div className="text-5xl mb-3">{workflow.icon}</div>
          <h1 className="text-3xl font-bold mb-2">{workflow.name}</h1>
          <p className="text-gray-400">{workflow.description}</p>
        </div>

        {/* Resultado */}
        {result && (
          <div className="mb-6 p-4 bg-green-900 border border-green-600 rounded-lg">
            <div className="flex gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-green-300 mb-1">✅ Sucesso!</h3>
                <p className="text-green-200 text-sm">{result.message}</p>
              </div>
            </div>
            {result.data && (
              <details className="mt-3 text-xs text-green-200">
                <summary className="cursor-pointer font-mono">Ver dados completos</summary>
                <pre className="mt-2 bg-black bg-opacity-30 p-2 rounded overflow-auto max-h-48">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}

        {/* Erros */}
        {error && (
          <div className="mb-6 p-4 bg-red-900 border border-red-600 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-red-300 mb-1">Erro</h3>
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-6 rounded-lg">
          {workflow.inputs.map(input => (
            <div key={input.name}>
              <label className="block text-sm font-medium mb-2">
                {input.label}
                {input.required && <span className="text-red-400">*</span>}
              </label>

              {input.type === 'text' && (
                <input
                  type="text"
                  name={input.name}
                  value={formData[input.name] || ''}
                  onChange={handleInputChange}
                  placeholder={input.placeholder}
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg
                    focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                    outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
              )}

              {input.type === 'textarea' && (
                <textarea
                  name={input.name}
                  value={formData[input.name] || ''}
                  onChange={handleInputChange}
                  placeholder={input.placeholder}
                  disabled={isLoading}
                  rows={4}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg
                    focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                    outline-none disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                />
              )}

              {input.type === 'select' && (
                <select
                  name={input.name}
                  value={formData[input.name] || ''}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg
                    focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                    outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">-- Seleciona --</option>
                  {input.options?.map(opt => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              )}

              {input.type === 'file' && (
                <div>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    disabled={isLoading}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg
                      focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                      outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  {uploadedFiles.length > 0 && (
                    <div className="mt-2 text-sm text-blue-300">
                      {uploadedFiles.length} arquivo(s) selecionado(s)
                    </div>
                  )}
                </div>
              )}

              {input.type === 'email' && (
                <input
                  type="email"
                  name={input.name}
                  value={formData[input.name] || ''}
                  onChange={handleInputChange}
                  placeholder={input.placeholder}
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg
                    focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                    outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
              )}
            </div>
          ))}

          {/* Botão Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600
              text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Executando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Executar Workflow
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
