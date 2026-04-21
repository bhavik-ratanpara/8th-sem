import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['genkit', '@genkit-ai/google-genai', '@genkit-ai/core', '@genkit-ai/ai'],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  allowedDevOrigins: [
    '6000-firebase-studio-1766594294520.cluster-osvg2nzmmzhzqqjio6oojllbg4.cloudworkstations.dev',
    '9000-firebase-studio-1766594294520.cluster-osvg2nzmmzhzqqjio6oojllbg4.cloudworkstations.dev',
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;