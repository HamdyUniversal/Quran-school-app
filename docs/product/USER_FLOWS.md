# User Flows

**Status:** V1 baseline for Product Owner review
**Related:** [PRD](PRD.md), [Navigation](NAVIGATION.md), [Screens](SCREENS.md), [Permissions](../architecture/PERMISSIONS.md)

## 1. First-School Bootstrap and Staff Access (0.1)

1. Approved operator provisions the initial school and administrator through the controlled bootstrap.
2. Administrator activates/signs in, reviews the school profile, and sets locale/timezone as permitted.
3. Administrator creates teacher records and initiates approved teacher account provisioning.
4. On failure, the app shows a safe retry state and avoids duplicate accounts/memberships; sensitive provisioning is audited.
5. There is no public administrator sign-up or client-side privilege grant.

## 2. Student Record and Optional Login (0.1)

1. Administrator creates a student educational profile without requiring email, phone, or authentication.
2. If the student has a verified private recovery contact and the school's approved policy permits login, the administrator initiates provider-supported account provisioning.
3. Profile, school membership, student role, and account link are created consistently through a trusted workflow.
4. If the contact cannot be verified or provisioning fails, retain the staff-managed student profile and do not create a partial login.
5. A student account can read only its linked student's permitted data; no shared accounts or custom username bridge are used in V1.

## 3. Sign-In, Session Restore, and Recovery (0.1)

1. User submits sign-in credentials; form validation provides immediate feedback without revealing account status.
2. Supabase Auth authenticates; app loads active membership and permissions before rendering protected routes.
3. If session or membership is invalid, clear local private state and route to sign-in/access-unavailable.
4. On relaunch, show a neutral loading state until session and authorization resolve.
5. For reset, user supplies a verified account contact; app always returns a generic confirmation and the provider completes recovery.
6. Expired/revoked sessions cannot return to protected routes. Sign-out clears back stack and scoped cached data.

## 4. Administrator People Workflow (0.1)

1. Administrator opens People and receives only records in the active school.
2. Administrator creates or updates a teacher/student profile using allow-listed fields.
3. The backend revalidates school membership/permission, persists the profile, and records a redacted audit event.
4. Invalid/duplicate input is returned as a field-level validation error; network/server failure preserves the draft for a safe retry.
5. A modified request using another school's ID or protected role/account fields is rejected by server policy.

## 5. Group Setup and Teacher Roster (0.2)

1. Administrator creates a term/group and schedule, then assigns active teachers and students with effective dates.
2. Teacher opens only an assigned group and sees only its currently authorized roster.
3. Transfer ends the prior membership and starts the new one without erasing historical group context.
4. Unassigned, inactive, or cross-school group identifiers are denied by RLS and shown as not available.

## 6. Homework and Memorization (0.3)

1. Teacher chooses a validated Qur'an range and assignment type, selects authorized student(s)/group, and publishes.
2. Server validates dataset/version, range, scope, recipients, and assignment policy; each recipient gets independent state.
3. Teacher opens a recipient and records an assessment. A trusted transaction writes session, assessment, assignment state, audit/amendment metadata, and derived progress as appropriate.
4. A repeated idempotency key with the same payload returns the original outcome; a different payload under the same key is rejected.
5. Student sees only their assignment and resulting feedback; overlap does not inflate unique verified coverage.
6. A correction appends an attributed amendment; original assessment remains available.

## 7. Qur'an Range Selection and Reader (0.4)

1. Teacher navigates the approved reader and selects start/end verses.
2. The app validates basic structure; backend validates range against the approved dataset/version.
3. Teacher selects permitted recipients and publishes homework.
4. Student opens the assignment; app opens the same edition/version at the highlighted range.
5. Missing/unavailable data, a changed dataset, or invalid range produces an explicit error; the app never silently substitutes an edition.

## 8. Revision and Attendance (0.5)

1. Teacher selects an authorized group meeting and records each attendance status.
2. Duplicate student/meeting entries are rejected or safely updated according to the approved policy.
3. Teacher records revision results separately from new memorization.
4. Authorized corrections append audit/history; student views remain own-record scoped.

## 9. Competition and Notifications (0.6–0.7)

1. Administrator configures a versioned competition and privacy policy.
2. Server derives eligibility and awards points from approved events; clients cannot submit points or ranking totals.
3. User sees only permitted competition/ranking data; disabled or private rankings expose no public list.
4. A notification is persisted before delivery; push delivery is not the source of truth.
5. Deep links authenticate and re-fetch the target under current authorization; revoked access produces a safe denial.

## 10. Offline Lesson Replay (0.9)

1. Authorized teacher captures a permitted lesson result offline; app stores a minimum local mutation and shows `pending`.
2. On reconnect, server revalidates user, membership, group/student scope, assignment state, dataset/range, and idempotency key.
3. Accepted mutation commits once and is marked `synced`.
4. Revoked access or changed assignment becomes `rejected` or `conflict` with a safe explanation; assessments never use silent last-write-wins.
5. Teacher explicitly resolves supported conflicts. Logout/account switch removes private local state and unresolved work follows a documented safe policy.