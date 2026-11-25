import type { ImageMetadata } from 'astro';
import { getImage } from 'astro:assets';

/**
 * Photos are picked up automatically from folders:
 *   src/photos/2026-11-25/*.jpg            → that ski day
 *   src/photos/off-piste/<file-name>/*.jpg → that off-piste post
 * Full-size phone photos are fine: they're resized and compressed when the site builds.
 * Photos are shown in file-name order, so name your favourite "01-…" to make it first.
 */
const files = import.meta.glob<{ default: ImageMetadata }>(
  '/src/photos/**/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}',
  { eager: true },
);

export type Photo = { thumb: string; full: string; alt: string };

export async function photosIn(folder: string): Promise<Photo[]> {
  const prefix = `/src/photos/${folder}/`;
  const matches = Object.entries(files)
    .filter(([path]) => path.startsWith(prefix) && !path.slice(prefix.length).includes('/'))
    .sort(([a], [b]) => a.localeCompare(b));
  return Promise.all(
    matches.map(async ([path, mod]) => {
      const [thumb, full] = await Promise.all([
        getImage({ src: mod.default, width: 800, format: 'webp' }),
        getImage({ src: mod.default, width: 2000, format: 'webp' }),
      ]);
      // file name → caption-ish alt text: "02-button-lift.jpg" → "button lift"
      const alt = path.split('/').pop()!.replace(/\.[^.]+$/, '').replace(/^\d+[-_ ]*/, '').replace(/[-_]/g, ' ');
      return { thumb: thumb.src, full: full.src, alt };
    }),
  );
}
