import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  
  if (!query) return new NextResponse('Missing query', { status: 400 });

  // Use Pollinations AI but route it through our server so the browser's adblocker cannot block it!
  const prompt = `A delicious, mouth-watering plate of ${query}, professional food photography, restaurant quality, natural lighting, highly detailed, 4k, appetizing`;
  const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=800&height=600&model=flux&nologo=true`;

  try {
    const response = await fetch(pollinationsUrl);
    
    if (!response.ok) {
        return new NextResponse('Error generating AI image', { status: 500 });
    }

    const blob = await response.blob();
    
    return new NextResponse(blob, {
      headers: {
        'Content-Type': response.headers.get('content-type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    return new NextResponse('Error fetching image', { status: 500 });
  }
}
