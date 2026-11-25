import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// One file per ski day: src/content/days/2026-11-25.md (the file name is the date)
const days = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/days' }),
  schema: z.object({
    title: z.string(),
    location: z.string(), // a key from src/data/resorts.json, e.g. "muttereralm"
    temp: z.string().optional(), // e.g. "−4°C"
    weather: z.string().optional(), // e.g. "Sunny, smug"
    summary: z.string(), // one line, shown in lists and emails
  }),
});

// Everything that isn't skiing: src/content/off-piste/christmas-markets.md
const offPiste = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/off-piste' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    category: z.string().default('life'), // food, adventure, life… anything
    summary: z.string(),
  }),
});

export const collections = { days, offPiste };
