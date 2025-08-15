// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  image: {
    // Disable image optimization for now to avoid missing image errors
    service: { entrypoint: 'astro/assets/services/noop' }
  },
  legacy: {
    collections: true
  }
});
