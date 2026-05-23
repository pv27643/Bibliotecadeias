import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, X, Image as ImageIcon, Plus } from 'lucide-react';

interface MultiImageUploadProps {
  onImagesUpload: (imageUrls: string[]) => void;
  currentImages?: string[];
  maxImages?: number;
  maxSizeMB?: number;
}

export default function MultiImageUpload({
  onImagesUpload,
  currentImages = [],
  maxImages = 10,
  maxSizeMB = 10
}: MultiImageUploadProps) {
  const [previews, setPreviews] = useState<string[]>(currentImages);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList) => {
    setError(null);

    const fileArray = Array.from(files);
    const remainingSlots = maxImages - previews.length;

    if (fileArray.length > remainingSlots) {
      setError(`Você pode adicionar no máximo ${remainingSlots} imagem(ns) a mais`);
      return;
    }

    const validFiles: File[] = [];
    const maxSize = maxSizeMB * 1024 * 1024;

    for (const file of fileArray) {
      if (!file.type.startsWith('image/')) {
        setError(`${file.name} não é uma imagem válida`);
        continue;
      }

      if (file.size > maxSize) {
        setError(`${file.name} excede o tamanho máximo de ${maxSizeMB}MB`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    const promises = validFiles.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then(results => {
      const newPreviews = [...previews, ...results];
      setPreviews(newPreviews);
      onImagesUpload(newPreviews);
    });
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
      handleFiles(files);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  const handleRemove = (index: number) => {
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
    onImagesUpload(newPreviews);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const canAddMore = previews.length < maxImages;

  return (
    <div className="w-full space-y-4">
      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative group rounded-lg overflow-hidden border border-gray-300 aspect-square">
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
              />

              <button
                onClick={() => handleRemove(index)}
                className="
                  absolute top-2 right-2 p-1.5 rounded-full
                  bg-red-500 hover:bg-red-600 text-white
                  opacity-0 group-hover:opacity-100
                  transition-all shadow-lg
                "
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-2 text-white text-xs">
                  <ImageIcon className="w-3 h-3" />
                  <span>Imagem {index + 1}</span>
                </div>
              </div>
            </div>
          ))}

          {canAddMore && (
            <button
              onClick={handleClick}
              className="
                aspect-square border-2 border-dashed border-gray-300
                hover:border-gray-400 hover:bg-gray-50
                rounded-lg flex flex-col items-center justify-center
                gap-2 text-gray-500 hover:text-gray-700
                transition-all cursor-pointer
              "
            >
              <Plus className="w-8 h-8" />
              <span className="text-sm">Adicionar</span>
            </button>
          )}
        </div>
      )}

      {previews.length === 0 && (
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
          <div className="flex flex-col items-center gap-3">
            <div className={`
              p-3 rounded-full transition-colors
              ${isDragging ? 'bg-blue-100' : 'bg-gray-200'}
            `}>
              <Upload className={`w-8 h-8 ${isDragging ? 'text-blue-500' : 'text-gray-500'}`} />
            </div>

            <div>
              <p className="font-medium text-gray-700">
                {isDragging ? 'Solte as imagens aqui' : 'Clique ou arraste imagens'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                PNG, JPG, GIF até {maxSizeMB}MB (máx. {maxImages} imagens)
              </p>
            </div>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileInput}
        className="hidden"
      />

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          {error}
        </div>
      )}

      {previews.length > 0 && (
        <div className="text-sm text-gray-600">
          {previews.length} de {maxImages} imagem(ns) adicionada(s)
        </div>
      )}
    </div>
  );
}
