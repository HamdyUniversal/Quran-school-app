# Screen Inventory

**Status:** V1 screen baseline for Product Owner review
**Related:** [PRD](PRD.md), [Navigation](NAVIGATION.md), [User Flows](USER_FLOWS.md)

Every screen handles loading, empty, recoverable error, and permission-denied states as applicable. Display only fields authorized for the current role and milestone.

| Version | Screen | User / permission | Main purpose and states |
| --- | --- | --- | --- |
| 0.1 | App launch/session restore | All | Restore session and membership; neutral loading; route safely when signed out/inactive |
| 0.1 | Sign in | Provisioned users | Email/password sign-in; validation, generic failure, offline/network error |
| 0.1 | Forgot/reset password | Users with verified recovery contact | Start/complete provider recovery; generic response; expired/invalid recovery state |
| 0.1 | Role home | Authenticated active membership | Admin foundation status; teacher/student honest empty states until their workflows arrive |
| 0.1 | Profile | Own profile; admin may manage school staff/student records | View own profile; permitted admin profile create/edit; loading/not-found/validation states |
| 0.1 | People list | Administrator with people-management permission | Paginated teacher/student list; search/empty/error states |
| 0.1 | Person editor | Administrator with people-management permission | Create/update allowed teacher or student fields; dirty-form, validation, duplicate, save-failure states |
| 0.1 | Language/appearance settings | Authenticated user | Arabic/English, direction and appearance preference; confirmation/reload state if needed |
| 0.2 | Terms list/editor | Administrator | Manage school terms; active/archived states and validation |
| 0.2 | Groups list/detail/editor | Administrator; assigned teacher read-only | Manage groups/schedules; teacher sees assigned groups only |
| 0.2 | Teacher assignment | Administrator | Assign/remove teacher; confirmation and conflict state |
| 0.2 | Student enrollment/transfer | Administrator | Enroll/transfer with effective dates; preserve historical membership |
| 0.2 | Teacher roster | Teacher in assigned group | Read scoped students; no access to unassigned group |
| 0.3 | Homework list/create/detail | Teacher authorized group; student own recipient | Create assignment, select recipient(s), manage due date and recipient state |
| 0.3 | Memorization assessment | Teacher authorized student | Capture verified range, rubric, result, feedback; submit/conflict/error state |
| 0.3 | Student homework/history/progress | Student own record; teacher authorized students | Show assignments and verified history; never editable aggregate totals |
| 0.3 | Assessment amendment | Explicit correction permission | Attributed correction with reason; original result remains visible in history |
| 0.4 | Qur'an reader/navigation | Authenticated permitted users | Surah/Ayah/page/Juz navigation, search, bookmarks, selection and range highlighting |
| 0.5 | Revision and attendance | Teacher authorized group; student own records | Record revision/meeting attendance and view history; correction is audited |
| 0.6 | Competition/leaderboard/achievement | Policy-permitted roles | Explain scoring and visibility; privacy-disabled rankings show no list |
| 0.7 | Notification inbox/preferences | Authenticated user | Read own notifications and control allowed preferences; deep links reauthorize |
| 0.8 | Role dashboards/reports | Explicit role/resource scope | Show timezone-aware metrics with source and no unauthorized aggregates |
| 0.9 | Sync status/conflict review | User with queued work | Pending/synced/rejected/conflict states; explicit resolution, no silent assessment overwrite |

## 0.1 Completion Gate

Authentication, session restore, role home, profile, administrator people list/editor, language/appearance settings, and their failure states are reviewed in both locales. Later-version screens are planned inventory only and must not be presented as implemented in 0.1.