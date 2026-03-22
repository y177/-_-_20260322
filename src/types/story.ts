// === src/types/story.ts ===

export interface StoryScene {
  pageNumber: number;
  text: string;
  imagePrompt: string;
  emotion: string;
  imageBase64?: string;
  mimeType?: string;
}

export interface GenerateStoryRequest {
  story: string;
  apiKey: string;
}

export interface GenerateStoryResponse {
  title: string;
  scenes: StoryScene[];
}

export interface GenerateImageRequest {
  prompt: string;
  apiKey: string;
  pageNumber: number;
}

export interface GenerateImageResponse {
  pageNumber: number;
  imageBase64: string;
  mimeType: string;
}

export type GenerationStep =
  | 'idle'
  | 'parsing'
  | 'generating'
  | 'done'
  | 'error';

export interface GenerationState {
  step: GenerationStep;
  title: string;
  scenes: StoryScene[];
  completedImages: number;
  totalImages: number;
  error: string | null;
}
