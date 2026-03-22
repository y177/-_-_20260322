/**
 * 이야기 → 동화책 생성 훅
 *
 * 전체 생성 흐름을 관리합니다:
 *   1단계: 이야기 텍스트를 AI가 장면으로 분리 (generate-story 서버 함수)
 *   2단계: 각 장면에 대한 이미지를 순차 생성 (generate-image 서버 함수)
 *
 * 이미지를 순차적으로 생성하는 이유:
 *   - API 레이트 리밋(분당 요청 한도) 방지
 *   - 완성된 이미지를 즉시 화면에 표시하는 스트리밍 UX 제공
 */

import { useState, useCallback } from 'react';
import type { GenerationState, StoryScene } from '../types/story';
import { logger } from '../utils/logger';

/** 초기 상태: 아무 작업도 하지 않은 상태 */
const INITIAL_STATE: GenerationState = {
  step: 'idle',
  title: '',
  scenes: [],
  completedImages: 0,
  totalImages: 0,
  error: null,
};

export function useStoryGeneration() {
  const [state, setState] = useState<GenerationState>(INITIAL_STATE);

  /** 상태를 초기화하여 새 이야기를 받을 수 있게 합니다 */
  const reset = useCallback(() => {
    logger.info('이야기 생성 초기화');
    setState(INITIAL_STATE);
  }, []);

  /**
   * 이야기를 입력받아 동화책을 생성합니다.
   * @param story - 사용자가 입력한 이야기 텍스트
   * @param apiKey - Google Gemini API 키
   */
  const generate = useCallback(async (story: string, apiKey: string) => {
    logger.info('동화책 생성 시작', { storyLength: story.length });
    setState({ ...INITIAL_STATE, step: 'parsing' });

    // ─── 1단계: 이야기를 장면으로 분리 ───
    let scenes: StoryScene[];
    let title: string;
    try {
      logger.info('1단계: 이야기 분석 요청 중...');
      const storyRes = await fetch('/.netlify/functions/generate-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({ story }),
      });

      if (!storyRes.ok) {
        const err = await storyRes.json();
        throw new Error(err.error || '이야기 분석에 실패했습니다.');
      }

      const data = await storyRes.json();
      title = data.title;
      scenes = data.scenes;
      logger.success(`1단계 완료: "${title}" — ${scenes.length}개 장면`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '이야기 분석 중 오류가 발생했습니다.';
      logger.error('1단계 실패: 이야기 분석 오류', { message });
      setState((prev) => ({ ...prev, step: 'error', error: message }));
      return;
    }

    // ─── 2단계: 이미지 순차 생성 (레이트 리밋 방지) ───
    logger.info(`2단계: 이미지 생성 시작 (총 ${scenes.length}장)`);
    setState({
      step: 'generating',
      title,
      scenes: scenes.map((s) => ({ ...s })),
      completedImages: 0,
      totalImages: scenes.length,
      error: null,
    });

    const updatedScenes: StoryScene[] = scenes.map((s) => ({ ...s }));

    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      try {
        logger.info(`이미지 생성 중: ${i + 1}/${scenes.length}페이지`);
        const imgRes = await fetch('/.netlify/functions/generate-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
          },
          body: JSON.stringify({
            prompt: scene.imagePrompt,
            pageNumber: scene.pageNumber,
          }),
        });

        if (imgRes.ok) {
          const imgData = await imgRes.json();
          updatedScenes[i] = {
            ...updatedScenes[i],
            imageBase64: imgData.imageBase64,
            mimeType: imgData.mimeType,
          };
          logger.success(`${i + 1}페이지 이미지 생성 완료`);
        } else {
          // 이미지 생성 실패 시 해당 페이지는 이미지 없이 진행
          logger.warn(`${i + 1}페이지 이미지 생성 실패 (HTTP ${imgRes.status}), 빈 이미지로 계속 진행`);
        }
      } catch (err) {
        // 개별 이미지 오류는 무시하고 계속 진행 (전체 중단 방지)
        logger.warn(`${i + 1}페이지 이미지 생성 오류 (무시하고 계속)`, { error: String(err) });
      }

      // 완료된 이미지 수를 즉시 반영하여 로딩 화면에 진행상황 표시
      setState((prev) => ({
        ...prev,
        scenes: [...updatedScenes],
        completedImages: i + 1,
      }));
    }

    logger.success('동화책 생성 완료!', { title, totalScenes: scenes.length });
    setState((prev) => ({
      ...prev,
      step: 'done',
      scenes: [...updatedScenes],
    }));
  }, []);

  return { state, generate, reset };
}
