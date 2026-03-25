import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/settings/', '/payment/'],
    },
    sitemap: 'https://hatcher.markets/sitemap.xml',
  };
}
