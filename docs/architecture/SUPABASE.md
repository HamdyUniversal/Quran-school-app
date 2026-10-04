# Supabase Architecture

**Status:** Proposed for V1; review alongside [Permissions](PERMISSIONS.md) and [Data Access](DATA_ACCESS.md)

## 1. Services Used

| Supabase capability | V1 responsibility |
| --- | --- |
| Auth | Staff accounts, optional eligible student accounts, sessions, activation, and recovery |
| PostgreSQL | School-scoped records, stable role/permission data, and audit history |
| RLS | Default-deny row-level access for every exposed school-owned table |
| SQL migrations | Versioned schema, constraints, indexes, seed data, and policy changes |
| RPC/database functions | Atomic and server-controlled database operations where transaction guarantees are needed |
| Edge Functions | Privileged Auth provisioning, external providers, and trusted operations not safe for direct clients |
| Storage | Not needed for 0.1; future files must use private buckets and authorized access |
| Realtime | Not needed for 0.1; later subscriptions must be narrowly scoped and authorization-tested |

## 2. Client Access Rules

- The app uses the public/anon key and the signed-in user's session. The service-role key is never included in the mobile app.
- Supabase SDK calls exist only in repository adapters.
- Direct queries are limited to RLS-safe reads and simple permitted changes. Select explicit columns, paginate lists, and map rows to domain types.
- User-submitted school/resource IDs are validated against authenticated membership and resource relationships; they are never authorization proof.
- RLS is enabled for every exposed school-owned table. Test each operation separately and verify policy behavior through the database/API boundary.
- Global Qur'an reference rows are read-only and are not tenant-owned.

## 3. Trusted Operations

Use a database transaction/RPC or Edge Function for:

- controlled first-school/admin bootstrap and Auth account provisioning;
- membership, role, and sensitive profile changes;
- any multi-row operation requiring atomicity or an audit record;
- later lesson submission, assessment amendment, homework bulk assignment, progress projection, point awards, competition evaluation, and sensitive notification creation.

Every trusted operation authenticates the caller and checks current membership, permission, school, target relationship, and input. Elevated credentials are isolated to server-side environment secrets. Avoid a general-purpose privileged endpoint that accepts arbitrary table/column writes.

## 4. Realtime, Storage, and Background Work

Defer Realtime and Storage until their feature milestones. When enabled:

- use private storage buckets, validate file type/size, and issue short-lived authorized URLs;
- subscribe only to the minimum event/resource scope and handle membership revocation;
- avoid sensitive child data in push payloads; use an authorized deep link to fetch details;
- use an outbox/durable delivery record if transactional event delivery is required.

Add workers/queues only when measured scheduled or retryable workloads justify them; do not add Redis/BullMQ by default.

## 5. Environment and Change Management

Maintain independent local, staging, and production Supabase projects. Commit SQL migrations and seed definitions; run them in CI on an empty database and from the previous schema. Promote changes to staging before production. Keep project references and public keys environment-specific, and keep privileged credentials in protected CI/server secret stores.

## 6. Review Gate

Technical Lead reviews RLS coverage, function privilege boundaries, connection/secrets handling, environment separation, and recovery behavior before implementation. Security and authorization test requirements are in [TEST_STRATEGY.md](../testing/TEST_STRATEGY.md).