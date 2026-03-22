/**
 * 앱 실행 로그 기록 유틸리티
 *
 * 이야기 생성 과정과 오류를 브라우저 localStorage에 기록합니다.
 * 문제 발생 시 로그를 확인하여 원인을 파악할 수 있습니다.
 *
 * 로그 확인 방법:
 *   - 브라우저 개발자 도구(F12) → Console 탭
 *   - 또는 Application → Local Storage → 'app_logs' 항목
 */

import { APP_CONFIG } from '../config';

/** 로그 레벨 정의 */
type LogLevel = 'info' | 'warn' | 'error' | 'success';

/** 로그 항목 구조 */
interface LogEntry {
  timestamp: string;   // 기록 시각 (ISO 형식)
  level: LogLevel;     // 로그 레벨
  message: string;     // 로그 메시지
  data?: unknown;      // 추가 데이터 (선택)
}

/**
 * 현재 저장된 로그 목록을 localStorage에서 불러옵니다.
 */
function getLogs(): LogEntry[] {
  try {
    const raw = localStorage.getItem(APP_CONFIG.logging.storageKey);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * 로그를 localStorage에 저장합니다.
 * 최대 저장 개수를 초과하면 오래된 로그부터 삭제합니다.
 */
function saveLogs(logs: LogEntry[]): void {
  try {
    // 최대 개수 초과 시 오래된 로그 제거
    const trimmed = logs.slice(-APP_CONFIG.logging.maxEntries);
    localStorage.setItem(APP_CONFIG.logging.storageKey, JSON.stringify(trimmed));
  } catch {
    // localStorage 저장 실패는 무시 (용량 초과 등)
  }
}

/**
 * 로그를 기록하는 핵심 함수
 */
function log(level: LogLevel, message: string, data?: unknown): void {
  if (!APP_CONFIG.logging.enabled) return;

  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    data,
  };

  // 콘솔에도 출력 (개발자 도구에서 확인 가능)
  const prefix = `[이야기동화관] [${level.toUpperCase()}]`;
  if (level === 'error') {
    console.error(prefix, message, data ?? '');
  } else if (level === 'warn') {
    console.warn(prefix, message, data ?? '');
  } else {
    console.log(prefix, message, data ?? '');
  }

  // localStorage에 저장
  const logs = getLogs();
  logs.push(entry);
  saveLogs(logs);
}

/** 정보 로그 (일반적인 실행 단계 기록) */
export const logger = {
  info: (message: string, data?: unknown) => log('info', message, data),
  warn: (message: string, data?: unknown) => log('warn', message, data),
  error: (message: string, data?: unknown) => log('error', message, data),
  success: (message: string, data?: unknown) => log('success', message, data),

  /**
   * 저장된 모든 로그를 반환합니다.
   */
  getLogs,

  /**
   * 저장된 로그를 모두 삭제합니다.
   */
  clearLogs(): void {
    localStorage.removeItem(APP_CONFIG.logging.storageKey);
    console.log('[이야기동화관] 로그가 삭제되었습니다.');
  },

  /**
   * 로그를 텍스트 파일로 다운로드합니다.
   * 문제 발생 시 개발자에게 전달할 수 있습니다.
   */
  exportLogs(): void {
    const logs = getLogs();
    if (logs.length === 0) {
      console.warn('[이야기동화관] 저장된 로그가 없습니다.');
      return;
    }

    const text = logs
      .map((e) => `[${e.timestamp}] [${e.level.toUpperCase()}] ${e.message}${e.data ? '\n  데이터: ' + JSON.stringify(e.data) : ''}`)
      .join('\n');

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `app-logs-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  },
};
