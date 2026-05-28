import { useState, useCallback } from 'react';

interface UseN8nWebhookOptions {
  webhookUrl: string;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

interface UseN8nWebhookReturn {
  isLoading: boolean;
  error: string | null;
  response: any;
  sendData: (data: FormData | Record<string, any>) => Promise<any>;
  clearError: () => void;
}

export const useN8nWebhook = ({
  webhookUrl,
  onSuccess,
  onError
}: UseN8nWebhookOptions): UseN8nWebhookReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<any>(null);

  const sendData = useCallback(
    async (data: FormData | Record<string, any>): Promise<any> => {
      setError(null);
      setIsLoading(true);

      try {
        console.log('📤 Enviando para webhook:', webhookUrl);

        const fetchOptions: RequestInit = {
          method: 'POST'
        };

        if (data instanceof FormData) {
          fetchOptions.body = data;
        } else {
          fetchOptions.headers = {
            'Content-Type': 'application/json'
          };
          fetchOptions.body = JSON.stringify(data);
        }

        const res = await fetch(webhookUrl, fetchOptions);

        console.log('📊 Status:', res.status);

        if (!res.ok) {
          let errorText = '';
          try {
            errorText = await res.text();
            console.error('❌ Resposta de erro:', errorText);
          } catch (e) {
            console.error('❌ Erro ao ler resposta:', e);
          }
          throw new Error(
            `Erro do servidor (${res.status}): ${errorText || res.statusText}`
          );
        }

        const responseData = await res.json();
        console.log('✅ Resposta:', responseData);

        // Validar resposta
        if (!responseData) {
          throw new Error('Resposta vazia do servidor');
        }

        setResponse(responseData);
        onSuccess?.(responseData);

        return responseData;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
        console.error('❌ Erro:', errorMessage);
        setError(errorMessage);
        onError?.(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [webhookUrl, onSuccess, onError]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    response,
    sendData,
    clearError
  };
};
