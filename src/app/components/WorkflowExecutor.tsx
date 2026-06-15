import { useState, useRef } from 'react';
import type { ReactNode } from 'react';
import { ArrowLeft, Send, Loader, AlertCircle, CheckCircle, Upload, X, ExternalLink, Image as ImageIcon, FileSpreadsheet, HardDrive } from 'lucide-react';
import { getWebhookUrl } from '@/config/workflows.config';

/**
 * WorkflowExecutor — Executa workflows reais via webhook do n8n.
 *
 * Suporta:
 *  - Campos de texto / textarea / select / email
 *  - Upload de imagens direto no formulário
 *  - Exibição de resultado com links para Google Drive / Sheets
 *
 * Como usar no App.tsx (substituir o modal "executingWorkflow"):
 *
 *   {executingWorkflow && !showBrandGenerator && (
 *     <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
 *       <div className="bg-[#1a1f2e] border border-gray-800/50 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
 *         <WorkflowExecutor
 *           workflow={executingWorkflow}
 *           onClose={() => setExecutingWorkflow(null)}
 *         />
 *       </div>
 *     </div>
 *   )}
 *
 * Adicionar ao interface WorkflowType em App.tsx:
 *   webhookUrl?: string;
 *   inputs?: WorkflowInput[];
 *
 * Exemplo de workflow com inputs:
 *   {
 *     id: 'brand-post',
 *     title: 'Brand Post Generator',
 *     webhookUrl: 'https://ivannnnnn.app.n8n.cloud/webhook/brand-post-generator',
 *     inputs: [
 *       { name: 'brandName', label: 'Nome da Marca', type: 'text', required: true },
 *       { name: 'postType', label: 'Tipo de Post', type: 'select', options: ['Quote Post', 'Story Post'], required: true },
 *       { name: 'images', label: 'Imagens de Referência', type: 'image', maxImages: 6 },
 *     ]
 *   }
 */

export interface WorkflowInput {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'email' | 'image';
  required?: boolean;
  options?: string[];
  placeholder?: string;
  maxImages?: number;
}

export interface WorkflowResult {
  success: boolean;
  message?: string;
  googleDriveUrl?: string;
  googleSheetsUrl?: string;
  imageUrl?: string;
  downloadUrl?: string;
  viewLink?: string;
  downloadLink?: string;
  thumbnailLink?: string;
  inputImageUrl?: string;
  data?: Record<string, any>;
}

const LINK_FIELDS: Array<{ key: string; label: string }> = [
  { key: 'googleDriveUrl', label: 'Google Drive' },
  { key: 'googleSheetsUrl', label: 'Google Sheets' },
  { key: 'imageUrl', label: 'Imagem gerada' },
  { key: 'downloadUrl', label: 'Download' },
  { key: 'viewLink', label: 'Ver ficheiro' },
  { key: 'downloadLink', label: 'Transferir ficheiro' },
  { key: 'thumbnailLink', label: 'Miniatura' },
  { key: 'inputImageUrl', label: 'Imagem de entrada' },
];

const HIDDEN_FIELDS = new Set([
  ...LINK_FIELDS.map(field => field.key),
  'success',
]);

const LABELS: Record<string, string> = {
  fileId: 'ID do ficheiro',
  fileName: 'Nome do ficheiro',
  createdAt: 'Criado em',
  imagePrompt: 'Prompt da imagem',
  message: 'Mensagem',
  output: 'Saída',
  text: 'Texto',
  caption: 'Legenda',
  title: 'Título',
  summary: 'Resumo',
};

function formatFieldLabel(key: string) {
  return LABELS[key] || key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function ResponseValue({ value, depth = 0 }: { value: unknown; depth?: number }) {
  if (value === null || value === undefined || value === '') {
    return <span className="text-gray-500">—</span>;
  }

  if (typeof value === 'string') {
    if (/^https?:\/\//i.test(value)) {
      return (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 break-all">
          {value}
        </a>
      );
    }

    return <span className="text-gray-200 whitespace-pre-wrap break-words">{value}</span>;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return <span className="text-gray-200">{String(value)}</span>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-gray-500">Lista vazia</span>;
    }

    return (
      <div className="space-y-2">
        {value.map((item, index) => (
          <div key={index} className="rounded-md border border-white/5 bg-black/20 px-3 py-2">
            <ResponseValue value={item} depth={depth + 1} />
          </div>
        ))}
      </div>
    );
  }

  if (isPlainObject(value)) {
    const entries = Object.entries(value).filter(([, nestedValue]) => nestedValue !== undefined && nestedValue !== null && nestedValue !== '');

    if (entries.length === 0) {
      return <span className="text-gray-500">Objeto vazio</span>;
    }

    return (
      <div className={`space-y-2 ${depth > 0 ? 'pl-3 border-l border-white/10' : ''}`}>
        {entries.map(([nestedKey, nestedValue]) => (
          <div key={nestedKey} className="space-y-1">
            <p className="text-[11px] uppercase tracking-wide text-gray-500">{formatFieldLabel(nestedKey)}</p>
            <ResponseValue value={nestedValue} depth={depth + 1} />
          </div>
        ))}
      </div>
    );
  }

  return <span className="text-gray-200">{String(value)}</span>;
}

function ResponseSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-white/5 bg-black/20 p-3">
      <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-2">{title}</p>
      {children}
    </div>
  );
}

function ResponseDetails({ data }: { data: Record<string, any> }) {
  const entries = Object.entries(data).filter(([key, value]) => !HIDDEN_FIELDS.has(key) && value !== undefined && value !== null && value !== '');

  if (entries.length === 0) {
    return <p className="text-xs text-gray-500">Sem campos adicionais para mostrar.</p>;
  }

  return (
    <div className="space-y-3">
      {entries.map(([key, value]) => (
        <div key={key} className="rounded-lg border border-white/5 bg-black/20 p-3">
          <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">{formatFieldLabel(key)}</p>
          <ResponseValue value={value} />
        </div>
      ))}
    </div>
  );
}

function extractLinks(result: WorkflowResult) {
  return LINK_FIELDS
    .map(({ key, label }) => {
      const href = result[key as keyof WorkflowResult];
      if (typeof href !== 'string' || !href.trim()) {
        return null;
      }

      return {
        key,
        href,
        label,
        color:
          key === 'googleSheetsUrl'
            ? 'text-green-400 border-green-800 bg-green-900/20'
            : key === 'downloadLink' || key === 'downloadUrl'
              ? 'text-orange-400 border-orange-800 bg-orange-900/20'
              : key === 'thumbnailLink'
                ? 'text-pink-400 border-pink-800 bg-pink-900/20'
                : key === 'inputImageUrl' || key === 'imageUrl'
                  ? 'text-purple-400 border-purple-800 bg-purple-900/20'
                  : 'text-blue-400 border-blue-800 bg-blue-900/20',
      };
    })
    .filter(Boolean) as { key: string; href: string; label: string; color: string }[];
}

interface WorkflowExecutorProps {
  workflow: {
    id: string;
    title: string;
    description?: string;
    webhookUrl?: string;
    inputs?: WorkflowInput[];
  };
  onClose: () => void;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function ImageUploadField({
  label, required, maxImages = 6, files, onChange, disabled,
}: {
  label: string; required?: boolean; maxImages?: number;
  files: File[]; onChange: (files: File[]) => void; disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const imgs = Array.from(incoming).filter(f => f.type.startsWith('image/'));
    onChange([...files, ...imgs].slice(0, maxImages));
  };

  return (
    <div>
      <label className="block text-sm text-gray-400 mb-1.5">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${disabled ? 'opacity-50 cursor-not-allowed border-gray-700' : 'border-gray-700 hover:border-blue-600 cursor-pointer'
          }`}
        onClick={() => !disabled && inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" multiple accept="image/*" className="hidden"
          disabled={disabled} onChange={e => handleFiles(e.target.files)} />
        <Upload className="w-6 h-6 mx-auto mb-2 text-gray-500" />
        <p className="text-sm text-gray-500">Clica ou arrasta imagens</p>
        <p className="text-xs text-gray-600 mt-1">PNG, JPG, WebP — máx. {maxImages} imagens</p>
      </div>
      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-3">
          {files.map((f, idx) => (
            <div key={idx} className="relative group rounded-lg overflow-hidden border border-gray-800">
              <img src={URL.createObjectURL(f)} alt={`preview-${idx}`} className="w-full h-24 object-cover" />
              <button type="button" onClick={e => { e.stopPropagation(); onChange(files.filter((_, i) => i !== idx)); }}
                disabled={disabled}
                className="absolute top-1 right-1 bg-red-600 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ResultCard({ result }: { result: WorkflowResult }) {
  const links = extractLinks(result);
  const linkIcons: Record<string, ReactNode> = {
    googleDriveUrl: <HardDrive className="w-4 h-4" />,
    googleSheetsUrl: <FileSpreadsheet className="w-4 h-4" />,
    imageUrl: <ImageIcon className="w-4 h-4" />,
    downloadUrl: <ExternalLink className="w-4 h-4" />,
    viewLink: <ExternalLink className="w-4 h-4" />,
    downloadLink: <ExternalLink className="w-4 h-4" />,
    thumbnailLink: <ImageIcon className="w-4 h-4" />,
    inputImageUrl: <ImageIcon className="w-4 h-4" />,
  };

  return (
    <div className="bg-green-950/40 border border-green-800/50 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
        <p className="text-sm text-green-300 font-medium">{result.message || 'Workflow executado com sucesso!'}</p>
      </div>
      {links.length > 0 && (
        <div className="space-y-2 mt-3">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Resultados</p>
          {links.map((link, i) => (
            <a key={i} href={link.href} target="_blank" rel="noopener noreferrer"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-opacity hover:opacity-80 ${link.color}`}>
              {linkIcons[link.key] ?? <ExternalLink className="w-4 h-4" />}{link.label}<ExternalLink className="w-3 h-3 ml-auto opacity-60" />
            </a>
          ))}
        </div>
      )}
      {result.data && Object.keys(result.data).length > 0 && (
        <details className="mt-3">
          <summary className="text-xs text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-400">
            Conteúdo da resposta
          </summary>
          <div className="mt-3 space-y-3">
            {(result.data.message || result.data.output || result.data.text || result.data.caption || result.data.title || result.data.summary) && (
              <ResponseSection title="Mensagem principal">
                <ResponseValue value={result.data.message || result.data.output || result.data.text || result.data.caption || result.data.title || result.data.summary} />
              </ResponseSection>
            )}

            {links.length > 0 && (
              <ResponseSection title="Links disponíveis">
                <div className="space-y-2">
                  {links.map((link, i) => (
                    <a key={i} href={link.href} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-opacity hover:opacity-80 ${link.color}`}>
                      {linkIcons[link.key] ?? <ExternalLink className="w-4 h-4" />}{link.label}<ExternalLink className="w-3 h-3 ml-auto opacity-60" />
                    </a>
                  ))}
                </div>
              </ResponseSection>
            )}

            <ResponseSection title="Detalhes">
              <ResponseDetails data={result.data} />
            </ResponseSection>
          </div>
        </details>
      )}
    </div>
  );
}

export default function WorkflowExecutor({ workflow, onClose }: WorkflowExecutorProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [imageFiles, setImageFiles] = useState<Record<string, File[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<WorkflowResult | null>(null);

  const inputs: WorkflowInput[] = workflow.inputs ?? [
    { name: 'message', label: 'Mensagem / Dados', type: 'textarea', required: true, placeholder: 'Descreve o que pretendes...' },
  ];

  const handleChange = (name: string, value: string) => {
    setError(null);
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setError(null);

    for (const input of inputs) {
      if (input.required && input.type !== 'image' && !formData[input.name]?.trim()) {
        setError(`"${input.label}" é obrigatório.`); return;
      }
      if (input.required && input.type === 'image' && !imageFiles[input.name]?.length) {
        setError(`"${input.label}" — carrega pelo menos uma imagem.`); return;
      }
    }

    const webhookUrl = getWebhookUrl(workflow as any);
    if (!webhookUrl) {
      setError('Este workflow não tem um webhook configurado.\nEdita o workflow e adiciona o Webhook URL no campo correspondente.');
      return;
    }

    setIsLoading(true);

    try {
      let response: Response;
      const hasImages = Object.values(imageFiles).some(arr => arr.length > 0);

      if (hasImages) {
        const body = new FormData();
        body.append('workflowId', workflow.id);
        Object.entries(formData).forEach(([k, v]) => body.append(k, v));

        const imagesPayload: Record<string, string[]> = {};
        for (const [fieldName, files] of Object.entries(imageFiles)) {
          if (files.length > 0) {
            const b64s = await Promise.all(files.map(fileToBase64));
            imagesPayload[fieldName] = b64s;
            files.forEach((file, idx) => body.append(`${fieldName}_${idx}`, file, file.name));
          }
        }
        body.append('imagesBase64', JSON.stringify(imagesPayload));
        response = await fetch(webhookUrl, { method: 'POST', body });
      } else {
        response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workflowId: workflow.id, ...formData }),
        });
      }

      let data: any;
      const contentType = response.headers.get('content-type') ?? '';
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        try { data = JSON.parse(text); } catch { data = { message: text }; }
      }

      if (!response.ok) {
        throw new Error(data?.message || data?.error || `Erro HTTP ${response.status}`);
      }

      setResult({
        success: true,
        message: data?.message || data?.output || 'Workflow executado com sucesso!',
        googleDriveUrl: data?.googleDriveUrl || data?.driveUrl || data?.drive_url,
        googleSheetsUrl: data?.googleSheetsUrl || data?.sheetsUrl || data?.sheets_url,
        imageUrl: data?.imageUrl || data?.image_url || data?.outputImage,
        downloadUrl: data?.downloadUrl || data?.download_url,
        viewLink: data?.viewLink,
        downloadLink: data?.downloadLink,
        thumbnailLink: data?.thumbnailLink,
        inputImageUrl: data?.inputImageUrl,
        data,
      });
    } catch (err: any) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError(
          'Não foi possível contactar o n8n. Verifica:\n' +
          '• O workflow no n8n está ativo (botão "Active" ligado)\n' +
          '• O nó Webhook tem "Respond: Immediately" ou "Using Respond Node"\n' +
          '• Adiciona o header CORS no nó Webhook: Access-Control-Allow-Origin: *'
        );
      } else {
        setError(err.message || 'Erro desconhecido');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-semibold text-white">{workflow.title}</h2>
            {workflow.description && <p className="text-sm text-gray-400 mt-0.5">{workflow.description}</p>}
          </div>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Aviso: webhook não configurado */}
      {!workflow.webhookUrl && (
        <div className="mb-4 p-3 bg-yellow-950/40 border border-yellow-800/50 rounded-lg flex gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-300">
            <strong>Webhook não configurado.</strong> Edita este workflow e adiciona o URL do webhook n8n.
            <br />
            <span className="text-yellow-500 text-xs">
              Ex: https://ivannnnnn.app.n8n.cloud/webhook/nome-do-webhook
            </span>
          </div>
        </div>
      )}

      {/* Resultado */}
      {result && (
        <div className="mb-4">
          <ResultCard result={result} />
          <button onClick={() => { setResult(null); setFormData({}); setImageFiles({}); }}
            className="mt-3 text-sm text-gray-400 hover:text-white transition-colors">
            ↩ Executar novamente
          </button>
        </div>
      )}

      {/* Erro */}
      {error && (
        <div className="mb-4 p-3 bg-red-950/40 border border-red-800/50 rounded-lg flex gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <pre className="text-sm text-red-300 whitespace-pre-wrap font-sans">{error}</pre>
        </div>
      )}

      {/* Formulário */}
      {!result && (
        <div className="space-y-4">
          {inputs.map(input => (
            <div key={input.name}>
              {input.type === 'image' ? (
                <ImageUploadField
                  label={input.label} required={input.required}
                  maxImages={input.maxImages ?? 6}
                  files={imageFiles[input.name] ?? []}
                  onChange={files => setImageFiles(prev => ({ ...prev, [input.name]: files }))}
                  disabled={isLoading}
                />
              ) : (
                <>
                  <label className="block text-sm text-gray-400 mb-1.5">
                    {input.label}{input.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {input.type === 'textarea' && (
                    <textarea rows={4} value={formData[input.name] ?? ''} onChange={e => handleChange(input.name, e.target.value)}
                      placeholder={input.placeholder} disabled={isLoading}
                      className="w-full bg-[#0f1420] border border-gray-800/50 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-blue-600 resize-none disabled:opacity-50" />
                  )}
                  {input.type === 'select' && (
                    <select value={formData[input.name] ?? ''} onChange={e => handleChange(input.name, e.target.value)}
                      disabled={isLoading}
                      className="w-full bg-[#0f1420] border border-gray-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-600 disabled:opacity-50">
                      <option value="">-- Seleciona --</option>
                      {(input.options ?? []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  )}
                  {(input.type === 'text' || input.type === 'email') && (
                    <input type={input.type} value={formData[input.name] ?? ''} onChange={e => handleChange(input.name, e.target.value)}
                      placeholder={input.placeholder} disabled={isLoading}
                      className="w-full bg-[#0f1420] border border-gray-800/50 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-blue-600 disabled:opacity-50" />
                  )}
                </>
              )}
            </div>
          ))}

          <div className="pt-2">
            <button onClick={handleSubmit} disabled={isLoading || !workflow.webhookUrl}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-400 transition-colors font-medium">
              {isLoading ? <><Loader className="w-4 h-4 animate-spin" />A executar...</> : <><Send className="w-4 h-4" />Executar Workflow</>}
            </button>
            {inputs.some(i => i.type === 'image') && !isLoading && (
              <p className="text-xs text-gray-600 text-center mt-2">
                As imagens são enviadas diretamente para o n8n via webhook
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
