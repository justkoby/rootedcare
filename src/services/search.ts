import { supabase } from '../lib/supabase';

export type SearchResult = {
  id: string;
  type: 'herb' | 'wellness' | 'article';
  title: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
};

export async function searchRootedCare(
  searchTerm: string
): Promise<SearchResult[]> {
  const term = searchTerm.trim();

  if (!term) {
    return [];
  }

  const [herbsResponse, wellnessResponse, articlesResponse] =
    await Promise.all([
      supabase
        .from('herbs')
        .select(
          'id, name, slug, short_description, image_url'
        )
        .eq('is_published', true)
        .or(
          `name.ilike.%${term}%,short_description.ilike.%${term}%,scientific_name.ilike.%${term}%`
        )
        .limit(10),

      supabase
        .from('wellness_concerns')
        .select(
          'id, name, slug, summary, image_url'
        )
        .eq('is_published', true)
        .or(
          `name.ilike.%${term}%,summary.ilike.%${term}%`
        )
        .limit(10),

      supabase
        .from('articles')
        .select(
          'id, title, slug, excerpt, short_description, image_url, cover_image_url'
        )
        .eq('is_published', true)
        .or(
          `title.ilike.%${term}%,excerpt.ilike.%${term}%,short_description.ilike.%${term}%`
        )
        .limit(10),
    ]);

  if (herbsResponse.error) {
    console.error(
      'Herb search error:',
      herbsResponse.error
    );
  }

  if (wellnessResponse.error) {
    console.error(
      'Wellness search error:',
      wellnessResponse.error
    );
  }

  if (articlesResponse.error) {
    console.error(
      'Article search error:',
      articlesResponse.error
    );
  }

  const herbs: SearchResult[] = (
    herbsResponse.data ?? []
  ).map((herb) => ({
    id: herb.id,
    type: 'herb',
    title: herb.name,
    slug: herb.slug,
    description: herb.short_description,
    imageUrl: herb.image_url,
  }));

  const wellness: SearchResult[] = (
    wellnessResponse.data ?? []
  ).map((item) => ({
    id: item.id,
    type: 'wellness',
    title: item.name,
    slug: item.slug,
    description: item.summary,
    imageUrl: item.image_url,
  }));

  const articles: SearchResult[] = (
    articlesResponse.data ?? []
  ).map((article) => ({
    id: article.id,
    type: 'article',
    title: article.title,
    slug: article.slug,
    description:
      article.excerpt ??
      article.short_description,
    imageUrl:
      article.image_url ??
      article.cover_image_url,
  }));

  return [...herbs, ...wellness, ...articles];
}
