// === netlify/functions/generate-image.ts ===

import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface GenerateImageRequest {
  prompt: string;
  pageNumber: number;
}

export const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: '허용되지 않는 메서드입니다.' }),
    };
  }

  const apiKey = event.headers['x-api-key'] || event.headers['X-Api-Key'];
  if (!apiKey) {
    return {
      statusCode: 401,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'API 키가 필요합니다.' }),
    };
  }

  let body: GenerateImageRequest;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: '잘못된 요청 형식입니다.' }),
    };
  }

  if (!body.prompt || body.prompt.trim().length === 0) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: '이미지 프롬프트가 비어있습니다.' }),
    };
  }

  // Netlify Free Tier: 8초 타임아웃 설정
  const TIMEOUT_MS = 8000;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-preview-image-generation',
    });

    const generatePromise = model.generateContent({
      contents: [{ role: 'user', parts: [{ text: body.prompt }] }],
      generationConfig: {
        responseModalities: ['IMAGE'],
      } as unknown as Parameters<typeof model.generateContent>[0] extends { generationConfig?: infer T } ? T : never,
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('이미지 생성 시간이 초과되었습니다 (8초)')), TIMEOUT_MS)
    );

    const result = await Promise.race([generatePromise, timeoutPromise]);

    const imagePart = result.response.candidates?.[0]?.content?.parts?.find(
      (p: { inlineData?: { data: string; mimeType: string } }) => p.inlineData
    );

    if (!imagePart?.inlineData) {
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: '이미지 데이터를 받지 못했습니다.' }),
      };
    }

    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pageNumber: body.pageNumber,
        imageBase64: imagePart.inlineData.data,
        mimeType: imagePart.inlineData.mimeType || 'image/png',
      }),
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '알 수 없는 오류';

    if (message.includes('API_KEY_INVALID') || message.includes('API key not valid')) {
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ error: '유효하지 않은 API 키입니다.' }),
      };
    }

    if (message.includes('429') || message.includes('Too Many Requests') || message.includes('quota')) {
      return {
        statusCode: 429,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'API 사용량 한도 초과로 이미지를 생성할 수 없습니다. 잠시 후 다시 시도해주세요.' }),
      };
    }

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: `이미지 생성 중 오류가 발생했습니다: ${message}` }),
    };
  }
};
