# HaloBloc Back Office — Hostinger Deploy Notes

**Stack:** React + Vite + TypeScript (HashRouter)  
**Persistence:** LocalStorage (no backend)  
**Hosting target:** Hostinger (static site)

## Hostinger Git Settings
- **Build command:** `npm ci && npm run build`
- **Publish directory:** `dist`
- **Deployment path:** `public_html`
- **Node version:** `>=20` (use `.nvmrc` or `"engines"` in `package.json`)
- **Routing:** HashRouter (no `.htaccess` SPA rewrite required)
- **Vite base:** `/` (use `/<subfolder>/` only if deploying under a subdirectory)
- **Do not commit:** `dist/` when using server builds

## Deploy (Git on Hostinger)
1. hPanel → **Advanced → Git → Connect repository** (use SSH URL; add Deploy Key as read-only).
2. Set the values above and **Deploy**. (Optional: enable Auto deployment on push.)

## Manual Upload (optional)
Build locally (`npm ci && npm run build`) and upload the **contents** of `dist/` to `public_html/`.

