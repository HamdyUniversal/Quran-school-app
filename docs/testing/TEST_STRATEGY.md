# Test Strategy

**Scope:** React Native + Expo + Supabase V1
**Status:** Baseline for Technical Lead review
**Related:** [Permissions](../architecture/PERMISSIONS.md), [Data Access](../architecture/DATA_ACCESS.md), [Security Plan](../security/SECURITY_PLAN.md)

## 1. Quality Goals

- Prevent cross-school, cross-group, and cross-student data access.
- Preserve correct Qur'an references and reliable educational history.
- Keep provider-specific behavior behind repositories and trusted server operations.
- Verify Arabic/RTL and English/LTR layouts on supported devices.
- Test migrations, restore, and release behavior before production data is used.
- Use synthetic data in development and CI; never copy production child records into test environments.

## 2. Test Layers

| Layer | Scope | Minimum evidence |
| --- | --- | --- |
| Static checks | TypeScript, lint, formatting, dependency/build configuration | CI passes on every pull request |
| Unit | Domain validation, state transitions, date/range rules, derived calculations, use cases | Deterministic tests for boundary and failure cases |
| Component | Screens, forms, role navigation, loading/error/empty states, locale direction | React Native Testing Library tests with accessible queries |
| Repository | Supabase adapters, row mapping, pagination, and error translation | Contract tests against deterministic fakes plus adapter-focused tests |
| PostgreSQL/Supabase integration | Migrations, constraints, RPCs, transactions, RLS policies | Local Supabase tests using separate authenticated identities and roles |
| End-to-end | Real user workflows across app and backend | Release smoke suite on staging builds and target platforms |
| Qur'an dataset | Counts, order, boundaries, edition mappings, checksums, text immutability | Repeatable validator in CI; qualified human review before production |
| Security | IDOR, privilege escalation, secret leakage, recovery, offline replay | Negative authorization tests and pre-pilot security review |
| Operations | Migration rehearsal, backup restore, rollback, monitoring | Dated rehearsal record and resolved findings |

Baseline tooling proposal: Expo-supported Jest configuration (`jest-expo`), React Native Testing Library, Supabase CLI local stack for database/RLS integration tests, and Maestro or an approved equivalent for device-level end-to-end flows. Confirm versions and exact E2E runner during project setup; pin them in the lockfile and CI image.

## 3. Pull Request CI

Run checks in a clean environment for every pull request:

1. Install dependencies from the committed lockfile.
2. Run formatter check, lint, and TypeScript type check.
3. Run unit and component tests.
4. Start the local Supabase stack and apply all migrations plus deterministic synthetic seed data.
5. Run database constraints, RPC, RLS allow/deny, and repository integration tests.
6. Export/build the Expo app for supported targets to catch bundling/configuration errors.
7. Scan repository and generated artifacts for secrets; report dependency/security findings.
8. Publish test results and build artifacts without publishing environment secrets.

Pull requests cannot merge with failing required checks, unresolved high-severity authorization failures, or unreviewed schema changes. Flaky tests are tracked and fixed; do not make security tests non-blocking to reduce CI noise.

## 4. Coverage by Milestone

### 0.1 Foundation

- Account activation, sign-in, session restoration, logout, recovery, and deactivation.
- Controlled bootstrap authorization and one-time behavior.
- Profile/membership/role creation consistency and audit events.
- RLS denial for unauthenticated, wrong-school, wrong-role, and student-to-student access.
- Arabic/English localization, RTL/LTR forms/navigation, and error states.
- Clean database migration/seed and app export/build.

### 0.2 Groups

- Teacher assigned-group and roster access; wrong-group denials.
- Student enrollment, transfer, inactive membership, and preserved history.
- Duplicate membership/schedule constraints.

### 0.3–0.5 Qur'an learning and attendance

- Qur'an range validity and cross-Surah ordering.
- Dataset integrity, checksum, page/Juz boundary mapping, and edition identity.
- Overlapping accepted ranges count once; revision never increases new-memorization totals.
- Lesson submission is transactional and idempotent; retry commits once.
- Unauthorized score edits fail; amendments preserve original history and actor.
- Attendance duplicate prevention, correction history, and timezone boundaries.

### 0.6–0.9 Growth and offline

- Points are server-generated, deduplicated, and corrected by attributed reversal.
- Competition eligibility and ranking visibility follow school policy.
- Notifications/realtime deliver only authorized data and handle revocation/reconnect.
- Metrics reconcile with source history and school-local reporting windows.
- Offline replay after restart, duplicate replay, stale version, revoked membership, group transfer, and multi-device conflict produce deterministic outcomes; assessments never silently last-write-win.

## 5. Authorization Test Matrix

Use at least two schools, each with administrator, teacher, and student identities. Include a student with no login profile. Test data must be synthetic.

Required cases are listed in [PERMISSIONS.md](../architecture/PERMISSIONS.md). Execute them through database/API operations, not only screens. Include both allowed and denied cases for each role and resource. Re-run the RLS suite on every policy/schema change.

## 6. End-to-End Smoke Flows

Run against staging for each release candidate:

- Administrator signs in, views own school, creates a teacher and student profile, and confirms a student profile can exist without a login.
- Provisioned teacher signs in and sees only authorized destinations.
- Provisioned student signs in and sees only their own allowed profile/data.
- Password recovery returns a generic app response and follows the configured verified-contact flow.
- Arabic and English can be selected and remain correct after app restart.
- Later releases extend the suite with group setup, assignment, assessment, reader, attendance, notification, and offline flows.

## 7. Qur'an Content Test Rules

- Do not accept a new/changed dataset without the source approval and validation gates in [Qur'an Integration](../quran/INTEGRATION.md).
- Verify the original downloaded input by checksum and preserve the source/license notice.
- Fail CI when expected sequence/counts, mapping coverage, or approved checksums differ unexpectedly.
- Review representative text, diacritics, pause marks, and boundaries with a qualified reviewer and on physical Android/iOS devices.
- Keep any search-normalized text separate from approved display text.

## 8. Release Test Gate

A release candidate requires all CI checks green, migration/RLS tests green, end-to-end smoke tests on supported targets, no unresolved critical/high privacy or security finding, and a documented staging rehearsal. Production student data additionally requires the pre-pilot approvals and restore rehearsal in the security and deployment plans.