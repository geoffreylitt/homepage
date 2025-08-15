import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.string(),
    tags: z.array(z.string()).optional().nullable(),
    image_url: z.string().optional(),
    summary: z.string().optional(),
    starred: z.boolean().optional(),
    hidden: z.boolean().optional(),
  }),
});

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    // layout field is ignored in Astro 5, we'll handle it in the component
  }),
});

export const collections = {
  posts,
  projects,
};