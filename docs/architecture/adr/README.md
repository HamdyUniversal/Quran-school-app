# Architecture Decision Records

ADRs record context, a decision or proposed direction, and its consequences. Status is explicit: `Accepted` means approved; `Proposed` means the direction is documented but needs the listed review before implementation.

| ADR | Topic | Status |
| --- | --- | --- |
| [0001](0001-mobile-and-backend-stack.md) | Mobile and backend stack | Accepted for V1; NestJS remains conditional |
| [0002](0002-school-tenant-isolation.md) | School tenant isolation | Proposed |
| [0003](0003-immutable-learning-history.md) | Immutable learning history | Proposed |
| [0004](0004-verified-progress-calculation.md) | Verified progress calculation | Proposed |
| [0005](0005-quran-reference-model.md) | Qur'an reference model | Proposed; source and edition not approved |
| [0006](0006-offline-mutation-replay.md) | Offline mutation replay | Proposed; full offline writes deferred to 0.9 |
| [0007](0007-conditional-nestjs-adoption.md) | Conditional NestJS adoption | Proposed |
| [0008](0008-state-management.md) | State management | Proposed |

Review each ADR with its owner before the relevant implementation milestone. Update the status and decision date when approved; supersede an ADR rather than silently rewriting an accepted decision.