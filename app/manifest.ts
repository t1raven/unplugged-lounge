import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '언플러그드 라운지',
    short_name: '언플러그드',

    start_url: '/',
    scope: '/',
    display: 'standalone',

    background_color: '#ffffff',
    theme_color: '#ffffff',

    icons: [
      {
        src: '/icons/web-app-manifest-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/web-app-manifest-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
