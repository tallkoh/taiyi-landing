# Taiyi Almanac

TypeScript landing app for Taiyi's personalized weekly fengshui newsletter.

## Local Development

```bash
bun install
bun run dev
```

The dev server runs at `http://127.0.0.1:5173/` by default.

## Production Build

```bash
npm run build
```

The deployable static output is written to `dist/`.

## Deployment

This is a Vite TypeScript app and can deploy to any static host.

- Build command: `npm run build`
- Output directory: `dist`
- Node version: 22 works locally

For Vercel, Netlify, Cloudflare Pages, or Render static sites, use the build command and output directory above.
