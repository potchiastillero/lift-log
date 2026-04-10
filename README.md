# Lift Log

Lift Log is a minimal, fast workout logging app built for daily use during workouts. It focuses on speed over features: templates, one-tap-ish set logging, previous-set autofill, progression history, and notes that carry forward to the next time you lift.

## What it includes

- Reusable workout templates
- Start-a-workout flow from a template
- Fast set logging with weight and reps
- Previous-set autofill per exercise
- Progression history per lift
- Exercise notes for next time
- Recent log browser with delete
- Replit-inspired light and dark themes
- PWA install support for phone home-screen use

## Tech stack

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- Lucide icons
- Local-first browser storage

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy for phone use

The easiest free path is:

1. Push this repo to GitHub
2. Import the GitHub repo into Vercel
3. Deploy
4. Open the deployed URL on your iPhone in Safari
5. Tap `Share` -> `Add to Home Screen`

## PWA notes

This project includes:

- a web app manifest
- install icons
- Apple touch icon support
- standalone mobile web app metadata
- service worker registration in production

Install behavior is best tested on a deployed production URL rather than local development.
