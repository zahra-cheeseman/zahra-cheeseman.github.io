// RSS feed of ski days at /rss.xml.
// Newsletter tools (Buttondown, Mailchimp, Substack…) can watch this feed and email
// every new ski day to subscribers automatically: no copy-pasting.
import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE } from '../site.config';
import { getDays, resortName, fmt } from '../lib/data';
import { photosIn } from '../lib/photos';

export async function GET(context: APIContext) {
  const site = context.site!;
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const abs = (p: string) => new URL(`${base}${p}`, site).toString();
  const days = await getDays();

  const items = await Promise.all(
    days.map(async ({ entry, n, session }) => {
      const link = abs(`/days/${entry.id}/`);
      const photo = (await photosIn(entry.id))[0];
      const facts = [resortName(entry.data.location), entry.data.temp, entry.data.weather].filter(Boolean).join(' · ');
      const stats = session
        ? `<p><strong>Ski:IQ ${session.skiIQ}</strong> · ${session.runs} runs · ${fmt(session.verticalM)} m vertical · ${fmt(session.topSpeedKmh, 1)} km/h top speed · ${session.falls} falls</p>`
        : '';
      return {
        title: `Day ${n}: ${entry.data.title}`,
        link,
        pubDate: new Date(entry.id + 'T18:00:00'),
        description: entry.data.summary,
        content: [
          `<p>${facts}</p>`,
          photo ? `<p><img src="${new URL(photo.thumb, site)}" alt="${photo.alt}" width="600" /></p>` : '',
          stats,
          `<p>${entry.data.summary}</p>`,
          `<p><a href="${link}">Read the full day and see the photos →</a></p>`,
        ].join(''),
      };
    }),
  );

  return rss({
    title: `${SITE.name}: ski days`,
    description: SITE.description,
    site,
    items,
  });
}
