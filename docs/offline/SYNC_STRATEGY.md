# Offline Synchronization Strategy

**Status:** Design baseline; full offline writes deferred to 0.9
**Related:** [Security Plan](../security/SECURITY_PLAN.md), [Data Access](../architecture/DATA_ACCESS.md), [Test Strategy](../testing/TEST_STRATEGY.md)

## 1. Goals and Non-Goals

Allow a teacher to continue a limited workflow during connectivity loss without losing educational history, duplicating submissions, or bypassing permissions. Offline cache is not authoritative and cannot grant access.

Full offline writes are not part of 0.1. The design should keep repository contracts and mutation boundaries compatible with the later queue, but avoid unused placeholder modules until the 0.9 implementation.

## 2. Offline Data Scope

Potential read cache for later milestones:

- approved Qur'an text and edition metadata after licensing approval;
- recent authorized groups, rosters, assignments, and progress needed for a teaching session.

Cache the minimum data and shortest duration that supports the workflow. Before storing child data offline, verify platform storage protection/encryption requirements; Expo SQLite is not assumed encrypted at rest by default. Evaluate device-level file protection or an approved encrypted database approach. Partition all cache/queue records by authenticated user and school. Logout, account switch, membership revocation, and retention expiry clear or invalidate private state.

## 3. Mutation Record

Proposed local queue fields:

| Field | Purpose |
| --- | --- |
| `idempotency_key` | Stable globally unique mutation identity |
| `user_id`, `school_id` | Partition and identify the submitting actor/context; server still revalidates |
| `mutation_type` | Allow-listed command identifier, not arbitrary table name |
| `payload` | Minimum validated command data; encrypt/protect at rest as required |
| `payload_hash` | Detect reuse of a key with different content |
| `schema_version` | Version the queued command shape |
| `created_at` | Client event time for audit/context, never trusted as server time |
| `status` | `pending`, `syncing`, `synced`, `rejected`, or `conflict` |
| `attempt_count`, `last_error_code` | Safe retry diagnostics, no sensitive payload in logs |

Queue records are user data. Define expiry and handling of unsynced records on logout, account revocation, app removal, and account deletion before implementation.

## 4. Replay Protocol

1. When connectivity returns, acquire a per-user queue lock and process in deterministic order.
2. Refresh/authenticate the current session; do not trust cached roles or school access.
3. Submit an allow-listed command with its stable idempotency key and payload version.
4. Server rechecks active membership, role, group/student relationship, assignment state, and current domain rules.
5. Same key + same payload returns the original committed result. Same key + different payload is rejected.
6. Commit all related records atomically where possible; write audit/history with the mutation.
7. Mark local item `synced`, `rejected`, or `conflict` only after a definitive server response. Network timeout is retryable with the same key.

## 5. Conflict Policy

Never silently apply last-write-wins to lesson assessments, attendance corrections, or other historical student records.

| Conflict | Handling |
| --- | --- |
| Teacher lost group access while offline | Reject replay; do not write the assessment |
| Assignment cancelled/changed | Conflict or reject with current safe status; teacher must review |
| Same record assessed on another device | Return explicit conflict; preserve both attempts only if domain policy permits an attributed resolution |
| Student moved groups | Re-evaluate current authorization and historical assignment relationship; do not infer access from old cache |
| Duplicate retry | Return original result for same idempotency key and payload |
| Same key, changed payload | Reject; require a new user-confirmed mutation/key |
| Schema version no longer supported | Reject with recoverable update/review state; never reinterpret the payload silently |

Resolution UI must show only records the user is currently authorized to see. A rejected assessment is not silently discarded; provide a safe export/re-entry path if policy permits.

## 6. Privacy and Reliability Controls

- Use HTTPS/TLS for sync.
- Minimize fields in cached and queued payloads; never queue credentials or service keys.
- Protect local database files with platform storage controls or approved encryption after a documented threat review.
- Clear per-user cache and queue on logout/account switch; define whether unsynced work can be securely exported or must be explicitly resolved before sign-out.
- Enforce server-side idempotency with durable storage and a documented retention period.
- Bound retries with backoff; network retries reuse the exact key and payload.
- Log mutation ID and safe error code, not the full child-sensitive payload.
- Re-authorize every replay and test account/group revocation while offline.

## 7. Implementation and Test Gate

Implement only in milestone 0.9 after privacy and data-retention approval. Test process restart, duplicate retry, payload mutation, auth expiry, revoked account/group, stale assignment, multiple devices, storage protection, queue cleanup, and restore. Acceptance requires each mutation to commit at most once and all unresolved conflicts to remain explicit.