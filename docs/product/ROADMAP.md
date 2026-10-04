# Product Roadmap

**Status:** Proposed milestone sequence for Product Owner review
**Primary rule:** Finish, test, and release one milestone before beginning the next; later scopes are not permission to implement early.

| Version | Milestone | Depends on | Exit gate |
| --- | --- | --- | --- |
| 0.1.0 | Foundation: school identity, accounts, roles, profiles, localization, RLS, repositories, CI | Design gate; stack and privacy decisions | Admin/teacher/eligible student flows work; isolation tests pass; Arabic/English and provider boundary verified |
| 0.2.0 | Terms, groups, schedules, dated teacher/student memberships | 0.1.0 | Teacher scope is group-limited; transfers preserve history |
| 0.3.0 | Qur'an metadata, homework, memorization assessments, amendments, derived coverage | 0.2.0; source/license/reviewer approval | Valid ranges, safe transaction/idempotency, no overlap inflation, immutable history |
| 0.4.0 | Qur'an reader, navigation, bookmarks, search, range selection/highlighting | 0.3.0; approved text/font licenses | Assignment opens at matching range and dataset/edition; Arabic rendering reviewed on devices |
| 0.5.0 | Revision and attendance | 0.2.0; 0.3.0 records | Revision separate from memorization; duplicate attendance prevented; corrections attributed |
| 0.6.0 | Points ledger, achievements, competitions, privacy-scoped rankings | Verified lesson/attendance events | Server-generated awards are auditable and cannot be manipulated by clients |
| 0.7.0 | Notification inbox, push, selective realtime, deep links | Notification security and delivery design | No cross-scope leakage; delivery/reconnect/revocation tests pass |
| 0.8.0 | Analytics and complete role dashboards | Stable historical source data | Metrics reconcile with records, timezone rules, and permissions |
| 0.9.0 | Offline cache/replay, conflicts, security and operations hardening | Stable commands, privacy approval, sync design | Mutations replay at most once; conflicts explicit; recovery/security gates pass |
| 1.0.0 | Monitored school pilot and production release | All previous exit gates | Full school workflows, support, privacy, backup/restore, and release readiness approved |

## Cross-Milestone Rules

- Every version has its own migrations, acceptance evidence, changelog, and release review.
- Preserve student privacy and school boundaries in every milestone, not only during multi-school expansion.
- Do not accept Qur'an assignments until the dataset/edition/license gate in [INTEGRATION.md](../quran/INTEGRATION.md) is closed.
- Do not launch offline student-data caching/writes until the security, local-storage, conflict, and retention gates are approved.
- NestJS is an evidence-based future option described in [NESTJS_MIGRATION.md](../architecture/NESTJS_MIGRATION.md), not a numbered roadmap promise.
- Future guardian, branch, SaaS, payments, messaging, and certificate work remains out of V1 until separately prioritized.

## Release Readiness

Use the shared definition of done and deployment/test plans for every release. Version completion alone does not authorize production data or promotion; the Product Owner, Technical Lead, and school operations owner must accept the corresponding release evidence.