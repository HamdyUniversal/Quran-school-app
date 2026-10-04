# Deployment and Operations Plan

**Scope:** React Native + Expo + Supabase V1
**Status:** Baseline for Technical Lead and Product Owner review
**Related:** [Test Strategy](../testing/TEST_STRATEGY.md), [Security Plan](../security/SECURITY_PLAN.md), [Database Schema](../architecture/DATABASE_SCHEMA.md)

## 1. Environments

Maintain separate Supabase projects and app configuration for:

| Environment | Purpose | Data and access |
| --- | --- | --- |
| Local development | Feature work and automated integration tests | Supabase CLI local stack; synthetic data only |
| Staging | Release-candidate verification and restore drills | Separate project; synthetic or irreversibly anonymized data only |
| Production | Real school operations | Restricted operator access, approved users/data, monitored and backed up |

Never point local builds or CI tests at production. Use separate app identifiers, Supabase project references, callback URLs, and EAS environment configuration. Keep public client configuration environment-specific; service-role credentials remain only in trusted server/deployment secret stores.

## 2. CI and Promotion Flow

### Pull request

- Run the checks in [TEST_STRATEGY.md](../testing/TEST_STRATEGY.md).
- Review SQL migrations and RLS policy changes as security-sensitive code.
- Do not build or deploy with production secrets in pull-request jobs.

### Staging

1. Merge approved changes to the release/integration branch.
2. Apply reviewed migrations to staging through the controlled pipeline.
3. Deploy an identifiable Expo/EAS staging build with staging-only configuration.
4. Run migration, RLS, end-to-end smoke, and operational checks.
5. Record build ID, commit, migration version, test results, and known limitations.

### Production

1. Approve a release candidate after staging evidence passes.
2. Verify backups and the documented recovery path before schema changes.
3. Apply backward-compatible database migrations through the protected production pipeline.
4. Deploy/promote the matching mobile release and monitor health.
5. Pause promotion on unexpected authorization failures, data-integrity errors, crash spikes, or migration issues.

No manual production SQL edits or direct console changes to complete a release. Emergency changes require an incident record and a follow-up migration that restores source-of-truth consistency.

## 3. Database Migration Practices

- Every schema change is a reviewed, versioned SQL migration committed with the application change.
- CI verifies a clean migration/seed and forward upgrade from the previous schema.
- Use expand/migrate/contract for changes that must coexist with already-released mobile versions: add compatible columns/tables, deploy compatible app code, backfill if needed, then remove obsolete schema in a later release.
- Do not assume mobile clients update simultaneously; maintain backward compatibility for the supported app window.
- Use explicit transactions where supported and safe. Large data backfills use a measured, resumable procedure rather than a long blocking deployment migration.
- Test RLS behavior after every permission/schema migration.
- Destructive migration rollback is not the default recovery plan; prefer a forward corrective migration. Restore from backup only under the recovery procedure.

## 4. Mobile Builds and Release Artifacts

- Use EAS Build/Submit or an approved equivalent for signed Android/iOS distribution.
- Keep signing credentials in the provider's protected credential store; never commit them.
- Build from a tagged/identified commit and pinned dependency lockfile.
- Separate development, internal testing, staging, and production application IDs/configuration as appropriate.
- Treat OTA updates as application releases: only ship backward-compatible JavaScript changes, verify the target runtime/native version, and do not use OTA to bypass required native builds or database rollout sequencing.
- Keep release notes, build IDs, source commit, and deployment approvals for each distribution.

## 5. Secrets and Access

- Store CI and deployment secrets in protected environment-specific secret stores.
- Limit production project and database access to named operators with least privilege and MFA where available.
- Never place service-role keys, database passwords, signing keys, or privileged API credentials in mobile bundles, logs, test fixtures, or pull-request output.
- Rotate a secret immediately after suspected exposure and record the incident.
- Review production access periodically and revoke access when responsibilities end.

## 6. Backups and Recovery

Before pilot, the Product Owner and Technical Lead must choose measurable Recovery Point Objective (RPO) and Recovery Time Objective (RTO) values based on the school's tolerance for lost work and service interruption. Verify that the selected Supabase plan actually supports the required backup frequency and point-in-time recovery; availability and retention vary by plan and configuration.

Database backups do not automatically guarantee recovery of Storage object bytes. Document and test backup/restore separately for PostgreSQL data, private storage files (if added), configuration/secrets, and required migration artifacts.

### Restore rehearsal

1. Select a recorded restore point and record its timestamp/source.
2. Restore into an isolated non-production project; never overwrite production as a test.
3. Apply/reconcile schema migrations and verify constraints, row counts, tenant boundaries, RLS, and representative workflows.
4. Restore private storage objects separately if the feature is in use; verify metadata-to-object integrity and access controls.
5. Confirm recovery of audit/history and account/profile links; verify no restored secrets or data are exposed to unauthorized users.
6. Record elapsed time against the proposed RTO and data loss against the proposed RPO; track and remediate gaps.

Repeat the rehearsal before pilot and at a cadence approved by the operations owner. The recovery operator and decision authority must be named before production.

## 7. Monitoring and Operations

Configure monitoring and alert ownership for:

- app crashes, fatal errors, and release-specific regressions;
- authentication failures and unusual account/security events;
- database availability, saturation, slow queries, and migration failures;
- RLS/authorization denials at useful aggregate levels without logging sensitive row data;
- later realtime delivery, notification failures, and offline conflict/replay rates;
- backup completion and restore-drill status.

Define alert thresholds and on-call/escalation contacts before pilot. Redact personal/child data and secrets in crash reporting. Document a kill switch or feature disable procedure for unsafe workflows.

## 8. Rollback and Recovery Strategy

- **Mobile regression:** pause promotion; disable the affected feature via a server-controlled flag if available; roll back to the last known-good compatible build when store/distribution rules permit.
- **Database migration issue:** stop subsequent deploy steps. Apply a tested forward fix when data is intact. Restore only when integrity cannot be repaired safely, with incident-owner approval and a documented point-in-time impact assessment.
- **Incompatible app/schema:** use expand/contract migrations and keep old/new app versions compatible during rollout; do not remove columns or policies while supported clients still depend on them.
- **Credential compromise:** revoke sessions, rotate affected secrets, inspect audit evidence, and follow the incident plan in [SECURITY_PLAN.md](../security/SECURITY_PLAN.md).
- **Data corruption:** contain writes, preserve evidence, restore/reconcile into an isolated environment first, and validate tenant boundaries before returning service.

Rollback does not mean silently rewriting educational history. Correct assessments or attendance through attributable amendments/reversals when the domain model supports them.

## 9. Pre-Pilot Operations Gate

- [ ] Development, staging, and production projects/configurations are separate and verified.
- [ ] CI tests migrations and RLS; production migrations require protected approval.
- [ ] EAS/distribution credentials and deployment secrets are protected and access-reviewed.
- [ ] RPO/RTO are agreed; backup/PITR capability and retention are verified against the selected plan.
- [ ] PostgreSQL and any private storage files have tested recovery procedures.
- [ ] Restore rehearsal meets agreed RPO/RTO or has an accepted remediation plan.
- [ ] Rollback, forward-fix, monitoring, incident, and secret-rotation contacts are documented.
- [ ] Staging release smoke tests pass using synthetic data.