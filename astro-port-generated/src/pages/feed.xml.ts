import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = await getCollection('posts');
  
  // Filter out hidden posts and sort by date (newest first)
  const publishedPosts = posts
    .filter(post => !post.data.hidden)
    .sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());

  const site = context.site || 'https://geoffreylitt.com';

  return rss({
    title: 'Geoffrey Litt',
    description: 'Blog posts about programming tools, end-user programming, and other software topics',
    site: site,
    items: publishedPosts.map((post) => {
      // Generate URL matching our routing pattern
      const match = post.slug.match(/^(\d{4})-(\d{2})-(\d{2})-(.+)html$/);
      let url;
      if (match) {
        const [_, year, month, day, title] = match;
        url = `${year}/${month}/${day}/${title}/`;
      } else {
        url = `${post.slug.replace(/html$/, '')}/`;
      }
      
      return {
        title: post.data.title,
        pubDate: new Date(post.data.date),
        description: post.data.summary || post.data.title,
        content: post.body, // Use raw markdown body for content
        link: `${site}/${url}`,
      };
    }),
  });
}