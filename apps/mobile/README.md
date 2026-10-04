# Qur'an School Mobile App

React Native + Expo + TypeScript mobile client for Qur'an School Management.

## Local Setup

Use Node.js `22.13.0` or another version allowed by `package.json` and the repository `.nvmrc`.

```powershell
Copy-Item .env.example .env
npm ci
npm run lint
npm run typecheck
```

Set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` in `.env` after starting the local Supabase stack. Never put a service-role key in this app.

From the repository root, initialize/start local Supabase with Docker available:

```powershell
npx supabase start
```

Start Expo from this directory:

```powershell
npm run start
```

The app uses local configuration until staging and production Supabase projects and EAS environment variables are provisioned. Public sign-up is disabled; first-admin bootstrap is an operator-only Edge Function protected by a server-side secret.

See the root [README](../../README.md) and [build task list](../../plan/BUILD_TASK_LIST.md) for repository setup and milestone status.
