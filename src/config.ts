/**
 * 앱 전역 설정
 * config.json의 내용을 TypeScript에서 사용할 수 있도록 정의합니다.
 * 설정값을 변경하려면 이 파일을 수정하세요.
 */

export const APP_CONFIG = {
  /** 앱 기본 정보 */
  app: {
    name: '이야기 동화관',
    subtitle: '아이들의 이야기를 소중히 담습니다',
    version: '1.0.0',
  },

  /** 이야기 생성 관련 설정 */
  story: {
    /** 생성할 최소 장면 수 */
    minScenes: 4,
    /** 생성할 최대 장면 수 */
    maxScenes: 6,
    /** 예시 이야기 목록 (입력 폼에 표시) */
    sampleStories: [
      '토끼가 달나라에서 떡을 만들어요',
      '용감한 공룡이 폭풍우를 헤치고 친구를 구해요',
      '작은 별이 하늘에서 내려와 아이와 친구가 됐어요',
    ],
  },

  /** 이미지 생성 관련 설정 */
  image: {
    /** 이미지 스타일 가이드 (영어로 작성) */
    style: "children's book illustration, watercolor style, warm colors, safe for kids",
    /** 이미지 생성 타임아웃 (밀리초) */
    timeoutMs: 8000,
  },

  /** API 관련 설정 */
  api: {
    /** localStorage에 API 키를 저장할 때 사용하는 키 이름 */
    storageKey: 'gemini_api_key',
    /** 이야기 분석에 사용하는 Gemini 모델 */
    storyModel: 'gemini-2.0-flash',
    /** 이미지 생성에 사용하는 Gemini 모델 */
    imageModel: 'gemini-2.0-flash-preview-image-generation',
  },

  /** 로그 관련 설정 */
  logging: {
    /** 로그 기능 활성화 여부 */
    enabled: true,
    /** localStorage에 로그를 저장할 때 사용하는 키 이름 */
    storageKey: 'app_logs',
    /** 저장할 최대 로그 수 (초과 시 오래된 것부터 삭제) */
    maxEntries: 100,
  },
} as const;
