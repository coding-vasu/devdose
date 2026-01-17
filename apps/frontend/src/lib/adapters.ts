import { Post, ContentCard, CardType } from '@/types/content';

/**
 * Adapter to convert API Post to frontend ContentCard
 */
export function adaptPostToContentCard(post: Post): ContentCard {
  // Map backend category to frontend type
  const categoryMapping: Record<string, CardType> = {
    'Quick Tips': 'quick-tip',
    'Common Mistakes': 'common-mistake',
    'Did You Know': 'did-you-know',
    'Quick Wins': 'quick-win',
    'Under the Hood': 'under-the-hood',
  };

  // Try to use backend category first, then fallback to tags, then default
  let type: CardType = 'quick-tip';
  if (post.category && categoryMapping[post.category]) {
    type = categoryMapping[post.category];
  } else {
    // Fallback to tags for backward compatibility or if category is missing
    const typeTag = post.tags.find(tag => 
      ['quick-tip', 'common-mistake', 'did-you-know', 'quick-win', 'under-the-hood'].includes(tag)
    );
    if (typeTag) type = typeTag as CardType;
  }

  return {
    id: post.id,
    type,
    title: post.title,
    codeSnippet: post.code,
    language: post.language,
    explanation: post.explanation,
    tags: post.tags,
    difficulty: post.difficulty,
    sourceName: post.source_name || 'DevDose',
    sourceUrl: post.source_url || '#',
    viewCount: post.view_count || 0,
    saveCount: post.bookmark_count || 0,
  };
}

/**
 * Adapter to convert array of Posts to ContentCards
 */
export function adaptPostsToContentCards(posts: Post[]): ContentCard[] {
  return posts.map(adaptPostToContentCard);
}
