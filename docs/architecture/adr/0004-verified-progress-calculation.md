# ADR 0004: Verified Progress Calculation

**Status:** Proposed
**Date:** 2026-10-04
**Owner:** Product Owner; Technical Lead; Qur'an Reviewer

## Context

Students may memorize out of order, repeat ranges, and revise previously learned material. Editable totals or summing each lesson's verse count would inflate progress when ranges overlap.

## Decision

- Accepted teacher assessments determine verified memorization coverage.
- Store references against a versioned Qur'an dataset and compute coverage as the union of accepted memorization ranges in that dataset's canonical order.
- Revisions do not add new-memorization coverage.
- Keep current position separate from total verified coverage.
- Treat any progress snapshot as a rebuildable projection, never the source of truth.
- Apply assessment amendments transactionally to the effective coverage calculation while retaining original history.

## Consequences

- Range validity and ordering depend on an approved dataset/version.
- Overlap, non-linear order, amendments, and revision require domain tests.
- Progress can be recomputed after corrections; performance optimizations must preserve equivalent results.

## Alternatives Considered

- Sum lesson lengths: rejected because overlap double counts verses.
- Let teachers edit a memorized-percentage field: rejected because it is not explainable from verified records.
- Count revision as new memorization: rejected because revision assesses retention, not newly covered verses.

## Review Gate

Qur'an Reviewer and Technical Lead approve the ordering, completion, and projection rules after the dataset/edition is approved and before milestone 0.3.