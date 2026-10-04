# ADR 0003: Immutable Learning History

**Status:** Proposed
**Date:** 2026-10-04
**Owner:** Product Owner; Technical Lead; School Representative

## Context

Lesson assessments and attendance affect student records and derived progress. Silent in-place edits would make it difficult to explain what was originally recorded, who changed it, and how progress changed.

## Decision

- Preserve original submitted/accepted learning events and their actor/time.
- Correct historical assessments or attendance through an attributed amendment, correction, or reversal record with a reason and timestamp.
- Compute current effective state from the original event plus valid amendments.
- Keep audit history append-only for application roles.
- Restrict correction to explicitly granted permissions and audit every correction.

## Consequences

- History and correction flows require explicit schema and UI design.
- Transactions must write the correction and audit event together where atomicity is required.
- Derived views/projections can be rebuilt from source events; corrections cannot silently erase original values.
- Retention/anonymization needs a separate approved policy that preserves necessary audit integrity.

## Alternatives Considered

- Update assessment rows in place: rejected because it loses attribution and original history.
- Keep only immutable events without a correction path: rejected because legitimate mistakes need a controlled remediation process.

## Review Gate

Approve assessment amendment fields, reason requirements, correction permissions, and history visibility before milestone 0.3 implementation.