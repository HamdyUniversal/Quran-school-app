# State Management Strategy

**Status:** Proposed for Product Owner and Technical Lead review

## 1. Ownership by State Type

| State | Owner | Examples |
| --- | --- | --- |
| Remote/server state | TanStack Query | Profiles, memberships, school settings, paginated people lists, future groups/homework/progress |
| Ephemeral cross-screen UI state | Zustand, sparingly | Unsaved UI-only selection or transient navigation preference |
| Form state | React Hook Form | Login, profile edit, student/teacher forms |
| Input validation | Zod schemas shared with use cases where appropriate | Required fields, locale, password constraints, Qur'an range input in later milestone |
| Authentication secrets/session | Supabase Auth SDK + Expo SecureStore-supported persistence | Provider-managed access/refresh session; never passwords |
| Durable offline data | Expo SQLite only when introduced in 0.9 | Partitioned cache and pending mutation queue |

## 2. Rules

- Do not mirror server entities into Zustand. TanStack Query is the client cache for remote state.
- Components render query/mutation state and dispatch use cases; repository adapters own network/provider work.
- Invalidate/refetch relevant query keys after mutations; do not hand-edit derived progress, scores, or points in client state.
- Scope query caches by authenticated identity and active school where applicable. Clear private data on logout, account change, or membership/school switch.
- Cached data is a convenience, never an authorization source. Server policies decide access on every request.
- Keep forms local and disposable. Client validation improves feedback but server validation remains authoritative.
- Keep Zustand small and non-persistent unless a specific privacy-reviewed use case requires persistence.
- Offline state and replay status are explicit domain states, not optimistic success; full write sync is deferred to 0.9.

## 3. Query and Mutation Conventions

- Define stable query-key factories by feature and include user/school scope where the resource is scoped.
- Use cursor/page-based pagination for growing lists; do not download all school records.
- Normalize provider errors in repositories before they reach hooks/screens.
- Mutations expose pending/success/error states and invalidate affected queries. Conflict and permission errors must remain distinguishable from generic failures.
- Avoid optimistic updates for assessments, attendance, role changes, or other historical/security-sensitive data.

## 4. Review Gate

Approve package versions and persistence behavior during app scaffolding. Test logout/cache clearing, Arabic/English form errors, and query invalidation before 0.1 release.