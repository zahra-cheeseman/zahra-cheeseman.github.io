#!/usr/bin/env node
// Start a new ski day.
//   npm run new-day                 → today
//   npm run new-day -- 2026-11-28   → a specific date
// Creates: the diary file, a photo folder, and a blank row in sessions.json for the Carv numbers.
import fs from 'node:fs';

const date = process.argv[2] ?? new Date().toISOString().slice(0, 10);
if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
  console.error('Date should look like 2026-11-28');
  process.exit(1);
}

const md = `src/content/days/${date}.md`;
if (fs.existsSync(md)) {
  console.log('Already exists:', md);
} else {
  fs.writeFileSync(md, `---
title: ""
location: muttereralm   # a key from src/data/resorts.json
temp: ""                # e.g. "−4°C"
weather: ""             # e.g. "Sunny, smug"
summary: ""             # one line, shown in the list and the email
---

Write the day here.
`);
  console.log('Diary:  ', md);
}

const photos = `src/photos/${date}`;
fs.mkdirSync(photos, { recursive: true });
console.log('Photos: ', photos + '/');

const file = 'src/data/sessions.json';
const sessions = JSON.parse(fs.readFileSync(file, 'utf8'));
if (!sessions.some((s) => s.date === date)) {
  sessions.push({ date, resort: 'muttereralm', skiIQ: 0, runs: 0, verticalM: 0, topSpeedKmh: 0, turns: 0, timeOnSnowMin: 0, falls: 0 });
  sessions.sort((a, b) => a.date.localeCompare(b.date));
  fs.writeFileSync(file, JSON.stringify(sessions, null, 2) + '\n');
  console.log('Numbers:', file, '(fill in from the Carv app)');
}
