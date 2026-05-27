import { useState } from 'react';
import { Loader, AlertCircle, CheckCircle, Upload, X } from 'lucide-react';

interface GeneratorResult {
  success: boolean;
  message: string;
  fileName: string;
  brandName: string;
  postType: string;
}

interface BrandPostGeneratorProps {
  webhookUrl?: string;
}

export default function BrandPostGenerator({ 
  webhookUrl = 'https://ivannnnnn.app.n8n.cloud/webhook-test/brand-post-generator' 
}: BrandPostGeneratorProps) {
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

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GeneratorResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      setError('⚠️ Seleciona apenas imagens (PNG, JPG, WebP, etc)');
      return;
    }
    
    if (imageFiles.length > 6) {
      setError('⚠️ Máximo 6 imagens permitidas');
      return;
    }
    
    setUploadedFiles(imageFiles);
    setError(null);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setIsLoading(true);

    try {
      // Validação básica
      if (uploadedFiles.length === 0) {
        throw new Error('Carrega pelo menos uma imagem');
      }
      if (!formData.brandName.trim()) {
        throw new Error('Preenche o nome da marca');
      }
      if (!formData.postType) {
        throw new Error('Escolhe o tipo de post');
      }
      if (!formData.topic.trim()) {
        throw new Error('Preenche o tópico do post');
      }
      if (!formData.mainMessage.trim()) {
        throw new Error('Preenche a mensagem principal');
      }
      if (!formData.headline.trim()) {
        throw new Error('Preenche a headline');
      }

      console.log('📤 Enviando', uploadedFiles.length, 'ficheiros');
      
      // Montar FormData
      const formDataBody = new FormData();
      uploadedFiles.forEach((file, index) => {
        formDataBody.append(`image_${index}`, file);
      });
      formDataBody.append('brandName', formData.brandName);
      formDataBody.append('postType', formData.postType);
      formDataBody.append('topic', formData.topic);
      formDataBody.append('mainMessage', formData.mainMessage);
      formDataBody.append('headline', formData.headline);
      formDataBody.append('secondaryText', formData.secondaryText);
      formDataBody.append('format', formData.format);

      console.log('🔗 POST para:', webhookUrl);

      const response = await fetch(webhookUrl, {
        method: 'POST',
        body: formDataBody
      });

      console.log('📊 Status:', response.status);

      if (!response.ok) {
        let errorData = '';
        try {
          errorData = await response.text();
          console.error('❌ Resposta de erro:', errorData);
        } catch (e) {
          console.error('❌ Erro ao ler resposta:', e);
        }
        throw new Error(`Erro do servidor (${response.status}): ${errorData || response.statusText}`);
      }

      const data = await response.json() as GeneratorResult | { success: boolean; error?: string; details?: string; message?: string };
      console.log('✅ Resposta:', data);

      if ('success' in data && data.success) {
        setResult(data as GeneratorResult);
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
      } else if ('success' in data && !data.success) {
        const errorMsg = data.error || 'Erro desconhecido';
        const errorDetails = data.details || '';
        
        let userFriendlyError = errorMsg;
        if (errorMsg.includes('email')) {
          userFriendlyError = '❌ Erro ao enviar o email. Verifica a configuração do Gmail.';
        } else if (errorMsg.includes('download')) {
          userFriendlyError = '❌ Erro ao fazer download da imagem gerada.';
        } else if (errorMsg.includes('identidade')) {
          userFriendlyError = '❌ Erro ao analisar as imagens. Verifica o formato e tamanho.';
        } else if (errorMsg.includes('gerar imagem')) {
          userFriendlyError = '❌ Erro ao gerar a imagem. Tenta novamente.';
        }
        
        throw new Error(userFriendlyError + (errorDetails ? ` (${errorDetails})` : ''));
      } else if ('message' in data) {
        setError(null);
        setResult({
          success: true,
          message: data.message || 'Post gerado com sucesso!',
          fileName: 'Enviado por email',
          brandName: formData.brandName,
          postType: formData.postType
        });
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
      } else {
        throw new Error('Resposta do servidor indicou erro');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('❌ Erro:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Título */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-2">🎨 Brand Post Generator</h2>
          <p className="text-gray-400">
            Carrega imagens de referência. O post será gerado e enviado por email.
          </p>
        </div>
      </div>

      {/* Instrução inicial */}
      <div className="bg-blue-600/20 border border-blue-600/50 rounded-lg p-4">
        <p className="text-blue-300 text-sm">
          <strong>ℹ️ Sistema:</strong> Faz upload das imagens da marca. O post será criado e enviado automaticamente para o teu email. Podes carregar até <strong>6 imagens</strong>.
        </p>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Upload de imagens */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Imagens de referência da marca *
          </label>
          <div className="relative border-2 border-dashed border-gray-800 rounded-lg p-8 hover:border-blue-600/50 transition-colors cursor-pointer">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="text-center">
              <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">Clica ou arrasta imagens aqui (máx 6)</p>
              <p className="text-gray-600 text-xs mt-1">PNG, JPG, WebP, etc</p>
            </div>
          </div>
          
          {/* Preview dos ficheiros */}
          {uploadedFiles.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index}`}
                    className="w-full h-24 object-cover rounded-lg border border-gray-700"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-700 rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                  <p className="text-xs text-gray-400 mt-1 truncate">{file.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Nome da marca */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Nome da marca *
          </label>
          <input
            type="text"
            name="brandName"
            value={formData.brandName}
            onChange={handleInputChange}
            placeholder="Ex: Nike, Apple, Zara..."
            className="w-full bg-[#0f1420] border border-gray-800/50 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-blue-600 transition-colors"
          />
        </div>

        {/* Tipo de post */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Tipo de post *
          </label>
          <select
            name="postType"
            value={formData.postType}
            onChange={handleInputChange}
            className="w-full bg-[#0f1420] border border-gray-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-600 transition-colors"
          >
            <option>quote post</option>
            <option>announcement</option>
            <option>carousel cover</option>
            <option>feature post</option>
            <option>story post</option>
          </select>
        </div>

        {/* Tópico do post */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Tópico do post *
          </label>
          <input
            type="text"
            name="topic"
            value={formData.topic}
            onChange={handleInputChange}
            placeholder="Ex: lançamento verão, promoção, motivação..."
            className="w-full bg-[#0f1420] border border-gray-800/50 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-blue-600 transition-colors"
          />
        </div>

        {/* Mensagem principal */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Mensagem principal *
          </label>
          <input
            type="text"
            name="mainMessage"
            value={formData.mainMessage}
            onChange={handleInputChange}
            placeholder="Ex: Just Do It"
            className="w-full bg-[#0f1420] border border-gray-800/50 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-blue-600 transition-colors"
          />
        </div>

        {/* Headline */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Headline (texto principal da imagem) *
          </label>
          <input
            type="text"
            name="headline"
            value={formData.headline}
            onChange={handleInputChange}
            placeholder="Ex: O limite és tu."
            className="w-full bg-[#0f1420] border border-gray-800/50 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-blue-600 transition-colors"
          />
        </div>

        {/* Texto secundário */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Texto secundário
          </label>
          <input
            type="text"
            name="secondaryText"
            value={formData.secondaryText}
            onChange={handleInputChange}
            placeholder="Ex: Colecção Verão 2025 (opcional)"
            className="w-full bg-[#0f1420] border border-gray-800/50 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-blue-600 transition-colors"
          />
        </div>

        {/* Formato */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Formato *
          </label>
          <select
            name="format"
            value={formData.format}
            onChange={handleInputChange}
            className="w-full bg-[#0f1420] border border-gray-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-600 transition-colors"
          >
            <option value="1:1">1:1 — Feed quadrado</option>
            <option value="4:5">4:5 — Feed retrato</option>
            <option value="9:16">9:16 — Story / Reels</option>
            <option value="16:9">16:9 — Paisagem</option>
          </select>
        </div>

        {/* Mensagens de erro */}
        {error && (
          <div className="bg-red-600/20 border border-red-600/50 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 font-medium">Erro</p>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Botão de submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Gerando...
            </>
          ) : (
            'Gerar Post'
          )}
        </button>
      </form>

      {/* Resultado */}
      {result && (
        <div className="bg-green-600/20 border border-green-600/50 rounded-lg p-6">
          <div className="flex items-start gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-green-400 font-semibold">Post gerado com sucesso!</p>
              <p className="text-green-300 text-sm">{result.message}</p>
            </div>
          </div>

          {/* Detalhes */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {result.brandName && (
              <div>
                <p className="text-gray-400 text-xs">Marca</p>
                <p className="text-white font-medium">{result.brandName}</p>
              </div>
            )}
            {result.postType && (
              <div>
                <p className="text-gray-400 text-xs">Tipo de Post</p>
                <p className="text-white font-medium">{result.postType}</p>
              </div>
            )}
            {result.fileName && (
              <div className="col-span-2">
                <p className="text-gray-400 text-xs">Ficheiro</p>
                <p className="text-white font-medium">{result.fileName}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
