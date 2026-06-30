import { useState, useRef, useEffect } from 'react';
import { Send, Loader, AlertCircle, ArrowLeft, Clock } from 'lucide-react';
import { getWebhookUrl } from '@/config/workflows.config';
import type { WorkflowConfig, WorkflowInput } from '@/config/workflows.config';
import type { BrandStyleProfile } from '@/types/brand';
import { supabase } from '@/utils/supabase/client';
import ResultPanel from './ResultPanel';
import type { WorkflowOutput } from './ResultPanel';
import { ImageUploadField } from './ImageUpload';

interface WorkflowRunnerProps {
  workflow: WorkflowConfig;
  activeBrand: BrandStyleProfile | null;
  onBack: () => void;
}


function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function saveGeneration(brandId: string, workflowId: string, workflowName: string, inputs: Record<string, any>, outputs: Record<string, any>) {
  await supabase.from('generations').insert({
    brand_id: brandId,
    workflow_id: workflowId,
    workflow_name: workflowName,
    inputs,
    outputs,
  });
}

export default function WorkflowRunner({ workflow, activeBrand, onBack }: WorkflowRunnerProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [imageFiles, setImageFiles] = useState<Record<string, File[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<WorkflowOutput | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef<number>(0);

  const inputs: WorkflowInput[] = workflow.inputs ?? [
    { name: 'message', label: 'Mensagem', type: 'textarea', required: true },
  ];

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const handleChange = (name: string, value: string) => {
    setError(null);
    setFormData(p => ({ ...p, [name]: value }));
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

    if (workflow.requiresBrand && !activeBrand) {
      setError('Este workflow requer uma marca ativa. Seleciona ou cria uma marca primeiro.'); return;
    }

    setElapsed(0);
    setDuration(null);
    startRef.current = Date.now();
    timerRef.current = setInterval(() => setElapsed(Math.floor((Date.now() - startRef.current) / 1000)), 1000);
    setLoading(true);
    try {
      const webhookUrl = getWebhookUrl(workflow);
      let response: Response;
      const hasImages = Object.values(imageFiles).some(a => a.length > 0);

      const brandPayload = activeBrand ? { brand_id: activeBrand.id } : {};

      if (hasImages) {
        const body = new FormData();
        Object.entries({ ...formData, ...brandPayload }).forEach(([k, v]) =>
          body.append(k, typeof v === 'string' ? v : JSON.stringify(v))
        );
        for (const [field, files] of Object.entries(imageFiles)) {
          files.forEach((file, i) => body.append(i === 0 ? field : `${field}_${i}`, file, file.name));
          const b64s = await Promise.all(files.map(fileToBase64));
          body.append(`${field}_base64`, JSON.stringify(b64s));
        }
        response = await fetch(webhookUrl, { method: 'POST', body });
      } else {
        response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, ...brandPayload }),
        });
      }

      let data: any;
      const ct = response.headers.get('content-type') ?? '';
      if (ct.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        try { data = JSON.parse(text); } catch { data = { message: text }; }
      }

      if (Array.isArray(data)) data = data[0] ?? {};

      if (!response.ok) throw new Error(data?.message || data?.error || `Erro HTTP ${response.status}`);

      setResult(data);

      if (activeBrand?.id) {
        await saveGeneration(activeBrand.id, workflow.id, workflow.name ?? '', formData, data);
      }
    } catch (err: any) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Não foi possível contactar o n8n.\n• O workflow está ativo no n8n?\n• O nó Webhook tem CORS configurado (Access-Control-Allow-Origin: *)?');
      } else {
        setError(err.message || 'Erro desconhecido');
      }
    } finally {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      setDuration(Math.floor((Date.now() - startRef.current) / 1000));
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h3 className="text-lg font-semibold text-white">{workflow.name}</h3>
          <p className="text-sm text-gray-400">{workflow.description}</p>
        </div>
      </div>

      {/* Brand required warning */}
      {workflow.requiresBrand && !activeBrand && (
        <div className="flex items-start gap-2 p-3 bg-amber-950/30 border border-amber-800/40 rounded-lg">
          <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-300">Seleciona uma marca no topo antes de executar este workflow.</p>
        </div>
      )}

      {/* Active brand badge */}
      {activeBrand && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-violet-950/30 border border-violet-800/30 rounded-lg w-fit">
          <span className="w-2 h-2 rounded-full bg-violet-400" />
          <span className="text-xs text-violet-300">{activeBrand.brand_name}</span>
        </div>
      )}

      {/* Result */}
      {result && (
        <ResultPanel
          output={result}
          workflowId={workflow.id}
          duration={duration ?? undefined}
          onRunAgain={() => { setResult(null); setFormData({}); setImageFiles({}); setDuration(null); }}
        />
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-950/30 border border-red-800/40 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <pre className="text-sm text-red-300 whitespace-pre-wrap font-sans">{error}</pre>
        </div>
      )}

      {/* Form */}
      {!result && (
        <div className="space-y-4">
          {inputs.map(input => (
            <div key={input.name}>
              {input.type === 'image' ? (
                <ImageUploadField
                  label={input.label} required={input.required} maxImages={input.maxImages}
                  files={imageFiles[input.name] ?? []}
                  onChange={f => setImageFiles(p => ({ ...p, [input.name]: f }))}
                  disabled={loading}
                />
              ) : (
                <>
                  <label className="block text-sm text-gray-400 mb-1.5">
                    {input.label}{input.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {input.type === 'textarea' && (
                    <textarea rows={4} value={formData[input.name] ?? ''} onChange={e => handleChange(input.name, e.target.value)}
                      placeholder={input.placeholder} disabled={loading}
                      className="w-full bg-[#0f1420] border border-gray-800/50 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-600 resize-none disabled:opacity-50 text-sm" />
                  )}
                  {input.type === 'select' && (
                    <select value={formData[input.name] ?? ''} onChange={e => handleChange(input.name, e.target.value)}
                      disabled={loading}
                      className="w-full bg-[#0f1420] border border-gray-800/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-600 disabled:opacity-50 text-sm">
                      <option value="">{input.placeholder || '-- Seleciona --'}</option>
                      {input.options?.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  )}
                  {(input.type === 'text' || input.type === 'email') && (
                    <input type={input.type} value={formData[input.name] ?? ''} onChange={e => handleChange(input.name, e.target.value)}
                      placeholder={input.placeholder} disabled={loading}
                      className="w-full bg-[#0f1420] border border-gray-800/50 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-blue-600 disabled:opacity-50 text-sm" />
                  )}
                </>
              )}
            </div>
          ))}

          <button
            onClick={handleSubmit}
            disabled={loading || (workflow.requiresBrand && !activeBrand)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-400 transition-colors font-medium text-sm"
          >
            {loading
              ? <><Loader className="w-4 h-4 animate-spin" />A executar... <span className="text-gray-400 font-mono">{elapsed}s</span></>
              : <><Send className="w-4 h-4" />Executar Workflow</>}
          </button>
        </div>
      )}
    </div>
  );
}
