/**
 * Gemini API 키 관리 훅
 *
 * API 키를 브라우저 localStorage에 안전하게 저장하고 불러옵니다.
 * 키는 서버로 전송되지 않으며, 사용자 기기에만 보관됩니다.
 */

import { useState, useCallback } from 'react';
import { APP_CONFIG } from '../config';
import { logger } from '../utils/logger';

/** localStorage에 API 키를 저장할 때 사용하는 키 이름 (config.ts에서 관리) */
const STORAGE_KEY = APP_CONFIG.api.storageKey;

export function useApiKey() {
  /** 앱 시작 시 localStorage에서 저장된 API 키를 자동으로 불러옵니다 */
  const [apiKey, setApiKeyState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY) || '';
  });

  /** API 키를 localStorage에 저장하고 상태를 업데이트합니다 */
  const saveApiKey = useCallback((key: string) => {
    localStorage.setItem(STORAGE_KEY, key);
    setApiKeyState(key);
    logger.success('API 키 저장 완료');
  }, []);

  /** API 키를 localStorage에서 삭제하고 상태를 초기화합니다 */
  const clearApiKey = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setApiKeyState('');
    logger.info('API 키 삭제됨');
  }, []);

  /**
   * Gemini API에 테스트 요청을 보내 키 유효성을 검사합니다.
   * HTTP 401 응답 → 키 오류, 그 외 → 키 자체는 유효
   */
  const validateApiKey = useCallback(async (key: string): Promise<boolean> => {
    logger.info('API 키 유효성 검사 중...');
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
      if (response.status === 401) {
        logger.warn('API 키 유효성 검사 실패: 유효하지 않은 키');
        return false;
      }
      logger.success('API 키 유효성 검사 통과');
      return true;
    } catch {
      logger.error('API 키 유효성 검사 중 네트워크 오류');
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
