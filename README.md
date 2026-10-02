# PlaySuper — In-Game Reward Drop Prototype

A clickable Next.js prototype for the PlaySuper Product Associate assignment.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Deploy

This is a plain Next.js app (App Router), so it deploys with zero config on:

- **Vercel** (recommended, made by the Next.js team): push this folder to a GitHub repo, then import it at vercel.com — it auto-detects Next.js and deploys.
- **Netlify**: same flow, select "Next.js" as the framework.

No environment variables or backend needed — everything is client-side state.

## What's in here

- `app/page.js` — the entire prototype: 5 screens (gameplay trigger, store home,
  product/checkout, post-purchase, retention hook), plus the full "Show product
  decisions & assumptions" panel with every decision and the reasoning behind it.
- `app/layout.js` — root layout, loads the Baloo 2 / Inter fonts.

## Stack

Next.js 15 (App Router), React 18, styled-jsx (built into Next.js, no extra
CSS dependency needed).
