import { useState } from 'react';
import { useN8nWebhook } from '@/hooks/useN8nWebhook';
import { Loader, AlertCircle, CheckCircle, Upload, X } from 'lucide-react';

interface BrandPostGeneratorRefactoredProps {
  webhookUrl?: string;
}

export default function BrandPostGeneratorRefactored({
  webhookUrl = 'https://ivannnnnn.app.n8n.cloud/webhook/execute-workflow'
}: BrandPostGeneratorRefactoredProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    brandName: '',
    postType: 'quote post',
    topic: '',
    mainMessage: '',
    headline: '',
    secondaryText: '',
    format: '1:1'
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { isLoading, error, sendData, clearError } = useN8nWebhook({
    webhookUrl,
    onSuccess: (data) => {
      console.log('✅ Post criado:', data);
      setSuccessMessage(data.message || 'Post gerado com sucesso!');
      // Limpar formulário após sucesso
      setUploadedFiles([]);
      setFormData({
        brandName: '',
        postType: 'quote post',
        topic: '',
        mainMessage: '',
        headline: '',
        secondaryText: '',
        format: '1:1'
      });
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearError();
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(f => f.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      return;
    }

    if (imageFiles.length > 6) {
      return;
    }

    setUploadedFiles(imageFiles);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    clearError();
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      // Validação
      if (uploadedFiles.length === 0) throw new Error('Carrega pelo menos uma imagem');
      if (!formData.brandName.trim()) throw new Error('Preenche o nome da marca');
      if (!formData.topic.trim()) throw new Error('Preenche o tópico');
      if (!formData.mainMessage.trim()) throw new Error('Preenche a mensagem principal');
      if (!formData.headline.trim()) throw new Error('Preenche a headline');

      // Montar FormData
      const body = new FormData();
      uploadedFiles.forEach((file, index) => {
        body.append(`image_${index}`, file);
      });
      body.append('brandName', formData.brandName);
      body.append('postType', formData.postType);
      body.append('topic', formData.topic);
      body.append('mainMessage', formData.mainMessage);
      body.append('headline', formData.headline);
      body.append('secondaryText', formData.secondaryText);
      body.append('format', formData.format);

      await sendData(body);
    } catch (err) {
      console.error('Erro:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-2">🎨 Brand Post Generator</h2>
          <p className="text-gray-400">
            Carrega imagens de referência. O post será gerado com base na tua marca.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-600">{successMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Upload de Ficheiros */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            📷 Imagens de Referência <span className="text-red-500">*</span>
          </label>
          <div className="relative border-2 border-dashed rounded-lg p-8 text-center hover:border-blue-500 transition">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              disabled={isLoading}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600">Arrasta imagens ou clica para selecionar</p>
            <p className="text-xs text-gray-400 mt-1">Máximo 6 imagens (PNG, JPG, WebP)</p>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {uploadedFiles.map((file, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${idx}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Brand Name */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Brand Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="brandName"
            value={formData.brandName}
            onChange={handleInputChange}
            disabled={isLoading}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
            placeholder="ex: TechBrand"
          />
        </div>

        {/* Post Type */}
        <div>
          <label className="block text-sm font-medium mb-2">Post Type</label>
          <select
            name="postType"
            value={formData.postType}
            onChange={handleInputChange}
            disabled={isLoading}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
          >
            <option value="quote post">Quote Post</option>
            <option value="announcement">Announcement</option>
            <option value="carousel cover">Carousel Cover</option>
            <option value="feature post">Feature Post</option>
            <option value="story post">Story Post</option>
          </select>
        </div>

        {/* Topic */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Tópico <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="topic"
            value={formData.topic}
            onChange={handleInputChange}
            disabled={isLoading}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
            placeholder="ex: New Product Launch"
          />
        </div>

        {/* Main Message */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Mensagem Principal <span className="text-red-500">*</span>
          </label>
          <textarea
            name="mainMessage"
            value={formData.mainMessage}
            onChange={handleInputChange}
            disabled={isLoading}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
            rows={3}
            placeholder="Descreve a mensagem principal..."
          />
        </div>

        {/* Headline */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Headline <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="headline"
            value={formData.headline}
            onChange={handleInputChange}
            disabled={isLoading}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
            placeholder="ex: Revolucionando a indústria"
          />
        </div>

        {/* Secondary Text */}
        <div>
          <label className="block text-sm font-medium mb-2">Secondary Text (Opcional)</label>
          <textarea
            name="secondaryText"
            value={formData.secondaryText}
            onChange={handleInputChange}
            disabled={isLoading}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
            rows={2}
            placeholder="Texto complementar..."
          />
        </div>

        {/* Format */}
        <div>
          <label className="block text-sm font-medium mb-2">Formato</label>
          <select
            name="format"
            value={formData.format}
            onChange={handleInputChange}
            disabled={isLoading}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
          >
            <option value="1:1">1:1 (Square)</option>
            <option value="9:16">9:16 (Story)</option>
            <option value="16:9">16:9 (Landscape)</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium flex items-center justify-center gap-2"
        >
          {isLoading && <Loader className="w-4 h-4 animate-spin" />}
          {isLoading ? 'Gerando Post...' : 'Gerar Post'}
        </button>
      </form>
    </div>
  );
}
