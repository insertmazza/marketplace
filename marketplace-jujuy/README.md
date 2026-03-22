# 🌵 Compra en Jujuy — Marketplace

Clasificados gratuitos para toda la provincia de Jujuy, Argentina.

## Stack
- **Frontend**: HTML + React (CDN) — sin Node.js ni build
- **Base de datos**: Supabase (free tier)
- **Imágenes**: Cloudflare R2 (10GB gratis)
- **Deploy**: Cloudflare Pages (auto-deploy en cada push)
- **API subida**: Cloudflare Worker

## Archivos del proyecto

| Archivo | Para qué sirve |
|---|---|
| `index.html` | Entrada de la app, carga React desde CDN |
| `app.jsx` | Todo el frontend del marketplace |
| `config.js` | Tus credenciales (**NO sube a GitHub**) |
| `supabase.js` | Cliente de Supabase |
| `upload.js` | Compresión y subida de imágenes a R2 |
| `worker-upload.js` | Pegalo en el editor de Cloudflare Workers |
| `supabase-setup.sql` | Ejecutalo en Supabase → SQL Editor |
| `_headers` | Headers de Cloudflare Pages |

## Setup rápido

1. Completá `config.js` con tus credenciales
2. Ejecutá `supabase-setup.sql` en Supabase → SQL Editor
3. Creá el Worker en Cloudflare y pegá `worker-upload.js`
4. Conectá este repo a Cloudflare Pages
5. Listo 🚀

## Costo mensual: $0
