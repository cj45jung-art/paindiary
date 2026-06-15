import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const authHeader = req.headers.get('Authorization');
    
    // Extract API Key
    let apiKey = '';
    if (authHeader) {
      apiKey = authHeader.replace('Bearer ', '').trim();
    }
    
    if (!apiKey || apiKey === 'undefined' || apiKey === 'null') {
      apiKey = process.env.GEMINI_API_KEY || '';
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API Key가 설정되지 않았습니다. API Key를 입력하거나 서버 환경변수(GEMINI_API_KEY)를 설정해 주세요.' },
        { status: 400 }
      );
    }

    // Call Google Gemini API from server-side (bypass CORS)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      let parsedError;
      try {
        parsedError = JSON.parse(errorText);
      } catch {
        parsedError = errorText;
      }
      return NextResponse.json(
        { error: 'Gemini API 호출 에러가 발생했습니다.', details: parsedError },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Gemini Proxy Route Error:', error);
    return NextResponse.json(
      { error: '프록시 서버 내부 오류가 발생했습니다.', details: error.message || String(error) },
      { status: 500 }
    );
  }
}
