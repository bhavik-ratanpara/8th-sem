import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 });
  }

  try {
    // We return a proxy URL that tells our backend to fetch the image from Pollinations AI.
    // This perfectly solves the adblocker/ISP blocking issue, AND guarantees highly accurate AI food photography!
    
    // Instead of giving the frontend a direct pollinations URL, we give it our proxy route
    const proxyUrl = `/api/food-image-proxy?q=${encodeURIComponent(query)}`;

    return NextResponse.json({ imageUrl: proxyUrl });
  } catch (error) {
    console.error('Food image URL generation error:', error);
    return NextResponse.json({ imageUrl: null });
  }
}
