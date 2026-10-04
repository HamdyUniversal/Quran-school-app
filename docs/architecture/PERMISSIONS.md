# Permissions and Tenant Isolation

**Status:** V1 baseline for Product Owner and Technical Lead review
**Applies to:** React Native + Supabase V1
**Related:** [Product Requirements Document](../product/PRD.md) and section 5/10 of the detailed project plan

## 1. Authorization Model

Authorization combines the authenticated user, an active school membership, effective permissions, and resource scope. A role name by itself is never sufficient authorization. The server/database must make the final decision; hiding a screen or button is only a usability measure.

Every school-owned row is scoped to one school. The active school must be derived from a membership the authenticated user is allowed to use. A `school_id`, profile ID, student ID, group ID, or role supplied by the client is an identifier to validate, not proof of access.

Use default-deny policies for exposed data. Grant only the operations needed by the relevant workflow. Shared Qur'an reference data is global, read-only application data and is not owned by any school.

## 2. Role and Resource Matrix

| Resource/action | Administrator | Teacher | Student |
| --- | --- | --- | --- |
| School profile/settings | Read and manage own school | Read only if explicitly needed | No access unless explicitly needed for own experience |
| Teacher/student profiles | Manage profiles in own school | Own profile in 0.1; students in currently assigned groups from 0.2 | Own profile only with an active linked account |
| School memberships and roles | Manage own-school memberships within granted admin permissions | No | No |
| Groups, terms, schedules | Manage own school from 0.2 | Read assigned groups from 0.2 | Read only relevant own-group information if exposed |
| Homework | Manage only when explicitly permitted; later milestone | Create/read for authorized groups from 0.3 | Read own recipient records from 0.3 |
| Lesson assessments and history | Read own-school records; corrections require explicit audited permission | Record for authorized students from 0.3; correct only with explicit audited permission | Read own records; never create or change verified results |
| Attendance | Manage only when explicitly permitted from 0.5 | Record for assigned groups from 0.5 | Read own permitted attendance from 0.5 |
| Scores, points, competitions | Manage settings only with explicit permission; no arbitrary point edits | No arbitrary point edits; permitted teaching actions only | Read own and explicitly permitted ranking data |
| Audit logs | Read only with explicit audit permission | No by default | No |
| Other schools' records | No | No | No |

In 0.1, groups do not exist yet. Therefore teachers must not receive roster access based only on their teacher role. Student profile access requires an active authenticated account linked to that exact student; profiles without accounts remain manageable only through authorized staff workflows.

## 3. Tenant Isolation Requirements

- Every school-owned table includes a non-null `school_id`, except where a reviewed schema decision proves a different safe representation.
- Every school-owned query, mutation, search, count, export, and detail lookup enforces the authenticated membership and resource scope.
- Tenant ownership is checked in PostgreSQL RLS policies. Sensitive multi-step mutations use a trusted database function or Edge Function and validate the caller before writing.
- Foreign keys must not allow records from one school to reference another school's profiles, groups, students, or assignments. Use tenant-aware constraints where required.
- RLS must cover both list and direct-ID access. Knowing or guessing a UUID must not grant access.
- Authenticated clients never receive the Supabase service-role key. Any trusted function using elevated credentials must independently enforce user, school, role, and resource authorization.
- Global Qur'an reference rows are read-only to application users and must not be writable through school roles.
- Realtime subscriptions and private storage objects must follow equivalent school/resource authorization when those features are introduced.
- Offline writes must be reauthorized at replay time. Revoked membership or group assignment blocks the queued mutation; client-cached permissions are not authoritative.
- Inactive memberships and accounts grant no access. Role changes and sensitive access changes are audited.

## 4. Supabase RLS Policy Shape

For each exposed table, define and test the allowed `SELECT`, `INSERT`, `UPDATE`, and `DELETE` operations separately. Policies should establish at least:

1. The request is authenticated.
2. The user has an active membership in the row's school.
3. The membership grants the required permission.
4. The row is inside the actor's resource scope (own profile, assigned group, or own student records as applicable).
5. New or changed rows preserve school ownership and valid same-school relationships.

Do not rely on the mobile client to pass a correct school ID. Avoid broad policies such as “authenticated users can access all rows” and avoid using a service-role client from the app.

## 5. Required Authorization Tests

Seed two schools with administrator, teacher, and student accounts. Verify both expected access and denial behavior at the database/API boundary, not only through UI tests.

| Test case | Expected result |
| --- | --- |
| Unauthenticated read or write of school-owned data | Denied |
| Administrator reads or edits a profile in own school | Allowed only for granted operations |
| Administrator requests another school's profile by ID | Denied |
| Teacher reads own profile in 0.1 | Allowed |
| Teacher reads student roster before group relationships exist | Denied |
| Teacher reads a student in an assigned group from 0.2 | Allowed for permitted fields/actions |
| Teacher reads a student in an unassigned group | Denied |
| Student with active linked account reads own profile | Allowed |
| Student reads another student's profile, homework, score, or history | Denied |
| Student profile without a login account attempts authenticated access | No session/access |
| Client attempts to change role, school ownership, verified score, progress, or points without permission | Denied |
| Client supplies a different `school_id` or guesses a valid UUID | Denied unless membership and row scope independently authorize it |
| Cross-school foreign-key relationship is inserted | Rejected by constraint or trusted mutation |
| Inactive/revoked membership or account accesses protected data | Denied |
| Later realtime/storage access crosses school or resource scope | Denied |

## 6. Review Gate

Before real student data is used, the Product Owner and Technical Lead review this matrix against actual migrations and RLS policies. All denial tests must pass. Any exception requires a documented permission, a scoped implementation, and a test covering both the allowed case and nearby denial cases.