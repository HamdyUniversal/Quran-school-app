# Mobile Navigation

**Status:** Proposed route design for Product Owner and Technical Lead review
**Platform:** React Native + Expo Router
**Related:** [PRD](PRD.md), [Screens](SCREENS.md), [Permissions](../architecture/PERMISSIONS.md)

## 1. Route Groups

```text
app/
├── _layout.tsx                 # Root providers and session gate
├── (public)/
│   ├── sign-in.tsx
│   ├── forgot-password.tsx
│   └── reset-password.tsx
├── (admin)/
│   ├── _layout.tsx              # Requires active administrator permission
│   ├── home.tsx
│   ├── people/index.tsx
│   ├── people/[personId].tsx
│   └── settings.tsx
├── (teacher)/                   # Added as teacher workflows arrive
└── (student)/                   # Added for provisioned student accounts
```

The route names are proposed. Follow the role/resource permission model; route groups are not a security boundary.

## 2. Session and Authorization Routing

1. While auth and membership are loading, show a neutral loading/splash state; do not flash protected content.
2. Without a valid session, route to sign-in.
3. With an inactive account or no active school membership, show an access/unavailable state and provide a safe sign-out path.
4. With a valid membership, load effective permissions and expose only role-authorized routes.
5. On a forbidden deep link, route to the user's allowed home and show a non-sensitive explanation. Server/database authorization remains authoritative.
6. On sign-out or account/school switch, clear protected navigation history and user-scoped private cache.

## 3. Role Destinations by Milestone

| Role | 0.1 | Later additions |
| --- | --- | --- |
| Administrator | Home, People, profile, language/appearance settings | Groups/terms, reports, competitions, school settings |
| Teacher | Home, profile | Assigned groups, students, homework, Qur'an, assessments, attendance |
| Student with an optional provisioned account | Home, own profile | Own homework, Qur'an, progress, attendance, achievements, permitted competitions |
| Student without a login | No app routes; record is staff-managed | Login only after an approved recovery method and account provisioning |

Do not show disabled future routes as functional destinations. Use empty states where an authorized route exists but no data is available.

## 4. Deep Links

- Support deep links only for a feature that exists in that milestone.
- Parse identifiers as untrusted input; authenticate first, then fetch the resource through an RLS-protected repository.
- Never include student names, scores, notes, contact details, or other sensitive record content in URLs or push payloads.
- If the user is signed out, preserve only a non-sensitive intended destination through sign-in; re-check authorization after authentication.
- Unknown, deleted, cancelled, or forbidden destinations resolve to a safe role home with an appropriate message.

## 5. Arabic and English Direction

- Locale controls translated strings; layout direction follows the active locale.
- Use direction-aware layout primitives and alignment, not hard-coded left/right assumptions.
- Ensure back navigation, progress direction, icons, form errors, and tab order remain understandable in RTL and LTR.
- If platform direction changes require a reload, perform it through a deliberate settings flow without losing an in-progress form silently.

## 6. Navigation Acceptance Checks

- Unauthenticated and inactive users never see protected screens during session restore.
- Wrong-role routes and manipulated deep links do not reveal data.
- Role change/revocation updates permitted navigation and the backend rejects stale access.
- Sign-out removes protected back-stack entries and user-scoped cached state.
- Core routes and error messages work in Arabic RTL and English LTR.