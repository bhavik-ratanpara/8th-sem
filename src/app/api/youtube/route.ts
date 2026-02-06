'use server';

import {NextResponse} from 'next/server';

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json(
      {error: 'Query parameter "q" is required.'},
      {status: 400}
    );
  }

  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
  if (!YOUTUBE_API_KEY) {
    console.error('YouTube API key is missing. Please set YOUTUBE_API_KEY in your .env file.');
    return NextResponse.json({ error: 'YouTube API key is missing from the server environment.' }, { status: 500 });
  }
  
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${encodeURIComponent(
    query
  )}&type=video&order=viewCount&key=${YOUTUBE_API_KEY}`;

  try {
    const response = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1 hour
    if (!response.ok) {
      const errorData = await response.json();
      console.error('YouTube API Error:', errorData);
      return NextResponse.json({ error: 'Failed to fetch from YouTube API.' }, { status: response.status });
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Network or other error fetching from YouTube API:', error);
    return NextResponse.json({ error: 'Failed to fetch videos.' }, { status: 500 });
  }
}
