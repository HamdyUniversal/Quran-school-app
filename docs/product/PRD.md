# Product Requirements Document

**Product:** Qur'an School Management
**Document status:** V1 baseline for Product Owner review
**Planning milestone:** 0.1.0 Foundation
**Platforms:** Android and iOS
**Primary plan:** `plan/QURAN_SCHOOL_REACT_NATIVE_SUPABASE_V1_NESTJS_LATER_PROJECT_PLAN.md`

## 1. Product Summary

Build an Arabic-first mobile app for one initial Qur'an school. The app will help administrators manage school accounts and people, teachers manage authorized student learning workflows, and students review their own assignments and progress. The product must protect student records, preserve trustworthy educational history, and support Arabic RTL and English LTR from the foundation release.

V1 uses React Native, Expo, TypeScript, and Supabase. The mobile app accesses backend data through domain repositories so the provider can change without rewriting screens and feature logic.

## 2. Users

| User | V1 responsibility |
| --- | --- |
| Administrator | Manage the school, teacher/student profiles, accounts, and foundation settings. Later milestones add groups, assignments, scoring, and reports. |
| Teacher | Sign in and access authorized teacher screens. Later milestones add group rosters, homework, assessments, and attendance. |
| Student | Sign in only if an optional account is provisioned; view only the student's own permitted profile and, in later milestones, learning records. |
| Guardian | Not supported in V1. |
| Platform administrator | No self-service platform console in V1; first-school setup uses a controlled bootstrap. |

## 3. V1.0 Release Scope

The first production release is planned across milestones 0.1 through 1.0. It includes school setup, groups, Qur'an-based homework and memorization, the reader, revision, attendance, competitions, notifications, analytics, offline reconciliation, and production operations. The release is not complete until the pilot and release criteria in the detailed plan pass.

### 3.1 Milestone 0.1 — Foundation

0.1 provides the smallest secure, runnable base:

- One school identity with school-scoped records and permissions.
- A controlled first-administrator bootstrap; no public administrator registration.
- Administrator-managed teacher and student profiles. A student profile does not require an authentication account.
- Authentication, session restore, logout, activation, and password recovery for provisioned accounts.
- Optional student sign-in only when the student has a verified private email or phone usable for account recovery. Use Supabase-supported auth and recovery; do not use shared student accounts, fabricated email addresses, or a custom username bridge in V1.
- Role-aware administrator, teacher, and student home/profile screens with clear empty states for features not yet available.
- Arabic and English localization, RTL/LTR layout, typed data contracts, repository boundaries, SQL migrations, audit events, automated tests, and CI foundation.

### 3.2 Later milestones

| Milestone | Included capability |
| --- | --- |
| 0.2 | Terms, groups, schedules, teacher assignments, student enrollment and transfer history |
| 0.3 | Validated Qur'an references, homework, memorization assessments, amendments, derived progress |
| 0.4 | Qur'an reader, navigation, bookmarks, search, assignment range selection and highlighting |
| 0.5 | Revision workflows and attendance |
| 0.6 | Versioned scoring, achievements, competitions, privacy-scoped rankings |
| 0.7 | Notifications, push tokens, authorized realtime updates and deep links |
| 0.8 | Role-scoped analytics and dashboards |
| 0.9 | Offline cache, queued writes, conflict resolution, security and operational hardening |
| 1.0 | Monitored school pilot and production release |

## 4. Out of Scope

The following are not 0.1 deliverables: group management; homework or lesson recording; Qur'an text/reader; revision; attendance; scoring or competitions; push notifications or realtime; analytics; offline writes; guardian access; multiple branches; multi-school self-service; payments; messaging; certificates; and a NestJS API. Do not present future milestone functionality as if it is available in 0.1.

## 5. Functional Requirements and Acceptance Criteria

| ID | Requirement | Acceptance criteria |
| --- | --- | --- |
| PR-01 | Provision the first school administrator securely. | Bootstrap is restricted to an approved operator; there is no public administrator sign-up; setup does not require manual production database edits. |
| PR-02 | Manage teacher and student profiles. | An authorized administrator can create, view, and update profiles in the active school. Student profile creation does not require an email, phone, or login account. |
| PR-03 | Authenticate provisioned accounts. | Valid active accounts can sign in, restore a valid session, and log out. Invalid, inactive, expired, or revoked sessions cannot access protected screens. |
| PR-04 | Recover account access safely. | Password recovery is available only through a verified account contact and provider-supported flow. Responses do not disclose whether an account exists. Staff cannot view a user's existing password. |
| PR-05 | Enforce roles and school boundaries. | Each protected query and mutation is authorized server-side. A student cannot read another student's record; a user cannot access another school's records. Navigation alone is not treated as access control. |
| PR-06 | Provide role-aware foundation screens. | Authenticated users see only the navigation destinations allowed for their role. Unavailable future features display honest empty/not-yet-available states, not fabricated data. |
| PR-07 | Support Arabic and English. | Login, profile, navigation, form validation, errors, and settings render in both locales and switch layout direction correctly. |
| PR-08 | Keep data access testable and provider-independent. | Screens/components do not call Supabase directly. Domain repositories and typed models mediate data access; migrations, seed/setup, and automated checks work on a clean development environment. |
| PR-09 | Audit sensitive foundation actions. | Account creation, role changes, and sensitive profile changes are attributable and queryable without storing credentials, tokens, or unnecessary child-sensitive data. |

## 6. V0.1 Screens and Navigation

### Shared screens

- App launch and session restoration
- Sign in
- Forgot/reset password
- Language and appearance settings
- Profile

### Administrator

- Home/dashboard with only real foundation status
- People list
- Teacher profile create/edit
- Student profile create/edit
- School/settings entry point

### Teacher

- Home/dashboard with an empty state until groups are available in 0.2
- Profile

### Student

- Home/dashboard and profile for provisioned student accounts
- Login is optional; profiles without an account remain administratively managed and cannot sign in

Navigation is selected from the authenticated membership and permissions. Unauthorized deep links return to an allowed screen. A user with no active school membership cannot enter a role home.

## 7. Core V0.1 User Flows

### First-school setup

1. An approved operator runs the controlled bootstrap for the initial school and first administrator.
2. The administrator signs in and completes the school profile/settings required for foundation use.
3. The administrator creates teacher and student profiles.
4. The administrator provisions teacher accounts and only provisions a student account when the student has a verified private recovery contact.

### Sign-in and recovery

1. The user signs in with an activated account.
2. The app restores a valid session on relaunch and loads the active membership and permissions.
3. The user signs out; protected screens and cached private state are cleared or inaccessible.
4. A user requests recovery through a verified contact. The app shows a generic response and relies on the provider's secure recovery flow.

### Role access

1. The app loads the authenticated user's active school membership and effective permissions.
2. It renders the role-appropriate home and profile.
3. The user can read only records permitted by server-side policy; direct requests using another user's or school's identifier are denied.

### Localization

1. The app selects Arabic or English from the user's saved preference or device default.
2. The interface updates strings, text alignment, and directional layout for RTL or LTR.
3. Validation and authentication errors remain understandable and correctly laid out in either direction.

## 8. Quality and Privacy Requirements

- Keep child educational records private and expose only fields needed for the current workflow.
- Enforce tenant and resource scope in database policies and server-side operations, including direct API/database access.
- Never ship Supabase service-role credentials in the mobile application.
- Store authentication material using platform-appropriate secure storage; redact tokens and child-sensitive fields from logs.
- Do not silently overwrite historical assessment data; later corrections must be attributable amendments.
- Build accessible controls and support right-to-left and left-to-right layouts without relying on text direction alone for directional UI.
- Use migrations for schema changes and verify a clean database setup in automated checks.
- Keep lists paginated and establish indexes based on query needs.

## 9. V1 Production Acceptance

The product is ready for 1.0 only when a pilot school can configure people, terms, and groups; teachers can assign Qur'an work, assess lessons, record attendance, and view derived progress; students can access only their authorized work; offline submissions reconcile exactly once; notifications, competitions, and reports respect school settings; and security, migration, backup/restore, monitoring, and recovery checks pass. The version roadmap and shared definition of done remain authoritative for release gates.

## 10. Open Decisions

Open decisions and their role owners are tracked in section 30 of the detailed plan. Named owners must be assigned before implementation begins. The approved Qur'an source and licensing must be resolved before milestone 0.3 accepts Qur'an-based assignments.