# Mobile and Repository Folder Structure

**Status:** Proposed; create folders only when their milestone begins

```text
quran-school-management/
├── docs/
│   ├── architecture/
│   ├── product/
│   ├── quran/
│   ├── security/
│   ├── offline/
│   ├── testing/
│   └── deployment/
├── apps/
│   └── mobile/
│       ├── app/                  # Expo Router routes/layouts
│       ├── src/
│       │   ├── core/             # auth, config, errors, i18n, storage, theme
│       │   ├── features/         # feature-owned UI/hooks/use cases
│       │   ├── repositories/     # domain contracts + provider adapters
│       │   ├── services/         # cross-feature orchestration only
│       │   └── shared/           # generic controls/types/utilities
│       ├── assets/
│       └── tests/
├── supabase/
│   ├── migrations/
│   ├── functions/
│   ├── seed.sql
│   └── config/
├── packages/
│   ├── domain/                   # provider-independent shared domain types
│   ├── validation/               # shared input schemas when genuinely reused
│   └── shared-types/             # cross-app contracts only when needed
├── scripts/
└── .github/workflows/
```

Future `apps/api/` is added only if NestJS is approved. Avoid creating empty feature modules or packages. A feature owns its presentation and use cases; shared modules contain only generic behavior used by multiple features.

## Dependency Direction

```text
app routes → feature presentation → use cases/domain → repository interfaces
                                             ↑              ↑
                                         domain types   infrastructure adapters
```

Domain and feature logic must not depend on React Native screens, Supabase SDK types, or PostgreSQL row shapes. Supabase adapters map provider rows/errors at the infrastructure boundary.

## Ownership Rules

- Routes compose screens and access guards; keep business rules out of route files.
- Features own screens, forms, hooks, and feature-specific validation/use cases.
- `core/` is for cross-feature infrastructure, not a dumping ground for domain behavior.
- `shared/components` contains generic accessible controls, not feature-specific workflow components.
- Add `packages/` only when code is actually shared and has a clear independent contract.