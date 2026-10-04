# Qur'an School App — Step-by-Step Build Task List

Use this checklist to build one verified milestone at a time. The detailed requirements, architecture, schema, and acceptance criteria live in [QURAN_SCHOOL_REACT_NATIVE_SUPABASE_V1_NESTJS_LATER_PROJECT_PLAN.md](QURAN_SCHOOL_REACT_NATIVE_SUPABASE_V1_NESTJS_LATER_PROJECT_PLAN.md).

Mark a task `[x]` only after its deliverable exists and its checks pass. Do not start the next milestone until the current milestone is usable and its acceptance criteria are met.

## Step 0 — Confirm the project direction

- [x] Confirm React Native + Expo + TypeScript + Supabase as the V1 stack.
- [x] Record Product Owner approval of React Native + Expo + TypeScript + Supabase in ADR 0001.
- [x] Mark the Flutter/NestJS-first `PROJECT_PLAN.md` as superseded; use the React Native plan as the implementation source of truth.
- [x] Set V1 defaults: Android and iOS, one initial operating school, and first-administrator creation through a controlled bootstrap (no public administrator registration).
- [x] Keep student profiles independent of login accounts. Provision optional student sign-in only when the student has a verified private email or phone for recovery; use Supabase recovery, and defer other students' logins rather than using shared accounts, fake emails, or a custom username bridge in V1.
- [x] Provisionally assign Hamdy Abd Elmohsen as Product Owner and Technical Lead.
- [x] Assign Hamdy Abd Elmohsen provisionally as School Representative as well as Product Owner/Technical Lead.
- [ ] Name a qualified Qur'an Reviewer and privacy/legal reviewer before their respective approval gates; school jurisdiction is Egypt.

**Gate:** The team agrees on one V1 stack, one product scope, and the decisions needed before real student data is used.

## Step 1 — Finish the design gate

- [x] Consolidate V1 requirements, exclusions, user flows, screens, navigation, and acceptance criteria in [docs/product/PRD.md](../docs/product/PRD.md); approved as the V1 planning baseline.
- [x] Document the role/permission matrix, tenant-isolation rules, milestone boundaries, and denial cases in [docs/architecture/PERMISSIONS.md](../docs/architecture/PERMISSIONS.md); review against implemented RLS before real student data.
- [x] Document the full target ERD and schema, constraints, indexes, and staged migration order in [ERD.md](../docs/architecture/ERD.md) and [DATABASE_SCHEMA.md](../docs/architecture/DATABASE_SCHEMA.md); approved as the V1 planning baseline.
- [x] Define 0.1 repository contracts and Supabase data-access boundaries in [DATA_ACCESS.md](../docs/architecture/DATA_ACCESS.md); approved as the V1 planning baseline.
- [x] Document the Qur'an source candidate, licensing questions, reference model, and validation gates in [INTEGRATION.md](../docs/quran/INTEGRATION.md). Final source, rights, and Qur'an Reviewer approval are prerequisites to 0.3, not to starting 0.1.
- [x] Document authentication, audit, child-data privacy, retention, and threat model in [SECURITY_PLAN.md](../docs/security/SECURITY_PLAN.md); jurisdiction-specific privacy approval and pre-pilot checks remain gates.
- [x] Document testing and CI in [TEST_STRATEGY.md](../docs/testing/TEST_STRATEGY.md), and environments, deployment, backup, restore, and rollback in [DEPLOYMENT.md](../docs/deployment/DEPLOYMENT.md); pre-pilot RPO/RTO and restore checks remain gates.
- [x] Draft and approve the V1 planning ADR baseline in [docs/architecture/adr/](../docs/architecture/adr/); future NestJS and source-specific choices remain conditional.
- [x] Create the standalone architecture, navigation, screens, user flows, folder structure, state management, Supabase, NestJS migration, offline sync, and roadmap docs listed in [DESIGN_READINESS.md](../docs/architecture/DESIGN_READINESS.md).
- [x] Extend the ERD/schema to cover the target-domain catalog while keeping migrations staged by version.
- [x] Review the design against section 24 and record completed, partial, missing, and blocked deliverables in [DESIGN_READINESS.md](../docs/architecture/DESIGN_READINESS.md). Product Owner/Technical Lead approved the V1 planning baseline.

**Gate:** Step 1 is complete and the 0.1 foundation may begin. Qur'an source/licensing must be approved before 0.3. Qualified Egyptian privacy/legal review, retention decisions, and recovery requirements are required before real student data/pilot.

## Step 2 — Build 0.1.0 Foundation

### Project and environments


### Foundation data and access

**Environment notes:** Current Node is `22.12.0`; the pinned Expo/React Native toolchain requires Node `22.13.0` or another version listed in `apps/mobile/package.json`. Initial npm install reports 30 dependency advisories (11 moderate, 19 high); no force-fix was applied because npm proposed downgrading Expo.
- [ ] Apply and verify migrations for schools, profiles, memberships, roles/permissions, teachers, students, and audit logs. Draft migrations are present but have not run against Postgres.
- [ ] Verify constraints and indexes that enforce school-scoped identity/relationships against a running database.
- [ ] Validate the controlled first-administrator bootstrap in Supabase; no public admin registration is enabled.
- [ ] Verify sign-in, session restore, logout, invite/activation, and password recovery against configured Supabase Auth.
- [ ] Complete domain types and repository interfaces for auth, school, student, and teacher data; auth contract/adapter currently exists.
- [ ] Complete and verify Supabase adapters behind repository interfaces; auth adapter currently exists.
- [ ] Execute allowed/denied RLS tests for all exposed school-owned tables; policies are drafted but unverified without local Postgres.
- [ ] Verify audit coverage for account/profile changes and confirm secrets/child data are redacted.

### Mobile experience and release checks

- [ ] Complete role-based navigation and administrator/teacher/student dashboard and profile workflows; auth routes and active-membership guard are scaffolded.
- [ ] Complete Arabic/English, RTL/LTR, form-error, and navigation review across all 0.1 screens; sign-in/dashboard localization is scaffolded.
- [ ] Build accessible shared controls and verify loading, empty, and error states.
- [ ] Add unit, component, repository, migration, and RLS tests; none have been added yet.
- [ ] Complete CI with test jobs and a verified app build; basic install/lint/typecheck/web-export workflow exists, but no tests or database job can pass yet.
- [ ] Update the CHANGELOG, run 0.1 acceptance checks, and prepare `v0.1.0` after the database/runtime blockers are resolved.

**Gate:** Not yet met. Expo config, TypeScript, lint, formatting, and web export pass. Supabase migration/RLS/auth acceptance remains blocked until Docker is running or a configured development project is available; people CRUD, full role screens, and automated tests remain to be implemented.

## Step 3 — Build 0.2.0 Groups

- [ ] Add terms, groups, schedules, teacher-group assignments, and dated student-group memberships.
- [ ] Build administrator workflows to create groups, assign teachers, enroll students, and transfer students.
- [ ] Build teacher group and roster views scoped to active assignments.
- [ ] Add group-level RLS and preserve inactive membership history.
- [ ] Test transfers, inactive memberships, and unauthorized group access; prepare `v0.2.0`.

**Gate:** Administrators manage groups; teachers see only their assigned groups and students; transfers preserve history.

## Step 4 — Build 0.3.0 Homework and memorization

- [ ] Obtain Qur'an Reviewer approval and written distribution rights for the selected source/edition; then import and validate its metadata and record provenance/version.
- [ ] Implement typed Qur'an references/ranges and validate range ordering and boundaries.
- [ ] Add homework, ranges, recipients, and independent recipient status.
- [ ] Build teacher assignment flows for one student, multiple students, and groups.
- [ ] Add memorization sessions, assessment fields, feedback visibility, and attributed amendments.
- [ ] Implement server-controlled lesson submission with transaction boundaries and idempotency.
- [ ] Derive verified coverage from accepted assessments; prevent overlapping ranges from double counting.
- [ ] Build student assignment/history views and teacher assessment/history views.
- [ ] Test invalid ranges, duplicate submissions, overlap, amendments, and unauthorized score changes; prepare `v0.3.0`.

**Gate:** Teachers can assign and assess valid ranges; students see only their own work; progress is derived correctly and historical corrections remain attributable.

## Step 5 — Build 0.4.0 Qur'an reader

- [ ] Integrate the approved text and edition-specific metadata under the confirmed license.
- [ ] Add Surah, Ayah, page, and Juz navigation, plus permitted search and bookmarks.
- [ ] Add Ayah selection and assignment-range highlighting.
- [ ] Link assignments to the exact selected range and open student work at that range.
- [ ] Add approved offline text caching and verify Arabic rendering on target devices.
- [ ] Test navigation boundaries, dataset integrity, and assignment deep links; prepare `v0.4.0`.

**Gate:** A selected range opens consistently in the reader and matches the assignment's stored Qur'an dataset/version.

## Step 6 — Build 0.5.0 Revision and attendance

- [ ] Add recent, old, full-Surah, and Juz revision assignment types.
- [ ] Keep revision results separate from new memorization coverage.
- [ ] Add group meetings, attendance records/history, and authorized correction records.
- [ ] Define attendance statuses, rate policy, and timezone rules.
- [ ] Test duplicate attendance, correction history, and revision progress; prepare `v0.5.0`.

**Gate:** Teachers can record attendance and revision; revision never inflates memorized totals.

## Step 7 — Build 0.6.0 Competitions

- [ ] Add versioned scoring rules and an immutable points ledger.
- [ ] Add achievements, competitions, eligibility, participants, and ranking privacy settings.
- [ ] Build permitted student and administrator competition views.
- [ ] Keep awards server-generated; support attributed correction/reversal events.
- [ ] Test duplicate awards, scoring changes, and privacy scopes; prepare `v0.6.0`.

**Gate:** Points and rankings are explainable, auditable, privacy-scoped, and cannot be changed by the client.

## Step 8 — Build 0.7.0 Notifications

- [ ] Add notification records, preferences, and device-token lifecycle.
- [ ] Add authorized realtime subscriptions and push delivery for homework, feedback, scores, and competitions.
- [ ] Add notification deep links and safe reconnect behavior.
- [ ] Test revoked access, duplicate delivery, and subscription authorization; prepare `v0.7.0`.

**Gate:** Users receive only notifications and realtime updates they are authorized to see.

## Step 9 — Build 0.8.0 Analytics

- [ ] Define and document time windows, school timezone behavior, and each metric's source data.
- [ ] Add progress, revision, attendance, homework, and score metrics.
- [ ] Complete role-scoped administrator, teacher, and student dashboards.
- [ ] Add explainable attention flags and only the indexes needed by measured queries.
- [ ] Test aggregates against source history and privacy scope; prepare `v0.8.0`.

**Gate:** Dashboard figures reconcile with underlying records and remain correctly scoped.

## Step 10 — Build 0.9.0 Offline and production hardening

- [ ] Add a user/school-partitioned SQLite cache and define cache expiry and logout cleanup.
- [ ] Cache approved Qur'an content and the minimum recent records needed offline.
- [ ] Add a durable pending-mutation queue with idempotency, authorization rechecks, and explicit conflict states.
- [ ] Add offline lesson capture and safe replay; do not use last-write-wins for assessments.
- [ ] Test restarts, duplicate replay, stale records, multiple devices, revoked access, and group transfers.
- [ ] Review RLS, privacy, logging, retention, and security risks; resolve critical/high findings.
- [ ] Add crash/error monitoring and operational alerts.
- [ ] Rehearse migrations, backup restoration, staging release, rollback, and production promotion.
- [ ] Prepare `v0.9.0`.

**Gate:** Offline submissions synchronize once, conflicts are visible and resolvable, and recovery/security checks pass.

## Step 11 — Pilot and release 1.0.0

- [ ] Run a monitored pilot with a school using test or approved real data.
- [ ] Verify end-to-end administrator, teacher, and student workflows on target devices.
- [ ] Resolve pilot blockers and confirm privacy/consent and support ownership.
- [ ] Verify migration, backup restore, rollback, monitoring, onboarding, and release notes.
- [ ] Complete the shared definition of done in section 29 of the detailed plan.
- [ ] Promote the validated release candidate and prepare `v1.0.0`.

**Gate:** A school can run its regular workflow reliably and the release owner accepts the operational risks and recovery plan.

## Step 12 — Evaluate NestJS after V1

- [ ] Review actual Edge Function count, transaction complexity, job needs, integrations, and sync/security requirements.
- [ ] If complexity justifies it, define a small hybrid migration that preserves mobile repository contracts.
- [ ] Move one bounded use case to NestJS and compare behavior, authorization, tests, and operations before expanding.
- [ ] Keep Supabase as the database/auth/storage provider unless a separate decision justifies changing it.

**Gate:** Add NestJS only after a documented decision based on observed complexity; a version number alone is not a reason.