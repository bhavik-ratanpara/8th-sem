'use server';

import {NextResponse} from 'next/server';
import {PlaceHolderImages} from '@/lib/placeholder-images';

// This is mock data. In a real application, you would fetch this from the YouTube API.
// I have updated the video IDs to be real YouTube videos so clicking them works.
// To make the search functional, you need to replace this mock data with a real API call.
const mockVideos = [
  {
    id: {videoId: 'sJ3fG0j3258'},
    snippet: {
      title: 'Amazing Recipe Video',
      channelTitle: 'Chef John',
      thumbnails: {
        medium: {
          url: PlaceHolderImages[0]?.imageUrl || 'https://placehold.co/320x180',
        },
      },
    },
  },
  {
    id: {videoId: '0KEpKa-z3-c'},
    snippet: {
      title: 'The Best Way to Cook',
      channelTitle: 'Food Wishes',
      thumbnails: {
        medium: {
          url: PlaceHolderImages[1]?.imageUrl || 'https://placehold.co/320x180',
        },
      },
    },
  },
  {
    id: {videoId: 'bbz35w_35sI'},
    snippet: {
      title: 'Quick & Easy Dinner',
      channelTitle: 'Pro Home Cooks',
      thumbnails: {
        medium: {
          url: PlaceHolderImages[2]?.imageUrl || 'https://placehold.co/320x180',
        },
      },
    },
  },
  {
    id: {videoId: 'ZZg5-A06-uE'},
    snippet: {
      title: 'Learn to Cook Like a Pro',
      channelTitle: 'Gordon Ramsay',
      thumbnails: {
        medium: {
          url: PlaceHolderImages[3]?.imageUrl || 'https://placehold.co/320x180',
        },
      },
    },
  },
  {
    id: {videoId: 'J7A9e324-7M'},
    snippet: {
      title: 'Secret Family Recipe',
      channelTitle: 'Joshua Weissman',
      thumbnails: {
        medium: {
          url: PlaceHolderImages[4]?.imageUrl || 'https://placehold.co/320x180',
        },
      },
    },
  },
];

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json(
      {error: 'Query parameter "q" is required.'},
      {status: 400}
    );
  }

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // =================================================================================
  // TODO: Replace mock data with a real YouTube API call.
  // 1. Get a YouTube Data API v3 key from the Google Cloud Console.
  // 2. Add it to your environment variables as YOUTUBE_API_KEY.
  //    (You can add it to your .env file for local development).
  // 3. Uncomment and use the code below to fetch real data.
  // =================================================================================
  /*
  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
  if (!YOUTUBE_API_KEY) {
    return NextResponse.json({ error: 'YouTube API key is missing.' }, { status: 500 });
  }
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${encodeURIComponent(
    query
  )}&type=video&key=${YOUTUBE_API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json();
      console.error('YouTube API Error:', errorData);
      return NextResponse.json({ error: 'Failed to fetch from YouTube API.' }, { status: response.status });
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Network or other error:', error);
    return NextResponse.json({ error: 'Failed to fetch from YouTube API.' }, { status: 500 });
  }
  */
  // =================================================================================
  // End of section to replace. The code below uses mock data.
  // =================================================================================

  const results = mockVideos.map(video => ({
    ...video,
    snippet: {
      ...video.snippet,
      title: `How to make ${query} - ${video.snippet.channelTitle}`,
    },
  }));

  return NextResponse.json({items: results});
}
