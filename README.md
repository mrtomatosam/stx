# STX

Public site for STX.

See live demo: https://mrtomatosam.github.io/stx/

## Security model

This project cannot store secrets in GitHub Pages. GitHub Pages is a static hosting service, so any secret placed in a public repository or static asset becomes accessible to anyone inspecting the browser or repository.

Use this model instead:

- GitHub Pages for the public frontend
- Vercel or another private backend for privileged operations
- Supabase with Row Level Security (RLS) enabled
- `anon` keys only in the browser
- `service_role` keys only in server-side environment variables

Never commit `.env` files or service secrets to the repository.

## Environment variables

The backend under `server` expects:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PORT`
- `ALLOWED_ORIGINS` (optional, comma-separated list)

Create a local `.env` file in `server/` and keep it out of source control.

