import { useState } from 'react';
import { Copy, Download, Check, ExternalLink, Image as ImageIcon, ChevronDown, ChevronUp, Clock } from 'lucide-react';

const isSafeUrl = (url: string): boolean => /^https?:\/\//i.test(url);

export interface WorkflowOutput {
  // Text workflows (W2, W4, W5, W6)
  caption?: string;
  hashtags?: string[];
  cta?: string;
  visual_concept?: string;
  variations?: Record<string, { caption?: string; hashtags?: string[] }>;
  slides?: Array<{ title: string; body: string; image_url?: string; visual_concept?: string }>;
  posts?: Array<{ platform: string; caption: string; hashtags: string[]; cta?: string; visual_concept?: string }>;
  calendar?: Array<{ day: string; theme: string; caption: string; visual_concept?: string }>;
  // Visual workflows (W3, existing)
  image_url?: string;
  alt_text?: string;
  viewLink?: string;
  downloadLink?: string;
  // BSP (W1)
  brand?: Record<string, any>;
  // Generic
  message?: string;
  [key: string]: any;
}

interface ResultPanelProps {
  output: WorkflowOutput;
  workflowId: string;
  duration?: number;
  onRunAgain: () => void;
}

function CopyButton({ text, label = 'Copiar' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs transition-colors"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copiado!' : label}
    </button>
  );
}

function TextBlock({ label, text, mono = false }: { label: string; text: string; mono?: boolean }) {
  return (
    <div className="rounded-lg border border-white/5 bg-black/20 p-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] uppercase tracking-wide text-gray-500">{label}</p>
        <CopyButton text={text} />
      </div>
      <p className={`text-sm text-gray-200 whitespace-pre-wrap leading-relaxed ${mono ? 'font-mono text-xs' : ''}`}>{text}</p>
    </div>
  );
}

function ImageResult({ url, alt, downloadUrl, viewLink }: { url: string; alt?: string; downloadUrl?: string; viewLink?: string }) {
  const isBase64 = url.startsWith('data:');
  const isThumbnail = url.includes('drive.google.com/thumbnail');
  const isDrive = url.includes('drive.google.com') || viewLink?.includes('drive.google.com');
  const [imgError, setImgError] = useState(false);

  return (
    <div className="rounded-lg border border-white/5 bg-black/20 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
        <p className="text-[11px] uppercase tracking-wide text-gray-500 flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5" /> Imagem gerada
          {isDrive && <span className="text-[10px] text-blue-400/70 ml-1">· Google Drive</span>}
        </p>
        <div className="flex gap-2">
          {downloadUrl && (
            <a href={downloadUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs transition-colors">
              <Download className="w-3.5 h-3.5" /> Transferir
            </a>
          )}
          {viewLink && (
            <a href={viewLink} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 text-xs transition-colors">
              <ExternalLink className="w-3.5 h-3.5" /> Abrir no Drive
            </a>
          )}
          {!viewLink && !isBase64 && (
            <a href={url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs transition-colors">
              <ExternalLink className="w-3.5 h-3.5" /> Abrir
            </a>
          )}
        </div>
      </div>
      {imgError ? (
        <div className="p-6 text-center text-gray-500 text-sm">
          <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="mb-2">Não foi possível pré-visualizar a imagem.</p>
          {viewLink && (
            <a href={viewLink} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 text-xs transition-colors">
              <ExternalLink className="w-3 h-3" /> Ver no Google Drive
            </a>
          )}
        </div>
      ) : (isBase64 || isSafeUrl(url)) ? (
        <img
          src={url}
          alt={alt || 'Imagem gerada'}
          className="w-full max-h-96 object-contain bg-black/40"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="p-6 text-center text-gray-500 text-sm">
          <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p>URL de imagem inválida.</p>
        </div>
      )}
    </div>
  );
}

function PlatformVariations({ variations }: { variations: Record<string, { caption?: string; hashtags?: string[] }> }) {
  const [activeTab, setActiveTab] = useState(Object.keys(variations)[0]);
  const tabs = Object.keys(variations);

  return (
    <div className="rounded-lg border border-white/5 bg-black/20 overflow-hidden">
      <div className="flex border-b border-white/5">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-medium transition-colors ${activeTab === tab ? 'text-white border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-300'}`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="p-3 space-y-3">
        {variations[activeTab]?.caption && (
          <TextBlock label="Legenda" text={variations[activeTab].caption!} />
        )}
        {variations[activeTab]?.hashtags?.length ? (
          <TextBlock label="Hashtags" text={variations[activeTab].hashtags!.join(' ')} />
        ) : null}
      </div>
    </div>
  );
}

function CalendarView({ calendar }: { calendar: NonNullable<WorkflowOutput['calendar']> }) {
  return (
    <div className="space-y-2">
      {calendar.map((item, i) => (
        <div key={i} className="rounded-lg border border-white/5 bg-black/20 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-blue-400">{item.day}</span>
            <div className="flex items-center gap-2">
              {(item as any).format && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-gray-400">{(item as any).format}</span>
              )}
              <span className="text-xs text-gray-500">{item.theme}</span>
            </div>
          </div>
          <p className="text-sm text-gray-200 whitespace-pre-wrap mb-2">{item.caption}</p>
          {(item as any).hashtags?.length > 0 && (
            <p className="text-xs text-gray-500 mb-1">{(item as any).hashtags.join(' ')}</p>
          )}
          {(item as any).cta && (
            <p className="text-xs text-violet-400 mb-1">CTA: {(item as any).cta}</p>
          )}
          {item.visual_concept && (
            <p className="text-xs text-gray-500 italic">Visual: {item.visual_concept}</p>
          )}
          <div className="mt-2">
            <CopyButton text={[item.caption, (item as any).hashtags?.join(' '), (item as any).cta].filter(Boolean).join('\n\n')} label="Copiar legenda" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SlideList({ slides }: { slides: NonNullable<WorkflowOutput['slides']> }) {
  return (
    <div className="space-y-2">
      {slides.map((slide, i) => (
        <div key={i} className="rounded-lg border border-white/5 bg-black/20 p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500 uppercase tracking-wide">Slide {i + 1}</span>
            <CopyButton text={`${slide.title}\n\n${slide.body}`} />
          </div>
          <p className="text-sm font-semibold text-white mb-1">{slide.title}</p>
          <p className="text-sm text-gray-300">{slide.body}</p>
          {slide.image_url && (isSafeUrl(slide.image_url) || slide.image_url.startsWith('data:')) && (
            <img src={slide.image_url} alt={slide.title} className="mt-2 w-full rounded-lg object-cover" />
          )}
          {!slide.image_url && slide.visual_concept && (
            <p className="text-xs text-gray-500 italic mt-1">Visual: {slide.visual_concept}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function BrandResult({ brand }: { brand: Record<string, any> }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="rounded-lg border border-violet-800/40 bg-violet-950/20 p-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-violet-300">Marca extraída: {brand.brand_name}</p>
        <button onClick={() => setExpanded(e => !e)} className="text-gray-500 hover:text-gray-300">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>
      {brand.palette && (
        <div className="flex gap-1.5 mb-2">
          {Object.values(brand.palette).filter(v => typeof v === 'string' && v.startsWith('#')).map((color, i) => (
            <div key={i} className="w-6 h-6 rounded-full border border-white/10" style={{ background: color as string }} title={color as string} />
          ))}
        </div>
      )}
      {expanded && (
        <pre className="text-xs text-gray-400 overflow-x-auto mt-2 p-2 bg-black/30 rounded">
          {JSON.stringify(brand, null, 2)}
        </pre>
      )}
      <div className="mt-2">
        <CopyButton text={JSON.stringify(brand, null, 2)} label="Copiar JSON" />
      </div>
    </div>
  );
}

function formatDuration(s: number) {
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

export default function ResultPanel({ output, workflowId, duration, onRunAgain }: ResultPanelProps) {
  const imageUrl = output.image_url || output.viewLink || output.thumbnailLink;
  const allText = [output.caption, output.hashtags?.join(' '), output.cta].filter(Boolean).join('\n\n');

  return (
    <div className="space-y-3">
      {/* Duration badge */}
      {duration !== undefined && (
        <div className="flex items-center gap-1.5 text-[11px] text-green-400/80">
          <Clock className="w-3 h-3" />
          Concluído em {formatDuration(duration)}
        </div>
      )}

      {/* Image */}
      {imageUrl && (
        <ImageResult
          url={imageUrl}
          alt={output.alt_text}
          downloadUrl={output.downloadLink || output.downloadUrl}
          viewLink={output.viewLink}
        />
      )}

      {/* Brand extraction result */}
      {output.brand && <BrandResult brand={output.brand} />}

      {/* Caption + hashtags + CTA */}
      {output.caption && (
        <>
          <TextBlock label="Legenda" text={output.caption} />
          {output.hashtags?.length && (
            <TextBlock label="Hashtags" text={output.hashtags.join(' ')} />
          )}
          {output.cta && <TextBlock label="CTA" text={output.cta} />}
          {output.visual_concept && (
            <TextBlock label="Conceito Visual" text={output.visual_concept} />
          )}
          {allText && (
            <div className="flex justify-end">
              <CopyButton text={allText} label="Copiar tudo" />
            </div>
          )}
        </>
      )}

      {/* Platform variations */}
      {output.variations && Object.keys(output.variations).length > 0 && (
        <div>
          <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-2">Variações por plataforma</p>
          <PlatformVariations variations={output.variations} />
        </div>
      )}

      {/* Carousel slides */}
      {output.slides?.length && (
        <div>
          <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-2">Slides do carrossel</p>
          <SlideList slides={output.slides} />
        </div>
      )}

      {/* Repurpose posts */}
      {output.posts?.length && (
        <div>
          <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-2">Posts adaptados</p>
          <div className="space-y-2">
            {output.posts.map((post, i) => (
              <div key={i} className="rounded-lg border border-white/5 bg-black/20 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-blue-400">{post.platform}</span>
                  <CopyButton text={[post.caption, post.hashtags?.join(' '), post.cta].filter(Boolean).join('\n\n')} />
                </div>
                <p className="text-sm text-gray-200 whitespace-pre-wrap">{post.caption}</p>
                {post.hashtags?.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">{post.hashtags.join(' ')}</p>
                )}
                {post.cta && (
                  <p className="text-xs text-violet-400 mt-1">CTA: {post.cta}</p>
                )}
                {post.visual_concept && (
                  <p className="text-xs text-gray-500 italic mt-1">Visual: {post.visual_concept}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly calendar */}
      {output.calendar?.length && (
        <div>
          <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-2">Calendário semanal</p>
          <CalendarView calendar={output.calendar} />
        </div>
      )}

      {/* Generic message fallback */}
      {!output.caption && !output.image_url && !output.brand && !output.slides && !output.posts && !output.calendar && output.message && (
        <TextBlock label="Resultado" text={output.message} />
      )}

      {/* Catch-all: render any unrecognised string fields */}
      {(() => {
        const KNOWN = new Set(['caption', 'hashtags', 'cta', 'visual_concept', 'image_url', 'viewLink', 'thumbnailLink', 'alt_text', 'downloadLink', 'downloadUrl', 'brand', 'slides', 'posts', 'calendar', 'variations', 'message', 'prompt_used']);
        const extras = Object.entries(output).filter(([k, v]) => !KNOWN.has(k) && typeof v === 'string' && (v as string).trim().length > 0);
        if (!extras.length) return null;
        return (
          <div className="space-y-3">
            {extras.map(([k, v]) => (
              <TextBlock key={k} label={k} text={v as string} />
            ))}
          </div>
        );
      })()}

      <button
        onClick={onRunAgain}
        className="w-full py-2 text-sm text-gray-500 hover:text-white border border-white/5 hover:border-white/10 rounded-lg transition-colors"
      >
        ↩ Executar novamente
      </button>
    </div>
  );
}
