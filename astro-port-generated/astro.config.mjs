// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://geoffreylitt.com',
  image: {
    // Disable image optimization for now to avoid missing image errors
    service: { entrypoint: 'astro/assets/services/noop' }
  },
  legacy: {
    collections: true
  },
  build: {
    // Disable minification for better HTML comparison with Middleman
    inlineStylesheets: 'never',
    format: 'preserve',
  },
  vite: {
    build: {
      minify: false,
      cssMinify: false,
    }
  }
});
