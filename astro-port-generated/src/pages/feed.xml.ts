import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import sanitizeHtml from 'sanitize-html';
import MarkdownIt from 'markdown-it';

const parser = new MarkdownIt();

export async function GET(context) {
  const posts = await getCollection('posts');
  
  const publishedPosts = posts
    .filter(post => !post.data.hidden)
    .sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());

  return rss({
    title: 'Geoffrey Litt',
    description: 'Blog posts about programming tools, end-user programming, and other software topics',
    site: context.site || 'https://geoffreylitt.com',
    items: publishedPosts.map((post) => {
      const match = post.slug.match(/^(\d{4})-(\d{2})-(\d{2})-(.+)html$/);
      const url = match 
        ? `${match[1]}/${match[2]}/${match[3]}/${match[4]}/`
        : `${post.slug.replace(/html$/, '')}/`;
      
      return {
        title: post.data.title,
        pubDate: new Date(post.data.date),
        description: post.data.summary || post.data.title,
        content: sanitizeHtml(parser.render(post.body), {
          allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img'])
        }),
        link: `${context.site}/${url}`,
      };
    }),
  });
}