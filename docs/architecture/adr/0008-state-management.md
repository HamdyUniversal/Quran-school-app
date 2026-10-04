# ADR 0008: State Management

**Status:** Proposed
**Date:** 2026-10-04
**Owner:** Product Owner; Technical Lead

## Context

The React Native app needs clear ownership for remote server data, transient UI state, forms, validation, and later offline persistence. Duplicated caches and client-owned derived learning totals risk stale or misleading student data.

## Decision

- Use TanStack Query for remote/server state and query caching.
- Use Zustand sparingly for ephemeral local UI state; do not mirror remote entities there.
- Use React Hook Form for forms and Zod for input validation.
- Use Supabase Auth with secure device persistence for sessions; never persist passwords.
- Defer durable SQLite records and mutation queues to the offline milestone; cached data never authorizes access.

## Consequences

- Features must define query keys, invalidation behavior, pagination, and error states.
- Security-sensitive/historical writes should not use optimistic success.
- Logout and account/school changes must invalidate private cached data.
- Tool versions and Expo compatibility are pinned during project setup and validated in CI.

## Alternatives Considered

- Zustand as the single source for server and UI state: rejected because remote cache invalidation and synchronization need dedicated server-state semantics.
- Store all server state in component state: rejected because it duplicates fetching, caching, and error handling.
- Persist all queries by default: rejected because student records require explicit privacy review and cache partitioning.

## Review Gate

Product Owner and Technical Lead approve package versions and persistence behavior before app scaffolding. Verify cache clearing, invalidation, and data ownership with 0.1 workflows.