// === src/hooks/useStoryGeneration.ts ===

import { useState, useCallback } from 'react';
import type { GenerationState, StoryScene } from '../types/story';

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

  const reset = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  const generate = useCallback(async (story: string, apiKey: string) => {
    setState({ ...INITIAL_STATE, step: 'parsing' });

    // 1단계: 이야기를 장면으로 분리
    let scenes: StoryScene[];
    let title: string;
    try {
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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '이야기 분석 중 오류가 발생했습니다.';
      setState((prev) => ({ ...prev, step: 'error', error: message }));
      return;
    }

    // 2단계: 이미지 순차 생성 (레이트 리밋 방지)
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
        }
        // 이미지 생성 실패 시 해당 페이지는 이미지 없이 진행
      } catch {
        // 개별 이미지 오류는 무시하고 계속 진행
      }

      // 진행상황 즉시 반영 (스트리밍 UX)
      const completed = i + 1;
      setState((prev) => ({
        ...prev,
        scenes: [...updatedScenes],
        completedImages: completed,
      }));
    }

    setState((prev) => ({
      ...prev,
      step: 'done',
      scenes: [...updatedScenes],
    }));
  }, []);

  return { state, generate, reset };
}
