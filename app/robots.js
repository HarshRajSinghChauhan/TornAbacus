export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://torn-abacus.vercel.app/sitemap.xml',
  };
}
