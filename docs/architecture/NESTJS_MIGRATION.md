# NestJS Migration Strategy

**Status:** Proposed future path; no NestJS service is approved for V1
**Related:** [ADR 0007](adr/0007-conditional-nestjs-adoption.md), [Data Access](DATA_ACCESS.md)

## 1. Principle and Trigger

V1 remains Supabase-first. Introduce NestJS only when observed complexity justifies a dedicated API, such as many complex trusted functions, difficult transaction orchestration, background jobs, multiple integrations, substantial reporting, multi-client business APIs, or SaaS tenancy. A roadmap version alone is not a trigger.

## 2. Stages

### Stage 1 — Supabase only (V1)

```text
React Native → repository contracts → Supabase Auth/PostgreSQL/RLS/RPC/Edge Functions
```

Keep business rules in domain/use-case contracts and trusted operations, not screens or ad hoc database calls.

### Stage 2 — Hybrid API

Move one bounded complex command to NestJS while simple, RLS-safe reads may remain in Supabase. Candidate commands include lesson submission, bulk homework assignment, or competition evaluation. Use a strangler approach; do not rewrite all features together.

```text
Mobile → repository adapter ─┬─ simple scoped reads → Supabase
                             └─ selected command → NestJS → PostgreSQL
```

### Stage 3 — NestJS as main business API

Move business operations incrementally behind NestJS. Supabase may continue as PostgreSQL hosting, Auth, Storage, and Realtime. Define one clear policy for every operation so Supabase direct access cannot bypass rules owned by the API.

### Stage 4 — Optional provider independence

Only when separately justified, replace Supabase-managed capabilities with independent identity, object storage, realtime, or workers. Treat each replacement as its own ADR and migration; full independence is not a V1 goal.

## 3. Migration Requirements

- Preserve mobile repository/domain contracts; add `NestApi...Repository` adapters rather than changing screens.
- Validate Supabase JWTs or an approved auth adapter at the API boundary; re-check active school membership and resource scope on every request.
- Keep database constraints and RLS as defense in depth. If API connections use elevated/bypass roles, explicitly prevent arbitrary cross-tenant access and document the boundary; prefer non-bypass roles and transaction-scoped tenant context where feasible.
- Move one operation at a time and compare behavior using the same contract and authorization tests.
- Plan idempotency, transaction boundaries, audit writes, observability, deploy/rollback, and data compatibility before moving writes.
- Operate hybrid failure modes: timeouts, retries, duplicate requests, and partial deployments must not duplicate educational events.

## 4. Readiness Signals

Before starting a migration, record evidence for the trigger, expected benefit, operating cost, target use case, security model, migration owner, rollback path, and success measures. Start with a proof-of-concept that can be disabled without data loss. Expand only after staging and production evidence shows the new path is safer or materially easier to operate.