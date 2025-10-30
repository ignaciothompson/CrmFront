# Deployment

Deploying the SPA (Single Page Application) to Vercel (or any static host).

## Build artifacts

- Run `npm run build` → outputs to `dist/crm-dashboard-fe/`
- Use the `dist/crm-dashboard-fe` folder as the publish directory

## Vercel configuration

The repo includes `vercel.json` with SPA rewrites:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

This ensures client-side routes resolve to `index.html`.

## Environment

- Production Angular environment comes from `src/environments/environment.ts`
- Ensure Firebase production keys are correct and authorized for your domains

## Steps

1. Configure a Vercel project pointing to this repo
2. Build command: `npm run build`
3. Output directory: `dist/crm-dashboard-fe`
4. Set any required environment variables in Vercel (if needed later)
5. Deploy

## Post-deploy checks

- Navigation across deep links (e.g., `/unidades/form/123`) works
- Auth flows redirect correctly between `/login` and protected routes
- Public routes (`/proyecto/:id`, `/comparacion/:id`) load without auth
