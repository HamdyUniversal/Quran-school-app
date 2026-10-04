# Security, Privacy, and Threat Model

**Scope:** React Native + Expo + Supabase V1
**Status:** Baseline for Product Owner, Technical Lead, and school privacy review
**Related:** [Permissions](../architecture/PERMISSIONS.md), [Database Schema](../architecture/DATABASE_SCHEMA.md), [Data Access](../architecture/DATA_ACCESS.md)

## 1. Security Objectives

- Protect children's identity and educational records from other students, unauthorized staff, other schools, and public access.
- Keep attendance, lesson assessments, verified progress, and future points historically trustworthy and attributable.
- Prevent a modified mobile client from bypassing authorization or changing server-controlled outcomes.
- Collect only the personal data needed for an approved school workflow.
- Make security events auditable without copying secrets or unnecessary child data into logs.
- Define retention and incident response before real student records are loaded.

## 2. Data Classification

| Classification | Examples | Baseline handling |
| --- | --- | --- |
| Public reference | Approved Qur'an dataset metadata and text, subject to source terms | Version, verify, preserve attribution, and follow source-specific license restrictions |
| School internal | School settings, staff profiles, group configuration | Authenticated school membership; school-scoped access |
| Sensitive student data | Student identity, enrollment, educational progress, attendance, assessments, teacher feedback | Minimize collection; deny by default; scope by school, role, and relationship; audit sensitive access/mutations where appropriate |
| Authentication secrets | Passwords, access/refresh tokens, recovery tokens, service-role keys | Managed by Supabase Auth/secure platform storage or secret manager; never log or expose to clients |

Do not collect student email, phone, or date of birth unless an approved workflow needs it. Student educational profiles can exist without an authentication account. Optional student sign-in requires a verified private recovery contact under the policy in the detailed plan.

## 3. Threat Model

| Threat / abuse case | Impact | Required controls and evidence |
| --- | --- | --- |
| Cross-school IDOR or guessed UUID | Exposure or mutation of another school's records | RLS on every exposed school-owned table; derive membership from authenticated identity; tenant-safe foreign keys; direct-ID negative tests |
| Student reads another student's records | Disclosure of child identity, work, scores, or attendance | Link authenticated student membership to one student record; own-record policies; student-to-student RLS tests for reads and writes |
| Teacher accesses an unassigned group | Unauthorized access or grading | Scope access to active teacher-group relationship beginning in 0.2; verify relationship on every operation; wrong-group denial tests |
| Client changes role, school, score, progress, points, or competition eligibility | Privilege escalation and corrupted history | Reject protected fields; use RLS and trusted functions; calculate derived outcomes server-side; test forged payloads |
| Stolen password, session, or recovery token | Account takeover | Supabase Auth; secure device storage; short-lived/revocable sessions as supported; generic recovery responses; logout/revocation tests; no secret logging |
| Public or unauthorized administrator bootstrap | Full-school compromise | No public first-admin registration; operator-controlled bootstrap; one-time/limited setup; audit actor and request; test bootstrap cannot be reused publicly |
| Service-role key extracted from mobile bundle or repository | Bypass of RLS across schools | Keep privileged keys only in server secret storage; inspect built app/config and CI artifacts; rotate credentials after exposure |
| Malicious or mistaken staff member | Improper access, role changes, or altered records | Least privilege, explicit permissions, audited role/profile changes, attributable amendments for historical correction, staff offboarding/revocation process |
| Lost/shared device or residual local data | Unauthorized access to cached child records | Minimize local sensitive data; SecureStore for auth material; partition any cache by user/school; clear private cache on logout/account switch; device lock guidance |
| Future offline replay after access revocation | Unauthorized delayed write or duplicate assessment | Re-check current membership and scope on replay; idempotency keys; explicit conflict state; never last-write-wins for assessment history |
| Sensitive data in logs, crash reports, exports, or support tickets | Secondary disclosure | Structured allow-listed logging; redact contacts/tokens/student content; restrict log access and retention; test redaction |
| Insecure future file upload or signed URL | Exposure, malware, or cross-tenant access | Not in 0.1; later use private buckets, file type/size validation, authorization checks, short-lived signed URLs, and upload threat tests |
| Vulnerable dependency or compromised build pipeline | App/API compromise | Lock dependencies, review updates, secret scanning, protected CI secrets, signed/reviewed releases, dependency and build provenance checks |
| Unauthorized realtime data delivery | Continuous cross-tenant disclosure | Not in 0.1; authorize subscriptions server-side and test revocation and tenant scope before enabling realtime |
| Backup or export disclosure | Broad, persistent data leak | Restrict operators, encrypt and access-control backups, define retention, record restoration access, rehearse recovery without exposing production data |

## 4. Authentication and Account Lifecycle

- Administrators and teachers use provisioned accounts; no public staff registration.
- Student records do not require auth accounts. Optional student accounts are provisioned only when a verified private recovery contact is available; no shared student accounts or fabricated addresses.
- Use Supabase Auth for sign-in, session refresh, activation, password reset, and revocation. Do not create a second password store.
- Password reset uses provider-supported recovery and generic responses that do not confirm account existence. Staff never see or send a user's existing password.
- Provisioning, membership/role changes, first-admin bootstrap, and disabling an account are trusted workflows, not client-side table writes.
- After sign-out or account switch, invalidate remote cached state and remove/invalidate user-scoped private local data.
- Authorization uses the current authenticated identity plus active membership, permissions, and resource relationship. Client navigation is not an authorization control.

## 5. Authorization and Data Protection Controls

- Apply default-deny RLS to all exposed school-owned tables and test `SELECT`, `INSERT`, `UPDATE`, and `DELETE` separately.
- Do not trust a client-submitted school ID, role, or resource ID without server-side membership and scope checks.
- Keep Supabase service-role credentials out of the mobile app, public configuration, logs, and distributable artifacts.
- Validate every mutation at the trusted boundary. Use RPC/Edge Functions for privileged auth operations and atomic multi-row writes.
- Use HTTPS/TLS for service communication. Do not include sensitive student details in push payloads or deep-link parameters.
- Use field allow-lists and explicit projections; paginate lists and avoid exposing contact fields not needed by the workflow.
- Keep school-owned relationships tenant-safe with constraints, and record sensitive mutations in append-only audit events.
- For any later storage, realtime, or offline feature, extend threat tests to the additional access path before enabling it.

## 6. Audit and Logging

Audit at minimum: first-school/admin bootstrap, account activation/deactivation, membership and role changes, sensitive profile edits, and later corrections to assessments, attendance, scoring, and competition rules.

Each audit event should identify the actor (or approved system/bootstrap actor), school where applicable, action, resource type/ID, timestamp, request/correlation ID, and minimal redacted metadata. Do not record passwords, auth tokens, recovery links, full request bodies, Qur'an recitation content, or unnecessary child details. Application roles cannot update or delete audit history.

Operational logs should contain event codes, correlation IDs, and safe error categories, not full database rows. Restrict log access and establish log retention separately from educational-record retention.

## 7. Child Privacy, Retention, and Deletion

The school jurisdiction is recorded as **Egypt**. This is not a legal interpretation, and no retention period or compliance conclusion is asserted here. Before importing real student data, the Product Owner, School Representative, and a qualified privacy/legal reviewer must document:

- applicable Egyptian requirements, school policy, and qualified privacy/legal review;
- the lawful/approved basis for collecting each student field and any required parent/guardian consent;
- retention periods for active/inactive student profiles, educational history, authentication records, audit logs, support artifacts, and backups;
- who may request access, correction, export, deactivation, deletion, or anonymization, and how requests are verified and fulfilled;
- how historical assessment/audit integrity is preserved when a student's identifying profile is removed or anonymized;
- backup expiry and restoration behavior, including how a deletion/anonymization request remains effective after restore;
- breach notification responsibilities, timelines, contacts, and documentation obligations.

Use soft deactivation for ordinary enrollment changes. Do not promise full deletion until linked educational history, audit obligations, backup retention, and applicable school/legal requirements have been reviewed. Avoid retaining optional contact or birth-date data without a clear approved purpose.

## 8. Incident Response Baseline

Before pilot, name the incident lead and school contact and document the escalation path. For a suspected compromise:

1. Triage scope and preserve relevant audit/security evidence without copying unnecessary student data.
2. Contain access: revoke affected sessions/accounts, disable compromised credentials, and rotate exposed secrets.
3. Determine affected schools, users, data categories, time window, and whether unauthorized reads or writes occurred.
4. Restore integrity from verified history/backups; use attributed amendments for corrections rather than silently rewriting records.
5. Notify the designated school/privacy/legal contacts and affected parties as required by the approved response policy and applicable law.
6. Record the incident, decisions, evidence, remediation, and follow-up security tests.

## 9. Pre-Pilot Security Gate

- [ ] Product Owner and Technical Lead review this threat model and assign named owners.
- [ ] School Representative and qualified privacy/legal reviewer approve data fields, consent, retention, access/correction/deletion handling, and incident contacts for the applicable jurisdiction.
- [ ] RLS and direct-ID tests pass for unauthenticated, wrong-school, wrong-role, wrong-group, and student-to-student cases.
- [ ] Privileged functions validate caller/school/resource scope and create expected audit entries.
- [ ] Verify no service-role credential, password, recovery token, or unnecessary child data appears in app bundles, logs, crash reports, or CI artifacts.
- [ ] Verify session revocation, generic recovery behavior, account deactivation, and local-data cleanup.
- [ ] Backups, restoration, incident escalation, and secret rotation have been rehearsed.
- [ ] Resolve all critical/high security findings before production student data is used.