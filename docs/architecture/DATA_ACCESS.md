# Data Access and Repository Contracts

**Scope:** Version 0.1 contracts and provider boundary
**Status:** Proposed baseline for Technical Lead review
**Related:** [Permissions](PERMISSIONS.md), [Database Schema](DATABASE_SCHEMA.md), [Detailed plan and NestJS migration strategy](../../plan/QURAN_SCHOOL_REACT_NATIVE_SUPABASE_V1_NESTJS_LATER_PROJECT_PLAN.md)

## 1. Boundary

Feature screens and domain logic depend on domain models and repository interfaces, never on Supabase SDK types or SQL table shapes.

```text
Screen / component
        ↓ dispatches
Feature hook or use case
        ↓ depends on
Domain repository interface
        ↓ implemented by
Supabase repository adapter
        ↓
Supabase Auth / PostgreSQL RLS / RPC / Edge Function
```

When a NestJS API is introduced, add API-backed repository adapters while preserving the domain contracts and feature workflows. Do not make React components choose between Supabase and NestJS.

## 2. Version 0.1 Domain Contracts

Types below illustrate domain-facing contracts. They are not generated Supabase database types and must not expose SDK clients, PostgREST response shapes, or database-specific errors.

```ts
export type PageRequest = {
  limit: number;
  cursor?: string;
};

export type Page<T> = {
  items: T[];
  nextCursor?: string;
};

export type UserProfile = {
  id: string;
  displayName: string;
  preferredLocale: "ar" | "en";
};

export type SchoolSummary = {
  id: string;
  name: string;
  defaultLocale: "ar" | "en";
  timezone: string;
};

export type Student = {
  id: string;
  schoolId: string;
  displayName: string;
  studentCode?: string;
  status: "active" | "inactive" | "withdrawn";
  hasLoginAccount: boolean;
};

export type Teacher = {
  id: string;
  schoolId: string;
  profileId: string;
  displayName: string;
  teacherCode?: string;
  status: "active" | "inactive";
};

export type AuthSession = {
  userId: string;
  expiresAt: string;
};

export type SignInInput = {
  email: string;
  password: string;
};

export type VerifiedContact =
  | { kind: "email"; value: string }
  | { kind: "phone"; value: string };

export type UpdateSchoolSettingsInput = {
  name?: string;
  defaultLocale?: "ar" | "en";
  timezone?: string;
};

export type CreateStudentInput = {
  displayName: string;
  studentCode?: string;
  dateOfBirth?: string;
  level?: string;
};

export type UpdateStudentInput = Partial<CreateStudentInput> & {
  status?: Student["status"];
};

export type CreateTeacherInput = {
  profileId: string;
  teacherCode?: string;
};

export type UpdateTeacherInput = {
  teacherCode?: string;
  status?: Teacher["status"];
};
```

IDs are opaque strings at the mobile boundary. Domain dates/timestamps are mapped into documented ISO values or date-only strings; UI code does not depend on database serialization details. Do not return authentication contact data from student profile repositories.

### Authentication

```ts
export interface AuthRepository {
  getCurrentSession(): Promise<AuthSession | null>;
  signIn(input: SignInInput): Promise<AuthSession>;
  signOut(): Promise<void>;
  requestPasswordReset(contact: VerifiedContact): Promise<void>;
  updatePassword(newPassword: string): Promise<void>;
  onSessionChanged(listener: (session: AuthSession | null) => void): () => void;
}
```

Public self-registration is not part of this contract. Account activation/provisioning is controlled by the school workflow. Password reset uses provider-supported recovery and generic responses; the application does not reveal account existence or store passwords.

### Current profile and school

```ts
export interface ProfileRepository {
  getCurrentProfile(): Promise<UserProfile>;
  updatePreferredLocale(locale: "ar" | "en"): Promise<UserProfile>;
}

export interface SchoolRepository {
  getCurrentSchool(): Promise<SchoolSummary>;
  updateSchoolSettings(input: UpdateSchoolSettingsInput): Promise<SchoolSummary>;
}
```

`getCurrentSchool` resolves through the authenticated user's active membership. A client-provided school ID never grants access. School updates are administrator-only and server/RLS enforced.

### Students and teachers

```ts
export interface StudentRepository {
  listForCurrentSchool(request: PageRequest): Promise<Page<Student>>;
  getById(studentId: string): Promise<Student>;
  create(input: CreateStudentInput): Promise<Student>;
  update(studentId: string, input: UpdateStudentInput): Promise<Student>;
}

export interface TeacherRepository {
  listForCurrentSchool(request: PageRequest): Promise<Page<Teacher>>;
  getById(teacherId: string): Promise<Teacher>;
  create(input: CreateTeacherInput): Promise<Teacher>;
  update(teacherId: string, input: UpdateTeacherInput): Promise<Teacher>;
}
```

Create/update inputs are explicit allow-lists, not arbitrary partial database rows. The adapter must not accept `schoolId`, role grants, account status, audit metadata, or other protected fields from a regular form unless the operation is specifically authorized. Student listing is for authorized administrators in 0.1; teacher/student roster access is not granted to teachers until group relationships exist in 0.2.

Teacher account creation and optional student login provisioning require privileged Auth operations. Implement these through a trusted server-side function with explicit caller authorization and transactional profile/membership/role handling. Creating a student educational profile without a login account remains supported.

## 3. Future Repository Seams

Keep these feature boundaries provider-independent, but add concrete operations only when their milestone begins. Do not create empty placeholder modules or expose future capabilities in 0.1 screens.

| Repository | First needed | Owns |
| --- | --- | --- |
| `GroupRepository` | 0.2 | Groups, terms, schedules, and authorized memberships |
| `QuranRepository` | 0.3 metadata; 0.4 reader | Dataset metadata, stable references, and permitted text access |
| `HomeworkRepository` | 0.3 | Assignments and per-student recipient state |
| `MemorizationRepository` | 0.3 | Server-controlled session submission, assessments, amendments, and history |
| `AttendanceRepository` | 0.5 | Meetings, attendance, and attributed corrections |
| `CompetitionRepository` | 0.6 | Competition configuration and permitted participation data |
| `AchievementRepository` | 0.6 | Achievement definitions and student awards |
| `NotificationRepository` | 0.7 | Inbox, preferences, and delivery state |

These repositories must not allow clients to write derived progress, verified scores, points, or ranking totals directly.

## 4. Supabase Adapter Rules

- Instantiate the Supabase client in one infrastructure/composition location. Inject adapters into feature use cases; do not import the client from screens/components.
- Keep generated Supabase database types inside the infrastructure layer. Map database rows to domain models at the adapter boundary.
- Use only the public/anon client configuration in the mobile app. Never bundle the service-role key or privileged credentials.
- Rely on RLS for all client-side reads and permitted simple writes. UI role checks do not replace RLS.
- Apply explicit field selection and pagination; do not return entire rows by default.
- Map provider errors to stable application errors such as unauthenticated, forbidden/not-found, validation, conflict, rate-limited, and unavailable. Avoid leaking SQL, policy internals, or account existence.
- Use RPC or Edge Functions for operations that need privileged Auth actions, multi-row atomicity, auditing, idempotency, external integrations, or protection from client-controlled derived values.
- Do not use broad generic `update(table, object)` helpers for sensitive records.
- Keep an audit record in the same trusted operation as the sensitive change where atomicity is required.

### Safe direct operations

Examples, always subject to RLS: reading the current profile/school, reading authorized profile lists with pagination, updating a user's own locale, and reading permitted data.

### Server-controlled operations

Examples: first-admin bootstrap; staff account provisioning; optional student account provisioning; role/membership changes; audit-sensitive profile changes; later lesson submission, assessment amendments, progress updates, point awards, bulk homework assignment, and notification creation.

## 5. State and Cache Ownership

- TanStack Query owns remote/server state, loading/error states, pagination, and invalidation.
- Zustand is limited to ephemeral UI state that does not belong to the server (for example, navigation or an unsaved local preference draft).
- React Hook Form and Zod own form state and client-side input validation; the server repeats all security and business validation.
- SecureStore contains only sensitive local authentication material managed by the auth provider. Do not store passwords.
- Any future local record cache is partitioned by user and school. Clear or make inaccessible private cached data on sign-out/account switch. Cache contents never authorize access.

## 6. Contract and Adapter Tests

- Test domain use cases against repository interfaces using deterministic fakes.
- Test each Supabase adapter's row-to-domain mapping, pagination, and error mapping.
- Test RLS separately at the database boundary using the cases in [PERMISSIONS.md](PERMISSIONS.md); mocked repositories do not prove authorization.
- Test privileged functions for caller authorization, validation, transactional behavior, and audit writes.
- When a NestJS adapter is added, run the same repository contract tests against it to verify behavioral parity.

## 7. Review Gate

Before implementation, the Technical Lead approves the domain contracts and dependency direction. Before real student data is used, validate the Supabase adapters and privileged functions against the permissions matrix and database schema. The mobile app must contain no direct Supabase calls outside infrastructure adapters.