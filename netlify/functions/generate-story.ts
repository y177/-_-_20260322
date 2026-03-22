// === netlify/functions/generate-story.ts ===

import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface GenerateStoryRequest {
  story: string;
}

const SYSTEM_PROMPT = `당신은 아동 치료사 보조 AI입니다. 입력된 이야기를 4-6개 장면으로 분리하고, 각 장면에 동화책 스타일의 삽화 프롬프트(영어)를 작성해주세요.

이미지 프롬프트는 반드시 'children's book illustration, watercolor style, warm colors, safe for kids' 스타일 가이드를 항상 포함시켜주세요.

응답은 반드시 아래 JSON 형식만 반환하세요. 마크다운 코드블록이나 추가 설명 없이 순수 JSON만 반환하세요:

{
  "title": "동화 제목",
  "scenes": [
    {
      "pageNumber": 1,
      "text": "해당 페이지 내용 (2-4문장, 한국어)",
      "imagePrompt": "children's book illustration, watercolor style, warm colors, safe for kids, [scene description in English]",
      "emotion": "감정 키워드 (한국어)"
    }
  ]
}`;

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

  let body: GenerateStoryRequest;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: '잘못된 요청 형식입니다.' }),
    };
  }

  if (!body.story || body.story.trim().length === 0) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: '이야기 내용이 비어있습니다.' }),
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: SYSTEM_PROMPT,
    });

    const result = await model.generateContent(
      `다음 이야기를 동화책으로 만들어주세요:\n\n${body.story}`
    );

    const responseText = result.response.text().trim();

    // JSON 파싱 시도 (마크다운 코드블록 제거)
    const cleanJson = responseText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const parsed = JSON.parse(cleanJson);

    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed),
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '알 수 없는 오류';

    if (message.includes('API_KEY_INVALID') || message.includes('API key')) {
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ error: '유효하지 않은 API 키입니다.' }),
      };
    }

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: `이야기 분석 중 오류가 발생했습니다: ${message}` }),
    };
  }
};
