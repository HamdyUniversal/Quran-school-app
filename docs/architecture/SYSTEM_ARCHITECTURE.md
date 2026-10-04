# System Architecture

**Status:** Proposed V1 architecture for Product Owner and Technical Lead review
**Scope:** React Native app, Supabase-first V1, conditional NestJS future

## 1. V1 System Shape

```mermaid
flowchart LR
    Screens[React Native + Expo screens] --> Features[Feature hooks and use cases]
    Features --> Contracts[Domain repository contracts]
    Contracts --> Adapters[Supabase adapters]
    Adapters --> Auth[Supabase Auth]
    Adapters --> DB[(Supabase PostgreSQL + RLS)]
    Adapters --> Functions[RPC / Edge Functions for trusted commands]
    Functions --> DB
    DB --> Shared[Approved global Qur'an data, read-only]
    Mobile[Mobile app] -. future cache/sync, 0.9 .-> SQLite[(Partitioned Expo SQLite)]
    Functions -. future durable events .-> Outbox[(Outbox / notifications)]
```

The local SQLite cache, durable outbox, notification dispatch, and reader data path are future capabilities, not 0.1 implementations. The first-school bootstrap runs through a controlled operator process; it is not a public mobile API.

## 2. Trust Boundaries

- The mobile app is an untrusted client. It may contain only public Supabase configuration and user session material managed by the auth SDK.
- PostgreSQL RLS is the final access boundary for direct client reads and permitted simple writes.
- RPC and Edge Functions own privileged Auth operations and atomic, high-impact business commands. Each validates the caller, current school membership, permissions, resource scope, and input.
- Deployment secrets and service-role credentials are trusted server-side only; they are never shipped to devices.
- External Qur'an content, fonts, translations, audio, and push providers are separate sources with separate provenance and licenses.

## 3. Mobile Module Boundaries

- `app/` owns routes, protected route groups, and root composition.
- `features/` owns role workflows, feature UI, hooks, and use cases.
- `core/` owns cross-feature auth, configuration, localization, storage, errors, and shared infrastructure.
- `repositories/` contains domain contracts and provider adapters; feature UI imports contracts, not Supabase SDK types.
- `packages/domain` and `packages/validation` hold reusable provider-independent models and schemas only when multiple app modules need them.

Keep a modular monolith. Do not introduce microservices or background workers until measured needs justify their operational cost.

## 4. Backend Responsibilities

Supabase provides authentication, PostgreSQL, RLS, SQL migrations, and selected RPC/Edge Functions. Simple reads and low-risk CRUD can use repositories directly when policies are complete. Account provisioning, bootstrap, role changes, historical amendments, lesson transactions, derived progress, points, bulk assignment, and sensitive notifications are server-controlled.

The same domain use cases may later be hosted in NestJS. Mobile repository contracts remain stable while adapters transition incrementally.

## 5. Environments and Operations

Use separate local, staging, and production Supabase projects/configuration. Apply versioned migrations through controlled CI/CD, validate them on staging, and promote identifiable app builds. Backup, restore, monitoring, and rollback practices are defined in [DEPLOYMENT.md](../deployment/DEPLOYMENT.md).

## 6. Review Gates

- Product Owner and Technical Lead approve Expo/TypeScript/Supabase decisions before project scaffolding.
- RLS and privileged-command tests pass before real student data is used.
- Architecture changes are recorded as ADR updates; NestJS adoption follows [NESTJS_MIGRATION.md](NESTJS_MIGRATION.md), not a calendar/version trigger.