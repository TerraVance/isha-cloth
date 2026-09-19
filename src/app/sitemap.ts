import { MetadataRoute } from 'next';
import { supabaseAdmin } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://ishacloth.com';

  // Fetch all active products
  const { data: products } = await supabaseAdmin
    .from('products')
    .select('id, created_at')
    .eq('status', 'active');

  const productUrls: MetadataRoute.Sitemap = (products || []).map((product) => ({
    url: `${baseUrl}/saree/${product.id}`,
    lastModified: new Date(product.created_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/collection`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/cart`,
      lastModified: new Date(),
      changeFrequency: 'never',
      priority: 0.5,
    },
  ];

  return [...staticUrls, ...productUrls];
}
