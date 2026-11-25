import { getCollection, type CollectionEntry } from 'astro:content';
import realSessions from '../data/sessions.json';
import demoSessions from '../data/demo-sessions.json';
import resortsJson from '../data/resorts.json';
import { SITE } from '../site.config';

/** One day of Carv data. Copy these numbers from the Carv app after each day. */
export type Session = {
  date: string; // 2026-11-25
  resort: string; // key from resorts.json
  skiIQ: number;
  runs: number;
  verticalM: number;
  topSpeedKmh: number;
  turns: number;
  timeOnSnowMin: number;
  falls: number; // not a Carv metric. Should be.
};
export type Resort = { name: string; lat: number; lng: number; label?: 'left' | 'right' | 'above' | 'below' };

export const resorts = resortsJson as Record<string, Resort>;
export const resortName = (key: string) => resorts[key]?.name ?? key;

export const sessions: Session[] = ((SITE.useDemoData ? demoSessions : realSessions) as Session[])
  .slice()
  .sort((a, b) => a.date.localeCompare(b.date));

export const sessionFor = (date: string) => sessions.find((s) => s.date === date);
export const latest = sessions.at(-1);
export const first = sessions[0];

const sum = (k: keyof Session) => sessions.reduce((t, s) => t + (s[k] as number), 0);
export const totals = {
  days: sessions.length,
  runs: sum('runs'),
  hours: Math.round(sum('timeOnSnowMin') / 6) / 10,
  verticalM: sum('verticalM'),
  topSpeedKmh: Math.max(0, ...sessions.map((s) => s.topSpeedKmh)),
  turns: sum('turns'),
  falls: sum('falls'),
  resorts: new Set(sessions.map((s) => s.resort)).size,
  skiIQ: latest?.skiIQ ?? 0,
  skiIQGain: (latest?.skiIQ ?? 0) - (first?.skiIQ ?? 0),
};

/** Days on snow per resort, most first. */
export const resortVisits = Object.entries(
  sessions.reduce<Record<string, number>>((m, s) => ((m[s.resort] = (m[s.resort] ?? 0) + 1), m), {}),
)
  .map(([key, days]) => ({ key, name: resortName(key), days }))
  .sort((a, b) => b.days - a.days);

/** Diary entries, newest first, with their day number and Carv numbers attached. */
export async function getDays() {
  const entries = await getCollection('days');
  const byDate = entries.slice().sort((a, b) => a.id.localeCompare(b.id));
  return byDate
    .map((entry, i) => ({ entry, n: pad(i + 1), session: sessionFor(entry.id) }))
    .reverse();
}
export type Day = Awaited<ReturnType<typeof getDays>>[number];
export type DayEntry = CollectionEntry<'days'>;

export const pad = (n: number) => String(n).padStart(2, '0');
export const fmt = (n: number, dec = 0) =>
  n.toLocaleString('en-GB', { minimumFractionDigits: dec, maximumFractionDigits: dec });
export const fmtDate = (d: string, style: 'short' | 'long' = 'short') =>
  new Date(d + 'T12:00:00').toLocaleDateString(
    'en-GB',
    style === 'long'
      ? { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
      : { weekday: 'short', day: '2-digit', month: '2-digit' },
  ).replace(',', '');

/** Prefix internal links with the base path (needed if the repo isn't <user>.github.io). */
export const url = (path: string) => `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
