# ADR 0006: Offline Mutation Replay

**Status:** Proposed; full offline writes deferred to milestone 0.9
**Date:** 2026-10-04
**Owner:** Technical Lead; Product Owner

## Context

Teachers may have limited connectivity. Replaying sensitive lesson mutations later creates risks from duplicate submissions, stale assignment state, changed group access, and concurrent assessments.

## Decision

- Design mutations for replay safety early, but defer full offline writes until milestone 0.9.
- Give every replayable mutation a stable idempotency key, actor, school, type, schema version, payload hash, and creation time.
- Re-check current authentication, membership, permission, and resource state on the server at replay time.
- Same key plus same payload returns the original result; same key plus different payload is rejected.
- Represent conflicts explicitly for teacher resolution. Never use silent last-write-wins for educational assessment data.
- Partition local data by user/school and remove or invalidate private state on logout/account switch.

## Consequences

- Trusted replay endpoints need idempotency storage and retention rules.
- Offline UX must distinguish pending, synced, rejected, and conflict states.
- Revoked access may cause a queued mutation to fail; the user must receive a safe explanation without leaking unrelated records.
- Multi-device and restart tests are mandatory before offline writes launch.

## Alternatives Considered

- Last-write-wins: rejected because it can silently overwrite educational history.
- Treat local cache as authoritative: rejected because permissions and assignments can change while offline.
- Implement all offline writes in 0.1: rejected because it adds high-risk synchronization before core workflows are validated.

## Review Gate

Finalize payload/versioning, idempotency retention, conflict resolution UI, and replay authorization before milestone 0.9.