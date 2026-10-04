# Qur'an School Management

Arabic-first mobile app for one initial Qur'an school, built with React Native, Expo, TypeScript, and Supabase.

## Project Status

The app is in milestone 0.1, Foundation. Follow [the build task list](plan/BUILD_TASK_LIST.md) and [the approved V1 planning baseline](docs/architecture/DESIGN_READINESS.md). Do not use real student data until the security and privacy gates are approved.

## Prerequisites

- Node.js `22.13.0` or another version supported by the pinned Expo/React Native toolchain.
- npm.
- Expo Go for device preview, or Android Studio/Xcode for native development builds.
- Supabase local CLI and Docker for local database/auth testing; cloud credentials are not committed.

Use the repository's `.nvmrc` with a Node version manager, then install the app dependencies:

```powershell
npm ci --prefix apps/mobile
npm run lint --prefix apps/mobile
npm run typecheck --prefix apps/mobile
```

Start Expo:

```powershell
npm run start --prefix apps/mobile
```

For platform targets:

```powershell
npm run android --prefix apps/mobile
npm run ios --prefix apps/mobile
npm run web --prefix apps/mobile
```

Create `apps/mobile/.env` from `apps/mobile/.env.example` when configuring a local Supabase project. Never put service-role credentials in the mobile app. Keep development, staging, and production credentials separate.

## Documentation

- [Step-by-step build task list](plan/BUILD_TASK_LIST.md)
- [Product requirements](docs/product/PRD.md)
- [Security and privacy plan](docs/security/SECURITY_PLAN.md)
- [Architecture decision records](docs/architecture/adr/README.md)