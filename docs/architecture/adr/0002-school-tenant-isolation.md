# ADR 0002: School Tenant Isolation

**Status:** Proposed
**Date:** 2026-10-04
**Owner:** Technical Lead; Product Owner

## Context

The first release serves one school, but records must not need a redesign when additional schools are supported. Users may have different roles or memberships by school, and client-supplied identifiers cannot be trusted as authorization.

## Decision

- Model authenticated identity separately from school membership and role grants.
- Put a `school_id` on every school-owned operational record.
- Enforce tenant and resource scope with default-deny PostgreSQL RLS and tenant-safe constraints.
- Derive active school access from the authenticated user's active membership and effective permissions; never authorize from a submitted `school_id` alone.
- Treat global Qur'an reference data as read-only and outside school tenancy.
- Apply the same authorization rules to queries, mutations, exports, realtime, storage, and offline replay as each feature is introduced.

## Consequences

- Every feature must include tenant scoping in its schema, policies, and tests.
- Composite constraints and RLS tests are required to prevent cross-school references and IDOR.
- Trusted functions using elevated database credentials must repeat caller and resource authorization.
- Local caches must be partitioned by user/school and never treated as authorization evidence.

## Alternatives Considered

- A single role field on the user: insufficient for school-specific roles and future memberships.
- UI-only school filtering: rejected because clients can be modified and direct requests can bypass screens.
- Add RLS only when multi-school launches: rejected because foundation data and relationships would already be exposed to tenant assumptions.

## Review Gate

Technical Lead and Product Owner review the final permission model against [PERMISSIONS.md](../PERMISSIONS.md). Do not use real student data until the direct database/API denial tests pass.