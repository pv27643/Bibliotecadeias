import { useState, useRef, useEffect, DragEvent, ChangeEvent } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

export function ImageUploadField({ label, required, maxImages = 6, files, onChange, disabled }: {
  label: string; required?: boolean; maxImages?: number;
  files: File[]; onChange: (f: File[]) => void; disabled?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const objectUrls = useRef<string[]>([]);

  useEffect(() => {
    return () => { objectUrls.current.forEach(u => URL.revokeObjectURL(u)); };
  }, []);

  const makeUrl = (f: File) => {
    const url = URL.createObjectURL(f);
    objectUrls.current.push(url);
    return url;
  };

  return (
    <div>
      <label className="block text-sm text-gray-400 mb-1.5">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div
        onClick={() => !disabled && ref.current?.click()}
        className={`border-2 border-dashed rounded-lg p-5 text-center transition-colors ${disabled ? 'opacity-50 cursor-not-allowed border-gray-700' : 'border-gray-700 hover:border-blue-600 cursor-pointer'}`}
      >
        <input ref={ref} type="file" multiple accept="image/*" className="hidden" disabled={disabled}
          onChange={e => {
            const inc = Array.from(e.target.files ?? []).filter(f => f.type.startsWith('image/'));
            onChange([...files, ...inc].slice(0, maxImages));
          }} />
        <Upload className="w-5 h-5 mx-auto mb-1.5 text-gray-500" />
        <p className="text-sm text-gray-500">Clica ou arrasta imagens</p>
        <p className="text-xs text-gray-600 mt-0.5">PNG, JPG, WebP — máx. {maxImages}</p>
      </div>
      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-2">
          {files.map((f, i) => (
            <div key={i} className="relative group rounded overflow-hidden border border-gray-800">
              <img src={makeUrl(f)} className="w-full h-20 object-cover" alt="" />
              <button type="button" onClick={() => onChange(files.filter((_, j) => j !== i))} disabled={disabled}
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

interface ImageUploadProps {
  onImageUpload: (imageUrl: string) => void;
  currentImage?: string;
  maxSizeMB?: number;
}

export default function ImageUpload({
  onImageUpload,
  currentImage,
  maxSizeMB = 50
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setError(null);

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione apenas arquivos de imagem');
      return;
    }

    // Validar tamanho
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`A imagem deve ter no máximo ${maxSizeMB}MB`);
      return;
    }

    // Criar preview e converter para base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
      onImageUpload(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onImageUpload('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      {!preview ? (
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-all duration-200
            ${isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100'
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />

          <div className="flex flex-col items-center gap-3">
            <div className={`
              p-3 rounded-full transition-colors
              ${isDragging ? 'bg-blue-100' : 'bg-gray-200'}
            `}>
              <Upload className={`w-8 h-8 ${isDragging ? 'text-blue-500' : 'text-gray-500'}`} />
            </div>

            <div>
              <p className="font-medium text-gray-700">
                {isDragging ? 'Solte a imagem aqui' : 'Clique ou arraste uma imagem'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                PNG, JPG, GIF até {maxSizeMB}MB
              </p>
            </div>
          </div>

          {error && (
            <div className="mt-3 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>
      ) : (
        <div className="relative rounded-lg overflow-hidden border border-gray-300">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-64 object-cover"
          />

          <button
            onClick={handleRemove}
            className="
              absolute top-2 right-2 p-2 rounded-full
              bg-red-500 hover:bg-red-600 text-white
              transition-colors shadow-lg
            "
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <div className="flex items-center gap-2 text-white text-sm">
              <ImageIcon className="w-4 h-4" />
              <span>Imagem carregada com sucesso</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
