import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Social Pulse - Instagram & TikTok Analytics',
    short_name: 'Social Pulse',
    description: 'Find Trends. Analyze Content. Make Smarter Moves. - Neo-Brutalism SaaS',
    start_url: '/',
    display: 'standalone',
    background_color: '#F5F4EF',
    theme_color: '#D9FF3F',
    icons: [
      { src: '/icons/icon-72.png', sizes: '72x72', type: 'image/png' },
      { src: '/icons/icon-96.png', sizes: '96x96', type: 'image/png' },
      { src: '/icons/icon-128.png', sizes: '128x128', type: 'image/png' },
      { src: '/icons/icon-144.png', sizes: '144x144', type: 'image/png' },
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
