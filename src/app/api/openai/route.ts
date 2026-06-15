import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const authHeader = req.headers.get('Authorization');
    
    // Fallback to server-side process.env.OPENAI_API_KEY if client apiKey is missing
    let apiKey = '';
    if (authHeader) {
      apiKey = authHeader.replace('Bearer ', '').trim();
    }
    
    if (!apiKey || apiKey === 'undefined' || apiKey === 'null') {
      apiKey = process.env.OPENAI_API_KEY || '';
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API Key가 설정되지 않았습니다. API Key를 입력하거나 서버 환경변수(OPENAI_API_KEY)를 설정해 주세요.' },
        { status: 400 }
      );
    }

    // Call OpenAI API from server-side (bypass CORS)
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      let parsedError;
      try {
        parsedError = JSON.parse(errorText);
      } catch {
        parsedError = errorText;
      }
      return NextResponse.json(
        { error: 'OpenAI API 호출 에러가 발생했습니다.', details: parsedError },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('OpenAI Proxy Route Error:', error);
    return NextResponse.json(
      { error: '프록시 서버 내부 오류가 발생했습니다.', details: error.message || String(error) },
      { status: 500 }
    );
  }
}
