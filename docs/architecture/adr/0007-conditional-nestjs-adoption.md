# ADR 0007: Conditional NestJS Adoption

**Status:** Proposed
**Date:** 2026-10-04
**Owner:** Technical Lead; Product Owner

## Context

Supabase provides V1 authentication, PostgreSQL, RLS, and server-side functions with lower initial operating overhead. Future scoring, offline synchronization, integrations, reporting, and multi-client needs may justify a dedicated API, but a rewrite should not be scheduled without evidence.

## Decision

- Start with a modular Supabase-backed V1 and repository interfaces owned by the application.
- Evaluate NestJS when observed complexity warrants it: numerous complex Edge Functions, difficult transaction orchestration, background jobs, integrations, substantial reporting, multi-client business APIs, or SaaS tenancy requirements.
- If justified, migrate incrementally: begin with a bounded hybrid use case, keep Supabase PostgreSQL/Auth/Storage where appropriate, and preserve mobile repository contracts.
- Do not introduce NestJS solely because a milestone or version number has been reached.

## Consequences

- Supabase-specific code must remain within infrastructure adapters and server-side operations.
- A hybrid period requires explicit ownership of authorization and transaction boundaries across both backends.
- Migration requires contract tests, observability, deployment/recovery plans, and a measured comparison before expanding.
- Redis/BullMQ is also conditional and should be added only when background workload requires it.

## Alternatives Considered

- NestJS from day one: defer until business/API complexity justifies another service to operate.
- Rewrite the entire backend at a fixed V1.x date: rejected because the trigger should be evidence-based.
- Couple mobile features to Supabase directly: rejected because it makes a gradual backend transition harder.

## Review Gate

Review after V1 or when a listed complexity signal appears. Record evidence, migration scope, risk, and operational cost before implementing a NestJS service.