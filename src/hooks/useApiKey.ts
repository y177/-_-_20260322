// === src/hooks/useApiKey.ts ===

import { useState, useCallback } from 'react';

const STORAGE_KEY = 'gemini_api_key';

export function useApiKey() {
  const [apiKey, setApiKeyState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY) || '';
  });

  const saveApiKey = useCallback((key: string) => {
    localStorage.setItem(STORAGE_KEY, key);
    setApiKeyState(key);
  }, []);

  const clearApiKey = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setApiKeyState('');
  }, []);

  /**
   * Gemini API에 테스트 요청을 보내 키 유효성을 검사한다.
   */
  const validateApiKey = useCallback(async (key: string): Promise<boolean> => {
    try {
      const response = await fetch('/.netlify/functions/generate-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
        },
        body: JSON.stringify({ story: '테스트' }),
      });

      // 401은 키 오류, 그 외는 키 자체는 유효
      if (response.status === 401) return false;
      return true;
    } catch {
      return false;
    }
  }, []);

  return {
    apiKey,
    hasApiKey: apiKey.length > 0,
    saveApiKey,
    clearApiKey,
    validateApiKey,
  };
}
