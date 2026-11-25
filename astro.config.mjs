// @ts-check
import { defineConfig } from 'astro/config';

// GitHub Pages:
//  - repo named <username>.github.io → site: 'https://<username>.github.io', base: '/'
//  - any other repo name, e.g. "piste-of-mind" → also set base: '/piste-of-mind'
export default defineConfig({
  site: 'https://zahra-cheeseman.github.io',
  base: '/',
});
